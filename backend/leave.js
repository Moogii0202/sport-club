const express = require("express");
const db      = require("./db");
const { authenticateToken } = require("./authMiddleware");

const router = express.Router();

// GET / — player: own leave requests
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        lr.id,
        lr."classId",
        TO_CHAR(lr.date::date, 'YYYY-MM-DD') AS date,
        lr.reason,
        lr.status,
        lr."createdAt",
        cg.name    AS "className",
        cg.level,
        s."startTime",
        s."endTime",
        s.location,
        s."dayOfWeek"
      FROM leave_requests lr
      JOIN class_groups cg ON lr."classId" = cg.id
      LEFT JOIN LATERAL (
        SELECT "startTime", "endTime", location, "dayOfWeek"
        FROM schedule
        WHERE "classId" = cg.id
          AND "dayOfWeek" = CASE EXTRACT(DOW FROM lr.date::date)
            WHEN 1 THEN 'Даваа'
            WHEN 2 THEN 'Мягмар'
            WHEN 3 THEN 'Лхагва'
            WHEN 4 THEN 'Пүрэв'
            WHEN 5 THEN 'Баасан'
            WHEN 6 THEN 'Бямба'
            WHEN 0 THEN 'Ням'
          END
        LIMIT 1
      ) s ON true
      WHERE lr."userId" = $1
      ORDER BY lr.date DESC, lr."createdAt" DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / — player: submit a leave request
router.post("/", authenticateToken, async (req, res) => {
  const { classId, date, reason } = req.body;
  if (!classId || !date)
    return res.status(400).json({ error: "Хичээл болон огноо заавал шаардлагатай" });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (new Date(date) < today)
    return res.status(400).json({ error: "Өнгөрсөн өдрийн хүсэлт илгээх боломжгүй" });

  try {
    // If today, check the class start time has not passed
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    if (date === todayStr) {
      const schedRow = await db.query(
        `SELECT "startTime" FROM schedule WHERE "classId" = $1 LIMIT 1`,
        [classId]
      );
      if (schedRow.rows.length) {
        const [sh, sm] = schedRow.rows[0].startTime.split(":").map(Number);
        const now = new Date();
        if (now.getHours() * 60 + now.getMinutes() >= sh * 60 + sm)
          return res.status(400).json({ error: "Хичээл эхэлсэн тул хүсэлт илгээх боломжгүй" });
      }
    }

    // Verify the player is enrolled in this class
    const enrolled = await db.query(`
      SELECT id FROM enrollments
      WHERE "userId" = $1 AND "classId" = $2 AND status = 'approved'
    `, [req.user.id, classId]);

    if (!enrolled.rows.length)
      return res.status(403).json({ error: "Та энэ хичээлд элсэлгүй байна" });

    // Prevent duplicate
    const dup = await db.query(`
      SELECT id FROM leave_requests
      WHERE "userId" = $1 AND "classId" = $2 AND date = $3
    `, [req.user.id, classId, date]);

    if (dup.rows.length)
      return res.status(400).json({ error: "Энэ өдрийн чөлөөний хүсэлт аль хэдийн илгээгдсэн байна" });

    const result = await db.query(`
      INSERT INTO leave_requests ("userId", "classId", date, reason, status)
      VALUES ($1, $2, $3, $4, 'pending') RETURNING id
    `, [req.user.id, classId, date, reason || null]);

    res.status(201).json({ message: "Чөлөөний хүсэлт илгээгдлээ", id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /coach — coach: all leave requests for their classes
router.get("/coach", authenticateToken, async (req, res) => {
  if (req.user.role !== "coach" && req.user.role !== "admin")
    return res.status(403).json({ error: "Зөвхөн дасгалжуулагч хандах боломжтой" });
  try {
    const result = await db.query(`
      SELECT
        lr.id,
        lr."classId",
        TO_CHAR(lr.date::date, 'YYYY-MM-DD') AS date,
        lr.reason,
        lr.status,
        lr."createdAt",
        cg.name    AS "className",
        cg.level,
        s."startTime",
        s."endTime",
        s.location,
        s."dayOfWeek",
        u."firstName",
        u."lastName",
        u.phone
      FROM leave_requests lr
      JOIN class_groups cg ON lr."classId" = cg.id
      JOIN users u ON lr."userId" = u.id
      LEFT JOIN LATERAL (
        SELECT "startTime", "endTime", location, "dayOfWeek"
        FROM schedule
        WHERE "classId" = cg.id
        LIMIT 1
      ) s ON true
      WHERE lr."classId" IN (
        SELECT id FROM class_groups WHERE "coachId" = $1
      )
      ORDER BY
        CASE lr.status WHEN 'pending' THEN 0 ELSE 1 END,
        lr.date DESC,
        lr."createdAt" DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /:id — coach: approve or reject, then notify the player
router.patch("/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "coach" && req.user.role !== "admin")
    return res.status(403).json({ error: "Зөвхөн дасгалжуулагч хандах боломжтой" });
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status))
    return res.status(400).json({ error: "status нь 'approved' эсвэл 'rejected' байх ёстой" });
  try {
    // Хүсэлтийн мэдээллийг авна (тоглогчийн id, огноо, бүлэг)
    const lr = await db.query(`
      SELECT lr."userId", lr.date, cg.name AS "className", cg.level
      FROM leave_requests lr
      JOIN class_groups cg ON lr."classId" = cg.id
      WHERE lr.id = $1
        AND lr."classId" IN (SELECT id FROM class_groups WHERE "coachId" = $2)
        AND lr.status = 'pending'
    `, [req.params.id, req.user.id]);

    if (!lr.rows.length)
      return res.status(404).json({ error: "Хүсэлт олдсонгүй эсвэл өөрчлөх боломжгүй" });

    const { userId, date, className, level } = lr.rows[0];

    // Статус шинэчлэх
    await db.query(
      `UPDATE leave_requests SET status = $1 WHERE id = $2`,
      [status, req.params.id]
    );

    // Тоглогчид хувийн мэдэгдэл үүсгэх
    const d          = new Date(date);
    const dateStr    = `${d.getMonth() + 1}/${d.getDate()}`;
    const isApproved = status === "approved";
    await db.query(`
      INSERT INTO announcements (title, body, "targetRole", "targetUserId", "createdBy")
      VALUES ($1, $2, 'player', $3, $4)
    `, [
      isApproved ? "Чөлөөний хүсэлт зөвшөөрөгдлөө ✓" : "Чөлөөний хүсэлт татгалзагдлаа ✗",
      `${dateStr}-ны ${level} (${className}) хичээлийн чөлөөний таны хүсэлт ${isApproved ? "зөвшөөрөгдлөө." : "татгалзагдлаа."}`,
      userId,
      req.user.id,
    ]);

    res.json({ message: isApproved ? "Зөвшөөрөгдлөө" : "Татгалзлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id — player: cancel own pending leave request
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      DELETE FROM leave_requests
      WHERE id = $1 AND "userId" = $2 AND status = 'pending'
      RETURNING id
    `, [req.params.id, req.user.id]);

    if (!result.rowCount)
      return res.status(404).json({ error: "Хүсэлт олдсонгүй эсвэл цуцлах боломжгүй" });

    res.json({ message: "Хүсэлт цуцлагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
