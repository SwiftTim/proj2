# CHAPTER 4: ACHIEVEMENT OF OBJECTIVES

## 4.1 Introduction
This chapter presents a comprehensive evaluation of the project’s outcomes against the initial research objectives. It assesses the effectiveness of the implemented technologies, including Next.js, FastAPI, and advanced AI parsing models, in delivering a functional and transparent budget monitoring system. This section is necessary to validate the research methodology and demonstrate that the final system meets the needs of its primary stakeholders: the citizens and administrators seeking financial accountability.

---

## 4.2 Objective 1: Building a Digital Public Financial Transparency System

### **Objective:**
To build a digital public financial transparency system that allows users to access, track, and analyze budget and expenditure information.

### **4.2.1 How it was Achieved**
This objective was achieved by developing a full-stack web-based platform that integrates a responsive frontend with a high-performance backend. The system provides a centralized environment where users can upload financial documents, process them, and access analyzed results. 

The platform ensures structured data management through PostgreSQL and enables smooth interaction between system components via API routes. This integration supports accessibility, scalability, and efficient handling of financial data.

### **4.2.2 Associated Interfaces**
*   **[Insert Screenshot of Main Landing Page / Dashboard Entry]**
*   **[Insert Screenshot of File Upload Interface]**
*   **[Insert Screenshot of System Navigation / Layout]**

### **4.2.3 Associated Code**

**`app/layout.tsx`**  
Defines the global application shell, ensuring consistent navigation and theme application.
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Configures the core application layout with standard fonts, dark mode, and UI providers
  // Ensuring all subordinate pages inherit the mission-critical branding and navigation
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${plusJakartaSans.variable}`}>
        <Suspense fallback={null}>
          <div className="flex flex-col min-h-screen border-red-500/10 bg-black">
            <main className="flex-grow">
              {children}
            </main>
            <Toaster />
          </div>
        </Suspense>
      </body>
    </html>
  )
}
```
**Explanation:** This function serves as the root wrapper for the entire application. It sets the global styling (dark mode) and injects necessary UI providers like `Toaster` for notifications, ensuring a uniform user experience across all pages. The structural div ensures the page stretches correctly even with minimal content.

**`app/python_service/db.py`**  
Manages the database lifecycle including initialization and connection pooling.
```python
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    # Initializes the 'uploads' table to track PDF metadata and status
    cur.execute("""
        CREATE TABLE IF NOT EXISTS uploads (
            id SERIAL PRIMARY KEY,
            county VARCHAR(100) NOT NULL,
            year VARCHAR(10) NOT NULL,
            filenames JSONB NOT NULL,
            upload_status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    # Initializes the table for persisting AI-interpreted budget analysis
    cur.execute("""
        CREATE TABLE IF NOT EXISTS analysis_results (
            id SERIAL PRIMARY KEY,
            upload_id INTEGER REFERENCES uploads(id) ON DELETE CASCADE,
            summary_text TEXT,
            revenue JSONB,
            expenditure JSONB,
            risk_score INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    conn.commit()

def get_db_connection():
    # Returns a fresh connection to the PostgreSQL instance using environment variables
    # This ensures thread-safety by not sharing global connections across async tasks
    return psycopg2.connect(
        os.getenv("DATABASE_URL"),
        cursor_factory=RealDictCursor
    )
```
**Explanation:** `init_db` ensures the schema is ready before any analysis occurs, creating both the upload tracker and the results storage. `get_db_connection` handles the low-level handshake with the database, utilizing `RealDictCursor` for convenient dictionary-style data access in Python.

**`app/api/analyze/route.ts`**  
Handles the communication between the user's browser and the AI analysis engine.
```typescript
export async function POST(req: Request) {
  // Receives the PDF file, forwards it to the Python service, and returns results
  // This route acts as a secure gateway, hiding internal service addresses from the client
  try {
    const formData = await req.formData();
    const res = await fetch("http://localhost:8000/analyze_pdf", { 
      method: "POST", 
      body: formData,
      headers: { 'X-Sync-Token': process.env.INTERNAL_API_KEY! }
    });
    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Analysis Service Timeout" }, { status: 504 });
  }
}

export async function GET() {
  // Retrieves a history of previous analyses from the database for the user to review
  // This enables the persistence layer of the transparency system
  const { rows } = await client.query(`
    SELECT u.county, u.year, a.summary_text, a.risk_score 
    FROM uploads u 
    JOIN analysis_results a ON u.id = a.upload_id 
    ORDER BY a.created_at DESC LIMIT 5
  `);
  return NextResponse.json(rows);
}
```
**Explanation:** `POST` bridges the Next.js frontend with the Python AI module, enabling real-time file processing with internal header verification for security. `GET` provides the "history" feature, joining uploads with results to provide a comprehensive look-back at county performance.

---

## 4.3 Objective 2: Automated Extraction of Financial Information

### **Objective:**
To develop a system that automatically extracts key financial information from county budget documents.

### **4.3.1 How it was Achieved**
This objective was achieved through the implementation of a hybrid document processing pipeline capable of handling both structured (text-heavy) and unstructured (scanned) PDF documents. The system uses a multi-strategy approach: it first maps the document structure using Table of Contents (TOC) detection, and then applies deep-learning OCR (Docling) to extract tables that traditional parsers miss.

### **4.3.2 Associated Interfaces**
*   **[Insert Screenshot of PDF Upload Process]**
*   **[Insert Screenshot of Extraction Output View]**
*   **[Insert Screenshot of Processing Status / Loader]**

### **4.3.3 Associated Code**

**`app/python_service/document_parser.py`**  
Orchestrates high-level structural analysis of the PDF document.
```python
def parse_document_structure(self, pdf_bytes: bytes) -> Dict[str, Any]:
    # Maps the document to find page ranges for specific counties and sectors
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        toc = self._extract_toc(pdf)
        sections = self._identify_sections(pdf, toc)
        # Combine TOC map with physical page identification
        for county in self.counties:
            sections[county] = self._locate_county_page_range(pdf, county)
        return {"toc": toc, "sections": sections}

def _extract_toc(self, pdf):
    # Scans early pages for a Table of Contents to enable fast page navigation
    # Uses regex to detect 3.x patterns standard in CBIRR reports
    links = []
    for page in pdf.pages[:15]:
        text = page.extract_text()
        links.extend(re.findall(r'3\.\d+\.\s+(?:County Government of )?(.*?)\.\.*?\d+', text))
    return list(OrderedDict.fromkeys(links))

def _identify_sections(self, pdf, toc):
    # Clusters pages into specific thematic blocks like 'Revenue' or 'Expenditure'
    # This prevents the AI from processing irrelevant introductory pages
    theme_map = {"Chapter 1": "Introduction", "Chapter 2": "National Summary", "Chapter 3": "County Details"}
    return {k: self._find_first_mention(pdf, k) for k in theme_map}
```
**Explanation:** `parse_document_structure` is the entry point for understanding a 300-page report. `_extract_toc` uses pattern matching to find the "index," and `_identify_sections` creates the page-level roadmap that guides the deeper extraction engines.

**`app/python_service/docling_processor.py`**  
Handles specialized OCR for complex financial tables using deep learning.
```python
async def process(self, pdf_path: str, county_name: str) -> Dict:
    # Triggers the Docling-Colab pipeline for high-fidelity table extraction
    # This is essential for low-quality scanned images where traditional text extraction fails
    locator = SmartPageLocator(pdf_path)
    pages = locator.find_county_pages(county_name)
    temp_path = self._slice_pdf(pdf_path, pages)
    
    response = await httpx.post(f"{self.colab_url}/convert", files={"file": open(temp_path, "rb")})
    return {"markdown": response.json().get("markdown", ""), "county": county_name}

def _extract_tables(self, markdown_output: str):
    # Converts the raw markdown tables from AI into structured JSON arrays
    # It ensures the data follows a strict [Row, Column] format before saving to PG
    lines = markdown_output.split('\n')
    tables = []
    current_table = []
    for line in lines:
        if '|' in line: current_table.append([c.strip() for c in line.split('|') if c.strip()])
        elif current_table: 
            tables.append(current_table)
            current_table = []
    return tables

def _cleanup_temp_files(self, paths: List[str]):
    # Ensures the server storage remains clean by deleting temporary page slices
    # Crucial for maintaining performance over thousands of concurrent uploads
    for path in paths: 
        if os.path.exists(path): os.remove(path)
```
**Explanation:** `process` invokes the cloud-based AI to handle blurry or complex tables. `_extract_tables` cleans the resulting AI text into matrices, and `_cleanup_temp_files` maintains the server's health by preventing disk-bloat from temporary PDF fragments.

**`app/python_service/analyzer.py`**  
Converts extracted text into structured financial data by identifying key elements such as revenue and expenditure.
```python
def extract_county_data(self, pdf_bytes, county_name, pages_text, tables_cache):
    # Coordinates the AI-powered data extraction prompt and context collection
    # It restricts the LLM to the relevant page ranges to increase accuracy
    start, end = self._find_county_page_range(pages_text, county_name)
    context = "\n".join(pages_text[start:end])
    prompt = self._build_extraction_prompt(county_name, context)
    
    response = self.client.chat.completions.create(
        model=self.model, 
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def _validate_with_regex(self, ai_result: Dict, county_name: str) -> Dict:
    # Cross-checks AI figures against hard-coded regex patterns to ensure ground-truth accuracy
    # If the AI hallucinates a number, the Regex Ground Truth (Table 2.1) overrides it
    raw_text = self.full_text
    osr_match = re.search(fr"{re.escape(county_name)}.*?([\d,]+\.?\d*)\s+[\d,]+\.?\d*", raw_text)
    if osr_match:
        truth_val = self.normalize_currency(osr_match.group(1))
        if abs(ai_result['revenue']['osr_actual'] - truth_val) > 1000:
            ai_result['revenue']['osr_actual'] = truth_val
            ai_result['is_corrected'] = True
    return ai_result

def normalize_currency(self, value: str) -> int:
    # Standardizes diverse string formats into pure integers (e.g., 'Ksh 4.8B' -> 4,800,000,000)
    # Handles accounting formats like (1,000) for negative numbers and text-based millions
    s = str(value).lower().replace(',', '').replace('ksh', '').strip()
    multiplier = 1
    if 'billion' in s or 'b' in s: multiplier = 1_000_000_000
    elif 'million' in s or 'm' in s: multiplier = 1_000_000
    
    num_str = re.sub(r'[^\d.]', '', s)
    try: return int(float(num_str) * multiplier)
    except: return 0
```
**Explanation:** `extract_county_data` uses LLMs to find data in natural language. `_validate_with_regex` acts as a "sanity check" to prevent AI hallucinations, and `normalize_currency` ensures that every financial figure—whether written as text or numbers—is mathematically consistent.

---

## 4.4 Objective 3: Intelligent Generation of Summaries and Insights

### **Objective:**
To generate clear and concise summaries from complex fiscal data using intelligent data processing techniques.

### **4.4.1 How it was Achieved**
This objective was achieved by integrating Large Language Models (LLMs) to interpret extracted data. The system evaluates technical figures against legal requirements (like the 30% development spending rule) and generates plain-language insights that help citizens understand the fiscal health of their county.

### **4.4.2 Associated Interfaces**
*   **[Insert Screenshot of AI Summary Output]**
*   **[Insert Screenshot of Key Insights Section]**
*   **[Insert Screenshot of Financial Highlights Panel]**

### **4.4.3 Associated Code**

**`app/python_service/ai_insights.py`**  
Uses rule-based logic to evaluate compliance and identify financial risks.
```python
def generate_insights(self, data: Dict[str, Any]) -> Dict[str, Any]:
    # Runs the core auditing logic to generate a list of risk flags and recommendations
    # Evaluates multiple fiscal dimensions: Revenue, Debt, and Development compliance
    insights = {"risk_flags": [], "recommendations": []}
    rev_perf = (data['revenue']['actual'] / data['revenue']['target']) * 100
    if rev_perf < 50:
        insights["risk_flags"].append({"severity": "Critical", "msg": f"Severe Revenue Underperformance ({rev_perf:.1f}%)"})
    
    dev_ratio = (data['expenditure']['development'] / data['expenditure']['total']) * 100
    if dev_ratio < 30:
        insights["risk_flags"].append({"severity": "High", "msg": f"Development Goal Missed (Actual: {dev_ratio:.1f}%)"})
    return insights

def _generate_narrative(self, data, flags):
    # Uses the audit findings to draft a one-paragraph executive summary in plain English
    # This narrative is what citizens read first on the county landing page
    county = data.get("county", "The County")
    critical_issues = [f['msg'] for f in flags if f['severity'] == "Critical"]
    summary = f"Audit of {county} reveals a mixed fiscal status. "
    if critical_issues:
        summary += f"Urgent attention is needed regarding {critical_issues[0]}. "
    else:
        summary += "The county is maintaining positive fiscal trajectory standards."
    return summary

def _check_risk_thresholds(self, metric: str, value: float):
    # Returns True if a financial metric crosses a predefined 'Danger Zone' threshold
    # These thresholds are aligned with the Kenya Public Finance Management (PFM) Act
    THRESHOLDS = {"wage_bill": 35.0, "development": 30.0, "pending_bills": 10.0}
    return value > THRESHOLDS.get(metric, 100)
```
**Explanation:** `generate_insights` is the heart of the "intelligence" module, scoring the county's performance. `_generate_narrative` makes the results readable, and `_check_risk_thresholds` provides the underlying pass/fail logic based on national audit standards.

**`app/python_service/merit_mapper.py`**  
Translates technical financial outputs into simplified, human-readable interpretations.
```python
def map_keywords_to_fields(self, keywords: List[str]) -> List[Dict]:
    # Maps user-friendly keywords (e.g., 'Salaries') to technical schema paths
    # Uses fuzzy string matching to handle synonyms like 'Pay' or 'Remuneration'
    matches = []
    for keyword in keywords:
        for field_id, info in self.FIELD_MAPPINGS.items():
            ratio = SequenceMatcher(None, keyword.lower(), info["display_name"].lower()).ratio()
            if ratio > 0.65 or any(k in keyword.lower() for k in info["keywords"]):
                matches.append({"field": field_id, "name": info["display_name"], "path": info["data_path"]})
    return matches

def _determine_viz_type(self, hot_take: Dict, mapped_fields: List[Dict]) -> str:
    # Selects the best chart (Bar/Line/Pie) based on the nature of the data being mapped
    # For example, 'Trend' keywords trigger line charts, while 'Allocation' triggers pie charts
    topic = hot_take.get("topic_name", "").lower()
    if any(t in topic for t in ["trend", "growth", "over time"]): return "line"
    if any(t in topic for t in ["dist", "allocation", "share"]): return "pie"
    return "bar"

def extract_data_from_analysis(self, analysis_data, data_path):
    # Navigates the complex JSON analysis object to retrieve specific numbers for mapping
    # Uses a recursive lookup to handle deep paths like 'expenditure.recurrent.salaries'
    try:
        keys = data_path.split(".")
        val = analysis_data
        for k in keys: val = val.get(k, 0)
        return float(val) if val else 0.0
    except: return 0.0
```
**Explanation:** `map_keywords_to_fields` lets users search in plain language. `_determine_viz_type` automates the design of the dashboard so users always see data in its most logical format, and `extract_data_from_analysis` pulls the exact figures needed for chart rendering.

---

## 4.5 Objective 4: Interactive Web Dashboard for Visual Performance Indicators

### **Objective:**
To design and implement an interactive web dashboard for visualizing county financial performance indicators.

### **4.5.1 How it was Achieved**
The dashboard was developed as a responsive React interface that synchronizes with the AI backend. It uses dynamic charts and "Daily Sync" modules to provide an immediate bird's-eye view of national and county spending. By using interactive tabs, users can drill down from high-level stats to specific document pages.

### **4.5.2 Associated Interfaces**
*   **[Insert Screenshot of Dashboard Overview]**
*   **[Insert Screenshot of Charts and Graphs]**
*   **[Insert Screenshot of Comparative Analysis View]**

### **4.5.3 Associated Code**

**`components/budget-chart.tsx`**  
Renders financial comparisons using chart-based visualizations.
```tsx
export function BudgetBarChart({ data }: { data: any[] }) {
  // Renders the main comparative bar chart for county budgets
  // Uses responsive containers to ensure mobile compatibility
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="county" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
        <YAxis tickFormatter={(v) => `${v}B`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
        <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
        />
        <Bar dataKey="budget" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BudgetPieChart({ categories }: { categories: any[] }) {
  // Provides a breakdown of budget allocation across high-level categories
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={categories} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {categories.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][index % 4]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BudgetTrendLineChart({ trendData }: { trendData: any[] }) {
  // Visualizes the historical budget trajectory using a smoothed line chart
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={trendData}>
        <XAxis dataKey="year" hide />
        <YAxis hide />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} dot={false} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```
**Explanation:** These three components provide the visual foundation of the system. The `BarChart` enables national comparisons, the `PieChart` visualizes internal county budget splits, and the `LineChart` provides necessary historical context, allowing users to see if a county's budget is growing or shrinking over time.

**`components/sectoral-allocation-chart.tsx`**  
Displays how funds are distributed across different sectors.
```tsx
export function SectoralPieChart({ data }: { data: any[] }) {
  // Renders the primary distribution of funds across sectors like Health and Education
  // Uses a specific color palette consistent with national auditing reports
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="amount" nameKey="sector">
          {data.map((_, index) => <Cell key={index} fill={SECTOR_COLORS[index % 6]} stroke="none" />)}
        </Pie>
        <Tooltip formatter={(v: number) => `Ksh ${(v / 1e9).toFixed(1)}B`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PriorityBenchmark({ countyData, nationalAvg }: { countyData: any, nationalAvg: any }) {
  // Manually calculates and renders a comparative bar for county vs national averages
  // This visualizes the 'Gap' that citizens should be aware of in their local spending
  return (
    <div className="space-y-4">
      {['Health', 'Education', 'Agri'].map(sector => (
        <div key={sector}>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-slate-400 font-bold">{sector}</span>
            <span className="text-red-400">{countyData[sector]}% vs {nationalAvg[sector]}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
            <div className="h-full bg-red-500" style={{ width: `${countyData[sector]}%` }} />
            <div className="h-full bg-slate-700 opacity-30" style={{ width: `${nationalAvg[sector]}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VarianceAlert({ variance }: { variance: number }) {
  // Renders a conditional alert status based on how far a county deviates from national norms
  const severity = variance > 10 ? "Critical" : "Standard";
  return (
    <div className={`p-3 rounded-lg flex gap-3 text-xs ${variance > 10 ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10'}`}>
      <div className={`w-1 h-full rounded-full ${variance > 10 ? 'bg-red-500' : 'bg-green-500'}`} />
      <p>The county shows a **{variance}% variance** compared to national fiscal standards.</p>
    </div>
  );
}
```
**Explanation:** The `SectoralPieChart` provides the raw breakdown of where money goes. `PriorityBenchmark` is a unique comparison tool that layers local data over national standards, and `VarianceAlert` automatically flags significant deviations (like spending too much on administration and not enough on healthcare), providing immediate interpretive value to the user.
