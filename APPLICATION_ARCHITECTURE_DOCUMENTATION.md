# BudgetAI 2.0 - Complete Application Architecture Documentation

**Version:** 2.3.0  
**Last Updated:** February 16, 2026  
**Purpose:** AI-powered County Budget Transparency Platform for Kenya

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Directory Structure](#directory-structure)
5. [Core Components](#core-components)
6. [Analysis Pipelines](#analysis-pipelines)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Frontend Pages & Components](#frontend-pages--components)
10. [Data Flow & Workflows](#data-flow--workflows)
11. [Deployment & Configuration](#deployment--configuration)

---

## 1. Executive Summary

**BudgetAI 2.0** is a Next.js-based web application that uses multiple AI models to analyze Kenya's County Government Budget Implementation Review Reports (CBIRR). The platform transforms complex PDF documents into actionable insights, compliance checks, and comparative analytics.

### Key Features:
- **Multi-Model AI Analysis**: GPU (OCRFlux + Groq), Docling, and Google Gemini pipelines
- **Real-time Dashboard**: Live fiscal insights, trending merits, and county comparisons
- **Compliance Tracking**: Automated checks against PFM Act regulations
- **Interactive Visualizations**: Charts, maps, and data-driven narratives
- **User Feedback System**: Collects user ratings to improve AI accuracy
- **Admin Panel**: Manage users, view feedback, and monitor system health

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14.2.33 (React 18)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9 + Custom CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Maps**: react-simple-maps + d3-geo
- **Animations**: Framer Motion, GSAP
- **Forms**: react-hook-form + Zod validation
- **State Management**: React hooks + Context API

### Backend
- **API Framework**: FastAPI (Python)
- **Database**: PostgreSQL (via `pg` npm package)
- **AI Models**:
  - OCRFlux-3B (Vision-based table extraction)
  - Groq LLaMA-70B (Fiscal analysis)
  - Google Gemini 2.5 Flash (Long-context extraction)
  - Docling (PDF to Markdown conversion)
- **PDF Processing**: PyMuPDF, Docling
- **Scheduling**: APScheduler (for daily hot take extraction)

### Infrastructure
- **Hosting**: Vercel (Frontend), Custom server (Python backend)
- **File Storage**: Local filesystem (`public/uploads/`)
- **Environment Management**: `.env.local` files

---

## 3. Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (Next.js)                  │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Landing  │Dashboard │ Analysis │Comparison│  Admin   │  │
│  │   Page   │   Page   │   Tab    │   Tab    │   Panel  │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  API LAYER (Next.js API Routes)              │
│  /api/upload  /api/analyze/*  /api/dashboard  /api/admin    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PYTHON BACKEND (FastAPI Service)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Analysis Pipelines:                                  │  │
│  │  • GPU Pipeline (OCRFlux + Groq)                     │  │
│  │  • Docling Pipeline (Docling + Groq)                 │  │
│  │  • Gemini Pipeline (Direct PDF Analysis)             │  │
│  │  • Comparison Pipeline (Gemini Long Context)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
│  uploads | analysis_results | trending_merits | feedback    │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Directory Structure

```
v0-ai-budget-transparency-main (2)/
│
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   │
│   ├── dashboard/                # Dashboard page
│   │   └── page.tsx
│   │
│   ├── admin/                    # Admin panel
│   │   └── page.tsx
│   │
│   ├── about/                    # About page
│   │   └── page.tsx
│   │
│   ├── api/                      # API routes
│   │   ├── upload/               # File upload endpoint
│   │   ├── analyze/              # Analysis endpoints
│   │   │   ├── gpu/              # GPU pipeline
│   │   │   ├── docling/          # Docling pipeline
│   │   │   └── gemini/           # Gemini pipeline
│   │   ├── dashboard/            # Dashboard data
│   │   ├── documents/            # Document retrieval
│   │   ├── feedback/             # User feedback
│   │   ├── admin/                # Admin operations
│   │   └── trending-merits/      # Hot takes API
│   │
│   └── python_service/           # Python backend
│       ├── main.py               # FastAPI application
│       ├── ai_models/            # AI model clients
│       ├── processors/           # Analysis processors
│       ├── validators/           # Data validators
│       └── requirements.txt      # Python dependencies
│
├── components/                   # React components
│   ├── analysis-module.tsx       # Analysis tab UI
│   ├── comparison-module.tsx     # Comparison tab UI
│   ├── unified-ai-dashboard.tsx  # Main dashboard
│   ├── landing-page/             # Landing page components
│   └── ui/                       # Reusable UI components
│
├── lib/                          # Utility libraries
│   ├── constants.ts              # App constants
│   ├── county-facts.ts           # County metadata
│   ├── dashboard-constants.ts    # Dashboard config
│   └── pdf-generator.ts          # PDF export logic
│
├── database/                     # Database schema
│   └── schema.sql                # PostgreSQL schema
│
├── public/                       # Static assets
│   └── uploads/                  # Uploaded PDFs
│
├── .env.local                    # Environment variables
├── package.json                  # Node dependencies
└── README.md                     # Project documentation
```

---

## 5. Core Components

### 5.1 Frontend Components

#### **Landing Page (`app/page.tsx`)**
- **Purpose**: First impression, showcases platform capabilities
- **Features**:
  - Interactive Kenya map with county hover effects
  - Live fiscal ticker (scrolling alerts)
  - Trending insights carousel
  - County spotlight cards
  - National budget header
  - Economic news ticker
- **Key Components Used**:
  - `<InteractiveKenyaMap />` - SVG map with tooltips
  - `<TrendingInsights />` - AI-generated fiscal narratives
  - `<EconomicTicker />` - Real-time economic updates
  - `<CountyAllocationCarousel />` - County data slider

#### **Dashboard (`app/dashboard/page.tsx`)**
- **Purpose**: Main analysis workspace
- **Tabs**:
  1. **Upload**: PDF file upload interface
  2. **Analysis**: Multi-model AI analysis (GPU, Docling, Gemini)
  3. **Comparison**: County benchmarking and PDF comparison
  4. **Documents**: View saved analysis reports
- **Component**: `<UnifiedAIDashboard />`

#### **Admin Panel (`app/admin/page.tsx`)**
- **Purpose**: System administration and monitoring
- **Features**:
  - User management (roles, permissions)
  - Feedback review (user ratings on AI accuracy)
  - System metrics (analysis count, success rates)
  - Database operations
- **Access Control**: Restricted to admin users

#### **Analysis Module (`components/analysis-module.tsx`)**
- **Purpose**: Orchestrates AI analysis workflows
- **Components**:
  - `<GPUAnalysisButton />` - Triggers GPU pipeline
  - `<DoclingAnalysisButton />` - Triggers Docling pipeline
  - `<GoogleAnalysisButton />` - Triggers Gemini pipeline
- **Features**:
  - Real-time progress tracking
  - Result visualization (charts, tables)
  - Export to PDF functionality
  - Feedback modal integration

#### **Comparison Module (`components/comparison-module.tsx`)**
- **Purpose**: County benchmarking and document comparison
- **Features**:
  - County-to-county comparison
  - PDF Push & Compare (Gemini long-context)
  - Merit-based comparison (Pending Bills, Revenue Variance, etc.)
  - Budget Integrity Scorecard
- **Visualization**: Side-by-side charts, difference highlighting

### 5.2 Backend Components

#### **Main API (`app/python_service/main.py`)**
- **Framework**: FastAPI
- **Endpoints**:
  - `POST /analyze/gpu` - GPU analysis pipeline
  - `POST /analyze/docling` - Docling pipeline
  - `POST /analyze/gemini` - Gemini pipeline
  - `POST /compare/gemini` - Gemini comparison
  - `GET /api/trending-merits` - Fetch hot takes
  - `POST /api/trigger-hot-take-analysis` - Manual hot take trigger
- **Middleware**: CORS enabled for Next.js frontend
- **Lifecycle Hooks**:
  - `startup_event()` - Initialize DB, start scheduler
  - `shutdown_event()` - Gracefully stop scheduler

#### **AI Model Clients (`app/python_service/ai_models/`)**

##### **OCRFlux Client (`ocrflux_client.py`)**
- **Purpose**: Vision-based table extraction from PDFs
- **Model**: OCRFlux-3B (hosted on Google Colab)
- **Process**:
  1. Converts PDF pages to images
  2. Sends images to Colab server via HTTP
  3. Receives structured table data (JSON)
- **Key Function**: `extract_tables_from_pdf()`

##### **Groq Client (`groq_client.py`)**
- **Purpose**: Fiscal analysis and risk assessment
- **Model**: LLaMA-3.1-70B-Versatile
- **Process**:
  1. Receives extracted text/tables
  2. Applies fiscal analysis prompts
  3. Returns structured JSON (revenue, expenditure, compliance)
- **Key Function**: `analyze_county_budget()`

##### **Gemini Client (`gemini_client.py`)**
- **Purpose**: Direct PDF analysis with long context
- **Model**: Gemini 2.5 Flash
- **Process**:
  1. Uploads entire PDF to Gemini
  2. Zero-shot extraction with detailed prompts
  3. Returns comprehensive budget analysis
- **Key Function**: `analyze_pdf_with_gemini()`

##### **Docling Client (`docling_colab_client.py`)**
- **Purpose**: High-fidelity PDF to Markdown conversion
- **Process**:
  1. Sends PDF to Docling Colab server
  2. Receives structured Markdown
  3. Passes Markdown to Groq for analysis
- **Key Function**: `convert_pdf_to_markdown()`

##### **Smart Page Locator (`smart_page_locator.py`)**
- **Purpose**: Intelligently locate county-specific sections in CBIRR
- **Process**:
  1. Extracts Table of Contents (TOC)
  2. Searches for county name patterns
  3. Returns page range for targeted extraction
- **Key Function**: `locate_county_section()`

#### **Processors (`app/python_service/processors/`)**

##### **Hybrid Processor (`hybrid_processor.py`)**
- **Pipeline**: OCRFlux (Stage 1) → Groq (Stage 2)
- **Workflow**:
  1. Locate county pages with `SmartPageLocator`
  2. Extract tables with `OCRFluxClient`
  3. Analyze with `GroqClient`
  4. Validate data with `DataValidator`
  5. Save to database
- **Output**: Structured budget analysis JSON

##### **Docling Processor (`docling_processor.py`)**
- **Pipeline**: Docling (Stage 1) → Groq (Stage 2)
- **Workflow**:
  1. Convert PDF to Markdown
  2. Extract county-specific sections
  3. Analyze Markdown with Groq
  4. Save to database
- **Advantage**: Better table structure preservation

##### **Gemini Processor (`gemini_processor.py`)**
- **Pipeline**: Gemini (Single-stage)
- **Workflow**:
  1. Upload entire PDF to Gemini
  2. Extract all metrics in one pass
  3. Save to database
- **Advantage**: Fastest, leverages 1M token context

##### **Comparison Processor (`comparison_processor.py`)**
- **Purpose**: Compare user-uploaded PDF vs. official CBIRR
- **Workflow**:
  1. Upload both PDFs to Gemini
  2. Extract merit-specific data (e.g., Pending Bills)
  3. Compare values, flag discrepancies
  4. Generate Budget Integrity Scorecard
- **Output**: Comparison report with integrity score

#### **Validators (`app/python_service/validators/`)**
- **Purpose**: Ensure data quality and catch AI hallucinations
- **Checks**:
  - Scale validation (county revenue shouldn't exceed national budget)
  - Type validation (numeric fields are numbers)
  - Range validation (percentages between 0-100)
  - Consistency checks (totals match sub-totals)

#### **Hot Take System**

##### **Hot Take Extractor (`hot_take_extractor.py`)**
- **Purpose**: Daily AI-driven fiscal insights
- **Process**:
  1. Fetches official CBIRR PDF
  2. Sends to Gemini with trending analysis prompt
  3. Extracts 3-5 high-priority fiscal issues
  4. Saves to `trending_merits` table
- **Output**: Topic name, description, keywords, priority score

##### **Hot Take Scheduler (`hot_take_scheduler.py`)**
- **Purpose**: Automate daily hot take extraction
- **Schedule**: Runs at 6:00 AM EAT daily
- **Library**: APScheduler
- **Trigger**: Can also be manually triggered via API

##### **Merit Mapper (`merit_mapper.py`)**
- **Purpose**: Map trending topics to database fields
- **Example**: "Pending Bills Crisis" → `debt_and_liabilities.pending_bills_amount`
- **Use Case**: Enables data-driven visualizations for hot takes

---

## 6. Analysis Pipelines

### 6.1 GPU Analysis Pipeline (Hybrid: OCRFlux + Groq)

**Endpoint**: `POST /api/analyze/gpu`

**Workflow**:
```
1. User uploads PDF → Next.js API → FastAPI
2. SmartPageLocator finds county section (e.g., pages 120-135)
3. OCRFlux extracts tables from those pages
   - Converts pages to images
   - Sends to Colab server
   - Receives structured table JSON
4. Groq analyzes extracted data
   - Applies fiscal analysis prompts
   - Extracts revenue, expenditure, debt metrics
   - Performs compliance checks
5. DataValidator ensures quality
   - Checks for hallucinations
   - Validates numeric ranges
6. Save to database (analysis_results table)
7. Return JSON to frontend
```

**Strengths**:
- High accuracy for table-heavy documents
- Good at handling complex layouts

**Weaknesses**:
- Slower (two-stage process)
- Requires Colab server for OCRFlux

---

### 6.2 Docling Analysis Pipeline (Docling + Groq)

**Endpoint**: `POST /api/analyze/docling`

**Workflow**:
```
1. User uploads PDF → Next.js API → FastAPI
2. SmartPageLocator finds county section
3. Docling converts PDF to Markdown
   - Preserves table structure
   - Maintains heading hierarchy
4. Groq analyzes Markdown
   - Extracts fiscal metrics
   - Performs analysis
5. Save to database
6. Return JSON to frontend
```

**Strengths**:
- Better table structure preservation
- Cleaner text extraction

**Weaknesses**:
- Requires Docling Colab server
- May struggle with scanned PDFs

---

### 6.3 Gemini Analysis Pipeline (Direct)

**Endpoint**: `POST /api/analyze/gemini`

**Workflow**:
```
1. User uploads PDF → Next.js API → FastAPI
2. Upload entire PDF to Gemini (1M token context)
3. Gemini extracts all metrics in one pass
   - Revenue, expenditure, debt, compliance
   - No intermediate steps
4. Save to database
5. Return JSON to frontend
```

**Strengths**:
- Fastest (single-stage)
- Leverages massive context window
- No external servers needed

**Weaknesses**:
- May miss fine-grained table details
- Dependent on Gemini API availability

---

### 6.4 Comparison Pipeline (Gemini Long Context)

**Endpoint**: `POST /api/compare/gemini`

**Workflow**:
```
1. User uploads county PDF
2. System loads official CBIRR PDF
3. Both PDFs uploaded to Gemini
4. Gemini extracts merit-specific data from both
   - Example merits: Pending Bills, Revenue Variance, OSR Performance
5. Compare values, calculate discrepancies
6. Generate Budget Integrity Scorecard
   - Integrity Score (0-100)
   - Discrepancy Alerts
   - Compliance Status
7. Return comparison report to frontend
```

**Use Case**: Verify county-submitted reports against official auditor data

---

## 7. Database Schema

### 7.1 Core Tables

#### **uploads**
- **Purpose**: Track uploaded PDF files
- **Fields**:
  - `id` (PK)
  - `county` (VARCHAR)
  - `year` (VARCHAR)
  - `filenames` (JSONB) - Array of file paths
  - `document_type` (VARCHAR) - 'CBIRR', 'Budget', 'Audit'
  - `upload_status` (VARCHAR) - 'pending', 'processing', 'completed', 'failed'
  - `created_at` (TIMESTAMP)

#### **analysis_results**
- **Purpose**: Store AI analysis outputs
- **Fields**:
  - `id` (PK)
  - `upload_id` (FK → uploads)
  - `county` (VARCHAR)
  - `year` (VARCHAR)
  - `revenue` (JSONB) - Revenue metrics
  - `expenditure` (JSONB) - Expenditure metrics
  - `debt_and_liabilities` (JSONB) - Debt data
  - `computed` (JSONB) - Calculated metrics (absorption rates, etc.)
  - `intelligence` (JSONB) - AI insights
  - `summary_text` (TEXT)
  - `risk_score` (INTEGER)
  - `raw_extracted` (JSONB) - Raw AI output
  - `created_at` (TIMESTAMP)

#### **trending_merits**
- **Purpose**: Store daily hot takes
- **Fields**:
  - `id` (PK)
  - `date` (DATE)
  - `topic_name` (VARCHAR)
  - `description` (TEXT)
  - `keywords` (TEXT)
  - `priority_score` (INTEGER)
  - `daily_audit` (TEXT) - Detailed analysis
  - `economic_ticker` (TEXT) - Ticker-friendly summary
  - `raw_gemini_response` (TEXT)
  - `created_at` (TIMESTAMP)

#### **user_feedback**
- **Purpose**: Collect user ratings on AI accuracy
- **Fields**:
  - `id` (PK)
  - `analysis_id` (FK → analysis_results)
  - `user_email` (VARCHAR)
  - `rating` (INTEGER) - 1-5 stars
  - `comment` (TEXT)
  - `created_at` (TIMESTAMP)

#### **compliance_checks**
- **Purpose**: Track regulatory compliance
- **Fields**:
  - `id` (PK)
  - `analysis_id` (FK)
  - `check_type` (VARCHAR) - '30% Development Rule', 'Wage Bill Ceiling'
  - `required_value` (DECIMAL)
  - `actual_value` (DECIMAL)
  - `compliant` (BOOLEAN)
  - `severity` (VARCHAR) - 'Critical', 'Warning', 'Info'
  - `recommendation` (TEXT)

### 7.2 Key Indexes
- `idx_uploads_county` - Fast county lookups
- `idx_analysis_county_year` - Dashboard queries
- `idx_trending_merits_date` - Hot take retrieval
- `idx_feedback_analysis` - Feedback aggregation

### 7.3 Database Functions
- `check_compliance_status(analysis_id)` - Returns compliance summary
- `rank_counties_by_metric(year, metric)` - County rankings

---

## 8. API Endpoints

### 8.1 Next.js API Routes (`/app/api/`)

#### **Upload**
- **POST** `/api/upload`
- **Body**: FormData with PDF file
- **Response**: `{ uploadId, fileName, county, year }`

#### **Analysis**
- **POST** `/api/analyze/gpu`
  - Body: `{ pdf_id, county, extraction_model, analysis_model }`
  - Triggers GPU pipeline
- **POST** `/api/analyze/docling`
  - Body: `{ pdf_id, county }`
  - Triggers Docling pipeline
- **POST** `/api/analyze/gemini`
  - Body: `{ pdf_id, county }`
  - Triggers Gemini pipeline

#### **Dashboard**
- **GET** `/api/dashboard`
  - Returns: Recent analyses, trending merits, county stats

#### **Documents**
- **GET** `/api/documents`
  - Query: `?county=Nairobi&year=2024`
  - Returns: List of saved analysis reports

#### **Feedback**
- **POST** `/api/feedback`
  - Body: `{ analysis_id, user_email, rating, comment }`
  - Saves user feedback

#### **Admin**
- **GET** `/api/admin/feedback`
  - Returns: All user feedback with analysis details
- **GET** `/api/admin/users`
  - Returns: User list with roles

#### **Trending Merits**
- **GET** `/api/trending-merits`
  - Query: `?days=7`
  - Returns: Recent hot takes
- **GET** `/api/trending-merits/{id}/data`
  - Returns: Visualization data for specific merit

### 8.2 Python FastAPI Endpoints (`main.py`)

#### **Analysis**
- **POST** `/analyze/gpu`
- **POST** `/analyze/docling`
- **POST** `/analyze/gemini`
- **POST** `/compare/gemini`

#### **Comparison**
- **POST** `/compare_counties`
  - Body: `{ county_a: {...}, county_b: {...} }`
  - Returns: Comparison metrics

#### **Reports**
- **POST** `/generate_report`
  - Body: `{ data: {...}, format: 'markdown' }`
  - Returns: Formatted report

#### **Hot Takes**
- **GET** `/api/trending-merits`
- **POST** `/api/trigger-hot-take-analysis`

---

## 9. Frontend Pages & Components

### 9.1 Pages

#### **Landing Page** (`app/page.tsx`)
- **Route**: `/`
- **Components**:
  - Hero section with interactive map
  - Trending insights carousel
  - County spotlight cards
  - National budget header
  - Economic ticker
- **Data Sources**:
  - `/api/landing-data` - County stats, trending merits
  - Hardcoded national budget data

#### **Dashboard** (`app/dashboard/page.tsx`)
- **Route**: `/dashboard`
- **Tabs**:
  1. Upload - File upload interface
  2. Analysis - Multi-model AI analysis
  3. Comparison - County benchmarking
  4. Documents - Saved reports
- **Authentication**: Required (email-based)

#### **Admin Panel** (`app/admin/page.tsx`)
- **Route**: `/admin`
- **Sections**:
  - User management
  - Feedback review
  - System metrics
- **Access**: Admin role only

#### **About** (`app/about/page.tsx`)
- **Route**: `/about`
- **Content**: Platform overview, methodology, team

### 9.2 Key Components

#### **UnifiedAIDashboard** (`components/unified-ai-dashboard.tsx`)
- **Purpose**: Main dashboard orchestrator
- **State Management**:
  - `uploadedFiles` - Tracks uploaded PDFs
  - `analysisResults` - Stores AI outputs
  - `activeTab` - Current tab selection
- **Features**:
  - Tab navigation
  - Real-time analysis progress
  - Result caching

#### **AnalysisModule** (`components/analysis-module.tsx`)
- **Purpose**: Analysis tab UI
- **Components**:
  - File selector dropdown
  - County selector
  - Analysis method buttons (GPU, Docling, Gemini)
  - Results display (charts, tables)
  - Export button
  - Feedback modal trigger

#### **ComparisonModule** (`components/comparison-module.tsx`)
- **Purpose**: Comparison tab UI
- **Features**:
  - County A vs County B selector
  - Merit selection (Pending Bills, Revenue, etc.)
  - PDF Push & Compare
  - Side-by-side charts
  - Budget Integrity Scorecard

#### **DocumentList** (`components/document-list.tsx`)
- **Purpose**: Display saved analysis reports
- **Features**:
  - Filter by county, year
  - Download PDF reports
  - View analysis details
  - Delete reports (admin only)

#### **FeedbackModal** (`components/feedback-modal.tsx`)
- **Purpose**: Collect user ratings
- **Trigger**: Automatically shown after analysis completes
- **Fields**:
  - Star rating (1-5)
  - Optional comment
  - User email (pre-filled if authenticated)

#### **TrendingInsights** (`components/trending-insights.tsx`)
- **Purpose**: Display AI-generated hot takes
- **Data Source**: `/api/trending-merits`
- **Features**:
  - Carousel navigation
  - Priority-based sorting
  - Click to view detailed analysis

#### **InteractiveKenyaMap** (`components/landing-page/interactive-kenya-map.tsx`)
- **Purpose**: SVG map of Kenya with county hover effects
- **Features**:
  - County tooltips (population, budget, OSR)
  - Color-coded by fiscal health
  - Click to navigate to county dashboard

---

## 10. Data Flow & Workflows

### 10.1 Complete Analysis Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: USER UPLOADS PDF                                     │
│ • User selects PDF file in Dashboard → Upload Tab            │
│ • File sent to /api/upload                                   │
│ • Saved to public/uploads/                                   │
│ • Record created in uploads table                            │
│ • Returns uploadId to frontend                               │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: USER SELECTS ANALYSIS METHOD                         │
│ • User navigates to Analysis Tab                             │
│ • Selects uploaded file from dropdown                        │
│ • Chooses county name                                        │
│ • Clicks GPU, Docling, or Gemini button                      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: FRONTEND SENDS ANALYSIS REQUEST                      │
│ • POST /api/analyze/{method}                                 │
│ • Body: { pdf_id, county, ...options }                       │
│ • Next.js API route proxies to Python backend                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: PYTHON BACKEND PROCESSES REQUEST                     │
│ • FastAPI receives request                                   │
│ • Resolves PDF path (public/uploads/filename.pdf)            │
│ • Initializes appropriate processor                          │
│   - HybridProcessor (GPU)                                    │
│   - DoclingProcessor (Docling)                               │
│   - GeminiProcessor (Gemini)                                 │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: AI ANALYSIS PIPELINE EXECUTES                        │
│ GPU Pipeline:                                                │
│   1. SmartPageLocator finds county pages                     │
│   2. OCRFlux extracts tables                                 │
│   3. Groq analyzes data                                      │
│   4. DataValidator checks quality                            │
│                                                              │
│ Docling Pipeline:                                            │
│   1. Docling converts PDF to Markdown                        │
│   2. Groq analyzes Markdown                                  │
│   3. DataValidator checks quality                            │
│                                                              │
│ Gemini Pipeline:                                             │
│   1. Upload PDF to Gemini                                    │
│   2. Gemini extracts all metrics                             │
│   3. DataValidator checks quality                            │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: SAVE TO DATABASE                                     │
│ • Insert into analysis_results table                         │
│ • Store revenue, expenditure, debt, computed metrics         │
│ • Calculate risk score                                       │
│ • Generate compliance checks                                 │
│ • Return analysis_id                                         │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: RETURN RESULTS TO FRONTEND                           │
│ • FastAPI returns JSON response                              │
│ • Next.js API route forwards to frontend                     │
│ • Frontend updates state with results                        │
│ • Displays charts, tables, insights                          │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: USER PROVIDES FEEDBACK                               │
│ • Feedback modal automatically appears                       │
│ • User rates accuracy (1-5 stars)                            │
│ • Optional comment                                           │
│ • POST /api/feedback                                         │
│ • Saved to user_feedback table                               │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Hot Take Daily Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ DAILY TRIGGER (6:00 AM EAT)                                  │
│ • APScheduler triggers HotTakeExtractor                      │
│ • Fetches official CBIRR PDF                                 │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ GEMINI ANALYSIS                                              │
│ • Upload CBIRR to Gemini                                     │
│ • Prompt: "Identify 3-5 trending fiscal issues"             │
│ • Gemini returns:                                            │
│   - Topic names                                              │
│   - Descriptions                                             │
│   - Keywords                                                 │
│   - Priority scores                                          │
│   - Daily audit narratives                                   │
│   - Economic ticker summaries                                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ SAVE TO DATABASE                                             │
│ • Insert into trending_merits table                          │
│ • Each merit gets unique ID                                  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND DISPLAYS                                            │
│ • Landing page fetches /api/trending-merits                  │
│ • Displays in TrendingInsights carousel                      │
│ • Shows in economic ticker                                   │
│ • Updates daily automatically                                │
└─────────────────────────────────────────────────────────────┘
```

### 10.3 Comparison Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ USER INITIATES COMPARISON                                    │
│ • Navigates to Comparison Tab                                │
│ • Uploads county PDF (e.g., Machakos Budget)                 │
│ • Selects merits to compare (Pending Bills, Revenue, etc.)   │
│ • Clicks "Compare"                                           │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND PROCESSES COMPARISON                                 │
│ • POST /api/compare/gemini                                   │
│ • Loads user PDF + official CBIRR PDF                        │
│ • Uploads both to Gemini                                     │
│ • Gemini extracts merit-specific data from both              │
│ • Calculates discrepancies                                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ GENERATE SCORECARD                                           │
│ • Integrity Score (0-100)                                    │
│ • Discrepancy Alerts (e.g., "Pending Bills differ by 20%")   │
│ • Compliance Status                                          │
│ • Recommendations                                            │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ DISPLAY RESULTS                                              │
│ • Side-by-side comparison charts                             │
│ • Highlighted discrepancies                                  │
│ • Budget Integrity Scorecard                                 │
│ • Export to PDF option                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Deployment & Configuration

### 11.1 Environment Variables (`.env.local`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/budget_db

# AI APIs
GROQ_API_KEY=gsk_xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx

# OCRFlux Colab Server
OCRFLUX_SERVER_URL=https://xxxxx.ngrok-free.app

# Docling Colab Server
DOCLING_SERVER_URL=https://xxxxx.ngrok-free.app

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 11.2 Setup Instructions

#### **1. Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd app/python_service
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

#### **2. Database Setup**
```bash
# Create PostgreSQL database
createdb budget_db

# Run schema
psql budget_db < database/schema.sql
```

#### **3. Start Colab Servers**
- Run `OCRFLUX_COLAB_SETUP_V3.py` in Google Colab
- Run `docling_colab_server.py` in Google Colab
- Copy ngrok URLs to `.env.local`

#### **4. Start Services**
```bash
# Terminal 1: Python Backend
cd app/python_service
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2: Next.js Frontend
npm run dev
```

#### **5. Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 11.3 Production Deployment

#### **Frontend (Vercel)**
```bash
# Deploy to Vercel
vercel --prod

# Environment variables in Vercel dashboard:
# - DATABASE_URL
# - GROQ_API_KEY
# - GOOGLE_API_KEY
# - OCRFLUX_SERVER_URL
# - DOCLING_SERVER_URL
```

#### **Backend (Custom Server)**
```bash
# Use systemd service or Docker
# Example systemd service:
[Unit]
Description=BudgetAI FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/budgetai/app/python_service
ExecStart=/var/www/budgetai/app/python_service/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 12. File-by-File Breakdown

### 12.1 Python Backend Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI application, defines all API endpoints |
| `hybrid_processor.py` | Orchestrates GPU pipeline (OCRFlux + Groq) |
| `docling_processor.py` | Orchestrates Docling pipeline |
| `gemini_processor.py` | Orchestrates Gemini pipeline |
| `comparison_processor.py` | Handles PDF comparison logic |
| `ocrflux_client.py` | Communicates with OCRFlux Colab server |
| `groq_client.py` | Communicates with Groq API |
| `gemini_client.py` | Communicates with Google Gemini API |
| `docling_colab_client.py` | Communicates with Docling Colab server |
| `smart_page_locator.py` | Locates county sections in CBIRR PDFs |
| `pdf_text_extractor.py` | Extracts raw text from PDFs |
| `hot_take_extractor.py` | Generates daily fiscal insights |
| `hot_take_scheduler.py` | Schedules daily hot take extraction |
| `merit_mapper.py` | Maps trending topics to database fields |
| `db.py` | Database connection and initialization |
| `analyzer.py` | Legacy analyzer (deprecated) |
| `comparison_engine.py` | County comparison logic |
| `report_generator.py` | Generates formatted reports |

### 12.2 Frontend Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page with map, carousel, ticker |
| `app/dashboard/page.tsx` | Main dashboard page |
| `app/admin/page.tsx` | Admin panel |
| `app/layout.tsx` | Root layout with navigation |
| `app/globals.css` | Global styles |
| `components/unified-ai-dashboard.tsx` | Dashboard orchestrator |
| `components/analysis-module.tsx` | Analysis tab UI |
| `components/comparison-module.tsx` | Comparison tab UI |
| `components/document-list.tsx` | Saved reports list |
| `components/feedback-modal.tsx` | User feedback form |
| `components/trending-insights.tsx` | Hot takes carousel |
| `components/landing-page/interactive-kenya-map.tsx` | SVG map |
| `components/landing-page/economic-ticker.tsx` | Scrolling ticker |
| `lib/constants.ts` | App-wide constants |
| `lib/county-facts.ts` | County metadata (population, etc.) |
| `lib/dashboard-constants.ts` | Dashboard configuration |
| `lib/pdf-generator.ts` | PDF export logic |

---

## 13. Key Algorithms & Logic

### 13.1 Smart Page Locator Algorithm

**Problem**: CBIRR PDFs have 47 counties, each in different page ranges. How to find the right pages?

**Solution**:
1. Extract Table of Contents (TOC) from PDF
2. Search for county name patterns (e.g., "3.25 Machakos County")
3. Extract page number from TOC entry
4. Return page range (start_page, end_page)
5. If TOC fails, use fallback regex search in full text

**Code**: `smart_page_locator.py`

### 13.2 Data Validation Algorithm

**Problem**: AI models can hallucinate (e.g., returning 418 billion for a county revenue)

**Solution**:
1. **Scale Check**: County revenue < National budget
2. **Type Check**: Numeric fields are numbers, not strings
3. **Range Check**: Percentages between 0-100
4. **Consistency Check**: Total revenue = Sum of revenue sources
5. **Null Check**: Critical fields not null

**Code**: `validators/data_validator.py`

### 13.3 Compliance Check Algorithm

**Problem**: Automatically check if counties comply with PFM Act

**Solution**:
1. Define compliance rules:
   - Wage Bill ≤ 35% of revenue
   - Development ≥ 30% of expenditure
   - OSR ≥ Target
2. Extract actual values from analysis
3. Compare actual vs. required
4. Flag violations with severity (Critical, Warning, Info)
5. Generate recommendations

**Code**: `compliance_checks` table + `groq_client.py` prompts

---

## 14. Future Enhancements

### Planned Features:
1. **Multi-year Trend Analysis**: Track county performance over time
2. **Predictive Analytics**: Forecast future budget performance
3. **Real-time Alerts**: Notify users of critical compliance violations
4. **Mobile App**: React Native version
5. **API for Researchers**: Public API for academic use
6. **Advanced Visualizations**: 3D charts, interactive dashboards
7. **AI Model Fine-tuning**: Train custom models on CBIRR data
8. **Blockchain Integration**: Immutable audit trails

---

## 15. Troubleshooting

### Common Issues:

#### **1. "PDF not found" error**
- **Cause**: PDF path incorrect
- **Fix**: Check `public/uploads/` directory, ensure file exists

#### **2. "Colab server unreachable"**
- **Cause**: Ngrok tunnel expired
- **Fix**: Restart Colab notebook, update `.env.local` with new URL

#### **3. "Database connection failed"**
- **Cause**: PostgreSQL not running or wrong credentials
- **Fix**: Start PostgreSQL, verify `DATABASE_URL` in `.env.local`

#### **4. "AI analysis returns zeros"**
- **Cause**: Data validation failed or AI extraction error
- **Fix**: Check logs, verify PDF quality, try different analysis method

#### **5. "Hot takes not updating"**
- **Cause**: Scheduler not running
- **Fix**: Check FastAPI startup logs, manually trigger via `/api/trigger-hot-take-analysis`

---

## 16. Contact & Support

**Project Maintainer**: BudgetAI Team  
**Documentation Version**: 2.3.0  
**Last Updated**: February 16, 2026

For questions or issues, please refer to:
- `README.md` - Quick start guide
- `SETUP.md` - Detailed setup instructions
- `PIPELINE_ARCHITECTURE_DIAGRAM.md` - Visual architecture

---

**End of Documentation**
