const express = require("express");
const db      = require("./db");
const { authenticateToken, requireRole } = require("./authMiddleware");

const router = express.Router();

// POST — Submit enrollment (player)
router.post("/", authenticateToken, async (req, res) => {
  const { classId, notes } = req.body;
  if (!classId) return res.status(400).json({ error: "Бүлэг сонгоно уу" });

  try {
    const existing = await db.query(
      `SELECT id FROM enrollments WHERE "userId"=$1 AND "classId"=$2 AND status IN ('pending','approved')`,
      [req.user.id, classId]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Та энэ бүлэгт аль хэдийн хүсэлт илгээсэн байна" });

    const result = await db.query(
      `INSERT INTO enrollments ("userId","classId",notes) VALUES ($1,$2,$3) RETURNING id`,
      [req.user.id, classId, notes || null]
    );
    res.json({ message: "Элсэлтийн хүсэлт илгээгдлээ", enrollId: result.rows[0].id });
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
