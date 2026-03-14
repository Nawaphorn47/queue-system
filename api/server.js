const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // เพิ่ม CORS เพื่อให้หน้า HTML ดึงข้อมูลได้
const app = express();

// ==========================================
// 1. ตั้งค่าฐานข้อมูล (Database Config)
// ==========================================
const pool = new Pool({
    user: 'root',
    host: 'db',
    database: 'queue_db',
    password: '123456789',
    port: 5432,
});

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS queues (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(100) NOT NULL,
                queue_number INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'waiting',
                counter_number INTEGER,  -- เพิ่มคอลัมน์เก็บเลขช่องบริการ
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'queues' is ready!");
    } catch (err) {
        console.error("Error creating table", err);
    }
};

createTable();

// ==========================================
// 2. ตั้งค่า Middleware
// ==========================================
app.use(cors()); // อนุญาตให้เรียก API จากข้ามโดเมน/ไฟล์ HTML
app.use(express.json()); // ให้อ่านข้อมูล JSON ได้

// ==========================================
// 3. API Endpoints
// ==========================================

// เช็คสถานะ API
app.get('/', (req, res) => res.send('Queue API is running!'));

// [POST] จองคิวใหม่
app.post('/reserve', async (req, res) => {
    const { name } = req.body;
    try {
        const lastQueue = await pool.query('SELECT MAX(queue_number) FROM queues');
        const nextNumber = (lastQueue.rows[0].max || 0) + 1;

        const result = await pool.query(
            'INSERT INTO queues (customer_name, queue_number) VALUES ($1, $2) RETURNING *',
            [name, nextNumber]
        );

        res.json({
            message: "จองคิวสำเร็จ!",
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการจองคิว" });
    }
});

// [GET] ดึงข้อมูลคิวที่จองไว้ตาม ID
app.get('/reserve/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM queues WHERE id = $1', [id]);
        if (result.rows.length === 0) { 
            return res.status(404).json({ error: "ไม่พบคิว" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "เกิดข้อผิดพลาด" });
    }
});

// [PATCH] เรียกคิวถัดไป (ต้องการ counter_number)
app.patch('/call-next', async (req, res) => {
    const { counter_number } = req.body; // รับค่าช่องบริการว่าใครเป็นคนเรียก
    
    if (!counter_number) {
        return res.status(400).json({ error: "กรุณาระบุช่องบริการ (counter_number)" });
    }

    try {
        const nextQueue = await pool.query(
            'SELECT * FROM queues WHERE status = $1 ORDER BY queue_number ASC LIMIT 1',
            ['waiting']
        );

        if (nextQueue.rows.length === 0) {
            return res.status(404).json({ message: "ไม่มีคิวรออยู่" });
        }

        const id = nextQueue.rows[0].id;
        const result = await pool.query(
            'UPDATE queues SET status = $1, counter_number = $2 WHERE id = $3 RETURNING *',
            ['called', counter_number, id]
        );

        res.json({ message: "เรียกคิวสำเร็จ", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [GET] หน้าจอ Display - ดึงคิวที่กำลังถูกเรียกไปโชว์
app.get('/queues/active', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT queue_number, counter_number FROM queues WHERE status = $1 ORDER BY created_at DESC LIMIT 5', 
            ['called']
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "เกิดข้อผิดพลาด" });
    }
});

// [GET] ดึงคิวที่ยังรออยู่ทั้งหมด
app.get('/queues/waiting', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM queues WHERE status = $1 ORDER BY queue_number ASC', ['waiting']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "เกิดข้อผิดพลาด" });
    }   
});

// ==========================================
// 4. สตาร์ท Server
// ==========================================
app.listen(3000, () => console.log('Server is running on port 3000'));