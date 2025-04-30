-- Create a simple health check table for keeping the database alive
CREATE TABLE health_check (
    id SERIAL PRIMARY KEY,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a single row that we'll update
INSERT INTO health_check (id) VALUES (1);

-- No RLS needed for this table since it's just for health checks
COMMENT ON TABLE health_check IS 'Table used for periodic health checks to prevent database pausing';
