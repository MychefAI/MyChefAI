-- Migration: Add parent_id column to post_comments table for nested comments support
-- Run this script on your MySQL database

USE healthy_table;

-- Add parent_id column
ALTER TABLE post_comments 
ADD COLUMN parent_id BIGINT NULL AFTER user_id;

-- Add foreign key constraint (optional but recommended)
ALTER TABLE post_comments
ADD CONSTRAINT fk_comment_parent 
FOREIGN KEY (parent_id) REFERENCES post_comments(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_comment_parent ON post_comments(parent_id);

-- Verify the changes
DESCRIBE post_comments;
