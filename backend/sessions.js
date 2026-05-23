const express = require("express");
const db      = require("./db");
const { authenticateToken, requireRole } = require("./authMiddleware");

const router = express.Router();

// POST / — coach: find or create today's training session for a schedule slot
router.post("/", authenticateToken, requireRole("coach"), async (req, res) => {
  const { scheduleId } = req.body;
  if (!scheduleId) return res.status(400).json({ error: "Хуваарийн дугаар шаардлагатай" });

  try {
    const sch = await db.query(`
      SELECT s."startTime", s."endTime", s.location, s."dayOfWeek", cg.id AS "classId"
      FROM schedule s
      JOIN class_groups cg ON s."classId" = cg.id
      WHERE s.id = $1 AND cg."coachId" = $2
    `, [scheduleId, req.user.id]);

    if (!sch.rows.length)
      return res.status(404).json({ error: "Хуваарь олдсонгүй" });

    const s   = sch.rows[0];
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const MN_DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
    const jsDay   = now.getDay(); // 0=Sun
    const todayMn = jsDay === 0 ? "Ням" : MN_DAYS[jsDay - 1];

    if (s.dayOfWeek !== todayMn)
      return res.status(400).json({
        error: `Өнөөдөр ${todayMn} — энэ хуваарь ${s.dayOfWeek} өдөр байна`
      });

    // Find or create a training session for this specific schedule slot + date
    const existing = await db.query(`
      SELECT id FROM training_sessions
      WHERE "scheduleId" = $1 AND date = $2 AND "coachId" = $3
    `, [scheduleId, today, req.user.id]);

    let sessionId;
    if (existing.rows.length > 0) {
      sessionId = existing.rows[0].id;
    } else {
      const ts = await db.query(`
        INSERT INTO training_sessions ("classId","coachId",date,"startTime","endTime",location,"scheduleId")
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
      `, [s.classId, req.user.id, today, s.startTime, s.endTime, s.location, scheduleId]);
      sessionId = ts.rows[0].id;
    }

    res.json({ sessionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/members — coach: members + current attendance for a session
router.get("/:id/members", authenticateToken, requireRole("coach"), async (req, res) => {
  try {
    const ts = await db.query(`
      SELECT ts.id, ts.date, ts."startTime", ts."endTime", ts.location,
             cg.name AS "className", cg.level, ts."classId", ts."scheduleId"
      FROM training_sessions ts
      JOIN class_groups cg ON ts."classId" = cg.id
      WHERE ts.id = $1 AND ts."coachId" = $2
    `, [req.params.id, req.user.id]);

    if (!ts.rows.length)
      return res.status(404).json({ error: "Сесс олдсонгүй" });

    const session = ts.rows[0];

    // Filter by specific schedule slot (new-style) or fallback to classId (legacy)
    const members = await db.query(`
      SELECT u.id, u."firstName", u."lastName", u.phone, u."profileImage",
             a.status,
             (lr.id IS NOT NULL) AS "hasApprovedLeave"
      FROM enrollments e
      JOIN users u ON e."userId" = u.id
      LEFT JOIN attendance a ON a."sessionId" = $1 AND a."userId" = u.id
      LEFT JOIN leave_requests lr ON lr."userId" = u.id
        AND lr."classId" = $2
        AND TO_CHAR(lr.date::date, 'YYYY-MM-DD') = $3
        AND lr.status = 'approved'
      WHERE e.status = 'approved'
        AND (
          ($4::int IS NOT NULL AND e."scheduleId" = $4)
          OR ($4::int IS NULL AND e."classId" = $2 AND e."scheduleId" IS NULL)
        )
      ORDER BY u."lastName", u."firstName"
    `, [req.params.id, session.classId, session.date, session.scheduleId]);

    res.json({ session, members: members.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/attendance — coach: save attendance marks
router.post("/:id/attendance", authenticateToken, requireRole("coach"), async (req, res) => {
  const { attendance } = req.body;
  if (!attendance || typeof attendance !== "object")
    return res.status(400).json({ error: "Ирцийн мэдээлэл шаардлагатай" });

  const client = await db.connect();
  try {
    const ts = await client.query(
      `SELECT id FROM training_sessions WHERE id = $1 AND "coachId" = $2`,
      [req.params.id, req.user.id]
    );
    if (!ts.rows.length)
      return res.status(403).json({ error: "Эрх хүрэхгүй" });

    await client.query("BEGIN");

    for (const [userId, status] of Object.entries(attendance)) {
      await client.query(`
        INSERT INTO attendance ("sessionId", "userId", status)
        VALUES ($1, $2, $3)
        ON CONFLICT ("sessionId", "userId") DO UPDATE SET status = EXCLUDED.status, "recordedAt" = NOW()
      `, [req.params.id, userId, status]);
    }

    await client.query("COMMIT");
    res.json({ message: "Ирц хадгалагдлаа" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
