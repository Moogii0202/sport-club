const express = require("express");
const db      = require("./db");
const { authenticateToken, requireRole } = require("./authMiddleware");

const router = express.Router();

/*
  SQL — нэг удаа ажиллуулна:
  CREATE TABLE announcements (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    body         TEXT NOT NULL,
    "targetRole" VARCHAR(20)  NOT NULL DEFAULT 'all',
    "createdBy"  INT REFERENCES users(id) ON DELETE SET NULL,
    "createdAt"  TIMESTAMP DEFAULT NOW()
  );
*/

// GET / — нэвтэрсэн хэрэглэгч: өөрийн role-д хамаарах мэдэгдлүүд + хувийн мэдэгдлүүд
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        a.id,
        a.title,
        a.body,
        a."targetRole",
        a."createdAt",
        u."firstName" AS "authorFirst",
        u."lastName"  AS "authorLast",
        false AS "isPersonal"
      FROM announcements a
      LEFT JOIN users u ON a."createdBy" = u.id
      WHERE $1 = 'admin' OR a."targetRole" = 'all' OR a."targetRole" = $1
      ORDER BY a."createdAt" DESC
      LIMIT 50
    `, [req.user.role]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / — админ: шинэ мэдэгдэл нийтлэх
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  const { title, body, targetRole = "all" } = req.body;
  if (!title?.trim() || !body?.trim())
    return res.status(400).json({ error: "Гарчиг болон агуулга шаардлагатай" });
  if (!["all", "player", "coach"].includes(targetRole))
    return res.status(400).json({ error: "Буруу хэрэглэгчийн бүлэг" });

  try {
    const result = await db.query(`
      INSERT INTO announcements (title, body, "targetRole", "createdBy")
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [title.trim(), body.trim(), targetRole, req.user.id]);
    res.status(201).json({ message: "Мэдэгдэл нийтлэгдлээ", id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id — админ: мэдэгдэл устгах
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM announcements WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!result.rowCount)
      return res.status(404).json({ error: "Мэдэгдэл олдсонгүй" });
    res.json({ message: "Мэдэгдэл устгагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
