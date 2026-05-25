const express = require("express");
const bcrypt  = require("bcrypt");
const db      = require("./db");
const { authenticateToken, requireRole } = require("./authMiddleware");

const router = express.Router();

// GET /coaches/public — public: coach list for About page
router.get("/coaches/public", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u."firstName",
        u."lastName",
        u."profileImage",
        COUNT(DISTINCT cg.id)  AS "classCount",
        COUNT(DISTINCT e.id)   FILTER (WHERE e.status = 'approved') AS "memberCount",
        STRING_AGG(DISTINCT cg.level, ', ' ORDER BY cg.level) AS levels
      FROM users u
      LEFT JOIN class_groups cg ON cg."coachId" = u.id
      LEFT JOIN enrollments e   ON e."classId"  = cg.id
      WHERE u.role = 'coach'
      GROUP BY u.id
      ORDER BY u."lastName", u."firstName"
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /coaches — list all coaches
router.get("/coaches", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u."firstName",
        u."lastName",
        u.phone,
        u.email,
        u."profileImage",
        COUNT(DISTINCT cg.id)  AS "classCount",
        COUNT(DISTINCT e.id)   FILTER (WHERE e.status = 'approved') AS "memberCount"
      FROM users u
      LEFT JOIN class_groups cg ON cg."coachId" = u.id
      LEFT JOIN enrollments e   ON e."classId"  = cg.id
      WHERE u.role = 'coach'
      GROUP BY u.id
      ORDER BY u."lastName", u."firstName"
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /coaches — create a new coach account
router.post("/coaches", authenticateToken, requireRole("admin"), async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;

  if (!firstName || !lastName || !phone || !password)
    return res.status(400).json({ error: "Овог, нэр, утас, нууц үг заавал шаардлагатай" });

  const cleanPhone = phone.replace(/[\s\-]/g, "");
  if (!/^\d{8}$/.test(cleanPhone))
    return res.status(400).json({ error: "Утасны дугаар 8 оронтой тоо байна" });
  if (password.length < 6)
    return res.status(400).json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" });

  try {
    const existing = await db.query(`SELECT id FROM users WHERE phone = $1`, [cleanPhone]);
    if (existing.rows.length)
      return res.status(400).json({ error: "Энэ утасны дугаар бүртгэлтэй байна" });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users ("firstName","lastName",phone,email,password,role)
       VALUES ($1,$2,$3,$4,$5,'coach') RETURNING id`,
      [firstName, lastName, cleanPhone, email || null, hash]
    );

    res.status(201).json({ message: "Багш амжилттай нэмэгдлээ", id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /coaches/:id — update coach info
router.put("/coaches/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;

  if (!firstName || !lastName || !phone)
    return res.status(400).json({ error: "Овог, нэр, утас заавал шаардлагатай" });

  const cleanPhone = phone.replace(/[\s\-]/g, "");
  if (!/^\d{8}$/.test(cleanPhone))
    return res.status(400).json({ error: "Утасны дугаар 8 оронтой тоо байна" });

  try {
    const target = await db.query(
      `SELECT id FROM users WHERE id = $1 AND role = 'coach'`,
      [req.params.id]
    );
    if (!target.rows.length)
      return res.status(404).json({ error: "Багш олдсонгүй" });

    const dup = await db.query(
      `SELECT id FROM users WHERE phone = $1 AND id != $2`,
      [cleanPhone, req.params.id]
    );
    if (dup.rows.length)
      return res.status(400).json({ error: "Энэ утасны дугаар өөр хэрэглэгчид бүртгэлтэй байна" });

    if (password) {
      if (password.length < 6)
        return res.status(400).json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" });
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE users SET "firstName"=$1,"lastName"=$2,phone=$3,email=$4,password=$5 WHERE id=$6`,
        [firstName, lastName, cleanPhone, email || null, hash, req.params.id]
      );
    } else {
      await db.query(
        `UPDATE users SET "firstName"=$1,"lastName"=$2,phone=$3,email=$4 WHERE id=$5`,
        [firstName, lastName, cleanPhone, email || null, req.params.id]
      );
    }

    res.json({ message: "Багшийн мэдээлэл шинэчлэгдлээ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /coaches/:id — remove coach (only if no active members)
router.delete("/coaches/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const target = await db.query(
      `SELECT id FROM users WHERE id = $1 AND role = 'coach'`,
      [req.params.id]
    );
    if (!target.rows.length)
      return res.status(404).json({ error: "Багш олдсонгүй" });

    const active = await db.query(`
      SELECT COUNT(*) FROM enrollments e
      JOIN class_groups cg ON e."classId" = cg.id
      WHERE cg."coachId" = $1 AND e.status = 'approved'
    `, [req.params.id]);

    if (parseInt(active.rows[0].count) > 0)
      return res.status(400).json({ error: "Идэвхтэй гишүүдтэй багшийг устгах боломжгүй" });

    await db.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
    res.json({ message: "Багш устгагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users — list all players
router.get("/users", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u."firstName",
        u."lastName",
        u.phone,
        u.email,
        u."profileImage",
        u.role,
        COUNT(e.id) FILTER (WHERE e.status = 'approved') AS "approvedCount",
        COUNT(e.id) FILTER (WHERE e.status = 'pending')  AS "pendingCount"
      FROM users u
      LEFT JOIN enrollments e ON e."userId" = u.id
      WHERE u.role IN ('player', 'coach')
      GROUP BY u.id
      ORDER BY u.role, u."lastName", u."firstName"
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /users/:id — update user info (admin can edit any non-admin user)
router.put("/users/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;

  if (!firstName || !lastName || !phone)
    return res.status(400).json({ error: "Овог, нэр, утас заавал шаардлагатай" });

  const cleanPhone = phone.replace(/[\s\-]/g, "");
  if (!/^\d{8}$/.test(cleanPhone))
    return res.status(400).json({ error: "Утасны дугаар 8 оронтой тоо байна" });

  try {
    const target = await db.query(
      `SELECT id FROM users WHERE id = $1 AND role != 'admin'`,
      [req.params.id]
    );
    if (!target.rows.length)
      return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });

    const dup = await db.query(
      `SELECT id FROM users WHERE phone = $1 AND id != $2`,
      [cleanPhone, req.params.id]
    );
    if (dup.rows.length)
      return res.status(400).json({ error: "Энэ утасны дугаар өөр хэрэглэгчид бүртгэлтэй байна" });

    if (password) {
      if (password.length < 6)
        return res.status(400).json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" });
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE users SET "firstName"=$1,"lastName"=$2,phone=$3,email=$4,password=$5 WHERE id=$6`,
        [firstName, lastName, cleanPhone, email || null, hash, req.params.id]
      );
    } else {
      await db.query(
        `UPDATE users SET "firstName"=$1,"lastName"=$2,phone=$3,email=$4 WHERE id=$5`,
        [firstName, lastName, cleanPhone, email || null, req.params.id]
      );
    }

    res.json({ message: "Хэрэглэгчийн мэдээлэл шинэчлэгдлээ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:id — delete a non-admin user
router.delete("/users/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const target = await db.query(
      `SELECT id, "firstName", "lastName" FROM users WHERE id = $1 AND role != 'admin'`,
      [req.params.id]
    );
    if (!target.rows.length)
      return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });

    // Remove attendance, enrollments, then user
    await db.query(`DELETE FROM attendance WHERE "userId" = $1`, [req.params.id]);
    await db.query(`DELETE FROM enrollments WHERE "userId" = $1`, [req.params.id]);
    await db.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);

    res.json({ message: "Хэрэглэгч устгагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reports/attendance?months=3
router.get("/reports/attendance", authenticateToken, requireRole("admin"), async (req, res) => {
  const months = Math.min(Math.max(parseInt(req.query.months) || 3, 1), 24);
  try {
    // 1. Member count by level
    const levelStats = await db.query(`
      SELECT cg.level, COUNT(DISTINCT e."userId") AS "memberCount"
      FROM enrollments e
      JOIN class_groups cg ON e."classId" = cg.id
      WHERE e.status = 'approved'
      GROUP BY cg.level
    `);

    // 2. Per-session data by level — only sessions where attendance was actually recorded
    const sessions = await db.query(`
      SELECT
        ts.date::date                                                        AS date,
        cg.level,
        COUNT(DISTINCT e."userId")                                           AS "totalMembers",
        COUNT(a.id) FILTER (WHERE a.status IN ('present','late'))           AS present,
        COUNT(a.id) FILTER (WHERE a.status = 'absent')                     AS absent
      FROM training_sessions ts
      JOIN class_groups cg ON ts."classId" = cg.id
      JOIN (
        SELECT DISTINCT "userId", "classId" FROM enrollments WHERE status = 'approved'
      ) e ON e."classId" = cg.id
      JOIN attendance a ON a."sessionId" = ts.id AND a."userId" = e."userId"
      WHERE ts.date::date >= CURRENT_DATE - ($1::int * INTERVAL '1 month')
      GROUP BY ts.id, ts.date::date, cg.level
      ORDER BY cg.level, ts.date::date
    `, [months]);

    // 3. Per-member totals — only count sessions where attendance was recorded
    const members = await db.query(`
      SELECT
        u.id,
        u."firstName",
        u."lastName",
        cg.level,
        COUNT(DISTINCT ts.id)                                    AS "totalSessions",
        COUNT(a.id) FILTER (WHERE a.status = 'present')         AS present,
        COUNT(a.id) FILTER (WHERE a.status = 'late')            AS late,
        COUNT(a.id) FILTER (WHERE a.status = 'absent')          AS absent
      FROM (
        SELECT DISTINCT ON ("userId", "classId") "userId", "classId"
        FROM enrollments WHERE status = 'approved'
        ORDER BY "userId", "classId"
      ) e
      JOIN users u              ON e."userId"  = u.id
      JOIN class_groups cg      ON e."classId" = cg.id
      JOIN training_sessions ts ON ts."classId" = cg.id
        AND ts.date::date >= CURRENT_DATE - ($1::int * INTERVAL '1 month')
        AND EXISTS (SELECT 1 FROM attendance WHERE "sessionId" = ts.id)
      LEFT JOIN attendance a ON a."sessionId" = ts.id AND a."userId" = u.id
      GROUP BY u.id, u."firstName", u."lastName", cg.id, cg.level
      ORDER BY cg.level, u."lastName", u."firstName"
    `, [months]);

    // Build stats summary
    const byLevel = {};
    let totalMembers = 0;
    levelStats.rows.forEach(r => {
      byLevel[r.level] = Number(r.memberCount);
      totalMembers += Number(r.memberCount);
    });

    const totalSessions = sessions.rows.reduce((s, r) => s + 1, 0);
    const totalPresent  = sessions.rows.reduce((s, r) => s + Number(r.present), 0);
    const totalPossible = sessions.rows.reduce((s, r) => s + Number(r.totalMembers), 0);
    const avgPct = totalPossible > 0 ? Math.round(totalPresent / totalPossible * 100) : 0;

    res.json({
      stats: { totalMembers, byLevel, totalSessions, avgPct },
      sessions: sessions.rows,
      members: members.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /levels — list all levels
router.get("/levels", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM levels ORDER BY "sortOrder", id`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /levels — create a new level
router.post("/levels", authenticateToken, requireRole("admin"), async (req, res) => {
  const { name, badge, description, features, fee, accent, sortOrder, startDate, endDate } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: "Түвшний нэр заавал шаардлагатай" });
  try {
    const result = await db.query(
      `INSERT INTO levels (name, badge, description, features, fee, accent, "sortOrder", "startDate", "endDate")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name.trim(), badge || "", description || "", JSON.stringify(features || []),
       fee || 0, accent || "orange", sortOrder || 0, startDate || null, endDate || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Энэ нэртэй түвшин аль хэдийн байна" });
    res.status(500).json({ error: err.message });
  }
});

// PUT /levels/:id — update a level
router.put("/levels/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const { name, badge, description, features, fee, accent, sortOrder, startDate, endDate } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: "Түвшний нэр заавал шаардлагатай" });
  try {
    const result = await db.query(
      `UPDATE levels SET name=$1, badge=$2, description=$3, features=$4, fee=$5, accent=$6,
        "sortOrder"=$7, "startDate"=$8, "endDate"=$9
       WHERE id=$10 RETURNING *`,
      [name.trim(), badge || "", description || "", JSON.stringify(features || []),
       fee || 0, accent || "orange", sortOrder || 0, startDate || null, endDate || null, req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Түвшин олдсонгүй" });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Энэ нэртэй түвшин аль хэдийн байна" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /levels/:id — delete a level (blocked if class_groups reference it)
router.delete("/levels/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const lv = await db.query(`SELECT name FROM levels WHERE id=$1`, [req.params.id]);
    if (!lv.rows.length)
      return res.status(404).json({ error: "Түвшин олдсонгүй" });

    const used = await db.query(
      `SELECT COUNT(*) FROM class_groups WHERE level=$1`, [lv.rows[0].name]
    );
    if (parseInt(used.rows[0].count) > 0)
      return res.status(400).json({ error: "Энэ түвшинг ашиглаж байгаа бүлэг байна. Устгах боломжгүй." });

    await db.query(`DELETE FROM levels WHERE id=$1`, [req.params.id]);
    res.json({ message: "Түвшин устгагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
