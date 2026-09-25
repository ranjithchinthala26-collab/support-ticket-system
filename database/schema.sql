-- ============================================================================
-- Support Ticket Management System - MySQL Database Schema
-- Technical Assessment: Junior Full Stack Developer
-- ============================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS support_ticket_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE support_ticket_db;

-- Drop tables in reverse order of foreign key dependencies to allow clean re-runs
DROP TABLE IF EXISTS ticket_comments;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- Represents customers raising tickets and support agents handling them.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'agent') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: tickets
-- Represents support tickets submitted by customers.
-- Assigned to support agents for resolution.
-- ----------------------------------------------------------------------------
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_tickets_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_tickets_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    -- Indexes for frequently filtered & sorted columns
    INDEX idx_tickets_user_id (user_id),
    INDEX idx_tickets_assigned_to (assigned_to),
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_priority (priority),
    INDEX idx_tickets_created_at (created_at),
    INDEX idx_tickets_status_priority (status, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: ticket_comments
-- Represents comments/responses exchanged between customers and support agents.
-- ----------------------------------------------------------------------------
CREATE TABLE ticket_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_comments_ticket_id
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_comments_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Indexes
    INDEX idx_comments_ticket_id (ticket_id),
    INDEX idx_comments_user_id (user_id),
    INDEX idx_comments_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Mandatory Assessment Query (Requirement 8)
-- "Returns all open tickets along with the customer's name and email.
-- Demonstrates use of a JOIN and filtering."
-- ----------------------------------------------------------------------------
-- EXPLAIN SELECT
--     t.id AS ticket_id,
--     t.subject,
--     t.description,
--     t.priority,
--     t.status,
--     t.created_at,
--     u.id AS customer_id,
--     u.name AS customer_name,
--     u.email AS customer_email
-- FROM tickets t
-- INNER JOIN users u ON t.user_id = u.id
-- WHERE t.status = 'open'
-- ORDER BY t.created_at DESC;
