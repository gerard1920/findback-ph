-- FindBack PH Database Schema for InfinityFree MySQL
-- Import this file through phpMyAdmin
-- Compatible with MySQL 5.7+

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(60) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  profile_image VARCHAR(500) DEFAULT NULL,
  role ENUM('user', 'admin', 'moderator', 'suspended') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended', 'banned') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_username (username),
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  category_id INT NOT NULL,
  type ENUM('LOST', 'FOUND') NOT NULL,
  status ENUM('ACTIVE', 'MATCHED', 'CLAIM_PENDING', 'RESOLVED', 'EXPIRED', 'REMOVED') DEFAULT 'ACTIVE',
  flagged BOOLEAN DEFAULT FALSE,
  title VARCHAR(120) NOT NULL,
  brand VARCHAR(60) DEFAULT NULL,
  color VARCHAR(40) DEFAULT NULL,
  description TEXT NOT NULL,
  distinguishing_features TEXT DEFAULT NULL,
  private_serial VARCHAR(200) DEFAULT NULL,
  private_proof TEXT DEFAULT NULL,
  reward VARCHAR(100) DEFAULT NULL,
  province VARCHAR(80) NOT NULL,
  city VARCHAR(80) NOT NULL,
  barangay VARCHAR(80) DEFAULT NULL,
  approximate_location VARCHAR(160) NOT NULL,
  date_occurred DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_items_type_status_created (type, status, created_at),
  INDEX idx_items_category_id (category_id),
  INDEX idx_items_province_city (province, city),
  INDEX idx_items_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Item images table
CREATE TABLE IF NOT EXISTS item_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  INDEX idx_item_images_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lost_item_id INT NOT NULL,
  found_item_id INT NOT NULL,
  score INT NOT NULL,
  status ENUM('PENDING', 'CONTACTED', 'VERIFIED', 'REJECTED', 'RESOLVED') DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_match (lost_item_id, found_item_id),
  INDEX idx_matches_lost_item_id (lost_item_id),
  INDEX idx_matches_found_item_id (found_item_id),
  FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  participant_a_id INT NOT NULL,
  participant_b_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_a_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_b_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_conversation (item_id, participant_a_id, participant_b_id),
  INDEX idx_conversations_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  body TEXT NOT NULL,
  read_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation_created (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  link VARCHAR(500) DEFAULT NULL,
  read_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (user_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved items table
CREATE TABLE IF NOT EXISTS saved_items (
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT DEFAULT NULL,
  reporter_id INT NOT NULL,
  reported_user_id INT DEFAULT NULL,
  reason ENUM('FAKE_LISTING', 'SCAM', 'HARASSMENT', 'STOLEN', 'INAPPROPRIATE', 'SPAM', 'SUSPICIOUS') NOT NULL,
  details TEXT DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  resolved_at DATETIME DEFAULT NULL,
  resolved_by INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reports_status_created (status, created_at),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  blocker_id INT NOT NULL,
  blocked_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token_hash CHAR(64) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME DEFAULT NULL,
  INDEX idx_password_resets_expires (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bans table
CREATE TABLE IF NOT EXISTS bans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  admin_id INT DEFAULT NULL,
  action VARCHAR(20) NOT NULL COMMENT 'BAN, SUSPEND, UNBAN',
  reason TEXT NOT NULL,
  expires_at DATETIME DEFAULT NULL,
  lifted_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bans_user_id (user_id),
  INDEX idx_bans_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT DEFAULT NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(20) NOT NULL COMMENT 'USER, ITEM, REPORT, SYSTEM',
  target_id INT DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_logs_created_at (created_at),
  INDEX idx_admin_logs_admin_id (admin_id),
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT IGNORE INTO categories (name, slug) VALUES
  ('Electronics', 'electronics'),
  ('Wallets', 'wallets'),
  ('IDs & Documents', 'ids-documents'),
  ('Bags', 'bags'),
  ('Keys', 'keys'),
  ('Jewelry', 'jewelry'),
  ('Vehicle Items', 'vehicle-items'),
  ('School Items', 'school-items'),
  ('Other', 'other');
