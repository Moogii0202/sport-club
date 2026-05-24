const express    = require("express");
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const db         = require("./db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret-change-in-production";

// ── OTP in-memory store ─────────────────────────────────────────────────────
const otpStore = new Map(); // phone → { otp, expiry, channel }

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otpStore) if (now > v.expiry) otpStore.delete(k);
}, 60_000);

async function sendOtpEmail(to, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[OTP Email] To: ${to}  Code: ${otp}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"Volleyball Club" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Бүртгэлийн баталгаажуулах код",
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;background:#111;border-radius:16px;padding:32px">
        <h2 style="color:#f97316;margin:0 0 16px">Баталгаажуулах код</h2>
        <p style="color:#9ca3af;margin:0 0 20px">Таны нэг удаагийн код:</p>
        <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#f97316;
                    background:#1a1a1a;border-radius:12px;text-align:center;padding:20px 0">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:12px;margin:16px 0 0">Код 5 минутын дараа хүчингүй болно.</p>
      </div>`,
  });
}

// ── POST /otp/send ──────────────────────────────────────────────────────────
router.post("/otp/send", async (req, res) => {
  let { channel, phone, email } = req.body;
  phone = phone?.replace(/[\s\-]/g, "");

  if (!phone || !/^\d{8}$/.test(phone))
    return res.status(400).json({ error: "8 оронтой утасны дугаар оруулна уу" });
  if (channel === "email" && !email?.includes("@"))
    return res.status(400).json({ error: "И-мэйл хаяг буруу байна" });

  try {
    const existing = await db.query(`SELECT id FROM users WHERE phone = $1`, [phone]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Энэ утасны дугаар бүртгэлтэй байна" });

    const otp    = Math.floor(10000 + Math.random() * 90000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore.set(phone, { otp, expiry, channel });

    if (channel === "email" && email) {
      await sendOtpEmail(email, otp);
    } else {
      console.log(`[OTP SMS] ${phone} → ${otp}`);
    }

    res.json({ message: "OTP илгээгдлээ" });
  } catch (err) {
    console.error("OTP send error:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
});

// ── Register ──────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  let { lastName, firstName, phone, password, email, birthDate, gender, otp } = req.body;

  phone = phone?.replace(/[\s\-]/g, "");

  if (!phone || !password || !firstName || !lastName)
    return res.status(400).json({ error: "Овог, нэр, утасны дугаар, нууц үг заавал шаардлагатай" });
  if (!/^\d{8}$/.test(phone))
    return res.status(400).json({ error: "Утасны дугаар 8 оронтой тоо байна" });
  if (password.length < 6)
    return res.status(400).json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" });

  // Verify OTP
  if (!otp)
    return res.status(400).json({ error: "Баталгаажуулах код оруулна уу" });

  const stored = otpStore.get(phone);
  if (!stored)
    return res.status(400).json({ error: "Баталгаажуулах код илгээгдээгүй байна. Дахин авна уу" });
  if (Date.now() > stored.expiry) {
    otpStore.delete(phone);
    return res.status(400).json({ error: "Кодын хугацаа дууссан. Дахин код авна уу" });
  }
  if (stored.otp !== otp)
    return res.status(400).json({ error: "Код буруу байна. Дахин оролдоно уу" });

  otpStore.delete(phone);

  try {
    const existing = await db.query(`SELECT id FROM users WHERE phone = $1`, [phone]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Энэ утасны дугаар бүртгэлтэй байна" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users ("lastName","firstName",phone,password,email,"birthDate",gender,role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'player') RETURNING id`,
      [lastName, firstName, phone, hashedPassword, email || null, birthDate || null, gender || null]
    );

    res.status(201).json({ message: "Амжилттай бүртгэгдлээ", userId: result.rows[0].id });

  } catch (err) {
    console.error("Register алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа гарлаа" });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  let { phone, password, role } = req.body;

  phone = phone?.replace(/[\s\-]/g, "");

  if (!phone || !password)
    return res.status(400).json({ error: "Утасны дугаар болон нууц үг шаардлагатай" });

  try {
    const result = await db.query(
      `SELECT * FROM users WHERE phone = $1`, [phone]
    );
    const user = result.rows[0];

    if (!user)
      return res.status(400).json({ error: "Утасны дугаар эсвэл нууц үг буруу байна" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Утасны дугаар эсвэл нууц үг буруу байна" });

    if (role && user.role !== role) {
      const roleNames = { admin: "Админ", coach: "Дасгалжуулагч", player: "Хэрэглэгч" };
      return res.status(403).json({
        error: `Энэ дугаар ${roleNames[user.role] || user.role} эрхтэй. ${roleNames[role] || role} эрхээр нэвтрэх боломжгүй.`
      });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Амжилттай нэвтэрлээ",
      token,
      user: {
        id:        user.id,
        firstName: user.firstName,
        lastName:  user.lastName,
        phone:     user.phone,
        email:     user.email,
        birthDate: user.birthDate,
        gender:    user.gender,
        role:      user.role,
        profileImage: user.profileImage,
      },
    });

  } catch (err) {
    console.error("Login алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа гарлаа" });
  }
});

// POST /forgot — OTP үүсгэж хадгалах
router.post("/forgot", async (req, res) => {
  let { phone } = req.body;
  phone = phone?.replace(/[\s\-]/g, "");

  if (!phone || !/^\d{8}$/.test(phone))
    return res.status(400).json({ error: "8 оронтой утасны дугаар оруулна уу" });

  try {
    const user = await db.query(`SELECT id FROM users WHERE phone = $1`, [phone]);

    // Бүртгэлтэй эсэхийг задруулахгүй
    if (!user.rows.length)
      return res.json({ message: "OTP код илгээгдлээ" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 мин

    await db.query(
      `UPDATE users SET "resetOtp" = $1, "resetOtpExpiry" = $2 WHERE id = $3`,
      [otp, expiry, user.rows[0].id]
    );

    // TODO: SMS provider холбогдсон үед энд sendSMS(phone, otp) нэмнэ
    console.log(`[OTP] ${phone} → ${otp}`);

    res.json({ message: "OTP код илгээгдлээ" });
  } catch (err) {
    res.status(500).json({ error: "Серверийн алдаа" });
  }
});

// POST /reset-password — OTP шалгаж нууц үг солих
router.post("/reset-password", async (req, res) => {
  let { phone, otp, newPassword } = req.body;
  phone = phone?.replace(/[\s\-]/g, "");

  if (!phone || !otp || !newPassword)
    return res.status(400).json({ error: "Бүх талбарыг бөглөнө үү" });
  if (newPassword.length < 6)
    return res.status(400).json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" });

  try {
    const result = await db.query(
      `SELECT id, "resetOtp", "resetOtpExpiry" FROM users WHERE phone = $1`,
      [phone]
    );

    const user = result.rows[0];

    if (!user || user.resetOtp !== otp)
      return res.status(400).json({ error: "OTP код буруу байна" });

    if (new Date() > new Date(user.resetOtpExpiry))
      return res.status(400).json({ error: "OTP кодын хугацаа дууссан байна. Дахин оролдоно уу" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE users SET password = $1, "resetOtp" = NULL, "resetOtpExpiry" = NULL WHERE id = $2`,
      [hashed, user.id]
    );

    res.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" });
  } catch (err) {
    res.status(500).json({ error: "Серверийн алдаа" });
  }
});

module.exports = router;
