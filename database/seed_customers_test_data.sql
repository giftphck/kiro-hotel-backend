-- Seed test data for customers table
-- Run this AFTER creating the customers table

INSERT INTO customers (name, phone_number, thai_id_card) VALUES
('สมชาย ใจดี', '0812345678', '1234567890123'),
('สมหญิง รักสงบ', '0823456789', '2345678901234'),
('วิชัย มั่นคง', '0834567890', '3456789012345'),
('สุดา สวยงาม', '0845678901', '4567890123456'),
('ประยุทธ์ เข้มแข็ง', '0856789012', '5678901234567'),
('นิภา อ่อนโยน', '0867890123', '6789012345678'),
('สมศักดิ์ กล้าหาญ', '0878901234', '7890123456789'),
('วรรณา สดใส', '0889012345', '8901234567890'),
('ชัยวัฒน์ ซื่อสัตย์', '0890123456', '9012345678901'),
('พิมพ์ใจ น่ารัก', '0801234567', '0123456789012')
ON CONFLICT (thai_id_card) DO NOTHING;

-- Verify inserted data
SELECT 
  customer_id,
  name,
  phone_number,
  thai_id_card,
  created_at
FROM customers
ORDER BY created_at DESC;
