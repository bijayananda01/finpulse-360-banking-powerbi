# 03. Power Query (M Code) Transformation & ETL Blueprint

## 1. ETL Workflow Overview

The ETL architecture in Power BI was configured using Power Query (M formula language) to enforce strict data cleanliness, correct data types, and avoid memory bloat.

```
[Raw CSV / Database Files]
         │
         ▼
[Source Extraction & Parameterization]
         │
         ▼
[Schema Validation & Type Casting]
         │
         ▼
[Data Cleaning, Null Handling & Text Trimming]
         │
         ▼
[Custom Calculated Logic & Conditional Columns]
         │
         ▼
[Load to VertiPaq Data Model]
```

---

## 2. Dynamic Source Parameterization (M Code)

Instead of hardcoding absolute local file paths, a Power Query parameter `pDataPath` was created. This allows instant migration between local developer machines, staging, and production gateways.

```powerquery
// Parameter Definition: pDataPath
"C:\Users\bibek\.gemini\antigravity-ide\scratch\banking_powerbi_project\data\" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true]
```

---

## 3. Power Query M Scripts for Each Table

### Table 1: `Dim_Branches` Transformation Script
```powerquery
let
    Source = Csv.Document(File.Contents(pDataPath & "Dim_Branches.csv"), [Delimiter=",", Columns=8, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Trimmed Text" = Table.TransformColumns(#"Promoted Headers", {{"BranchName", Text.Trim, type text}, {"City", Text.Trim, type text}, {"RegionalManager", Text.Trim, type text}}),
    #"Changed Type" = Table.TransformColumnTypes(#"Trimmed Text", {
        {"BranchID", type text},
        {"BranchName", type text},
        {"City", type text},
        {"State", type text},
        {"Region", type text},
        {"RegionalManager", type text},
        {"ManagerEmail", type text},
        {"BranchTier", type text}
    })
in
    #"Changed Type"
```

---

### Table 2: `Dim_Customers` Transformation Script
```powerquery
let
    Source = Csv.Document(File.Contents(pDataPath & "Dim_Customers.csv"), [Delimiter=",", Columns=14, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers", {
        {"CustomerID", type text},
        {"CustomerName", type text},
        {"Age", Int64.Type},
        {"Gender", type text},
        {"Occupation", type text},
        {"EmploymentType", type text},
        {"AnnualIncomeUSD", Currency.Type},
        {"CreditScore", Int64.Type},
        {"CreditScoreBand", type text},
        {"DebtToIncomeRatio", Percentage.Type},
        {"CustomerSegment", type text},
        {"HomeOwnership", type text},
        {"BranchID", type text},
        {"CustomerSinceDate", type date}
    }),
    #"Added Age Group Column" = Table.AddColumn(#"Changed Type", "AgeGroup", each 
        if [Age] < 30 then "Under 30"
        else if [Age] <= 45 then "30 - 45 (Peak Earning)"
        else if [Age] <= 60 then "46 - 60 (Pre-Retirement)"
        else "60+ (Senior)", 
        type text
    )
in
    #"Added Age Group Column"
```

---

### Table 3: `Fact_Loans` Transformation Script
```powerquery
let
    Source = Csv.Document(File.Contents(pDataPath & "Fact_Loans.csv"), [Delimiter=",", Columns=17, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers", {
        {"LoanID", type text},
        {"CustomerID", type text},
        {"ProductID", type text},
        {"BranchID", type text},
        {"DisbursalDateKey", Int64.Type},
        {"DisbursalDate", type date},
        {"MaturityDate", type date},
        {"LoanAmountUSD", Currency.Type},
        {"InterestRate", Percentage.Type},
        {"TenureMonths", Int64.Type},
        {"MonthlyEMI_USD", Currency.Type},
        {"LoanPurpose", type text},
        {"CollateralValueUSD", Currency.Type},
        {"ApprovalRiskRating", type text},
        {"LoanStatus", type text},
        {"IsNonPerformingAsset", Int64.Type},
        {"WriteOffAmountUSD", Currency.Type}
    }),
    #"Replaced Errors" = Table.ReplaceErrorValues(#"Changed Type", {{"WriteOffAmountUSD", 0}}),
    #"Added Loan-to-Value (LTV)" = Table.AddColumn(#"Replaced Errors", "LTV_Ratio", each 
        if [CollateralValueUSD] > 0 then [LoanAmountUSD] / [CollateralValueUSD] else null, 
        Percentage.Type
    )
in
    #"Added Loan-to-Value (LTV)"
```

---

### Table 4: `Fact_Repayments` Transformation Script
```powerquery
let
    Source = Csv.Document(File.Contents(pDataPath & "Fact_Repayments.csv"), [Delimiter=",", Columns=13, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers", {
        {"RepaymentID", type text},
        {"LoanID", type text},
        {"CustomerID", type text},
        {"DueDateKey", Int64.Type},
        {"DueDate", type date},
        {"PaymentDateKey", type text},
        {"PaymentDate", type text},
        {"ScheduledAmountUSD", Currency.Type},
        {"PaidAmountUSD", Currency.Type},
        {"DaysPastDue", Int64.Type},
        {"DelinquencyBucket", type text},
        {"IsLatePayment", Int64.Type},
        {"LatePenaltyUSD", Currency.Type}
    }),
    #"Added Shortfall Amount" = Table.AddColumn(#"Changed Type", "ShortfallAmountUSD", each 
        [ScheduledAmountUSD] - [PaidAmountUSD], 
        Currency.Type
    )
in
    #"Added Shortfall Amount"
```

---

### Table 5: Dynamic Enterprise Calendar (Pure M Script)
```powerquery
let
    StartDate = #date(2023, 1, 1),
    EndDate = #date(2026, 12, 31),
    NumberOfDays = Duration.Days(EndDate - StartDate) + 1,
    DateList = List.Dates(StartDate, NumberOfDays, #duration(1, 0, 0, 0)),
    #"Converted to Table" = Table.FromList(DateList, Splitter.SplitByNothing(), {"FullDate"}, null, ExtraValues.Error),
    #"Changed Type" = Table.TransformColumnTypes(#"Converted to Table", {{"FullDate", type date}}),
    #"Added DateKey" = Table.AddColumn(#"Changed Type", "DateKey", each Date.Year([FullDate]) * 10000 + Date.Month([FullDate]) * 100 + Date.Day([FullDate]), Int64.Type),
    #"Added Year" = Table.AddColumn(#"Added DateKey", "Year", each Date.Year([FullDate]), Int64.Type),
    #"Added Quarter" = Table.AddColumn(#"Added Year", "Quarter", each "Q" & Text.From(Date.QuarterOfYear([FullDate])), type text),
    #"Added MonthNumber" = Table.AddColumn(#"Added Quarter", "MonthNumber", each Date.Month([FullDate]), Int64.Type),
    #"Added MonthName" = Table.AddColumn(#"Added MonthNumber", "MonthName", each Date.MonthName([FullDate]), type text),
    #"Added MonthShort" = Table.AddColumn(#"Added MonthName", "MonthShort", each Date.ToText([FullDate], "MMM"), type text),
    #"Added YearMonth" = Table.AddColumn(#"Added MonthShort", "YearMonth", each Date.ToText([FullDate], "yyyy-MM"), type text),
    #"Added DayOfWeek" = Table.AddColumn(#"Added YearMonth", "DayOfWeek", each Date.DayOfWeekName([FullDate]), type text),
    #"Added IsWeekend" = Table.AddColumn(#"Added DayOfWeek", "IsWeekend", each if Date.DayOfWeek([FullDate], Day.Monday) >= 5 then 1 else 0, Int64.Type),
    #"Added FiscalYear" = Table.AddColumn(#"Added IsWeekend", "FiscalYear", each if Date.Month([FullDate]) >= 4 then "FY" & Text.From(Date.Year([FullDate])) else "FY" & Text.From(Date.Year([FullDate]) - 1), type text)
in
    #"Added FiscalYear"
```

---

## 4. Key Interview Discussion Points on Power Query
1. **Query Folding**: Why keeping transformations within folding range (e.g. Filter, Rename, Type Cast) pushes execution back to the SQL Server source rather than pulling raw unindexed rows into Power BI memory.
2. **Avoiding Redundant Steps**: Consolidating multiple `Changed Type` steps into a single unified step to improve refresh performance.
3. **Disabling Report Load for Staging Queries**: Right-clicking intermediate ETL queries and unchecking `Enable Load` to save model memory.
