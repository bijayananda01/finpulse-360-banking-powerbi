/* ==========================================================================
   FinPulse 360 - Interactive Power BI Dashboard Simulator Engine
   ========================================================================== */

// --- Branch & Loan Base Data ---
const BRANCH_DATA = [
  { id: 'BR-101', name: 'Downtown Manhattan Hub', region: 'East', manager: 'Sarah Jenkins', disbursed: 62.4, loans: 640, npa: 2.85, par30: 4.8, coll: 96.2, health: 'good' },
  { id: 'BR-102', name: 'Boston Beacon Hill', region: 'East', manager: 'Michael Chang', disbursed: 44.1, loans: 450, npa: 3.10, par30: 5.2, coll: 95.4, health: 'good' },
  { id: 'BR-103', name: 'Philadelphia Center City', region: 'East', manager: 'Emily Watson', disbursed: 32.8, loans: 340, npa: 3.90, par30: 6.8, coll: 93.8, health: 'warning' },
  { id: 'BR-104', name: 'Chicago Loop Premier Hub', region: 'Midwest', manager: 'David Miller', disbursed: 58.2, loans: 610, npa: 3.45, par30: 5.9, coll: 94.6, health: 'good' },
  { id: 'BR-105', name: 'Detroit Metro Commercial', region: 'Midwest', manager: 'Robert Hayes', disbursed: 28.5, loans: 290, npa: 4.85, par30: 8.4, coll: 91.2, health: 'danger' },
  { id: 'BR-106', name: 'Dallas Uptown Hub', region: 'South', manager: 'Carlos Rodriguez', disbursed: 52.6, loans: 530, npa: 2.95, par30: 5.1, coll: 95.8, health: 'good' },
  { id: 'BR-107', name: 'Atlanta Buckhead Branch', region: 'South', manager: 'Jessica Taylor', disbursed: 38.4, loans: 390, npa: 3.40, par30: 5.8, coll: 94.2, health: 'good' },
  { id: 'BR-108', name: 'Miami Brickell Center', region: 'South', manager: 'Antonio Morales', disbursed: 41.2, loans: 420, npa: 4.10, par30: 7.2, coll: 92.5, health: 'warning' },
  { id: 'BR-109', name: 'San Francisco Bay Plaza', region: 'West', manager: 'Lisa Wong', disbursed: 55.8, loans: 560, npa: 2.40, par30: 4.2, coll: 96.8, health: 'good' },
  { id: 'BR-110', name: 'Los Angeles Century City', region: 'West', manager: 'Kevin Scott', disbursed: 46.5, loans: 470, npa: 3.20, par30: 5.4, coll: 94.9, health: 'good' },
  { id: 'BR-111', name: 'Seattle Downtown Hub', region: 'West', manager: 'Rachel Green', disbursed: 36.2, loans: 370, npa: 2.75, par30: 4.6, coll: 96.1, health: 'good' },
  { id: 'BR-112', name: 'Denver Mile High Branch', region: 'West', manager: 'Brian Foster', disbursed: 28.5, loans: 290, npa: 3.65, par30: 6.3, coll: 93.4, health: 'warning' }
];

const DELINQUENCY_ACCOUNTS = [
  { id: 'LN-10245', name: 'Apex Industrial Robotics #12', product: 'SME Commercial Growth', fico: 615, dpd: 74, bucket: '61-90 DPD', emi: '$4,280', shortfall: '$8,560', action: 'Restructure / Secure Second Charge' },
  { id: 'LN-10318', name: 'David Rodriguez', product: 'Unsecured Flexi-Loan', fico: 560, dpd: 82, bucket: '61-90 DPD', emi: '$850', shortfall: '$2,550', action: 'Immediate Legal Demand Notice' },
  { id: 'LN-10492', name: 'Quantum Freight Dynamics #4', product: 'Machinery Lease', fico: 640, dpd: 45, bucket: '31-60 DPD', emi: '$2,150', shortfall: '$2,150', action: 'Proactive Tele-Collection Call' },
  { id: 'LN-10580', name: 'Elena Rostova', product: 'Residential Mortgage', fico: 685, dpd: 38, bucket: '31-60 DPD', emi: '$1,920', shortfall: '$1,920', action: 'Grace Period Extension (15 Days)' },
  { id: 'LN-10641', name: 'Solaria Solar Systems #8', product: 'SME Commercial Growth', fico: 590, dpd: 110, bucket: '90+ DPD (Default)', emi: '$6,400', shortfall: '$25,600', action: 'Collateral Foreclosure & Write-Off' },
  { id: 'LN-10788', name: 'Marcus Kane', product: 'Secured Auto Loan', fico: 630, dpd: 52, bucket: '31-60 DPD', emi: '$620', shortfall: '$1,240', action: 'Automated Repayment Rescheduling' },
  { id: 'LN-10895', name: 'Pinnacle Logistics Corp #19', product: 'Machinery Lease', fico: 670, dpd: 35, bucket: '31-60 DPD', emi: '$3,800', shortfall: '$3,800', action: 'Branch Relationship Manager Visit' }
];

// --- DAX Measures Dictionary Database ---
const DAX_DATABASE = {
  "Total Disbursed Amount": {
    dax: "Total Disbursed Amount = \nSUM(Fact_Loans[LoanAmountUSD])",
    desc: "Aggregates total original loan volume originated across the active filter context.",
    functions: "SUM(Fact_Loans[LoanAmountUSD])",
    context: "Calculated dynamically under visual filter context. Respects all slicers."
  },
  "Gross NPA Ratio %": {
    dax: "Gross NPA Ratio % = \nDIVIDE(\n    CALCULATE(\n        [Total Disbursed Amount],\n        Fact_Loans[IsNonPerformingAsset] = 1\n    ),\n    [Total Disbursed Amount],\n    0\n)",
    desc: "Key regulatory ratio: Non-performing assets (90+ DPD / default) as a % of total portfolio book.",
    functions: "DIVIDE, CALCULATE, SUM",
    context: "CALCULATE modifies filter context by injecting 'IsNonPerformingAsset = 1'. DIVIDE safely prevents division by zero."
  },
  "WAIR": {
    dax: "WAIR = \nDIVIDE(\n    SUMX(\n        Fact_Loans,\n        Fact_Loans[LoanAmountUSD] * Fact_Loans[InterestRate]\n    ),\n    [Total Disbursed Amount],\n    BLANK()\n)",
    desc: "Weighted Average Interest Rate: Computes portfolio yield weighted by loan ticket size.",
    functions: "SUMX, DIVIDE",
    context: "Uses SUMX iterator to calculate product yield row-by-row before aggregating."
  },
  "Collection Efficiency %": {
    dax: "Collection Efficiency % = \nDIVIDE(\n    SUM(Fact_Repayments[PaidAmountUSD]),\n    SUM(Fact_Repayments[ScheduledAmountUSD]),\n    0\n)",
    desc: "Ratio of actual cash collections received against scheduled monthly EMI billing demands.",
    functions: "DIVIDE, SUM",
    context: "Evaluated across Fact_Repayments table connected via 1:* relationship to Fact_Loans."
  },
  "Expected Credit Loss (ECL)": {
    dax: "Expected Credit Loss (ECL) = \nSUMX(\n    Fact_Loans,\n    VAR _PD = SWITCH(Fact_Loans[ApprovalRiskRating],\n        \"AAA - Low Risk\", 0.015,\n        \"BBB - Moderate Risk\", 0.045,\n        \"CCC - Elevated Risk\", 0.140,\n        \"DDD - High Default Probability\", 0.350,\n        0.05\n    )\n    VAR _LGD = 0.45 -- 45% Loss Given Default\n    VAR _EAD = Fact_Loans[LoanAmountUSD]\n    RETURN _EAD * _PD * _LGD\n)",
    desc: "Forward-looking IFRS 9 regulatory loss provisioning based on PD x LGD x EAD.",
    functions: "SUMX, VAR/RETURN, SWITCH",
    context: "Demonstrates advanced DAX variables and regulatory credit modeling."
  },
  "3-Month Rolling Avg Disbursal": {
    dax: "3-Month Rolling Avg Disbursal = \nAVERAGEX(\n    DATESINPERIOD(\n        Dim_Date[FullDate],\n        MAX(Dim_Date[FullDate]),\n        -3,\n        MONTH\n    ),\n    [Total Disbursed Amount]\n)",
    desc: "Time intelligence calculation smoothing monthly seasonal volatility over a rolling 3-month window.",
    functions: "AVERAGEX, DATESINPERIOD, MAX",
    context: "Requires a marked Date dimension table. Context transition occurs for each date in the period."
  },
  "PAR 30+ Ratio %": {
    dax: "PAR 30+ Ratio % = \nDIVIDE(\n    CALCULATE(\n        [Total Disbursed Amount],\n        Fact_Loans[LoanStatus] IN {\"Delinquent (31-60 DPD)\", \"Delinquent (61-90 DPD)\", \"In Default (90+ DPD)\"}\n    ),\n    [Total Disbursed Amount],\n    0\n)",
    desc: "Portfolio at Risk: Measures loans that have breached the 30-day delinquency threshold.",
    functions: "CALCULATE, DIVIDE, IN Operator",
    context: "Early warning metric for risk committees before loans reach full NPA status."
  },
  "Stressed NPA Amount": {
    dax: "Stressed NPA Amount = \nVAR _SpikePct = SELECTEDVALUE('Parameter_DefaultSpike'[DefaultSpikeValue], 0)\nVAR _BaseNPA = [NPA Amount]\nRETURN\n    _BaseNPA * (1 + _SpikePct)",
    desc: "Dynamic What-If measure recalculating NPA under simulated recession scenarios.",
    functions: "SELECTEDVALUE, VAR/RETURN",
    context: "Reads disconnected parameter table value and dynamically adjusts credit loss."
  },
  "Subprime Exposure Ratio (%)": {
    dax: "Subprime Exposure % = \nDIVIDE(\n    CALCULATE(\n        [Total Disbursed Amount],\n        Dim_Customers[CreditScoreBand] IN {\"Poor (500-579)\", \"Fair (580-669)\"}\n    ),\n    [Total Disbursed Amount],\n    0\n)",
    desc: "Calculates % of total lending allocated to borrowers with FICO score below 670.",
    functions: "DIVIDE, CALCULATE",
    context: "Cross-table filtering: Dim_Customers filters Fact_Loans via 1:* relationship."
  },
  "Additional Capital Provision Required": {
    dax: "Additional Capital Provision Required = \nVAR _StressedNPA = [Stressed NPA Amount]\nVAR _CurrentNPA = [NPA Amount]\nVAR _ProvisionCoverageRatio = 0.70 -- 70% PCR regulatory mandate\nRETURN\n    (_StressedNPA - _CurrentNPA) * _ProvisionCoverageRatio",
    desc: "Computes extra capital liquidity that must be set aside under Basel III stressed conditions.",
    functions: "VAR/RETURN, [Stressed NPA Amount]",
    context: "Reuses atomic measures for modular DAX architecture."
  },
  "Simulated NII Increase": {
    dax: "Simulated NII Increase = \nVAR _RateHike = SELECTEDVALUE('Parameter_RateHike'[RateHikeValue], 0)\nVAR _FloatingPortion = 0.65 -- 65% floating rate loans\nRETURN\n    [Total Disbursed Amount] * _FloatingPortion * _RateHike",
    desc: "Simulates additional Net Interest Income (NII) generated by central bank benchmark rate increases.",
    functions: "SELECTEDVALUE, VAR/RETURN",
    context: "Models interest rate sensitivity on variable-rate credit portfolios."
  }
};

// --- Interview Questions & Model Answers ---
const INTERVIEW_QA = {
  star: [
    {
      q: "Tell me about this Banking Power BI project and your role in it.",
      a: "In FinPulse 360, I served as the Data Analyst responsible for designing an end-to-end Credit Risk & Loan Portfolio dashboard for Apex Global Bank ($485M portfolio, 5,000 loans). I engineered a Star Schema data model, authored 35+ DAX measures (Gross NPA Ratio, WAIR, ECL, PAR 30+), configured dynamic Row-Level Security by branch manager email, and created What-If stress testing simulators. This reduced reporting turnaround from 5 days to real-time and improved early delinquency recovery efficiency by 14%."
    },
    {
      q: "What were the primary business metrics and why are they important?",
      a: "The core metrics are: (1) Gross NPA Ratio % (<4% regulatory benchmark), (2) Collection Efficiency % (cash collected vs EMI dues), (3) Portfolio at Risk (PAR 30+) for early warning detection, and (4) Weighted Average Interest Rate (WAIR) for asset yield."
    }
  ],
  modeling: [
    {
      q: "Why did you choose a Star Schema over Snowflake?",
      a: "Power BI's in-memory VertiPaq engine is optimized for flat, denormalized dimensions. Star schemas minimize table joins, lower CPU query overhead, avoid circular filter ambiguities, and provide faster visual rendering compared to multi-tier Snowflake hierarchies."
    },
    {
      q: "How did you handle role-playing date relationships?",
      a: "I linked Dim_Date to Fact_Loans via an Active relationship on DisbursalDateKey, and an Inactive relationship on MaturityDateKey. In DAX measures requiring maturity or payment dates, I dynamically activate the relationship using USERELATIONSHIP(Fact_Loans[MaturityDateKey], Dim_Date[DateKey])."
    },
    {
      q: "What is Cardinality and why did you avoid Bi-directional filters?",
      a: "Cardinality is 1-to-Many between Dimensions and Facts. Bi-directional filtering was strictly avoided because it can introduce ambiguous filter paths, slow down VertiPaq performance, and produce unexpected measure totals."
    }
  ],
  dax: [
    {
      q: "What is the difference between a Calculated Column and a Measure?",
      a: "Calculated columns are evaluated during data refresh, stored physically in RAM, consume disk space, and don't respond to slicers. Measures are calculated dynamically on-the-fly at query time, take zero RAM at rest, and adjust to user filter context."
    },
    {
      q: "Explain what CALCULATE does and how Context Transition works.",
      a: "CALCULATE is the only function that can modify or override filter context. When invoked inside an iterative row context (like SUMX or a calculated column), it triggers Context Transition, which converts the current row's attributes into an equivalent filter context."
    },
    {
      q: "Why use DIVIDE() instead of '/'?",
      a: "The '/' operator returns a NaN/Infinity error when dividing by zero, which crashes visuals. DIVIDE() safely handles zero denominators and returns BLANK() or a specified default (e.g., 0)."
    }
  ],
  rls: [
    {
      q: "How did you implement Dynamic Row-Level Security (RLS)?",
      a: "I created a role on Dim_Branches using the DAX filter `[ManagerEmail] = USERPRINCIPALNAME()`. When a manager logs into Power BI Service, their email is captured and Dim_Branches is filtered to their branch, which automatically filters the linked loan and repayment fact tables."
    },
    {
      q: "What is the difference between USERNAME() and USERPRINCIPALNAME()?",
      a: "In Power BI Desktop, USERNAME() returns the DOMAIN\\user, whereas USERPRINCIPALNAME() consistently returns the user's corporate email (user@apexbank.com) in both Desktop and Service."
    }
  ]
};

// --- Chart Instances ---
let chartDisbursals = null;
let chartProductSplit = null;
let chartDelinquency = null;
let chartScatterRisk = null;
let chartFico = null;
let chartStress = null;

// --- App State ---
let currentState = {
  year: '2026',
  region: 'All',
  product: 'All',
  segment: 'All',
  defaultSpike: 0,
  rateHike: 0
};

// --- Initialize App on DOM Load ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSlicers();
  initModalsAndDrawers();
  initWhatIfSliders();
  renderAllComponents();
});

// --- Tab Navigation ---
function initNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  const pages = document.querySelectorAll('.report-page');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const pageId = tab.getAttribute('data-page');
      const targetPage = document.getElementById(pageId);
      if (targetPage) {
        targetPage.classList.add('active');
        // Trigger resize on charts in active page
        window.dispatchEvent(new Event('resize'));
      }
    });
  });

  // Dark/Light Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.querySelector('.theme-icon').textContent = isLight ? '🌙' : '☀️';
    updateChartColors();
  });
}

// --- Slicers & Filters ---
function initSlicers() {
  const yearSelect = document.getElementById('slicer-year');
  const regionSelect = document.getElementById('slicer-region');
  const prodSelect = document.getElementById('slicer-product');
  const segSelect = document.getElementById('slicer-segment');
  const resetBtn = document.getElementById('reset-filters-btn');

  const updateFilters = () => {
    currentState.year = yearSelect.value;
    currentState.region = regionSelect.value;
    currentState.product = prodSelect.value;
    currentState.segment = segSelect.value;
    renderAllComponents();
  };

  yearSelect.addEventListener('change', updateFilters);
  regionSelect.addEventListener('change', updateFilters);
  prodSelect.addEventListener('change', updateFilters);
  segSelect.addEventListener('change', updateFilters);

  resetBtn.addEventListener('click', () => {
    yearSelect.value = '2026';
    regionSelect.value = 'All';
    prodSelect.value = 'All';
    segSelect.value = 'All';
    updateFilters();
  });
}

// --- Render All Visuals & KPIs ---
function renderAllComponents() {
  updateFilterSummary();
  updateKPIs();
  renderBranchTable();
  renderDelinquencyTable();
  renderHeatmapGrid();
  renderCharts();
  updateWhatIfCalculations();
}

function updateFilterSummary() {
  const summaryEl = document.getElementById('active-filter-summary');
  const parts = [];
  if (currentState.year !== 'All') parts.push(`FY: ${currentState.year}`);
  if (currentState.region !== 'All') parts.push(`Region: ${currentState.region}`);
  if (currentState.product !== 'All') parts.push(`Product: ${currentState.product}`);
  if (currentState.segment !== 'All') parts.push(`Segment: ${currentState.segment}`);
  
  summaryEl.textContent = parts.length > 0 ? `Filters Active (${parts.join(' • ')})` : 'Showing All 5,000 Loans | Direct Import Model';
}

function updateKPIs() {
  // Multipliers based on slicers
  let volMult = 1.0;
  if (currentState.region === 'East') volMult *= 0.35;
  else if (currentState.region === 'West') volMult *= 0.32;
  else if (currentState.region === 'South') volMult *= 0.22;
  else if (currentState.region === 'Midwest') volMult *= 0.18;

  if (currentState.year === '2025') volMult *= 0.82;
  else if (currentState.year === '2024') volMult *= 0.65;
  else if (currentState.year === '2023') volMult *= 0.48;

  const baseDisbursed = 485.2 * volMult;
  const baseNpa = 3.24;
  const baseEcl = 9.42 * volMult;
  const baseColl = 94.8;
  const baseWair = 8.42;

  document.getElementById('kpi-disbursed').textContent = `$${baseDisbursed.toFixed(1)}M`;
  document.getElementById('kpi-npa').textContent = `${baseNpa.toFixed(2)}%`;
  document.getElementById('kpi-wair').textContent = `${baseWair.toFixed(2)}%`;
  document.getElementById('kpi-collection').textContent = `${baseColl.toFixed(1)}%`;
  document.getElementById('kpi-ecl').textContent = `$${baseEcl.toFixed(2)}M`;

  // Page 2 & 3 KPIs
  document.getElementById('kpi-par30').textContent = `$${(baseDisbursed * 0.059).toFixed(1)}M`;
  document.getElementById('kpi-dpd30').textContent = `$${(baseDisbursed * 0.025).toFixed(1)}M`;
  document.getElementById('kpi-default-amt').textContent = `$${(baseDisbursed * 0.032).toFixed(1)}M`;
  document.getElementById('kpi-penalties').textContent = `$${(482.5 * volMult).toFixed(1)}K`;

  document.getElementById('kpi-high-dti').textContent = `$${(baseDisbursed * 0.132).toFixed(1)}M`;
}

function renderBranchTable() {
  const tbody = document.getElementById('branch-table-body');
  tbody.innerHTML = '';

  const filtered = BRANCH_DATA.filter(b => {
    if (currentState.region !== 'All' && b.region !== currentState.region) return false;
    return true;
  });

  filtered.forEach(b => {
    const tr = document.createElement('tr');
    const badgeClass = b.health === 'good' ? 'badge-health-good' : (b.health === 'warning' ? 'badge-health-warning' : 'badge-health-danger');
    const badgeText = b.health === 'good' ? '✓ Low Risk' : (b.health === 'warning' ? '⚠️ Moderate' : '🚨 Elevated Risk');

    tr.innerHTML = `
      <td><strong>${b.name}</strong></td>
      <td>${b.region}</td>
      <td>${b.manager}</td>
      <td><strong>$${b.disbursed.toFixed(1)}M</strong></td>
      <td>${b.loans}</td>
      <td style="color: ${b.npa > 4 ? '#EF4444' : '#10B981'}; font-weight: 700;">${b.npa.toFixed(2)}%</td>
      <td>${b.par30.toFixed(1)}%</td>
      <td>${b.coll.toFixed(1)}%</td>
      <td><span class="${badgeClass}">${badgeText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDelinquencyTable() {
  const tbody = document.getElementById('delinquency-table-body');
  tbody.innerHTML = '';

  DELINQUENCY_ACCOUNTS.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${a.id}</code></td>
      <td><strong>${a.name}</strong></td>
      <td>${a.product}</td>
      <td>${a.fico}</td>
      <td><span class="badge-urgent">${a.dpd} Days</span></td>
      <td>${a.bucket}</td>
      <td>${a.emi}</td>
      <td style="color: #EF4444; font-weight: 700;">${a.shortfall}</td>
      <td><span class="badge-info">${a.action}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderHeatmapGrid() {
  const grid = document.getElementById('segment-heatmap-grid');
  grid.innerHTML = '';

  const cells = [
    { seg: 'Affluent (FICO 740+)', val: '0.8%', bg: 'rgba(16, 185, 129, 0.25)', color: '#10B981' },
    { seg: 'Emerging Prime', val: '2.1%', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
    { seg: 'Mass Market Prime', val: '3.9%', bg: 'rgba(245, 158, 11, 0.25)', color: '#F59E0B' },
    { seg: 'Subprime / High Risk', val: '8.7%', bg: 'rgba(239, 68, 68, 0.35)', color: '#EF4444' },

    { seg: 'DTI < 25%', val: '1.2%', bg: 'rgba(16, 185, 129, 0.20)', color: '#10B981' },
    { seg: 'DTI 25% - 35%', val: '2.4%', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
    { seg: 'DTI 36% - 45%', val: '4.8%', bg: 'rgba(245, 158, 11, 0.30)', color: '#F59E0B' },
    { seg: 'DTI > 45% (Critical)', val: '9.5%', bg: 'rgba(239, 68, 68, 0.40)', color: '#EF4444' }
  ];

  cells.forEach(c => {
    const div = document.createElement('div');
    div.className = 'heatmap-cell';
    div.style.backgroundColor = c.bg;
    div.innerHTML = `
      <div class="cell-title">${c.seg}</div>
      <div class="cell-val" style="color: ${c.color}">${c.val}</div>
      <div style="font-size: 0.65rem; color: #94A3B8; margin-top: 2px;">Avg NPA Rate</div>
    `;
    grid.appendChild(div);
  });
}

// --- Chart.js Rendering ---
function renderCharts() {
  const isLight = document.body.classList.contains('light-theme');
  const textColor = isLight ? '#475569' : '#94A3B8';
  const gridColor = isLight ? '#E2E8F0' : '#1E293B';

  // 1. Disbursals Trend (Area + Line)
  const ctx1 = document.getElementById('chart-disbursals-trend').getContext('2d');
  if (chartDisbursals) chartDisbursals.destroy();
  chartDisbursals = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Monthly Disbursal ($M)',
          data: [32, 35, 41, 38, 44, 46, 42, 48, 52, 58, 64, 71],
          borderColor: '#38BDF8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5
        },
        {
          label: '3-Month Rolling Average ($M)',
          data: [30, 33, 36, 38, 41, 43, 44, 45, 47, 53, 58, 64],
          borderColor: '#818CF8',
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `$${v}M` } }
      }
    }
  });

  // 2. Product Category Split (Donut)
  const ctx2 = document.getElementById('chart-product-split').getContext('2d');
  if (chartProductSplit) chartProductSplit.destroy();
  chartProductSplit = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Home Mortgage', 'Auto Loan', 'Personal Flexi', 'SME Commercial', 'Education Loan'],
      datasets: [{
        data: [42, 22, 14, 16, 6],
        backgroundColor: ['#38BDF8', '#818CF8', '#F59E0B', '#10B981', '#6366F1'],
        borderWidth: 2,
        borderColor: isLight ? '#FFFFFF' : '#151F32'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: textColor, font: { size: 11 } } }
      },
      cutout: '68%'
    }
  });

  // 3. Delinquency Aging Stacked Bar
  const ctx3 = document.getElementById('chart-delinquency-buckets').getContext('2d');
  if (chartDelinquency) chartDelinquency.destroy();
  chartDelinquency = new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: ['Mortgage', 'Auto Loan', 'Personal Flexi', 'SME Business', 'Education'],
      datasets: [
        { label: 'Current (0 DPD)', data: [92, 88, 81, 84, 91], backgroundColor: '#10B981' },
        { label: '1-30 DPD', data: [4.5, 6.2, 9.5, 7.8, 5.2], backgroundColor: '#38BDF8' },
        { label: '31-60 DPD', data: [1.8, 3.1, 4.8, 4.2, 2.1], backgroundColor: '#F59E0B' },
        { label: '61-90 DPD', data: [1.0, 1.6, 2.7, 2.3, 1.0], backgroundColor: '#F97316' },
        { label: '90+ DPD (Default)', data: [0.7, 1.1, 2.0, 1.7, 0.7], backgroundColor: '#EF4444' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { size: 10 } } } },
      scales: {
        x: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor } },
        y: { stacked: true, max: 100, grid: { color: gridColor }, ticks: { color: textColor, callback: v => `${v}%` } }
      }
    }
  });

  // 4. Branch Risk Quadrant (Scatter)
  const ctx4 = document.getElementById('chart-scatter-risk').getContext('2d');
  if (chartScatterRisk) chartScatterRisk.destroy();
  chartScatterRisk = new Chart(ctx4, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Branch Risk Matrix',
        data: BRANCH_DATA.map(b => ({ x: b.coll, y: b.npa })),
        backgroundColor: '#38BDF8',
        borderColor: '#0284C7',
        pointRadius: 7,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const b = BRANCH_DATA[ctx.dataIndex];
              return `${b.name}: Coll ${b.coll}%, NPA ${b.npa}% ($${b.disbursed}M)`;
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Collection Efficiency (%)', color: textColor }, grid: { color: gridColor }, ticks: { color: textColor } },
        y: { title: { display: true, text: 'Gross NPA Ratio (%)', color: textColor }, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  // 5. FICO Distribution Bar
  const ctx5 = document.getElementById('chart-fico-dist').getContext('2d');
  if (chartFico) chartFico.destroy();
  chartFico = new Chart(ctx5, {
    type: 'bar',
    data: {
      labels: ['Poor (500-579)', 'Fair (580-669)', 'Good (670-739)', 'Very Good (740-799)', 'Exceptional (800-850)'],
      datasets: [{
        label: 'Loan Volume ($M)',
        data: [18.5, 38.6, 172.4, 154.2, 101.5],
        backgroundColor: ['#EF4444', '#F59E0B', '#38BDF8', '#818CF8', '#10B981'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `$${v}M` } }
      }
    }
  });

  // 6. What-If Stress Chart
  renderStressChart();
}

function renderStressChart() {
  const ctx6 = document.getElementById('chart-stress-comparison').getContext('2d');
  const isLight = document.body.classList.contains('light-theme');
  const textColor = isLight ? '#475569' : '#94A3B8';
  const gridColor = isLight ? '#E2E8F0' : '#1E293B';

  const baseNpa = 15.7;
  const stressedNpa = baseNpa * (1 + currentState.defaultSpike / 100);
  const baseEcl = 9.42;
  const stressedEcl = baseEcl + (stressedNpa - baseNpa) * 0.70;
  const niiGain = (485.2 * 0.65 * (currentState.rateHike / 10000));

  if (chartStress) chartStress.destroy();
  chartStress = new Chart(ctx6, {
    type: 'bar',
    data: {
      labels: ['Non-Performing Loans (NPA)', 'IFRS 9 Loss Provision (ECL)', 'Net Interest Income (NII Delta)'],
      datasets: [
        {
          label: 'Baseline Scenario ($M)',
          data: [baseNpa, baseEcl, 0],
          backgroundColor: '#64748B',
          borderRadius: 4
        },
        {
          label: 'Stressed Simulation ($M)',
          data: [stressedNpa, stressedEcl, niiGain],
          backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `$${v.toFixed(1)}M` } }
      }
    }
  });
}

function updateChartColors() {
  renderCharts();
}

// --- What-If Stress Testing Simulator ---
function initWhatIfSliders() {
  const spikeSlider = document.getElementById('param-default-spike');
  const hikeSlider = document.getElementById('param-rate-hike');
  const resetWhatIfBtn = document.getElementById('reset-whatif-btn');

  const onSliderChange = () => {
    currentState.defaultSpike = parseInt(spikeSlider.value, 10);
    currentState.rateHike = parseInt(hikeSlider.value, 10);

    document.getElementById('val-default-spike').textContent = `+${currentState.defaultSpike}%`;
    document.getElementById('val-rate-hike').textContent = `+${currentState.rateHike} bps`;

    updateWhatIfCalculations();
    renderStressChart();
  };

  spikeSlider.addEventListener('input', onSliderChange);
  hikeSlider.addEventListener('input', onSliderChange);

  resetWhatIfBtn.addEventListener('click', () => {
    spikeSlider.value = 0;
    hikeSlider.value = 0;
    onSliderChange();
  });
}

function updateWhatIfCalculations() {
  const baseNpa = 15.7;
  const stressedNpa = baseNpa * (1 + currentState.defaultSpike / 100);
  const diffNpa = stressedNpa - baseNpa;
  const addlProvision = diffNpa * 0.70; // 70% PCR
  const niiGain = 485.2 * 0.65 * (currentState.rateHike / 10000); // 65% floating rate
  const netImpact = niiGain - addlProvision;

  document.getElementById('sim-stressed-npa').textContent = `$${stressedNpa.toFixed(2)}M`;
  document.getElementById('sim-npa-diff').textContent = `Baseline: $${baseNpa.toFixed(1)}M (+${currentState.defaultSpike}%)`;
  document.getElementById('sim-addl-provision').textContent = `$${addlProvision.toFixed(2)}M`;
  document.getElementById('sim-nii-gain').textContent = `+$${niiGain.toFixed(2)}M`;
  
  const netEl = document.getElementById('sim-net-capital-impact');
  netEl.textContent = `${netImpact >= 0 ? '+' : ''}$${netImpact.toFixed(2)}M`;
  netEl.style.color = netImpact >= 0 ? '#10B981' : '#EF4444';
}

// --- Modals & Drawers Handling ---
function initModalsAndDrawers() {
  const daxModal = document.getElementById('dax-modal');
  const daxCloseBtn = document.getElementById('modal-close-btn');
  const daxGuideBtn = document.getElementById('dax-guide-btn');
  const copyDaxBtn = document.getElementById('copy-dax-btn');

  const interviewDrawer = document.getElementById('interview-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const interviewModeBtn = document.getElementById('interview-mode-btn');

  // DAX Inspect Click Handlers
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.inspectable');
    if (target) {
      const measureKey = target.getAttribute('data-measure');
      if (DAX_DATABASE[measureKey]) {
        openDaxModal(measureKey);
      }
    }
  });

  daxGuideBtn.addEventListener('click', () => openDaxModal('Gross NPA Ratio %'));
  daxCloseBtn.addEventListener('click', () => daxModal.classList.remove('active'));
  daxModal.addEventListener('click', (e) => {
    if (e.target === daxModal) daxModal.classList.remove('active');
  });

  copyDaxBtn.addEventListener('click', () => {
    const code = document.getElementById('modal-dax-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      copyDaxBtn.textContent = 'Copied!';
      setTimeout(() => copyDaxBtn.textContent = 'Copy DAX', 1800);
    });
  });

  // Interview Mode Handlers
  interviewModeBtn.addEventListener('click', () => {
    interviewDrawer.classList.add('active');
    renderInterviewQA('star');
  });

  drawerCloseBtn.addEventListener('click', () => interviewDrawer.classList.remove('active'));
  interviewDrawer.addEventListener('click', (e) => {
    if (e.target === interviewDrawer) interviewDrawer.classList.remove('active');
  });

  // Interview Tabs
  const qaTabs = document.querySelectorAll('.qa-tab');
  qaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      qaTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderInterviewQA(tab.getAttribute('data-qacat'));
    });
  });
}

function openDaxModal(measureKey) {
  const data = DAX_DATABASE[measureKey];
  if (!data) return;

  document.getElementById('modal-measure-name').textContent = measureKey;
  document.getElementById('modal-dax-code').textContent = data.dax;
  document.getElementById('modal-dax-desc').textContent = data.desc;
  document.getElementById('modal-dax-functions').textContent = data.functions;
  document.getElementById('modal-dax-context').textContent = data.context;

  document.getElementById('dax-modal').classList.add('active');
}

function renderInterviewQA(category) {
  const container = document.getElementById('qa-container');
  container.innerHTML = '';

  const items = INTERVIEW_QA[category] || [];
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'qa-card';
    card.innerHTML = `
      <div class="qa-q">Q: ${item.q}</div>
      <div class="qa-a">${item.a}</div>
    `;
    container.appendChild(card);
  });
}
