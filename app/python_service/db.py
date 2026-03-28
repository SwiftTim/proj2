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
    
    # Core Table: Tracking uploaded PDF files (Required for Document List)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS uploads (
            id SERIAL PRIMARY KEY,
            county VARCHAR(100) NOT NULL,
            year VARCHAR(10) NOT NULL,
            filenames JSONB NOT NULL,
            document_type VARCHAR(50) DEFAULT 'CBIRR',
            file_size_bytes BIGINT,
            upload_status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Enhanced Table: Analysis results (Joined with uploads)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS analysis_results (
            id SERIAL PRIMARY KEY,
            upload_id INTEGER REFERENCES uploads(id) ON DELETE CASCADE,
            county VARCHAR(100) NOT NULL,
            year VARCHAR(10),
            summary_text TEXT,
            revenue JSONB,
            expenditure JSONB,
            debt_and_liabilities JSONB,
            computed JSONB,
            intelligence JSONB,
            risk_score INTEGER,
            total_allocation BIGINT,
            risk_level VARCHAR(20),
            project_performance JSONB,
            raw_extracted JSONB,
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

    # New trending_merits table for daily hot takes
    cur.execute("""
        CREATE TABLE IF NOT EXISTS trending_merits (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL UNIQUE,
            topic_name VARCHAR(200) NOT NULL,
            description TEXT,
            keywords TEXT[],
            priority_score INTEGER DEFAULT 5,
            mapped_fields JSONB,
            daily_audit JSONB, 
            economic_ticker JSONB,
            raw_gemini_response JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    
    # Index for faster date-based queries
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_trending_merits_date 
        ON trending_merits(date DESC);
    """)
    
    # User Feedback
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_feedback (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255),
            rating INTEGER,
            category VARCHAR(50), 
            comment TEXT,
            analysis_id INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    # Audit Logs
    cur.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            action VARCHAR(255),
            details TEXT,
            service VARCHAR(50),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    # Generated Reports
    cur.execute("""
        CREATE TABLE IF NOT EXISTS generated_reports (
            id SERIAL PRIMARY KEY,
            report_type VARCHAR(100),
            county VARCHAR(100),
            format VARCHAR(10),
            file_url TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    # System Settings
    cur.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            key VARCHAR(100) PRIMARY KEY,
            value JSONB,
            updated_at TIMESTAMP DEFAULT NOW()
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database tables initialized successfully")
