import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables from .env or .env.local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env.local"))

DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    print("⚠️ DATABASE_URL not found in environment!")

def get_db_connection():
    conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Existing analysis_results table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS analysis_results (
            id SERIAL PRIMARY KEY,
            county VARCHAR(100),
            year VARCHAR(10),
            summary_text TEXT,
            key_metrics JSONB,
            performance_rating VARCHAR(20),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    
    # User roles for RBAC
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_roles (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100),
            email VARCHAR(255) UNIQUE,
            password_hash TEXT,
            role VARCHAR(50) DEFAULT 'public',
            permissions JSONB,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    """)

    # Function and Trigger for automatic updated_at
    cur.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)

    cur.execute("""
        DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
        CREATE TRIGGER update_user_roles_updated_at
        BEFORE UPDATE ON user_roles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)

    # New trending_merits table for daily hot takes (Enhanced)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS trending_merits (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL UNIQUE,
            topic_name VARCHAR(200) NOT NULL,
            description TEXT,
            keywords TEXT[],
            priority_score INTEGER DEFAULT 5,
            mapped_fields JSONB,
            daily_audit JSONB, -- For the Comparison Bar Chart
            economic_ticker JSONB, -- For the footer live ticker
            raw_gemini_response JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    
    # Index for faster date-based queries
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_trending_merits_date 
        ON trending_merits(date DESC);
    """)
    
    # System settings for global constants (Budget figures, etc.)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            key VARCHAR(255) PRIMARY KEY,
            value JSONB,
            updated_at TIMESTAMP DEFAULT NOW()
        );
    """)

    # User Feedback for the "Intelligence Feedback Loop"
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_feedback (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255),
            rating INTEGER,
            category VARCHAR(50), -- 'quality', 'speed', 'accuracy', 'other'
            comment TEXT,
            analysis_id INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
