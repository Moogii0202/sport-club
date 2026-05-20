const express = require("express");
const db      = require("./db");
const { authenticateToken } = require("./authMiddleware");

const router = express.Router();

// POST /socialpay/create — generate SocialPay invoice and return payment URL
// Production: replace this with a real Khan Bank SocialPay API call
router.post("/socialpay/create", authenticateToken, async (req, res) => {
  const { classId } = req.body;
  if (!classId) return res.status(400).json({ error: "Бүлэг сонгоно уу" });

  try {
    const cls = await db.query(
      `SELECT cg.fee, cg.name, cg.level FROM class_groups cg WHERE cg.id = $1`,
      [classId]
    );
    if (!cls.rows.length) return res.status(404).json({ error: "Бүлэг олдсонгүй" });

    const { fee, name, level } = cls.rows[0];
    const invoiceNo = `SP${Date.now()}`.slice(-12);

    // ── Production: call Khan Bank SocialPay API ────────────────────────────
    // POST https://api.khanbank.com/v1/pos/invoice/create
    //   { merchantId, terminalId, amount, description, invoiceNo, callbackUrl }
    // → returns { qr, paymentUrl, invoiceNo }
    // ─────────────────────────────────────────────────────────────────────────

    res.json({
      invoiceNo,
      amount:      fee || 0,
      description: `${level} · ${name} — сарын хураамж`,
      paymentUrl:  `https://socialpay.mn`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
