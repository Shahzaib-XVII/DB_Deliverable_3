```sql
-- 02_seed.sql
-- Expanded seed data (>=10 rows per table where applicable) for D2
USE d2;

-- ROLES (4 roles only needed)
INSERT INTO Roles (role_name) VALUES 
('Organizer'), ('Clerk'), ('Auditor'), ('Customer');

-- USERS (12 users)
INSERT INTO Users (name, email, phone, hashed_password, role_id) VALUES
('Admin Organizer', 'org1@example.com', '03001234567', 'hashed_org1', 1),
('Event Clerk', 'clerk@example.com', '03001230000', 'hashed_clerk', 2),
('Audit Officer', 'audit@example.com', '03111234567', 'hashed_audit', 3),
('Customer One', 'cust1@example.com', '03341234567', 'hashed_c1', 4),
('Customer Two', 'cust2@example.com', '03345555555', 'hashed_c2', 4),
('Customer Three', 'cust3@example.com', '03343332222', 'hashed_c3', 4),
('Customer Four', 'cust4@example.com', '03343333333', 'hashed_c4', 4),
('Sales Rep', 'sales@example.com', '03009998877', 'hashed_sales', 2),
('Organizer Two', 'org2@example.com', '03007654321', 'hashed_org2', 1),
('Support Clerk', 'support@example.com', '03110001111', 'hashed_support', 2),
('Auditor Two', 'audit2@example.com', '03112223344', 'hashed_audit2', 3),
('Customer Five', 'cust5@example.com', '03341230001', 'hashed_c5', 4);

-- VENUES (6)
INSERT INTO Venue (name, address, timezone, seating_config, capacity) VALUES
('Expo Center Hall A', 'Johar Town, Lahore', 'PKT', 'Default Layout', 200),
('Auditorium B', 'Gulberg, Lahore', 'PKT', 'Tiered Layout', 120),
('Open Air Stage', 'DHA, Lahore', 'PKT', 'Open Layout', 500),
('Conference Room 1', 'Model Town, Lahore', 'PKT', 'Conference Layout', 80),
('Small Hall C', 'Township, Lahore', 'PKT', 'Flat Layout', 60),
('Grand Theater', 'Liberty, Lahore', 'PKT', 'Orchestra Layout', 300);

-- SECTIONS (12; across venues)
INSERT INTO Section (venue_id, name, price_modifier) VALUES
(1, 'Front', 500),
(1, 'Middle', 200),
(1, 'Back', 0),
(2, 'Left Wing', 100),
(2, 'Right Wing', 100),
(3, 'Standing', 0),
(3, 'VIP Boxes', 800),
(4, 'Conference Front', 150),
(4, 'Conference Back', 0),
(5, 'Small Front', 50),
(6, 'Orchestra', 400),
(6, 'Balcony', 150);

-- SEATS (at least 20 seats to allow many reservations/tickets)
INSERT INTO Seat (section_id, row_label, seat_number, seat_type, accessible_flag) VALUES
(1,'A',1,'VIP',0),(1,'A',2,'VIP',0),(1,'A',3,'VIP',0),(1,'B',1,'REGULAR',0),
(1,'B',2,'REGULAR',0),(1,'B',3,'REGULAR',0),(1,'C',1,'REGULAR',1),(1,'C',2,'REGULAR',1),
(2,'D',1,'REGULAR',0),(2,'D',2,'REGULAR',0),(2,'D',3,'REGULAR',0),(3,'E',1,'REGULAR',0),
(3,'E',2,'REGULAR',0),(3,'F',1,'REGULAR',0),(4,'A',1,'REGULAR',0),(4,'A',2,'REGULAR',0),
(5,'A',1,'REGULAR',0),(6,'O',1,'VIP',0),(6,'O',2,'VIP',0),(6,'B',1,'ACCESSIBLE',1),
(6,'B',2,'REGULAR',0),(2,'E',4,'REGULAR',0),(3,'G',1,'REGULAR',0),(6,'Bal',1,'REGULAR',0);

-- EVENTS (12 events)
INSERT INTO Event (title, description, venue_id, start_datetime, end_datetime, status, created_by)
VALUES
('Tech Conference 2025', 'AI, ML and Cloud', 1, '2025-12-10 10:00:00', '2025-12-10 16:00:00', 'PUBLISHED', 1),
('Music Concert', 'Live performance by XYZ Band', 2, '2025-12-15 18:00:00', '2025-12-15 22:00:00', 'PUBLISHED', 1),
('Startup Pitch Night', 'Local startups pitch', 4, '2025-11-30 18:00:00', '2025-11-30 21:00:00', 'PUBLISHED', 9),
('Charity Gala', 'Fundraiser event', 6, '2025-12-05 19:00:00', '2025-12-05 23:00:00', 'PUBLISHED', 1),
('Open Air Comedy', 'Standup special', 3, '2025-12-20 20:00:00', '2025-12-20 22:30:00', 'DRAFT', 9),
('Workshop: Docker', 'Hands-on container workshop', 1, '2025-12-01 09:00:00', '2025-12-01 12:00:00', 'PUBLISHED', 1),
('Business Meetup', 'Networking', 4, '2025-12-02 17:00:00', '2025-12-02 20:00:00', 'PUBLISHED', 8),
('Children Play', 'Puppet show', 5, '2025-12-03 11:00:00', '2025-12-03 12:00:00', 'PUBLISHED', 9),
('Classical Night', 'Orchestra performance', 6, '2025-12-11 19:00:00', '2025-12-11 21:30:00', 'PUBLISHED', 1),
('Developer Meetup', 'Monthly developer meetup', 1, '2025-12-07 18:00:00', '2025-12-07 20:30:00', 'PUBLISHED', 1),
('Art Exhibition', 'Local artists', 5, '2025-12-09 10:00:00', '2025-12-09 18:00:00', 'PUBLISHED', 9),
('Film Screening', 'Indie film festival', 2, '2025-12-12 16:00:00', '2025-12-12 19:00:00', 'PUBLISHED', 1);

-- RESERVATIONS (12 holds, some HELD some CONFIRMED)
INSERT INTO Reservation (user_id, event_id, seat_id, hold_expires_at, status)
VALUES
(4, 1, 1, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'HELD'),
(5, 1, 2, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'HELD'),
(4, 2, 18, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'HELD'),
(6, 2, 19, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'HELD'),
(7, 3, 15, DATE_ADD(NOW(), INTERVAL 20 MINUTE), 'HELD'),
(12, 3, 16, DATE_ADD(NOW(), INTERVAL 20 MINUTE), 'HELD'),
(4, 4, 11, DATE_ADD(NOW(), INTERVAL 30 MINUTE), 'CONFIRMED'),
(5, 4, 12, DATE_ADD(NOW(), INTERVAL 30 MINUTE), 'CONFIRMED'),
(6, 5, 13, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'HELD'),
(7, 6, 3, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'HELD'),
(8, 7, 9, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'HELD'),
(11, 9, 20, DATE_ADD(NOW(), INTERVAL 40 MINUTE), 'HELD');

-- TRANSACTIONS (12 transactions)
INSERT INTO Transactions (user_id, event_id, amount, currency, payment_method, status)
VALUES
(4,1,1500,'PKR','Card','SUCCESS'),
(5,1,1500,'PKR','Card','SUCCESS'),
(4,2,1200,'PKR','Card','SUCCESS'),
(6,2,1200,'PKR','Card','SUCCESS'),
(7,3,800,'PKR','Card','SUCCESS'),
(12,3,800,'PKR','Card','SUCCESS'),
(4,4,2500,'PKR','Card','SUCCESS'),
(5,4,2500,'PKR','Card','SUCCESS'),
(6,5,700,'PKR','Card','SUCCESS'),
(7,6,600,'PKR','Card','SUCCESS'),
(8,7,400,'PKR','Card','SUCCESS'),
(11,9,1800,'PKR','Card','SUCCESS');

-- PAYMENTS (12 payments)
INSERT INTO Payment (txn_id, gateway_ref, status, paid_at)
VALUES
(1,'TXNREF001','PAID',NOW()),
(2,'TXNREF002','PAID',NOW()),
(3,'TXNREF003','PAID',NOW()),
(4,'TXNREF004','PAID',NOW()),
(5,'TXNREF005','PAID',NOW()),
(6,'TXNREF006','PAID',NOW()),
(7,'TXNREF007','PAID',NOW()),
(8,'TXNREF008','PAID',NOW()),
(9,'TXNREF009','PAID',NOW()),
(10,'TXNREF010','PAID',NOW()),
(11,'TXNREF011','PAID',NOW()),
(12,'TXNREF012','PAID',NOW());

-- TICKETS (12 tickets)
INSERT INTO Ticket (ticket_code, reservation_id, purchase_txn_id, seat_id, valid_from, valid_until, status)
VALUES
('CFX001',1,1,1,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX002',2,2,2,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX003',7,7,11,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX004',8,8,12,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX005',5,5,15,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX006',6,6,16,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX007',3,3,18,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX008',4,4,19,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX009',9,9,13,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX010',10,10,3,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX011',11,11,9,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID'),
('CFX012',12,12,20,NOW(),DATE_ADD(NOW(), INTERVAL 5 DAY),'VALID');

-- REFUNDS (2 example refunds; you can expand as needed)
INSERT INTO Refund (txn_id, amount, currency, refunded_at, reason)
VALUES
(2,1500,'PKR',NOW(),'Customer Requested'),
(5,800,'PKR',NOW(),'Event Cancelled');

-- AUDIT LOG (12 entries)
INSERT INTO AuditLog (entity_type, entity_id, action, performed_by, details) VALUES
('Event',1,'CREATE',1,'Event created'),
('Reservation',1,'HOLD',4,'Seat held for user 4'),
('Transaction',1,'PAYMENT_SUCCESS',4,'Paid via card'),
('Ticket',1,'ISSUE',1,'Ticket issued to user 4'),
('Event',2,'CREATE',1,'Music event created'),
('Reservation',3,'HOLD',4,'Seat held for user 4 for event 2'),
('Refund',2,'REFUND_ISSUED',3,'Refunded txn 5'),
('User',4,'CREATE',1,'Customer One created'),
('User',5,'CREATE',1,'Customer Two created'),
('Payment',7,'PAID',4,'Payment recorded'),
('Reservation',7,'CONFIRM',4,'Reservation confirmed and ticket issued'),
('Event',4,'CREATE',1,'Charity event created');

-- End of seed file