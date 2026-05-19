const express = require("express");
const bcrypt  = require("bcrypt");
const db      = require("./db");
const { authenticateToken } = require("./authMiddleware");

const router = express.Router();

// GET own profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id,"lastName","firstName",phone,email,"birthDate",gender,role,"profileImage","createdAt"
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update profile info
router.put("/", authenticateToken, async (req, res) => {
  const { firstName, lastName, email, birthDate, gender } = req.body;
  try {
    const result = await db.query(
      `UPDATE users SET "firstName"=$1,"lastName"=$2,email=$3,"birthDate"=$4,gender=$5 WHERE id=$6`,
      [firstName, lastName, email || null, birthDate || null, gender || null, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });
    res.json({ message: "Мэдээлэл шинэчлэгдлээ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT profile image (base64)
router.put("/image", authenticateToken, async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "Зураг байхгүй байна" });
  try {
    await db.query(`UPDATE users SET "profileImage"=$1 WHERE id=$2`, [image, req.user.id]);
    res.json({ message: "Зураг шинэчлэгдлээ", image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT change password
router.put("/password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Бүх талбарыг бөглөнө үү" });
  if (newPassword.length < 6)
    return res.status(400).json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" });

  try {
    const result = await db.query(`SELECT password FROM users WHERE id=$1`, [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });

    const match = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!match) return res.status(400).json({ error: "Одоогийн нууц үг буруу байна" });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE users SET password=$1 WHERE id=$2`, [hash, req.user.id]);
    res.json({ message: "Нууц үг амжилттай солигдлоо" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
