-- Spencer Denim Task Manager Database Initialization
-- This script sets up the initial database configuration

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for better performance
-- These will be created by Prisma migrations, but kept here for reference

-- Set timezone
SET timezone = 'UTC';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE spencer_denim_db TO spencer_user;
GRANT ALL PRIVILEGES ON DATABASE spencer_denim_prod TO spencer_prod_user;
