```sql
-- 01_schema.sql
-- Revised schema for D2 (Shahzaib & Rohaan)
-- Renamed Transactions (was Transaction) to avoid reserved-word ambiguity
USE d2;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS AuditLog;
DROP TABLE IF EXISTS Refund;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Ticket;
DROP TABLE IF EXISTS Reservation;
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Seat;
DROP TABLE IF EXISTS Section;
DROP TABLE IF EXISTS Event;
DROP TABLE IF EXISTS Venue;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- Roles
-- =========================
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- =========================
-- Users
-- =========================
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hashed_password VARCHAR(255),
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- =========================
-- Venue
-- =========================
CREATE TABLE Venue (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    address VARCHAR(255),
    timezone VARCHAR(50),
    seating_config VARCHAR(255),
    capacity INT CHECK (capacity >= 0)
);

-- =========================
-- Section
-- =========================
CREATE TABLE Section (
    section_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (venue_id) REFERENCES Venue(venue_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =========================
-- Seat
-- =========================
CREATE TABLE Seat (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    row_label VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    seat_type ENUM('REGULAR','VIP','ACCESSIBLE') DEFAULT 'REGULAR',
    accessible_flag BOOLEAN DEFAULT FALSE,
    UNIQUE(section_id, row_label, seat_number),
    FOREIGN KEY (section_id) REFERENCES Section(section_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- =========================
-- Event
-- =========================
CREATE TABLE Event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    venue_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    status ENUM('DRAFT','PUBLISHED','CANCELLED') DEFAULT 'DRAFT',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES Venue(venue_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES Users(user_id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- =========================
-- Reservation (SeatHold)
-- =========================
CREATE TABLE Reservation (
    hold_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    event_id INT NOT NULL,
    seat_id INT NOT NULL,
    hold_expires_at DATETIME NOT NULL,
    status ENUM('HELD','EXPIRED','CONFIRMED','CANCELLED') DEFAULT 'HELD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (seat_id) REFERENCES Seat(seat_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- =========================
-- Transactions
-- =========================
CREATE TABLE Transactions (
    txn_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'PKR',
    payment_method VARCHAR(50),
    status ENUM('SUCCESS','FAILED','REVERSED') DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_txn_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (related_txn_id) REFERENCES Transactions(txn_id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- =========================
-- Payment
-- =========================
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    txn_id INT NOT NULL,
    gateway_ref VARCHAR(100),
    status ENUM('PAID','FAILED','PENDING') DEFAULT 'PENDING',
    paid_at DATETIME,
    FOREIGN KEY (txn_id) REFERENCES Transactions(txn_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =========================
-- Refund
-- =========================
CREATE TABLE Refund (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    txn_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'PKR',
    refunded_at DATETIME,
    reason VARCHAR(255),
    FOREIGN KEY (txn_id) REFERENCES Transactions(txn_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =========================
-- Ticket
-- =========================
CREATE TABLE Ticket (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(32) UNIQUE NOT NULL,
    reservation_id INT NOT NULL,
    purchase_txn_id INT NOT NULL,
    seat_id INT NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_from DATETIME,
    valid_until DATETIME,
    status ENUM('VALID','USED','CANCELLED') DEFAULT 'VALID',
    FOREIGN KEY (reservation_id) REFERENCES Reservation(hold_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (purchase_txn_id) REFERENCES Transactions(txn_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (seat_id) REFERENCES Seat(seat_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- =========================
-- Audit Log
-- =========================
CREATE TABLE AuditLog (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50),
    entity_id INT,
    action VARCHAR(50),
    performed_by INT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (performed_by) REFERENCES Users(user_id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- End of schema