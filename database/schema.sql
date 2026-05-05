CREATE DATABASE IF NOT EXISTS smart_parking;
USE smart_parking;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Parking_Slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    status ENUM('available', 'booked') DEFAULT 'available',
    type ENUM('basic', 'semi', 'premium') DEFAULT 'basic',
    price_per_hour DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    slot_id INT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES Parking_Slots(slot_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);

-- Insert Sample Data
INSERT INTO Users (name, email, phone, vehicle_number, password, role) VALUES 
('Admin User', 'admin@example.com', '1234567890', 'ADMIN-001', '$2b$10$YourHashedPasswordHere', 'admin'),
('John Doe', 'john@example.com', '0987654321', 'XYZ-1234', '$2b$10$YourHashedPasswordHere', 'user');

INSERT INTO Parking_Slots (location, status, price_per_hour) VALUES
('Level 1 - A1', 'available', 10.00),
('Level 1 - A2', 'available', 10.00),
('Level 1 - A3', 'available', 10.00),
('Level 2 - B1', 'available', 15.00),
('Level 2 - B2', 'available', 15.00);
