const bcrypt = require("bcrypt");
const db = require("./db");

async function seed() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const coachPassword = await bcrypt.hash("coach123", 10);

  const run = (sql, params) =>
    new Promise((resolve, reject) =>
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      })
    );

  try {
    // Admin
    const admin = await run(
      `INSERT OR IGNORE INTO Users (lastName, firstName, phone, password, email, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["Админ", "Систем", "99000001", adminPassword, "admin@volleyball.mn", "admin"]
    );
    console.log(admin.changes > 0 ? "✅ Admin үүслээ: 99000001 / admin123" : "⚠️  Admin аль хэдийн байна");

    // Coach
    const coach = await run(
      `INSERT OR IGNORE INTO Users (lastName, firstName, phone, password, email, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["Бат-Эрдэнэ", "Болд", "99000002", coachPassword, "coach@volleyball.mn", "coach"]
    );
    console.log(coach.changes > 0 ? "✅ Coach үүслээ: 99000002 / coach123" : "⚠️  Coach аль хэдийн байна");

    // ClassGroups
    const groups = [
      [1, "Анхан шат", "Волейболын үндсэн дүрэм, техник", "beginner", 20, 80000],
      [2, "Дунд шат", "Тактик, багийн тоглолт", "intermediate", 15, 100000],
      [3, "Ахисан шат", "Тэмцээний бэлтгэл, мэргэжлийн сургалт", "advanced", 12, 120000],
    ];
    for (const [id, name, desc, level, cap, fee] of groups) {
      await run(
        `INSERT OR IGNORE INTO ClassGroups (id, name, description, level, maxCapacity, fee)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, desc, level, cap, fee]
      );
    }
    console.log("✅ ClassGroups үүслээ");

  } catch (err) {
    console.error("❌ Seed алдаа:", err.message);
  } finally {
    db.close(() => console.log("🔒 DB хаагдлаа"));
  }

  console.log("\n--- Нэвтрэх мэдээлэл ---");
  console.log("Админ:          99000001 / admin123");
  console.log("Дасгалжуулагч:  99000002 / coach123");
}

seed();