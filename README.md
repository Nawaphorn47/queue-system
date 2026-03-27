🎫 Queue Management System (Backend API)
ระบบ API สำหรับจัดการคิวการให้บริการ (Queue Management) ที่ออกแบบมาเพื่อความเสถียร รองรับการทำงานในรูปแบบ Container และพร้อมสำหรับการขยายตัว

🚀 จุดเด่นของระบบ (Key Features)
Automated Queueing: ระบบรันหมายเลขคิวให้อัตโนมัติเมื่อมีการจอง

Service Counter Management: รองรับการเรียกคิวแยกตามหมายเลขช่องบริการ (Counter)

Real-time Ready: มี Endpoint สำหรับดึงข้อมูลคิวที่กำลังเรียก (Active) และคิวที่รออยู่ (Waiting) เพื่อนำไปแสดงผลบนหน้าจอ Display

Infrastructure as Code: ระบบทั้งหมดทำงานบน Docker Compose เพื่อความง่ายในการ Deploy และสภาพแวดล้อมที่คงที่

Reverse Proxy: ใช้ Nginx เป็น Gateway ในการจัดการ Traffic และทำ Reverse Proxy ไปยัง API

🛠 Tech Stack
Language: Node.js (JavaScript)

Framework: Express.js

Database: PostgreSQL

Server/Proxy: Nginx

Containerization: Docker & Docker Compose

🏗 สถาปัตยกรรมระบบ (System Architecture)
ระบบถูกออกแบบให้ทำงานร่วมกันผ่าน Docker Container โดยมีองค์ประกอบหลักดังนี้:

Nginx: รับ Request จากภายนอกและส่งต่อไปยัง API Service

API Service (Node.js): จัดการ Business Logic และเชื่อมต่อฐานข้อมูล

Database (PostgreSQL): จัดเก็บข้อมูลคิวและสถานะต่างๆ

📝 รายละเอียด API (API Endpoints)
คุณสามารถดูเอกสารฉบับเต็มได้ที่โฟลเดอร์ queue-docs/ โดยมี Endpoint หลักดังนี้:

POST /reserve - จองคิวใหม่ (รับชื่อลูกค้า)

PATCH /call-next - เจ้าหน้าที่เรียกคิวถัดไป (ระบุหมายเลขช่องบริการ)

GET /queues/active - ดึงรายการคิวที่กำลังถูกเรียกไปที่ช่องบริการ

GET /queues/waiting - ดึงรายการคิวที่กำลังรออยู่ทั้งหมด

⚙️ วิธีการติดตั้งและรันระบบ (Installation)
Clone โปรเจกต์นี้ลงเครื่องของคุณ

ตรวจสอบว่าคุณได้ติดตั้ง Docker และ Docker Compose เรียบร้อยแล้ว

รันคำสั่งเพื่อเริ่มระบบ:

Bash
docker-compose up -d --build
ระบบจะเริ่มต้นทำงาน:

API: เข้าถึงผ่าน Nginx ที่ http://localhost

Database: PostgreSQL จะทำงานอยู่ที่ Port 5432 ภายในเครือข่าย Docker
