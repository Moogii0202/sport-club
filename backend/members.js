const express = require("express");
const db      = require("./db");
const { authenticateToken, requireRole } = require("./authMiddleware");

const router = express.Router();

// GET / — coach: all approved members enrolled in coach's classes
router.get("/", authenticateToken, requireRole("coach"), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u."firstName",
        u."lastName",
        u.phone,
        u.email,
        u."profileImage",
        cg.id            AS "classId",
        cg.name          AS "group",
        cg.level,
        e."submittedAt"  AS "enrolledAt",
        (
          SELECT COUNT(*) FROM (
            SELECT DISTINCT ts.date
            FROM attendance a
            JOIN training_sessions ts ON a."sessionId" = ts.id
            WHERE a."userId"   = u.id
              AND ts."classId" = cg.id
              AND ts."coachId" = $1
          ) _d
        ) AS "totalSessions",
        (
          SELECT COUNT(*) FROM (
            SELECT DISTINCT ON (ts.date) ts.date, a.status
            FROM attendance a
            JOIN training_sessions ts ON a."sessionId" = ts.id
            WHERE a."userId"   = u.id
              AND ts."classId" = cg.id
              AND ts."coachId" = $1
            ORDER BY ts.date, ts.id DESC
          ) _d
          WHERE _d.status IN ('present', 'late')
        ) AS "attendedSessions"
      FROM enrollments e
      JOIN users u  ON e."userId"  = u.id
      JOIN class_groups cg ON e."classId" = cg.id
      WHERE cg."coachId" = $1
        AND e.status = 'approved'
      ORDER BY cg.level, u."lastName", u."firstName"
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:userId/attendance — coach: attendance history for a specific member (optionally filtered by classId)
router.get("/:userId/attendance", authenticateToken, requireRole("coach"), async (req, res) => {
  const { classId } = req.query;
  try {
    const result = await db.query(`
      SELECT
        a."date",
        a."startTime",
        a."endTime",
        a.location,
        cg.name  AS "group",
        cg.level,
        a.status
      FROM (
        SELECT DISTINCT ON (ts."classId", ts.date)
          ts.id         AS "sessionId",
          ts.date,
          ts."startTime",
          ts."endTime",
          ts.location,
          ts."classId",
          att.status
        FROM (
          SELECT DISTINCT ON ("sessionId") "sessionId", status
          FROM attendance
          WHERE "userId" = $2
          ORDER BY "sessionId", id DESC
        ) att
        JOIN training_sessions ts ON ts.id = att."sessionId"
        JOIN (
          SELECT "classId",
            TO_CHAR(COALESCE(MAX("reviewedAt"), MAX("submittedAt")), 'YYYY-MM-DD') AS "enrolledDate"
          FROM enrollments
          WHERE "userId" = $2 AND status = 'approved'
          GROUP BY "classId"
        ) enr ON enr."classId" = ts."classId"
        WHERE ts."coachId" = $1
          AND ($3::integer IS NULL OR ts."classId" = $3::integer)
          AND ts.date >= enr."enrolledDate"
        ORDER BY ts."classId", ts.date, ts.id DESC
      ) a
      JOIN class_groups cg ON cg.id = a."classId"
      ORDER BY a."date" DESC
      LIMIT 60
    `, [req.user.id, req.params.userId, classId || null]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
