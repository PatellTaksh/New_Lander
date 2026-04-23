USE new_lander;

-- Insert sample users if they don't exist
INSERT IGNORE INTO users (id, full_name, email, password, current_country, destination_country, bio, phone, is_active) VALUES
(1, 'System Admin', 'admin@newlander.com', '$2y$10$w8/0F951qI1y01zKxI4lQ.wP0nZqG1w8/0F951qI1y01zKxI4lQ.', 'USA', 'UK', 'System administrator account', '1234567890', 1),
(2, 'Sarah Johnson', 'sarah@example.com', '$2y$10$w8/0F951qI1y01zKxI4lQ.wP0nZqG1w8/0F951qI1y01zKxI4lQ.', 'Canada', 'Australia', 'Medical Student', '9876543210', 1),
(3, 'Raj Patel', 'raj@example.com', '$2y$10$w8/0F951qI1y01zKxI4lQ.wP0nZqG1w8/0F951qI1y01zKxI4lQ.', 'India', 'USA', 'Engineering Graduate', '5551234567', 1);

-- 1. Accommodations
INSERT IGNORE INTO accommodations (id, user_id, title, description, country, city, location, type, price, bedrooms, bathrooms, image_url, is_available) VALUES
(1, 1, 'Modern Studio Apartment', 'Fully furnished studio near Columbia University with all utilities included. Perfect for international students.', 'United States', 'New York', 'Manhattan', 'apartment', 1200.00, 1, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', 1),
(2, 2, 'Shared Room in Student Hostel', 'Clean and safe student accommodation near city center. Breakfast included.', 'United Kingdom', 'London', 'Camden Town', 'hostel', 450.00, 1, 1, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400', 1),
(3, 3, 'Cozy PG Near University', 'Paying guest accommodation with meals included. Very close to the campus and subway.', 'Canada', 'Toronto', 'Downtown', 'pg', 600.00, 1, 1, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400', 1),
(4, 1, '2 Bedroom Apartment', 'Spacious apartment near UNSW. Great for sharing with another student.', 'Australia', 'Sydney', 'Kensington', 'apartment', 1500.00, 2, 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', 1);

-- 2. Community Posts
INSERT IGNORE INTO posts (id, user_id, title, content, post_type, country, likes, comments_count) VALUES
(1, 2, 'Tips for finding accommodation in New York', 'I recently moved to NYC for my masters. Here are some tips that helped me find a great place: Start early, have your financial documents ready, and always view the place in person before paying!', 'discussion', 'United States', 24, 0),
(2, 3, 'Best areas to live in London as a student?', 'I will be joining Imperial College next month. Which neighborhoods are best for students in terms of safety, rent, and commute?', 'question', 'United Kingdom', 18, 0),
(3, 1, 'Public transport guide for Toronto', 'Getting around Toronto is easy once you understand the TTC system. Get a Presto card as soon as you arrive to save money on daily commutes.', 'discussion', 'Canada', 31, 0),
(4, 2, 'How to open a bank account without an SSN?', 'Is it possible to open a bank account in the US if I haven\'t received my SSN yet as an international student?', 'question', 'United States', 12, 0);

-- 3. Events
-- Note: Dates are set in the future (2026/2027) so they appear as "upcoming"
INSERT IGNORE INTO events (id, user_id, title, description, event_date, event_time, location, city, country, category, max_attendees) VALUES
(1, 1, 'International Student Welcome Mixer', 'Join us for a welcome mixer! Great opportunity to network with fellow international students, enjoy free food, and learn about campus resources.', '2026-09-15', '18:00:00', 'Student Union Building', 'New York', 'United States', 'networking', 100),
(2, 2, 'Career Fair for International Students', 'Meet employers who sponsor visas and are looking for international talent in tech and finance.', '2026-10-20', '10:00:00', 'Exhibition Center', 'London', 'United Kingdom', 'networking', 200),
(3, 3, 'Diwali Celebration & Cultural Night', 'Celebrate Diwali with traditional food, music, and dance performances. Open to everyone!', '2026-11-05', '17:00:00', 'Community Center', 'Toronto', 'Canada', 'cultural', 150),
(4, 1, 'Student Orientation Workshop', 'A comprehensive workshop covering banking, housing rights, and healthcare basics for new arrivals.', '2026-08-25', '14:00:00', 'University Main Hall', 'Sydney', 'Australia', 'orientation', 50);

-- 4. Service Marketplace
INSERT IGNORE INTO services (id, provider_id, title, description, category, price, country, city, is_available) VALUES
(1, 1, 'Airport Pickup Service', 'Safe and reliable airport pickup for new arrivals. We track your flight and wait for you at the arrival gate.', 'Transport', 50.00, 'United States', 'New York', 1),
(2, 2, 'SIM Card & Bank Account Assistance', 'Personalized help to set up your local phone number and open a student bank account on your first day.', 'Setup', 15.00, 'United Kingdom', 'London', 1),
(3, 3, 'Document Translation', 'Professional, certified translation services for your academic and official documents.', 'Translation', 30.00, 'Canada', 'Toronto', 1),
(4, 1, 'Furniture Assembly & Rental', 'Rent basic furniture for your empty apartment, and we will assemble it for you before you move in.', 'Housing', 100.00, 'Australia', 'Sydney', 1);
