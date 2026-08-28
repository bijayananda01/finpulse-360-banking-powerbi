# 04. Complete DAX Measure Dictionary & Formula Reference

This document contains the entire enterprise DAX library created for **FinPulse 360**. All measures are organized into dedicated **Display Folders** inside the `_Measures` table.

---

## Folder 1: `01. Core Portfolio & Disbursals`

### Measure 1.1: Total Disbursed Amount
```dax
Total Disbursed Amount = 
SUM(Fact_Loans[LoanAmountUSD])
```
- **Description**: Total loan volume originated across the selected time period.
- **Format**: Currency (`$#,##0`)

### Measure 1.2: Total Active Loans Count
```dax
Total Active Loans Count = 
CALCULATE(
    COUNTROWS(Fact_Loans),
    Fact_Loans[LoanStatus] IN {"Current / Performing", "Delinquent (31-60 DPD)", "Delinquent (61-90 DPD)"}
)
```
- **Description**: Count of active accounts currently in the book of business (excluding fully settled or written-off accounts).

### Measure 1.3: Average Loan Ticket Size
```dax
Average Ticket Size = 
DIVIDE(
    [Total Disbursed Amount],
    DISTINCTCOUNT(Fact_Loans[LoanID]),
    0
)
```
- **Description**: Average capital disbursed per loan contract. Uses `DIVIDE` to prevent divide-by-zero errors.

### Measure 1.4: Weighted Average Interest Rate (WAIR)
```dax
WAIR = 
DIVIDE(
    SUMX(
        Fact_Loans,
        Fact_Loans[LoanAmountUSD] * Fact_Loans[InterestRate]
    ),
    [Total Disbursed Amount],
    BLANK()
)
```
- **Description**: Calculates the yield of the loan book weighted by loan size rather than a simple unweighted arithmetic average.
- **Format**: Percentage (`0.00%`)

---

## Folder 2: `02. Credit Risk, NPA & Delinquency`

### Measure 2.1: Non-Performing Assets (NPA) Amount
```dax
NPA Amount = 
CALCULATE(
    [Total Disbursed Amount],
    Fact_Loans[IsNonPerformingAsset] = 1
)
```
- **Description**: Dollar volume of loans classified as non-performing (90+ DPD, default, or restructured).

### Measure 2.2: Gross NPA Ratio (%)
```dax
Gross NPA Ratio % = 
DIVIDE(
    [NPA Amount],
    [Total Disbursed Amount],
    0
)
```
- **Description**: Benchmark banking metric. Ratios above 4% trigger executive credit audit.
- **Format**: Percentage (`0.00%`)

### Measure 2.3: Portfolio at Risk 30+ (PAR 30+ Amount)
```dax
PAR 30+ Amount = 
CALCULATE(
    [Total Disbursed Amount],
    Fact_Loans[LoanStatus] IN {"Delinquent (31-60 DPD)", "Delinquent (61-90 DPD)", "In Default (90+ DPD)"}
)
```
- **Description**: Total loan balance with payments overdue past 30 days.

### Measure 2.4: PAR 30+ Ratio (%)
```dax
PAR 30+ Ratio % = 
DIVIDE(
    [PAR 30+ Amount],
    [Total Disbursed Amount],
    0
)
```
- **Description**: Early-warning credit deterioration metric.

### Measure 2.5: Total Write-Off Amount
```dax
Total Write-Off Amount = 
SUM(Fact_Loans[WriteOffAmountUSD])
```
- **Description**: Cumulative unrecoverable bad debt booked to the profit and loss account.

### Measure 2.6: Expected Credit Loss (ECL Provisioning)
```dax
Expected Credit Loss (ECL) = 
SUMX(
    Fact_Loans,
    VAR _PD = 
        SWITCH(
            Fact_Loans[ApprovalRiskRating],
            "AAA - Low Risk", 0.015,
            "BBB - Moderate Risk", 0.045,
            "CCC - Elevated Risk", 0.140,
            "DDD - High Default Probability", 0.350,
            0.05
        )
    VAR _LGD = 0.45 -- 45% Loss Given Default standard
    VAR _EAD = Fact_Loans[LoanAmountUSD] -- Exposure at Default
    RETURN
        _EAD * _PD * _LGD
)
```
- **Description**: Regulatory IFRS 9 forward-looking credit loss estimation based on Probability of Default (PD), Loss Given Default (LGD), and Exposure at Default (EAD).

---

## Folder 3: `03. Collection & Repayment Efficiency`

### Measure 3.1: Total Scheduled Repayments
```dax
Total Scheduled Repayments = 
SUM(Fact_Repayments[ScheduledAmountUSD])
```

### Measure 3.2: Total Actual Collections
```dax
Total Actual Collections = 
SUM(Fact_Repayments[PaidAmountUSD])
```

### Measure 3.3: Collection Efficiency (%)
```dax
Collection Efficiency % = 
DIVIDE(
    [Total Actual Collections],
    [Total Scheduled Repayments],
    0
)
```
- **Description**: Ratio of cash collected against scheduled monthly EMI dues.
- **Format**: Percentage (`0.0%`)

### Measure 3.4: Total Late Penalties Collected
```dax
Total Late Penalties = 
SUM(Fact_Repayments[LatePenaltyUSD])
```

### Measure 3.5: Repayments under Inactive Payment Date (USERELATIONSHIP)
```dax
Collections by Payment Date = 
CALCULATE(
    [Total Actual Collections],
    USERELATIONSHIP(Fact_Repayments[PaymentDateKey], Dim_Date[DateKey])
)
```
- **Description**: Demonstrates handling of inactive role-playing relationships in DAX. Evaluates cash collections on the date payment was physically received rather than when it was due.

---

## Folder 4: `04. Time Intelligence (YTD, YoY, SPLY, MoM)`

### Measure 4.1: Disbursals YTD (Year-to-Date)
```dax
Disbursals YTD = 
CALCULATE(
    [Total Disbursed Amount],
    DATESYTD(Dim_Date[FullDate])
)
```

### Measure 4.2: Disbursals Same Period Last Year (SPLY)
```dax
Disbursals SPLY = 
CALCULATE(
    [Total Disbursed Amount],
    SAMEPERIODLASTYEAR(Dim_Date[FullDate])
)
```

### Measure 4.3: YoY Disbursal Growth (%)
```dax
YoY Disbursal Growth % = 
VAR _Current = [Total Disbursed Amount]
VAR _Prior = [Disbursals SPLY]
RETURN
    DIVIDE(_Current - _Prior, _Prior, 0)
```
- **Format**: Percentage (`+0.0%;-0.0%;0.0%`)

### Measure 4.4: 3-Month Rolling Average Disbursals
```dax
3-Month Rolling Avg Disbursal = 
AVERAGEX(
    DATESINPERIOD(
        Dim_Date[FullDate],
        MAX(Dim_Date[FullDate]),
        -3,
        MONTH
    ),
    [Total Disbursed Amount]
)
```

---

## Folder 5: `05. Customer & Segment Risk Analytics`

### Measure 5.1: Average Borrower Credit Score
```dax
Avg Borrower Credit Score = 
AVERAGE(Dim_Customers[CreditScore])
```

### Measure 5.2: High DTI Borrower Exposure (DTI > 40%)
```dax
High DTI Loan Exposure = 
CALCULATE(
    [Total Disbursed Amount],
    Dim_Customers[DebtToIncomeRatio] > 0.40
)
```

### Measure 5.3: Subprime Exposure Ratio (%)
```dax
Subprime Exposure % = 
DIVIDE(
    CALCULATE(
        [Total Disbursed Amount],
        Dim_Customers[CreditScoreBand] IN {"Poor (500-579)", "Fair (580-669)"}
    ),
    [Total Disbursed Amount],
    0
)
```

---

## Folder 6: `06. What-If Stress Testing & Loss Sensitivity`

### What-If Parameters Created:
1. `Parameter_DefaultSpike`: Disconnected parameter table for default stress testing (-5% to +20%).
2. `Parameter_RateHike`: Disconnected parameter table for benchmark interest rate hike (0 bps to +300 bps).

### Measure 6.1: Simulated Stressed NPA Amount
```dax
Stressed NPA Amount = 
VAR _SpikePct = SELECTEDVALUE('Parameter_DefaultSpike'[DefaultSpikeValue], 0)
VAR _BaseNPA = [NPA Amount]
RETURN
    _BaseNPA * (1 + _SpikePct)
```

### Measure 6.2: Simulated Additional Provisioning Capital Required
```dax
Additional Capital Provision Required = 
VAR _StressedNPA = [Stressed NPA Amount]
VAR _CurrentNPA = [NPA Amount]
VAR _ProvisionCoverageRatio = 0.70 -- 70% PCR regulatory mandate
RETURN
    (_StressedNPA - _CurrentNPA) * _ProvisionCoverageRatio
```

### Measure 6.3: Simulated Net Interest Income Impact
```dax
Simulated NII Increase = 
VAR _RateHike = SELECTEDVALUE('Parameter_RateHike'[RateHikeValue], 0)
VAR _FloatingPortion = 0.65 -- 65% of book is floating rate
RETURN
    [Total Disbursed Amount] * _FloatingPortion * _RateHike
```

---

## 7. Key DAX Principles to Explain in Interviews

1. **Why `DIVIDE()` over `/`**: The native slash operator throws a `NaN` error on zero denominator, causing visual crash. `DIVIDE()` handles zero safely with optional default values.
2. **Context Transition in `SUMX` & `AVERAGEX`**: How iterators row-by-row compute expressions before aggregating, and how wrapping with `CALCULATE` turns row context into filter context.
3. **Filter Context Modification with `CALCULATE()`**: `CALCULATE` is the only DAX function capable of mutating, overriding, or expanding filter context.
4. **Performance of `SELECTEDVALUE()`**: Replaces legacy `IF(HASONEVALUE(...), VALUES(...), BLANK())` with optimized, cleaner execution.
