const express = require("express");
const db      = require("./db");
const { authenticateToken, requireRole } = require("./authMiddleware");

const router = express.Router();

// GET / — public
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, district, "subDistrict", phone, "mapUrl", image, lat, lng, "createdAt"
       FROM halls ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / — админ
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  const { name, district, subDistrict, phone, mapUrl, image, lat, lng } = req.body;
  if (!name?.trim())
    return res.status(400).json({ error: "Заалны нэр шаардлагатай" });

  try {
    const result = await db.query(
      `INSERT INTO halls (name, district, "subDistrict", phone, "mapUrl", image, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, name, district, "subDistrict", phone, "mapUrl", image, lat, lng, "createdAt"`,
      [
        name.trim(),
        district?.trim()    || null,
        subDistrict?.trim() || null,
        phone?.trim()       || null,
        mapUrl?.trim()      || null,
        image               || null,
        lat  ? parseFloat(lat)  : null,
        lng  ? parseFloat(lng)  : null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Ийм нэртэй заал аль хэдийн бүртгэлтэй байна" });
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id — админ
router.put("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const { name, district, subDistrict, phone, mapUrl, image, lat, lng } = req.body;
  if (!name?.trim())
    return res.status(400).json({ error: "Заалны нэр шаардлагатай" });

  try {
    const result = await db.query(
      `UPDATE halls
       SET name=$1, district=$2, "subDistrict"=$3, phone=$4, "mapUrl"=$5,
           image=COALESCE($6, image), lat=$7, lng=$8
       WHERE id=$9
       RETURNING id, name, district, "subDistrict", phone, "mapUrl", image, lat, lng, "createdAt"`,
      [
        name.trim(),
        district?.trim()    || null,
        subDistrict?.trim() || null,
        phone?.trim()       || null,
        mapUrl?.trim()      || null,
        image               || null,
        lat  ? parseFloat(lat)  : null,
        lng  ? parseFloat(lng)  : null,
        req.params.id,
      ]
    );
    if (!result.rowCount)
      return res.status(404).json({ error: "Заал олдсонгүй" });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Ийм нэртэй заал аль хэдийн бүртгэлтэй байна" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id — админ
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM halls WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!result.rowCount)
      return res.status(404).json({ error: "Заал олдсонгүй" });
    res.json({ message: "Заал устгагдлаа" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
