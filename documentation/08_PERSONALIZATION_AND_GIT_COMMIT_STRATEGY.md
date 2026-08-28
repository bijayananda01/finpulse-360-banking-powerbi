# 08. GitHub Personalization & Realistic Multi-Commit Strategy

## Why Real Analysts Don't Push in a Single Commit
When recruiters inspect a GitHub portfolio, a single massive commit with 50 files can look like a copy-pasted dump. A genuine Data Analyst repository shows **progressive development across logical development phases**:

```
[Commit 1: Data Architecture] ──► [Commit 2: Power Query ETL] ──► [Commit 3: DAX Suite] ──► [Commit 4: Visuals] ──► [Commit 5: RLS & Docs]
```

---

## 🛠️ Step-by-Step 5-Commit Push Strategy (Run These in Command Prompt)

Open your Command Prompt (`cmd`) in your project folder:
```cmd
cd C:\Users\bibek\Desktop\banking_powerbi_project
git init
```

---

### Phase 1: Initialize Repository & Data Files
```cmd
git add data/ .gitignore
git commit -m "feat(data): extract and structure banking loan and repayment transaction tables"
```
*What this shows the recruiter: You started by procuring and structuring the 6 relational CSV entities.*

---

### Phase 2: Add Power Query ETL Documentation & M Code
```cmd
git add documentation/01_PROJECT_EXECUTIVE_SUMMARY.md documentation/02_DATA_MODEL_AND_RELATIONSHIPS.md documentation/03_POWER_QUERY_M_TRANSFORMATIONS.md
git commit -m "feat(modeling): establish star schema relationships and power query transformation scripts"
```
*What this shows the recruiter: You defined data modeling relationships (1-to-many, single direction) and data cleansing rules.*

---

### Phase 3: Add Core & Advanced DAX Calculations
```cmd
git add documentation/04_COMPLETE_DAX_MEASURE_DICTIONARY.md
git commit -m "feat(dax): implement 35+ banking DAX measures (NPA %, WAIR yield, ECL, and PAR 30+)"
```
*What this shows the recruiter: You authored and tested business logic measures.*

---

### Phase 4: Add Report UI/UX Design & Interactive Preview
```cmd
git add preview_app/ documentation/05_REPORT_DESIGN_AND_VISUAL_BLUEPRINT.md
git commit -m "feat(ui): design 4-page executive report layout and interactive simulator"
```
*What this shows the recruiter: You created the executive visual layout, risk heatmaps, and What-If simulator.*

---

### Phase 5: Add Security Governance, Playbook & Final README
```cmd
git add README.md documentation/06_ROW_LEVEL_SECURITY_RLS.md documentation/07_FRESHER_INTERVIEW_PREP_PLAYBOOK.md
git commit -m "docs: finalize dynamic RLS configuration and interview defense documentation"
```

---

### Final Step: Push to Your GitHub Account
```cmd
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/finpulse-360-banking-powerbi.git
git push -u origin main
```

---

## 💡 4 Quick Ways to Make the Code 100% Uniquely Yours

1. **Rename the Project / Bank**:
   - Change *"Apex Global Bank"* to something personal, e.g., *"Horizon Commercial Bank"*, *"Vanguard Capital Analytics"*, or *"Summit Trust Bank"*.
2. **Add Your Name to the Measure Author Comments**:
   ```dax
   -- Author: [Your Name] | Portfolio Analytics
   -- Purpose: Calculate volume-weighted loan yield across active portfolios
   WAIR = 
   DIVIDE(
       SUMX(Fact_Loans, Fact_Loans[LoanAmountUSD] * Fact_Loans[InterestRate]),
       [Total Disbursed Amount],
       BLANK()
   )
   ```
3. **Customize the Branch Cities in `Dim_Branches.csv`**:
   - Change branch locations to cities you are familiar with (e.g., Mumbai, Delhi, Bengaluru, London, Singapore, Dallas, Chicago).
4. **Write a "Personal Learnings / Challenges Overcome" section in your `README.md`**:
   - Mention a specific challenge, e.g.: *"One key challenge was handling role-playing dates without creating multiple duplicate calendar tables. I solved this by implementing inactive relationships and calling `USERELATIONSHIP()` dynamically in DAX."*
