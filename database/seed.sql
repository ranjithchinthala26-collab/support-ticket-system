-- ============================================================================
-- Support Ticket Management System - Seed Data
-- ============================================================================

USE support_ticket_db;

-- ----------------------------------------------------------------------------
-- 1. Insert Initial Users
-- Passwords:
--   customer@demo.com  -> Customer123!
--   alice@demo.com     -> Customer123!
--   agent@support.com  -> Agent123!
--   sarah@support.com  -> Agent123!
-- (Bcrypt hashes generated with cost factor 10)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'John Customer', 'customer@demo.com', '$2a$10$Nl2O9UKuPbi4XrWPyHXObufn95NySmIM8ljs2HoiXm9Eq8J0tIo.a', 'customer'),
(2, 'Alice Smith', 'alice@demo.com', '$2a$10$Nl2O9UKuPbi4XrWPyHXObufn95NySmIM8ljs2HoiXm9Eq8J0tIo.a', 'customer'),
(3, 'Bob Support Agent', 'agent@support.com', '$2a$10$..mLcE5TvPmW6.aR1DSvIO9D5jY5KHIhpyw./96Fe7J4iDA4QNgre', 'agent'),
(4, 'Sarah Davis', 'sarah@support.com', '$2a$10$..mLcE5TvPmW6.aR1DSvIO9D5jY5KHIhpyw./96Fe7J4iDA4QNgre', 'agent')
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role);

-- ----------------------------------------------------------------------------
-- 2. Insert Initial Tickets
-- Diverse priorities and statuses for realistic dashboard & testing
-- ----------------------------------------------------------------------------
INSERT INTO tickets (id, user_id, subject, description, priority, status, assigned_to, created_at) VALUES
(1, 1, 'Payment gateway failing on checkout', 'When attempting to complete credit card checkout via Stripe, an error code 502 occurs.', 'urgent', 'open', NULL, NOW() - INTERVAL 2 DAY),
(2, 1, 'Cannot update billing address', 'In user profile settings, clicking Save Billing Address produces an invalid form error.', 'medium', 'in_progress', 3, NOW() - INTERVAL 1 DAY),
(3, 1, 'Feature Request: Dark mode theme', 'Would love to have an automated dark theme option toggle in the portal navigation bar.', 'low', 'resolved', 3, NOW() - INTERVAL 5 DAY),
(4, 2, 'Two-factor authentication SMS delayed', 'SMS verification codes for login take over 10 minutes to arrive on mobile.', 'high', 'open', NULL, NOW() - INTERVAL 3 HOUR),
(5, 2, 'Export report to CSV not downloading', 'Clicking the Export CSV button spins continuously without initiating the browser download.', 'medium', 'in_progress', 4, NOW() - INTERVAL 12 HOUR)
ON DUPLICATE KEY UPDATE subject=VALUES(subject), status=VALUES(status);

-- ----------------------------------------------------------------------------
-- 3. Insert Initial Ticket Comments
-- Discussion thread between customer and agent
-- ----------------------------------------------------------------------------
INSERT INTO ticket_comments (id, ticket_id, user_id, comment, created_at) VALUES
(1, 2, 3, 'Hello John, thank you for reaching out. Could you please specify which browser and operating system you are using?', NOW() - INTERVAL 20 HOUR),
(2, 2, 1, 'Hi Bob, I am running Google Chrome v128 on Windows 11.', NOW() - INTERVAL 18 HOUR),
(3, 2, 3, 'Thanks! We identified a postal code regex validation issue and deployed a hotfix to staging.', NOW() - INTERVAL 15 HOUR),
(4, 3, 3, 'Hi John, pleased to inform you that dark mode has been added in v2.4.0. Please verify!', NOW() - INTERVAL 4 DAY),
(5, 3, 1, 'Verified and looks fantastic! Thank you for the quick resolution.', NOW() - INTERVAL 4 DAY)
ON DUPLICATE KEY UPDATE comment=VALUES(comment);
