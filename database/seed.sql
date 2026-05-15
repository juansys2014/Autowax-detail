-- ============================================
-- AUTO WAX SOUTH FLORIDA — SEED DATA
-- Run AFTER schema.sql
-- ============================================

USE autowax_db;

-- ─── USERS ────────────────────────────────────────────────────
-- Passwords are bcrypt hashes
-- superadmin → Admin2025!
-- admin      → Manager2025!
-- user       → Tech2025!

INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Super Admin',   'admin@autowax.com',   NULL,           '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin'),
('Maria Manager', 'manager@autowax.com', NULL,           '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Tech Carlos',   'carlos@autowax.com',  NULL,           '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Javier Lopez',  NULL,                  '15612000001',  NULL, 'vendedor'),
('Maria Garcia',  NULL,                  '15612000002',  NULL, 'vendedor'),
('Roberto Cruz',  NULL,                  '15612000003',  NULL, 'vendedor');

-- ─── SELLERS ──────────────────────────────────────────────────
INSERT INTO sellers (user_id, qr_code, qr_url, commission_type, commission_value) VALUES
(4, 'SELLER_JL001', 'http://localhost:3000/?ref=SELLER_JL001', 'percent', 10.00),
(5, 'SELLER_MG002', 'http://localhost:3000/?ref=SELLER_MG002', 'percent', 10.00),
(6, 'SELLER_RC003', 'http://localhost:3000/?ref=SELLER_RC003', 'fixed',   25.00);

-- ─── CLIENTS ──────────────────────────────────────────────────
INSERT INTO clients (name, phone, email, seller_id) VALUES
('Michael Torres',  '5612345678', 'm.torres@email.com', 1),
('Sarah Johnson',   '5613456789', 's.johnson@email.com', 1),
('Carlos Mendez',   '5614567890', 'c.mendez@email.com',  2),
('Emma Wilson',     '5615678901', 'e.wilson@email.com',  2),
('James Rivera',    '5616789012', 'j.rivera@email.com',  3),
('Linda Park',      '5617890123', 'l.park@email.com',    1);

-- ─── APPOINTMENTS ─────────────────────────────────────────────
INSERT INTO appointments (client_id, seller_id, service, vehicle_make, vehicle_color, preferred_date, status) VALUES
(1, 1, 'Paint Correction & Ceramic Coating', 'BMW M3 2021',       'Black',  '2025-05-20', 'confirmed'),
(2, 1, 'Professional Detailing',             'Honda CR-V 2023',   'White',  '2025-05-20', 'pending'),
(3, 2, 'Headlight Restoration',              'Nissan Altima 2019','Silver', '2025-05-21', 'confirmed'),
(4, 2, 'Ozone Treatment',                    'Ford F-150 2022',   'Gray',   '2025-05-21', 'confirmed'),
(5, 3, 'Window Tint & Paint Protection Film','Tesla Model 3',      'White',  '2025-05-22', 'pending'),
(6, 1, 'Paint & Fabric Protection',          'Audi Q5 2022',      'Blue',   '2025-05-23', 'pending');

-- ─── INVOICES ─────────────────────────────────────────────────
INSERT INTO invoices (invoice_number, client_id, appointment_id, subtotal, tax, total, payment_method, status, paid_at, paid_by) VALUES
('AWX-0001', 1, 1, 698.00, 0, 698.00, 'card',  'paid', '2025-05-15 10:30:00', 1),
('AWX-0002', 2, 2, 149.00, 0, 149.00, 'cash',  'paid', '2025-05-14 11:00:00', 1),
('AWX-0003', 3, 3, 79.00,  0, 79.00,  'zelle', 'paid', '2025-05-13 09:00:00', 2),
('AWX-0004', 4, 4, 238.00, 0, 238.00, 'venmo', 'paid', '2025-05-12 14:00:00', 2);

-- ─── INVOICE ITEMS ────────────────────────────────────────────
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
(1, 'Paint Correction', 1, 299.00, 299.00),
(1, 'Ceramic Coating',  1, 399.00, 399.00),
(2, 'Professional Detailing', 1, 149.00, 149.00),
(3, 'Headlight Restoration',  1, 79.00,  79.00),
(4, 'Ozone Treatment',        1, 89.00,  89.00),
(4, 'Professional Detailing', 1, 149.00, 149.00);

-- ─── COMMISSIONS ──────────────────────────────────────────────
-- Seller 1 (Javier, 10%): invoice 1 = $69.80, invoice 2 = $14.90
-- Seller 2 (Maria, 10%):  invoice 3 = $7.90,  invoice 4 = $23.80
INSERT INTO commissions (seller_id, invoice_id, client_id, service, invoice_total, commission_type, commission_rate, amount, status) VALUES
(1, 1, 1, 'Paint Correction & Ceramic Coating', 698.00, 'percent', 10, 69.80, 'pending'),
(1, 2, 2, 'Professional Detailing',             149.00, 'percent', 10, 14.90, 'pending'),
(2, 3, 3, 'Headlight Restoration',              79.00,  'percent', 10,  7.90, 'pending'),
(2, 4, 4, 'Ozone Treatment',                    238.00, 'percent', 10, 23.80, 'pending');

SELECT 'Seed completed successfully!' AS status;
SELECT CONCAT('Users: ', COUNT(*)) AS info FROM users
UNION ALL
SELECT CONCAT('Sellers: ', COUNT(*)) FROM sellers
UNION ALL
SELECT CONCAT('Clients: ', COUNT(*)) FROM clients
UNION ALL
SELECT CONCAT('Appointments: ', COUNT(*)) FROM appointments
UNION ALL
SELECT CONCAT('Invoices: ', COUNT(*)) FROM invoices
UNION ALL
SELECT CONCAT('Commissions: ', COUNT(*)) FROM commissions;
