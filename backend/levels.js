const express = require("express");
const db      = require("./db");

const router = express.Router();

// GET / — public: list all levels ordered by sortOrder
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM levels ORDER BY "sortOrder", id`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
