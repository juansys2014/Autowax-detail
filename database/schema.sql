-- ============================================
-- AUTO WAX SOUTH FLORIDA — DATABASE SCHEMA
-- Run this in MySQL Workbench
-- ============================================

CREATE DATABASE IF NOT EXISTS autowax_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE autowax_db;

-- ─── USERS (admins, employees, sellers) ───────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(180)  UNIQUE,
  phone         VARCHAR(20)   UNIQUE,
  password_hash VARCHAR(255),
  role          ENUM('superadmin','admin','user','vendedor') NOT NULL DEFAULT 'user',
  active        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── SELLERS (vendedores — extends users) ─────────────────────
CREATE TABLE IF NOT EXISTS sellers (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL UNIQUE,
  qr_code         VARCHAR(100) UNIQUE,
  qr_url          VARCHAR(500),
  commission_type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  commission_value DECIMAL(8,2) NOT NULL DEFAULT 10.00,
  notes           TEXT,
  active          TINYINT(1)  NOT NULL DEFAULT 1,
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── CLIENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  email       VARCHAR(180),
  seller_id   INT UNSIGNED,
  notes       TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─── APPOINTMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id     INT UNSIGNED NOT NULL,
  seller_id     INT UNSIGNED,
  service       VARCHAR(120) NOT NULL,
  vehicle_make  VARCHAR(100),
  vehicle_color VARCHAR(60),
  vin           VARCHAR(17),
  preferred_date DATE,
  notes         TEXT,
  status        ENUM('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  confirmed_by  INT UNSIGNED,
  confirmed_at  DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)    REFERENCES clients(id)  ON DELETE CASCADE,
  FOREIGN KEY (seller_id)    REFERENCES sellers(id)  ON DELETE SET NULL,
  FOREIGN KEY (confirmed_by) REFERENCES users(id)    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─── INVOICES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_number  VARCHAR(20) NOT NULL UNIQUE,
  client_id       INT UNSIGNED NOT NULL,
  appointment_id  INT UNSIGNED,
  subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax             DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method  ENUM('cash','card','zelle','venmo') NOT NULL DEFAULT 'cash',
  status          ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  paid_at         DATETIME,
  paid_by         INT UNSIGNED,
  notes           TEXT,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)       REFERENCES clients(id)      ON DELETE RESTRICT,
  FOREIGN KEY (appointment_id)  REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (paid_by)         REFERENCES users(id)        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─── INVOICE ITEMS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id  INT UNSIGNED NOT NULL,
  description VARCHAR(200) NOT NULL,
  quantity    DECIMAL(8,2) NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  total       DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── COMMISSIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commissions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id       INT UNSIGNED NOT NULL,
  invoice_id      INT UNSIGNED NOT NULL,
  client_id       INT UNSIGNED NOT NULL,
  service         VARCHAR(120) NOT NULL,
  invoice_total   DECIMAL(10,2) NOT NULL,
  commission_type ENUM('percent','fixed') NOT NULL,
  commission_rate DECIMAL(8,2) NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  status          ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  payment_id      INT UNSIGNED,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id)  REFERENCES sellers(id)  ON DELETE RESTRICT,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  FOREIGN KEY (client_id)  REFERENCES clients(id)  ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ─── COMMISSION PAYMENTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS commission_payments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id   INT UNSIGNED NOT NULL,
  total       DECIMAL(10,2) NOT NULL,
  paid_by     INT UNSIGNED NOT NULL,
  paid_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  method      ENUM('cash','transfer','check','other') NOT NULL DEFAULT 'cash',
  notes       TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE RESTRICT,
  FOREIGN KEY (paid_by)   REFERENCES users(id)   ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Add payment_id FK to commissions after commission_payments exists
ALTER TABLE commissions
  ADD CONSTRAINT fk_commission_payment
  FOREIGN KEY (payment_id) REFERENCES commission_payments(id) ON DELETE SET NULL;

-- ─── COMMISSION CONFIG (override per seller/service) ──────────
CREATE TABLE IF NOT EXISTS commission_config (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id       INT UNSIGNED,
  service         VARCHAR(120),
  commission_type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  commission_value DECIMAL(8,2) NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── SERVICE CATALOG ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_catalog (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  category    ENUM('service','product') NOT NULL DEFAULT 'service',
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── SERVICE PRICE HISTORY ────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_price_history (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id  INT UNSIGNED NOT NULL,
  old_price   DECIMAL(10,2) NOT NULL,
  new_price   DECIMAL(10,2) NOT NULL,
  changed_by  INT UNSIGNED NOT NULL,
  notes       TEXT,
  changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES service_catalog(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ─── ROLES (custom RBAC) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(60)  NOT NULL UNIQUE,
  description VARCHAR(200),
  color       VARCHAR(20)  NOT NULL DEFAULT 'blue',
  is_system   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── ROLE PERMISSIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id     INT UNSIGNED NOT NULL,
  module      VARCHAR(60)  NOT NULL,
  can_view    TINYINT(1)   NOT NULL DEFAULT 0,
  can_create  TINYINT(1)   NOT NULL DEFAULT 0,
  can_edit    TINYINT(1)   NOT NULL DEFAULT 0,
  can_delete  TINYINT(1)   NOT NULL DEFAULT 0,
  UNIQUE KEY uq_role_module (role_id, module),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- role_id on users (links to custom roles)
ALTER TABLE users ADD COLUMN role_id INT UNSIGNED NULL AFTER role;
ALTER TABLE users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_clients_phone     ON clients(phone);
CREATE INDEX idx_clients_seller    ON clients(seller_id);
CREATE INDEX idx_appts_client      ON appointments(client_id);
CREATE INDEX idx_appts_seller      ON appointments(seller_id);
CREATE INDEX idx_appts_status      ON appointments(status);
CREATE INDEX idx_appts_date        ON appointments(preferred_date);
CREATE INDEX idx_invoices_client   ON invoices(client_id);
CREATE INDEX idx_invoices_status   ON invoices(status);
CREATE INDEX idx_commissions_seller ON commissions(seller_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_sellers_qr        ON sellers(qr_code);
