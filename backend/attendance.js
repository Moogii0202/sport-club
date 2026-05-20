const express = require("express");
const db      = require("./db");
const { authenticateToken } = require("./authMiddleware");

const router = express.Router();

// GET /my — player: own attendance records from approved enrolled classes
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        TO_CHAR(a.date::date, 'YYYY-MM-DD') AS date,
        a."startTime"                 AS "checkIn",
        a."endTime"                   AS "checkOut",
        cg.name                       AS "group",
        COALESCE(a.status, 'absent')  AS status
      FROM (
        SELECT DISTINCT ON (ts."classId", ts.date)
          ts.id         AS "sessionId",
          ts.date,
          ts."startTime",
          ts."endTime",
          ts."classId",
          att.status
        FROM training_sessions ts
        JOIN (
          SELECT "classId",
            TO_CHAR(COALESCE(MAX("reviewedAt"), MAX("submittedAt")), 'YYYY-MM-DD') AS "enrolledDate"
          FROM enrollments
          WHERE "userId" = $1 AND status = 'approved'
          GROUP BY "classId"
        ) enr ON enr."classId" = ts."classId"
        LEFT JOIN (
          SELECT DISTINCT ON ("sessionId") "sessionId", status
          FROM attendance
          WHERE "userId" = $1
          ORDER BY "sessionId", id DESC
        ) att ON att."sessionId" = ts.id
        WHERE ts.date >= enr."enrolledDate"
          AND EXISTS (
            SELECT 1 FROM schedule sch
            WHERE sch."classId" = ts."classId"
              AND sch."dayOfWeek" = CASE EXTRACT(DOW FROM ts.date::date)
                WHEN 1 THEN 'Даваа'  WHEN 2 THEN 'Мягмар' WHEN 3 THEN 'Лхагва'
                WHEN 4 THEN 'Пүрэв'  WHEN 5 THEN 'Баасан' WHEN 6 THEN 'Бямба'
                WHEN 0 THEN 'Ням'
              END
          )
        ORDER BY ts."classId", ts.date, ts.id DESC
      ) a
      JOIN class_groups cg ON cg.id = a."classId"
      ORDER BY a.date DESC
      LIMIT 50
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
