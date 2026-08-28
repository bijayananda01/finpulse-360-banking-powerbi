# 05. Report Design, UI/UX & Visual Architecture Blueprint

## 1. Design System & Aesthetic Standards

To convey an institutional, high-trust banking feel, **FinPulse 360** employs a **FinTech Slate Navy** color system with high-contrast semantic indicators for risk alerts.

### Color Palette (Hex Codes)
- **Primary Background**: `#0F172A` (Slate 900 - Deep Navy) / `#F8FAFC` (Slate 50 - Clean Crisp Light)
- **Card Background**: `#1E293B` (Slate 800) with 1px border `#334155`
- **Primary Brand Accent**: `#3B82F6` (Electric Blue)
- **Secondary Accent**: `#6366F1` (Indigo Purple)
- **Positive / Safe Metric (Current/Low Risk)**: `#10B981` (Emerald Green)
- **Warning / Moderate Risk (PAR 30-60)**: `#F59E0B` (Amber Orange)
- **High Risk / Non-Performing (90+ DPD / Default)**: `#EF4444` (Crimson Red)
- **Primary Text**: `#F1F5F9` (Slate 100)
- **Muted Text / Secondary Labels**: `#94A3B8` (Slate 400)

### Typography
- Font Family: **Segoe UI Semibold** (Titles & KPI Cards), **Segoe UI** (Body & Data Labels).

---

## 2. Multi-Page Report Architecture (4 Comprehensive Pages)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FinPulse 360 Navigation Bar                     │
│ [1. Executive Command] [2. Delinquency Matrix] [3. Borrower Risk] [4. What-If] │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Page 1: Executive Credit Risk & Portfolio Command Center
**Target Audience**: Chief Executive Officer (CEO), Chief Risk Officer (CRO), Board of Directors.

#### Layout Structure:
1. **Top Global Slicer Bar**:
   - `Dim_Date[FiscalYear]` | `Dim_Branches[Region]` | `Dim_LoanProducts[ProductCategory]` | `Dim_Customers[CustomerSegment]`
2. **Top Executive KPI Card Banner (5 Multi-Row Cards with Sparklines)**:
   - **Card 1**: Total Disbursed Capital (`$485.2M`, YoY: `+18.4%`)
   - **Card 2**: Active Loan Accounts (`4,210 Loans`)
   - **Card 3**: Gross NPA Ratio (`3.24%`, Status Indicator: Green `< 4.0%`)
   - **Card 4**: Weighted Avg Interest Rate (`8.42%`)
   - **Card 5**: Collection Efficiency (`94.8%`)
3. **Left Visual (Area / Line Chart)**:
   - *Title*: Monthly Disbursal Trend vs 3-Month Moving Average (2023–2026).
   - *X-Axis*: `Dim_Date[YearMonth]`, *Y-Axis*: `[Total Disbursed Amount]`, `[3-Month Rolling Avg Disbursal]`.
4. **Center Visual (Donut / Clustered Bar Chart)**:
   - *Title*: Portfolio Distribution by Product Category & Risk Tier.
   - *Legend*: `Dim_LoanProducts[ProductCategory]`, *Values*: `[Total Disbursed Amount]`.
5. **Right Visual (Decomposition Tree)**:
   - *Title*: Root Cause Decomposition of Non-Performing Assets (NPA).
   - *Analyze*: `[NPA Amount]` -> *Explain by*: `Region` -> `ProductCategory` -> `CreditScoreBand` -> `DelinquencyBucket`.
6. **Bottom Table (Matrix with Conditional Heatmap)**:
   - *Rows*: `Dim_Branches[Region]` > `Dim_Branches[BranchName]`.
   - *Values*: `[Total Disbursed Amount]`, `[Gross NPA Ratio %]`, `[PAR 30+ Ratio %]`, `[Collection Efficiency %]`.

---

### Page 2: Delinquency Aging & Early Warning Early-Indicator Matrix
**Target Audience**: Head of Credit Collections, Recovery Officers, Regional Operations Leads.

#### Layout Structure:
1. **Top Alert Cards**:
   - Total PAR 30+ Balance (`$28.6M`)
   - Critical Early Delinquency (31-60 DPD) (`$12.1M`)
   - Expected Credit Loss Provision (`$9.4M`)
2. **Main Chart (100% Stacked Column Chart)**:
   - *Title*: Monthly Delinquency Aging Migration (Current vs 1-30 DPD vs 31-60 DPD vs 61-90 DPD vs Default).
   - *X-Axis*: `Dim_Date[YearMonth]`, *Legend*: `Fact_Repayments[DelinquencyBucket]`, *Values*: `% of Total Accounts`.
3. **Scatter Plot (Quadrant Risk Map)**:
   - *Title*: Branch Collection Efficiency vs NPA Ratio %.
   - *X-Axis*: `[Collection Efficiency %]`, *Y-Axis*: `[Gross NPA Ratio %]`, *Bubble Size*: `[Total Disbursed Amount]`, *Details*: `Dim_Branches[BranchName]`.
   - *Reference Lines*: Median Collection Efficiency (94%), Regulatory Max NPA (4.0%).
4. **Actionable Drill-Through Grid**:
   - *Columns*: `LoanID`, `CustomerName`, `ProductCategory`, `DaysPastDue`, `MonthlyEMI`, `ShortfallAmountUSD`, `LatePenaltyUSD`.
   - *Conditional Formatting*: Red highlight on records with `DPD > 60`.

---

### Page 3: Customer Credit Scoring, DTI & Segment Heatmap
**Target Audience**: Senior Underwriters, Risk Modeling Analysts.

#### Layout Structure:
1. **Distribution Histogram / Bar**:
   - *Title*: Loan Volume by FICO Credit Score Band.
   - *Bins*: Exceptional (800-850), Very Good (740-799), Good (670-739), Fair (580-669), Poor (500-579).
2. **Heatmap Matrix (Cross-Risk Analysis)**:
   - *Rows*: `Dim_Customers[CreditScoreBand]`.
   - *Columns*: `Dim_Customers[CustomerSegment]`.
   - *Values*: `[Gross NPA Ratio %]` formatted with red-yellow-green color gradient.
3. **Correlation Bubble Chart**:
   - *X-Axis*: `Dim_Customers[DebtToIncomeRatio]` (0% to 60%).
   - *Y-Axis*: `Dim_Customers[AnnualIncomeUSD]`.
   - *Size*: `[LoanAmountUSD]`, *Color*: `ApprovalRiskRating`.

---

### Page 4: Dynamic What-If Stress Testing & Rate Sensitivity Simulator
**Target Audience**: Chief Financial Officer (CFO), Treasury, Capital Planning Committee.

#### Layout Structure:
1. **Interactive What-If Sliders (Disconnected Parameter Controls)**:
   - **Slider 1**: Macro Default Spike Scenario (`-5%` to `+25%`, step `1%`).
   - **Slider 2**: Central Bank Interest Rate Hike (`0 bps` to `+300 bps`, step `25 bps`).
2. **Dynamic Comparison Cards**:
   - Baseline NPA vs **Stressed NPA ($)**
   - Baseline ECL Provision vs **Additional Capital Required ($)**
   - Simulated Net Interest Income (NII) Delta (`+$X.XM`)
3. **Scenario Waterfall Chart**:
   - *Title*: Net Capital Impact: Increased Interest Revenue vs Rising Provisioning Costs under Stress.
4. **Sensitivity Matrix**:
   - Dynamic simulation table evaluating capital adequacy ratios across varying rate/default combinations.

---

## 3. Interactive UX Elements Implemented
- **Bookmark Navigation Buttons**: Clean top navigation tabs switching seamlessly between report views with selected states.
- **Custom Tooltip Pages**: Hovering over any branch bar displays a mini sparkline of that branch's 12-month NPA trend and manager contact details.
- **Drill-Through Actions**: Right-clicking any customer or branch directs the user to a granular 360-degree account profile.
