const { Pool } = require("pg");
const bcrypt   = require("bcrypt");
require("dotenv").config();

// Pick up DATABASE_URL under any of the common names Railway may inject
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL ||
  process.env.DATABASE_PRIVATE_URL;

console.log("🔍 DB config:", dbUrl
  ? "DATABASE_URL set ✓ (" + dbUrl.slice(0, 25) + "...)"
  : `no URL → host=${process.env.DB_HOST || "localhost"}`);

const pool = dbUrl
  ? new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host:     process.env.DB_HOST     || "localhost",
      port:     parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME     || "sportclub",
      user:     process.env.DB_USER     || "postgres",
      password: String(process.env.DB_PASSWORD ?? ""),
    });

pool.connect()
  .then(client => { console.log("✅ PostgreSQL-д холбогдлоо"); client.release(); })
  .catch(err  => console.error("❌ DB холболтын алдаа:", err.message));

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              SERIAL PRIMARY KEY,
        "lastName"      TEXT,
        "firstName"     TEXT,
        phone           TEXT UNIQUE NOT NULL,
        password        TEXT NOT NULL,
        email           TEXT,
        "birthDate"     TEXT,
        gender          TEXT,
        role            TEXT DEFAULT 'player',
        "profileImage"  TEXT,
        "createdAt"     TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS class_groups (
        id              SERIAL PRIMARY KEY,
        name            TEXT NOT NULL,
        description     TEXT,
        "coachId"       INTEGER REFERENCES users(id),
        level           TEXT,
        "maxCapacity"   INTEGER DEFAULT 20,
        fee             INTEGER DEFAULT 0
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id              SERIAL PRIMARY KEY,
        "userId"        INTEGER NOT NULL REFERENCES users(id),
        "classId"       INTEGER NOT NULL REFERENCES class_groups(id),
        "scheduleId"    INTEGER REFERENCES schedule(id),
        notes           TEXT,
        status          TEXT DEFAULT 'pending',
        "submittedAt"   TIMESTAMPTZ DEFAULT NOW(),
        "reviewedAt"    TIMESTAMPTZ
      )
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name='enrollments' AND column_name='scheduleId') THEN
          ALTER TABLE enrollments ADD COLUMN "scheduleId" INTEGER REFERENCES schedule(id);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schedule (
        id              SERIAL PRIMARY KEY,
        "classId"       INTEGER NOT NULL REFERENCES class_groups(id),
        "dayOfWeek"     TEXT NOT NULL,
        "startTime"     TEXT NOT NULL,
        "endTime"       TEXT NOT NULL,
        location        TEXT,
        "isPublic"      BOOLEAN DEFAULT TRUE,
        "startDate"     TEXT,
        "endDate"       TEXT
      )
    `);

    // Migration: add startDate/endDate to schedule if they don't exist
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedule' AND column_name='startDate') THEN
          ALTER TABLE schedule ADD COLUMN "startDate" TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedule' AND column_name='endDate') THEN
          ALTER TABLE schedule ADD COLUMN "endDate" TEXT;
        END IF;
      END $$;
    `);

    // Migration: convert startDate/endDate from `date` type to TEXT "YYYY-MM-DD"
    await client.query(`
      DO $$ BEGIN
        IF (SELECT data_type FROM information_schema.columns
            WHERE table_name='schedule' AND column_name='startDate') = 'date' THEN
          ALTER TABLE schedule
            ALTER COLUMN "startDate" TYPE TEXT USING TO_CHAR("startDate", 'YYYY-MM-DD'),
            ALTER COLUMN "endDate"   TYPE TEXT USING TO_CHAR("endDate",   'YYYY-MM-DD');
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_sessions (
        id              SERIAL PRIMARY KEY,
        "classId"       INTEGER NOT NULL REFERENCES class_groups(id),
        "coachId"       INTEGER NOT NULL REFERENCES users(id),
        date            TEXT NOT NULL,
        "startTime"     TEXT,
        "endTime"       TEXT,
        location        TEXT,
        "scheduleId"    INTEGER REFERENCES schedule(id)
      )
    `);

    // Migration: add scheduleId to training_sessions if missing
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name='training_sessions' AND column_name='scheduleId') THEN
          ALTER TABLE training_sessions ADD COLUMN "scheduleId" INTEGER REFERENCES schedule(id);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id              SERIAL PRIMARY KEY,
        "sessionId"     INTEGER NOT NULL REFERENCES training_sessions(id),
        "userId"        INTEGER NOT NULL REFERENCES users(id),
        status          TEXT DEFAULT 'present',
        "recordedAt"    TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE ("sessionId", "userId")
      )
    `);

    // Migration: add unique constraint if table already existed without it
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'attendance_sessionId_userId_key'
            AND conrelid = 'attendance'::regclass
        ) THEN
          ALTER TABLE attendance ADD CONSTRAINT "attendance_sessionId_userId_key"
            UNIQUE ("sessionId", "userId");
        END IF;
      END $$;
    `);

    // Migration: fix training_session dates that were stored in UTC instead of local time (UTC+8).
    // Skip update if it would conflict with another session on the same (classId, coachId, date).
    await client.query(`
      UPDATE training_sessions ts
      SET date = subq.local_date
      FROM (
        SELECT "sessionId",
               TO_CHAR(MIN("recordedAt") + INTERVAL '8 hours', 'YYYY-MM-DD') AS local_date
        FROM attendance
        GROUP BY "sessionId"
      ) subq
      WHERE subq."sessionId" = ts.id
        AND ts.date != subq.local_date
        AND NOT EXISTS (
          SELECT 1 FROM training_sessions ts2
          WHERE ts2."classId" = ts."classId"
            AND ts2."coachId" = ts."coachId"
            AND ts2.date = subq.local_date
            AND ts2.id != ts.id
        )
    `);

    // Migration: drop old (classId, coachId, date) unique constraint — replaced by (scheduleId, date)
    await client.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'training_sessions_class_coach_date_unique'
            AND conrelid = 'training_sessions'::regclass
        ) THEN
          ALTER TABLE training_sessions
            DROP CONSTRAINT training_sessions_class_coach_date_unique;
        END IF;
      END $$;
    `);

    // Migration: add unique constraint on training_sessions (scheduleId, date)
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'training_sessions_schedule_date_unique'
            AND conrelid = 'training_sessions'::regclass
        ) THEN
          ALTER TABLE training_sessions
            ADD CONSTRAINT training_sessions_schedule_date_unique
            UNIQUE ("scheduleId", date);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS performance (
        id              SERIAL PRIMARY KEY,
        "userId"        INTEGER NOT NULL REFERENCES users(id),
        "sessionId"     INTEGER NOT NULL REFERENCES training_sessions(id),
        score           REAL,
        feedback        TEXT,
        "createdAt"     TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id              SERIAL PRIMARY KEY,
        "userId"        INTEGER NOT NULL REFERENCES users(id),
        amount          REAL NOT NULL,
        method          TEXT,
        status          TEXT DEFAULT 'pending',
        "transactionId" TEXT,
        "paidAt"        TIMESTAMPTZ,
        "createdAt"     TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id        SERIAL PRIMARY KEY,
        "userId"  INTEGER NOT NULL REFERENCES users(id),
        title     TEXT,
        message   TEXT,
        type      TEXT DEFAULT 'general',
        "isRead"  BOOLEAN DEFAULT FALSE,
        "sentAt"  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS levels (
        id          SERIAL PRIMARY KEY,
        name        TEXT UNIQUE NOT NULL,
        badge       TEXT DEFAULT '',
        description TEXT DEFAULT '',
        features    JSONB DEFAULT '[]'::jsonb,
        fee         INTEGER DEFAULT 0,
        accent      TEXT DEFAULT 'orange',
        "sortOrder" INTEGER DEFAULT 0,
        "startDate" TEXT,
        "endDate"   TEXT
      )
    `);

    // Migration: add startDate/endDate to levels if they don't exist
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='levels' AND column_name='startDate') THEN
          ALTER TABLE levels ADD COLUMN "startDate" TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='levels' AND column_name='endDate') THEN
          ALTER TABLE levels ADD COLUMN "endDate" TEXT;
        END IF;
      END $$;
    `);

    // Seed: default levels
    await client.query(`
      INSERT INTO levels (name, badge, description, features, fee, accent, "sortOrder")
      VALUES
        ('Анхан шат', 'Эхлэгчдэд',
         'Волейболын үндсэн дүрэм, техник, хөдөлгөөний зөв хэлбэр зэргийг суурь түвшинд эзэмшинэ.',
         '["Үндсэн техник сургалт","Бие бялдрын бэлтгэл","Баг ажиллагааны дадал"]', 80000, 'orange', 1),
        ('Дунд шат', 'Дунд түвшин',
         'Тактик, багийн тоглолт болон тэмцээний бэлтгэлийн суурийг эзэмшинэ.',
         '["Тактикийн сургалт","Тэмцээний бэлтгэл суурь","Клубын дотоод тэмцээн"]', 100000, 'blue', 2),
        ('Ахисан шат', 'Мэргэжлийн',
         'Мэргэжлийн сургалт, улсын тэмцээний бэлтгэл, хувийн тактик боловсруулалт.',
         '["Мэргэжлийн сургалт","Улсын тэмцээнд оролцох","Хувийн тактик боловсруулалт"]', 120000, 'purple', 3)
      ON CONFLICT (name) DO NOTHING
    `);

    // Seed: admin
    const adminHash = await bcrypt.hash("admin123", 10);
    await client.query(`
      INSERT INTO users ("lastName","firstName",phone,password,email,role)
      VALUES ('Админ','Систем','99000001',$1,'admin@volleyball.mn','admin')
      ON CONFLICT (phone) DO NOTHING
    `, [adminHash]);

    // Seed: coach
    const coachHash = await bcrypt.hash("coach123", 10);
    await client.query(`
      INSERT INTO users ("lastName","firstName",phone,password,email,role)
      VALUES ('Бат-Эрдэнэ','Болд','99000002',$1,'coach@volleyball.mn','coach')
      ON CONFLICT (phone) DO NOTHING
    `, [coachHash]);

    console.log("✅ Хүснэгтүүд болон seed өгөгдөл бэлэн");
  } catch (err) {
    console.error("❌ initDB алдаа:", err.message);
  } finally {
    client.release();
  }
}

initDB();

module.exports = pool;
