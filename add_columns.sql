-- Add missing columns to meal_logs table
ALTER TABLE meal_logs 
ADD COLUMN meal_details JSON NULL,
ADD COLUMN daily_stats JSON NULL;
