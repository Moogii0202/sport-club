const express = require("express");
const db      = require("./db");
const { authenticateToken, requireRole } = require("./authMiddleware");

const router = express.Router();

// POST — Submit enrollment (player)
router.post("/", authenticateToken, async (req, res) => {
  const { classId, scheduleId, notes } = req.body;
  if (!classId) return res.status(400).json({ error: "Бүлэг сонгоно уу" });

  try {
    // Uniqueness: per scheduleId if provided, otherwise per classId
    const dupCheck = scheduleId
      ? `SELECT id FROM enrollments WHERE "userId"=$1 AND "scheduleId"=$2 AND status='approved'`
      : `SELECT id FROM enrollments WHERE "userId"=$1 AND "classId"=$2 AND "scheduleId" IS NULL AND status='approved'`;
    const dupParam = scheduleId ? [req.user.id, scheduleId] : [req.user.id, classId];

    const approved = await db.query(dupCheck, dupParam);
    if (approved.rows.length > 0)
      return res.status(400).json({ error: "Та энэ цагт аль хэдийн бүртгүүлсэн байна" });

    const pendingCheck = scheduleId
      ? `SELECT id FROM enrollments WHERE "userId"=$1 AND "scheduleId"=$2 AND status='pending'`
      : `SELECT id FROM enrollments WHERE "userId"=$1 AND "classId"=$2 AND "scheduleId" IS NULL AND status='pending'`;

    const pending = await db.query(pendingCheck, dupParam);
    if (pending.rows.length > 0) {
      await db.query(
        `UPDATE enrollments SET status='approved', "reviewedAt"=NOW() WHERE id=$1`,
        [pending.rows[0].id]
      );
      return res.json({ message: "Элсэлт баталгаажлаа", enrollId: pending.rows[0].id });
    }

    const result = await db.query(
      `INSERT INTO enrollments ("userId","classId","scheduleId",notes,status,"reviewedAt")
       VALUES ($1,$2,$3,$4,'approved',NOW()) RETURNING id`,
      [req.user.id, classId, scheduleId || null, notes || null]
    );
    res.json({ message: "Элсэлт баталгаажлаа", enrollId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /approve-pending — bulk-approve all pending enrollments (admin)
router.post("/approve-pending", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE enrollments SET status='approved', "reviewedAt"=NOW()
       WHERE status='pending' RETURNING id`
    );
    res.json({ message: `${result.rowCount} хүсэлт батлагдлаа`, count: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /my — own enrollments (player)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, cg.name AS "className"
       FROM enrollments e
       LEFT JOIN class_groups cg ON e."classId" = cg.id
       WHERE e."userId" = $1
       ORDER BY e."submittedAt" DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /approved — all approved enrollments (admin)
router.get("/approved", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.id, e."userId", e."classId",
              e."submittedAt", e."reviewedAt",
              u."firstName", u."lastName", u.phone, u.email, u."profileImage",
              cg.name        AS "className",
              cg.level,
              cg.fee,
              coach."firstName" AS "coachFirstName",
              coach."lastName"  AS "coachLastName"
       FROM enrollments e
       JOIN users u          ON e."userId"   = u.id
       JOIN class_groups cg  ON e."classId"  = cg.id
       LEFT JOIN users coach ON cg."coachId" = coach.id
       WHERE e.status = 'approved'
       ORDER BY cg.level, u."lastName", u."firstName"`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /pending — all pending enrollments (admin)
router.get("/pending", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, u."firstName", u."lastName", u.phone, cg.name AS "className"
       FROM enrollments e
       JOIN users u ON e."userId" = u.id
       LEFT JOIN class_groups cg ON e."classId" = cg.id
       WHERE e.status = 'pending'
       ORDER BY e."submittedAt" DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/approve (admin)
router.put("/:id/approve", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE enrollments SET status='approved', "reviewedAt"=NOW() WHERE id=$1`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Хүсэлт олдсонгүй" });
    res.json({ message: "Хүсэлт батлагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/reject (admin)
router.put("/:id/reject", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE enrollments SET status='rejected', "reviewedAt"=NOW() WHERE id=$1`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Хүсэлт олдсонгүй" });
    res.json({ message: "Хүсэлт татгалзагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
