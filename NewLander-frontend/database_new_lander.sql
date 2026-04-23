-- ============================================================
-- NewLander Database — Use 'new_lander' to match config.php
-- Run this in phpMyAdmin > SQL tab
-- ============================================================

CREATE DATABASE IF NOT EXISTS new_lander CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE new_lander;

DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS accommodation_bookings;
DROP TABLE IF EXISTS accommodations;
DROP TABLE IF EXISTS users;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    current_country VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    university VARCHAR(255) DEFAULT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,
    INDEX idx_email (email),
    INDEX idx_countries (current_country, destination_country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ACCOMMODATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS accommodations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type ENUM('apartment', 'hostel', 'shared', 'pg') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    amenities TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (country, city),
    INDEX idx_type_price (type, price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ACCOMMODATION BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS accommodation_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accommodation_id INT NOT NULL,
    user_id INT NOT NULL,
    move_in_date DATE NOT NULL,
    duration_months INT NOT NULL,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    special_requests TEXT DEFAULT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    category ENUM('networking', 'cultural', 'orientation', 'workshop') NOT NULL,
    max_attendees INT DEFAULT NULL,
    attendees_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_date (event_date),
    INDEX idx_location (country, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- EVENT REGISTRATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- COMMUNITY POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_type ENUM('discussion', 'question') DEFAULT 'discussion',
    country VARCHAR(100) DEFAULT NULL,
    likes INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (post_type),
    INDEX idx_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- FAVORITES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('accommodation', 'post', 'event') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, item_type, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (country, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SAMPLE DATA — (For testing)
-- ============================================================

-- 1. Insert Sample Users
INSERT INTO users (full_name, email, password, current_country, destination_country, bio)
VALUES
('Test User 1', 'test1@example.com', '$2y$10$e9H6c5m2lU405Z5M4Z5Z5e', 'India', 'Canada', 'Student moving to Toronto'),
('Test User 2', 'test2@example.com', '$2y$10$e9H6c5m2lU405Z5M4Z5Z5e', 'India', 'United Kingdom', 'IT Professional moving to London');

-- 2. Insert Sample Accommodations
INSERT INTO accommodations (user_id, title, description, country, city, location, type, price, bedrooms, bathrooms, image_url)
VALUES
(1, 'Modern Studio Apartment', 'Fully furnished studio near Columbia University', 'United States', 'New York', 'Manhattan', 'apartment', 1200.00, 1, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'),
(2, 'Shared Room in Student Hostel', 'Clean and safe student accommodation', 'United Kingdom', 'London', 'South Kensington', 'hostel', 450.00, 1, 1, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'),
(1, 'Cozy PG Near University', 'Paying guest accommodation with meals included', 'Canada', 'Toronto', 'Downtown', 'pg', 600.00, 1, 1, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400');

-- 3. Insert Sample Events
INSERT INTO events (user_id, title, description, event_date, event_time, location, city, country, category, max_attendees)
VALUES
(1, 'International Student Welcome Mixer', 'Meet other international students!', '2026-02-15', '18:00:00', 'New York University', 'New York', 'United States', 'networking', 100),
(2, 'Career Fair for International Students', 'Find job opportunities abroad.', '2026-02-20', '10:00:00', 'Imperial College', 'London', 'United Kingdom', 'networking', 200),
(1, 'Diwali Celebration', 'Celebrate Diwali with the community.', '2026-10-25', '17:00:00', 'Community Center', 'Toronto', 'Canada', 'cultural', 150);

-- 4. Insert Sample Posts
INSERT INTO posts (user_id, title, content, post_type, country, likes, comments_count)
VALUES
(1, 'Tips for finding accommodation in New York', 'I recently moved to NYC for my masters. Here are some tips that helped me find a great place...', 'discussion', 'United States', 24, 0),
(2, 'Best areas to live in London as a student', 'After living in London for 2 years, I can recommend these neighborhoods for students...', 'discussion', 'United Kingdom', 18, 0),
(1, 'Public transport guide for Toronto', 'Getting around Toronto is easy once you understand the TTC system. Here is what you need to know...', 'discussion', 'Canada', 31, 0);

-- 5. Insert Sample Services
INSERT INTO services (provider_id, title, description, category, price, country, city)
VALUES
(2, 'Airport Pickup Service', 'Safe and reliable airport pickup for new arrivals from JFK.', 'Transportation', 50.00, 'United States', 'New York'),
(1, 'SIM Card Assistance', 'Help setting up local phone and internet with best student plans.', 'Utility', 15.00, 'United Kingdom', 'London'),
(2, 'Document Translation', 'Professional translation services for university documents.', 'Legal', 30.00, 'Canada', 'Toronto'),
(1, 'Local Guide Service', 'Personal guide to show you around the city and campus.', 'Tour', 40.00, 'United States', 'New York');
