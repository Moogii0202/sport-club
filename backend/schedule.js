const express = require("express");
const db      = require("./db");
const { authenticateToken, requireRole } = require("./authMiddleware");

const router = express.Router();

const LEVEL_FEE = { "Анхан шат": 80000, "Дунд шат": 100000, "Ахисан шат": 120000 };

function normalizeDate(d) {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const MN = { Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",
               Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12" };
  const m = d.match(/[A-Za-z]+ ([A-Za-z]{3}) (\d{1,2}) (\d{4})/);
  if (m && MN[m[1]]) return `${m[3]}-${MN[m[1]]}-${String(m[2]).padStart(2,"0")}`;
  return null;
}

// GET / — public: all class schedules with coach info and enrollment count
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.id             AS "scheduleId",
        s."classId",
        cg.name          AS "className",
        cg.level,
        cg."coachId",
        u."firstName"    AS "coachFirstName",
        u."lastName"     AS "coachLastName",
        u.phone          AS "coachPhone",
        u.email          AS "coachEmail",
        s."dayOfWeek",
        s."startTime",
        s."endTime",
        s.location,
        TO_CHAR(s."startDate"::date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(s."endDate"::date,   'YYYY-MM-DD') AS "endDate",
        cg."maxCapacity",
        cg.fee,
        COUNT(e.id) AS "enrolledCount"
      FROM schedule s
      JOIN class_groups cg ON s."classId" = cg.id
      LEFT JOIN users u ON cg."coachId" = u.id
      LEFT JOIN enrollments e ON e."scheduleId" = s.id AND e.status = 'approved'
      WHERE s."isPublic" = TRUE
      GROUP BY s.id, cg.id, u.id
      ORDER BY
        CASE s."dayOfWeek"
          WHEN 'Даваа'   THEN 1 WHEN 'Мягмар' THEN 2 WHEN 'Лхагва' THEN 3
          WHEN 'Пүрэв'   THEN 4 WHEN 'Баасан' THEN 5 WHEN 'Бямба'  THEN 6
          WHEN 'Ням'     THEN 7 END,
        s."startTime"
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /enrolled — player: schedule from their submitted/approved enrollments
router.get("/enrolled", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.id             AS "scheduleId",
        s."classId",
        cg.name          AS "className",
        cg.level,
        cg."coachId",
        u."firstName"    AS "coachFirstName",
        u."lastName"     AS "coachLastName",
        u.phone          AS "coachPhone",
        u.email          AS "coachEmail",
        u."profileImage" AS "coachImage",
        s."dayOfWeek",
        s."startTime",
        s."endTime",
        s.location,
        s."startDate" AS "startDate",
        s."endDate"   AS "endDate",
        cg.fee
      FROM schedule s
      JOIN class_groups cg ON s."classId" = cg.id
      LEFT JOIN users u ON cg."coachId" = u.id
      WHERE (
        s.id IN (
          SELECT "scheduleId" FROM enrollments
          WHERE "userId" = $1 AND status IN ('pending', 'approved')
            AND "scheduleId" IS NOT NULL
        )
        OR (
          cg.id IN (
            SELECT "classId" FROM enrollments
            WHERE "userId" = $1 AND status IN ('pending', 'approved')
              AND "scheduleId" IS NULL
          )
          AND s."isPublic" = TRUE
        )
      )
      ORDER BY
        CASE s."dayOfWeek"
          WHEN 'Даваа'   THEN 1 WHEN 'Мягмар' THEN 2 WHEN 'Лхагва' THEN 3
          WHEN 'Пүрэв'   THEN 4 WHEN 'Баасан' THEN 5 WHEN 'Бямба'  THEN 6
          WHEN 'Ням'     THEN 7 END,
        s."startTime"
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /by-day — гараг дээрх бүх хуваарийг харуулах (цаг давхардал шалгахад хэрэглэнэ)
router.get("/by-day", authenticateToken, async (req, res) => {
  const { day } = req.query;
  if (!day) return res.status(400).json({ error: "Гараг параметр шаардлагатай" });
  try {
    const result = await db.query(`
      SELECT
        s.id,
        s."startTime",
        s."endTime",
        s.location,
        s."dayOfWeek",
        cg.name  AS "className",
        cg.level,
        cg."coachId",
        u."firstName" AS "coachFirst",
        u."lastName"  AS "coachLast"
      FROM schedule s
      JOIN class_groups cg ON s."classId" = cg.id
      LEFT JOIN users u ON cg."coachId" = u.id
      WHERE s."dayOfWeek" = $1
      ORDER BY s."startTime"
    `, [day]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /my — coach: own schedule slots
router.get("/my", authenticateToken, requireRole("coach"), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.id          AS "scheduleId",
        s."classId",
        cg.name       AS "className",
        cg.level,
        s."dayOfWeek",
        s."startTime",
        s."endTime",
        s.location,
        TO_CHAR(s."startDate"::date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(s."endDate"::date,   'YYYY-MM-DD') AS "endDate",
        cg."maxCapacity",
        cg.fee,
        COUNT(e.id) AS "enrolledCount"
      FROM schedule s
      JOIN class_groups cg ON s."classId" = cg.id
      LEFT JOIN enrollments e ON e."scheduleId" = s.id AND e.status = 'approved'
      WHERE cg."coachId" = $1
      GROUP BY s.id, cg.id
      ORDER BY
        CASE s."dayOfWeek"
          WHEN 'Даваа'   THEN 1 WHEN 'Мягмар' THEN 2 WHEN 'Лхагва' THEN 3
          WHEN 'Пүрэв'   THEN 4 WHEN 'Баасан' THEN 5 WHEN 'Бямба'  THEN 6
          WHEN 'Ням'     THEN 7 END,
        s."startTime"
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / — coach: add a schedule slot (creates class_group if needed)
router.post("/", authenticateToken, requireRole("coach"), async (req, res) => {
  const { level, dayOfWeek, startTime, endTime, location, maxCapacity, startDate, endDate } = req.body;
  if (!level || !dayOfWeek || !startTime || !endTime)
    return res.status(400).json({ error: "Түвшин, гараг, цаг заавал шаардлагатай" });

  const VALID_LEVELS = ["Анхан шат", "Дунд шат", "Ахисан шат"];
  if (!VALID_LEVELS.includes(level))
    return res.status(400).json({ error: "Буруу түвшин" });

  if (startTime >= endTime)
    return res.status(400).json({ error: "Эхлэх цаг дуусах цагаас өмнө байх ёстой" });

  const cap = maxCapacity ? parseInt(maxCapacity) : 20;
  if (isNaN(cap) || cap < 1 || cap > 200)
    return res.status(400).json({ error: "Дүүргэлт 1–200 хооронд байх ёстой" });

  try {
    // ── Цаг давхардал: энэ багшийн ижил гараг + давхардах цаг ──────────────
    const coachConflict = await db.query(`
      SELECT s.id, s."startTime", s."endTime", cg.level
      FROM schedule s
      JOIN class_groups cg ON s."classId" = cg.id
      WHERE cg."coachId" = $1
        AND s."dayOfWeek" = $2
        AND s."startTime" < $3
        AND s."endTime"   > $4
    `, [req.user.id, dayOfWeek, endTime, startTime]);

    if (coachConflict.rows.length > 0) {
      const c = coachConflict.rows[0];
      return res.status(400).json({
        error: `Цаг давхардаж байна: таны ${c.level} бүлгийн ${c.startTime}–${c.endTime} хичээлтэй зөрчилдөж байна`,
      });
    }

    // ── Байршлын давхардал: ижил байршил, ижил гараг, давхардах цаг ────────
    if (location?.trim()) {
      const locConflict = await db.query(`
        SELECT s.id, s."startTime", s."endTime", u."lastName" AS "coachLast", cg.level
        FROM schedule s
        JOIN class_groups cg ON s."classId" = cg.id
        LEFT JOIN users u ON cg."coachId" = u.id
        WHERE s.location = $1
          AND s."dayOfWeek" = $2
          AND s."startTime" < $3
          AND s."endTime"   > $4
          AND cg."coachId" != $5
      `, [location.trim(), dayOfWeek, endTime, startTime, req.user.id]);

      if (locConflict.rows.length > 0) {
        const c = locConflict.rows[0];
        return res.status(400).json({
          error: `Байршил давхардаж байна: "${location}" байршилд ${c.coachLast} багшийн ${c.level} бүлэг ${c.startTime}–${c.endTime} цагт хичээллэж байна`,
        });
      }
    }

    // ── class_group олох эсвэл үүсгэх ─────────────────────────────────────
    let classRes = await db.query(
      `SELECT id FROM class_groups WHERE "coachId" = $1 AND level = $2`,
      [req.user.id, level]
    );

    let classId;
    if (classRes.rows.length > 0) {
      classId = classRes.rows[0].id;
      await db.query(
        `UPDATE class_groups SET "maxCapacity" = $1 WHERE id = $2`,
        [cap, classId]
      );
    } else {
      const newClass = await db.query(
        `INSERT INTO class_groups (name, level, "coachId", "maxCapacity", fee)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [level, level, req.user.id, cap, LEVEL_FEE[level] || 0]
      );
      classId = newClass.rows[0].id;
    }

    // Check whether startDate/endDate columns exist (migration may not have run yet)
    const colCheck = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'schedule' AND column_name IN ('startDate','endDate')
    `);
    const hasDates = colCheck.rows.length === 2;

    const result = await db.query(
      hasDates
        ? `INSERT INTO schedule ("classId","dayOfWeek","startTime","endTime",location,"isPublic","startDate","endDate")
           VALUES ($1,$2,$3,$4,$5,TRUE,$6,$7) RETURNING id`
        : `INSERT INTO schedule ("classId","dayOfWeek","startTime","endTime",location,"isPublic")
           VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING id`,
      hasDates
        ? [classId, dayOfWeek, startTime, endTime, location?.trim() || null, normalizeDate(startDate), normalizeDate(endDate)]
        : [classId, dayOfWeek, startTime, endTime, location?.trim() || null]
    );

    res.json({ message: "Хуваарь нэмэгдлээ", scheduleId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id — coach: update own schedule slot (all fields)
router.put("/:id", authenticateToken, requireRole("coach"), async (req, res) => {
  const { level, dayOfWeek, startTime, endTime, location, startDate, endDate, maxCapacity } = req.body;
  if (!startTime || !endTime)
    return res.status(400).json({ error: "Эхлэх болон дуусах цагийг оруулна уу" });
  if (startTime >= endTime)
    return res.status(400).json({ error: "Эхлэх цаг дуусах цагаас өмнө байх ёстой" });
  const cap = maxCapacity ? parseInt(maxCapacity) : null;
  if (cap !== null && (isNaN(cap) || cap < 1 || cap > 200))
    return res.status(400).json({ error: "Дүүргэлт 1–200 хооронд байх ёстой" });

  try {
    const own = await db.query(`
      SELECT s.id, s."classId", s."dayOfWeek" FROM schedule s
      JOIN class_groups cg ON s."classId" = cg.id
      WHERE s.id = $1 AND cg."coachId" = $2
    `, [req.params.id, req.user.id]);
    if (!own.rows.length)
      return res.status(404).json({ error: "Хуваарь олдсонгүй эсвэл эрх хүрэхгүй" });

    const { classId } = own.rows[0];
    const newDay = dayOfWeek || own.rows[0].dayOfWeek;

    const coachConflict = await db.query(`
      SELECT s.id, s."startTime", s."endTime", cg.level
      FROM schedule s JOIN class_groups cg ON s."classId" = cg.id
      WHERE cg."coachId" = $1 AND s."dayOfWeek" = $2
        AND s."startTime" < $3 AND s."endTime" > $4 AND s.id != $5
    `, [req.user.id, newDay, endTime, startTime, req.params.id]);
    if (coachConflict.rows.length) {
      const c = coachConflict.rows[0];
      return res.status(400).json({
        error: `Цаг давхардаж байна: таны ${c.level} бүлгийн ${c.startTime}–${c.endTime} хичээлтэй зөрчилдөж байна`,
      });
    }

    if (location?.trim()) {
      const locConflict = await db.query(`
        SELECT s.id, s."startTime", s."endTime", u."lastName" AS "coachLast", cg.level
        FROM schedule s JOIN class_groups cg ON s."classId" = cg.id
        LEFT JOIN users u ON cg."coachId" = u.id
        WHERE s.location = $1 AND s."dayOfWeek" = $2
          AND s."startTime" < $3 AND s."endTime" > $4
          AND cg."coachId" != $5 AND s.id != $6
      `, [location.trim(), newDay, endTime, startTime, req.user.id, req.params.id]);
      if (locConflict.rows.length) {
        const c = locConflict.rows[0];
        return res.status(400).json({
          error: `Байршил давхардаж байна: "${location}" байршилд ${c.coachLast} багшийн ${c.level} бүлэг ${c.startTime}–${c.endTime} цагт хичээллэж байна`,
        });
      }
    }

    await db.query(`
      UPDATE schedule
      SET "dayOfWeek" = $1, "startTime" = $2, "endTime" = $3,
          location = $4, "startDate" = $5, "endDate" = $6
      WHERE id = $7
    `, [newDay, startTime, endTime, location?.trim() || null,
        normalizeDate(startDate), normalizeDate(endDate), req.params.id]);

    if (level || cap !== null) {
      await db.query(`
        UPDATE class_groups SET
          ${level ? `level = '${level}', name = '${level}',` : ""}
          ${cap !== null ? `"maxCapacity" = ${cap}` : `"maxCapacity" = "maxCapacity"`}
        WHERE id = $1
      `, [classId]);
    }

    res.json({ message: "Хуваарь шинэчлэгдлээ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id — coach: remove own schedule slot
router.delete("/:id", authenticateToken, requireRole("coach"), async (req, res) => {
  try {
    const result = await db.query(`
      DELETE FROM schedule AS s
      USING class_groups AS cg
      WHERE s.id = $1 AND s."classId" = cg.id AND cg."coachId" = $2
    `, [req.params.id, req.user.id]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Хуваарь олдсонгүй эсвэл эрх хүрэхгүй" });

    res.json({ message: "Хуваарь устгагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
