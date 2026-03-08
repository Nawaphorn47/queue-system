const express = require('express');
const { Pool } = require('pg');
const app = express();

// ตั้งค่าเชื่อมต่อ Database (ดึงชื่อมาจาก Docker Compose)
const pool = new Pool({
  user: 'root',             // ต้องเป็น root ตามที่ตั้งใน docker-compose
  host: 'db',               // ชื่อ service ใน docker-compose
  database: 'queue_db',     // ต้องตรงกับ POSTGRES_DB
  password: '123456789',    // ต้องเป็น 123456789 ตามที่คุณตั้งล่าสุด
  port: 5432,
});

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS queues  (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        queue_number INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table created successfully!");
  } catch (err) {
    console.error("Error creating table", err);
  }
};

createTable();
 
app.get('/', (req, res) => res.send('Queue API is running!'));

// เพิ่มบรรทัดนี้เพื่อให้ Express อ่านข้อมูล JSON จากหน้าบ้านได้
app.use(express.json());

// Endpoint สำหรับจองคิว
app.post('/reserve', async (req, res) => {
    const { name } = req.body; // รับชื่อลูกค้ามาจาก request body

    try {
        // 1. หาเลขคิวล่าสุด (Logic ที่เคยไกด์ไว้)
        const lastQueue = await pool.query('SELECT MAX(queue_number) FROM queues');
        const nextNumber = (lastQueue.rows[0].max || 0) + 1;

        // 2. บันทึกลง Database
        const result = await pool.query(
            'INSERT INTO queues (customer_name, queue_number) VALUES ($1, $2) RETURNING *',
            [name, nextNumber]
        );

        // 3. ส่งผลลัพธ์กลับไปบอกหน้าบ้าน
        res.status(201).json({
            message: "จองคิวสำเร็จ!",
            data: result.rows[0]
        });

        res.send(`จองคิวสำเร็จ! เลขคิวของคุณคือ ${nextNumber}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการจองคิว" });
    }
});

// Endpoint สำหรับดึงข้อมูลคิวที่จองไว้
app.get('/reserve/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM queues WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "คิวไม่พบ" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลคิว" });
    }
});





app.listen(3000, () => console.log('Server on port 3000'));