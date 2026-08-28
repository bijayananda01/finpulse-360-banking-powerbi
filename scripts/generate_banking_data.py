import os
import random
import datetime

# Seed for reproducible banking dataset
random.seed(42)

DATA_DIR = r"C:\Users\bibek\.gemini\antigravity-ide\scratch\banking_powerbi_project\data"
os.makedirs(DATA_DIR, exist_ok=True)

print("Generating Banking Datasets...")

# -------------------------------------------------------------
# 1. Dim_Date.csv
# -------------------------------------------------------------
start_date = datetime.date(2023, 1, 1)
end_date = datetime.date(2026, 12, 31)
cur_date = start_date

date_rows = ["DateKey,FullDate,Year,Quarter,YearQuarter,MonthNumber,MonthName,MonthShort,YearMonth,DayOfWeek,IsWeekend,FiscalYear,FiscalQuarter"]
while cur_date <= end_date:
    dkey = cur_date.strftime("%Y%m%d")
    fdate = cur_date.strftime("%Y-%m-%d")
    y = cur_date.year
    q = f"Q{(cur_date.month - 1) // 3 + 1}"
    yq = f"{y}-{q}"
    m_num = cur_date.month
    m_name = cur_date.strftime("%B")
    m_short = cur_date.strftime("%b")
    ym = cur_date.strftime("%Y-%m")
    dow = cur_date.strftime("%A")
    is_wknd = 1 if cur_date.weekday() >= 5 else 0
    fy = f"FY{y if m_num >= 4 else y - 1}"
    fq = f"FQ{((m_num - 4) % 12) // 3 + 1}"
    
    date_rows.append(f"{dkey},{fdate},{y},{q},{yq},{m_num},{m_name},{m_short},{ym},{dow},{is_wknd},{fy},{fq}")
    cur_date += datetime.timedelta(days=1)

with open(os.path.join(DATA_DIR, "Dim_Date.csv"), "w", encoding="utf-8") as f:
    f.write("\n".join(date_rows))
print("-> Dim_Date.csv created")

# -------------------------------------------------------------
# 2. Dim_Customers.csv (1,000 Retail & Business Borrowers)
# -------------------------------------------------------------
first_names = ["James", "Emma", "Liam", "Olivia", "Noah", "Sophia", "Jackson", "Ava", "Aiden", "Isabella", "Lucas", "Mia", "Ethan", "Harper", "Oliver", "Evelyn", "Alexander", "Abigail", "Henry", "Emily", "Sebastian", "Elizabeth", "Jack", "Mila", "Owen", "Ella", "Theodore", "Avery", "Samuel", "Sofia", "David", "Camila", "Joseph", "Aria", "John", "Scarlett", "Wyatt", "Victoria", "Carter", "Madison", "Luke", "Luna", "Jayden", "Grace", "Dylan", "Chloe", "Grayson", "Penelope", "Levi", "Layla", "Rajesh", "Priya", "Amit", "Ananya", "Arjun", "Deepa", "Vikram", "Sunita", "Rahul", "Kavita", "Carlos", "Maria", "Juan", "Elena", "Wei", "Mei", "Chen", "Jin", "Kenji", "Yuki"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Sharma", "Patel", "Verma", "Gupta", "Iyer", "Nair", "Kulkarni", "Deshmukh", "Singh", "Reddy"]
occupations = ["Software Engineer", "Healthcare Professional", "Corporate Executive", "Small Business Owner", "Civil Servant", "Financial Analyst", "Operations Manager", "Sales Director", "Civil Engineer", "Educator / Professor", "Attorney / Legal Counsel", "Supply Chain Lead"]
employment_types = ["Salaried - Private", "Salaried - Public / Govt", "Self-Employed Professional", "Business Owner", "Contractor / Gig"]

branches = [f"BR-{i}" for i in range(101, 113)]

customer_rows = ["CustomerID,CustomerName,Age,Gender,Occupation,EmploymentType,AnnualIncomeUSD,CreditScore,CreditScoreBand,DebtToIncomeRatio,CustomerSegment,HomeOwnership,BranchID,CustomerSinceDate"]
customers_data = []

for cid in range(1, 1001):
    c_id_str = f"CUST-{cid:04d}"
    c_name = f"{random.choice(first_names)} {random.choice(last_names)}"
    age = random.randint(22, 68)
    gender = random.choice(["Male", "Female", "Other"])
    occ = random.choice(occupations)
    emp = random.choice(employment_types)
    
    # Realistic Credit Score distribution (FICO 500 - 850)
    score_rand = random.random()
    if score_rand < 0.10:
        credit_score = random.randint(520, 579) # Poor
    elif score_rand < 0.25:
        credit_score = random.randint(580, 669) # Fair
    elif score_rand < 0.65:
        credit_score = random.randint(670, 739) # Good
    elif score_rand < 0.90:
        credit_score = random.randint(740, 799) # Very Good
    else:
        credit_score = random.randint(800, 850) # Exceptional
        
    if credit_score < 580:
        band = "Poor (500-579)"
    elif credit_score < 670:
        band = "Fair (580-669)"
    elif credit_score < 740:
        band = "Good (670-739)"
    elif credit_score < 800:
        band = "Very Good (740-799)"
    else:
        band = "Exceptional (800-850)"
        
    # Income based on occupation & age
    base_inc = random.randint(35000, 180000)
    if occ in ["Corporate Executive", "Sales Director", "Attorney / Legal Counsel"]:
        base_inc = random.randint(110000, 320000)
    elif occ in ["Software Engineer", "Financial Analyst"]:
        base_inc = random.randint(75000, 190000)
        
    dti = round(random.uniform(0.12, 0.55), 3)
    
    if base_inc >= 150000 and credit_score >= 740:
        seg = "Affluent & HNI"
    elif base_inc >= 85000:
        seg = "Emerging Prime"
    elif credit_score >= 670:
        seg = "Mass Market Prime"
    else:
        seg = "Subprime / High Risk"
        
    home = random.choices(["Own Mortgage", "Own Outright", "Rent", "Living with Family"], weights=[0.45, 0.20, 0.30, 0.05])[0]
    b_id = random.choice(branches)
    
    cust_days = random.randint(30, 1200)
    cust_since = start_date + datetime.timedelta(days=cust_days)
    
    customers_data.append({
        "CustomerID": c_id_str,
        "CreditScore": credit_score,
        "AnnualIncome": base_inc,
        "DTI": dti,
        "Segment": seg,
        "BranchID": b_id,
        "CustSince": cust_since
    })
    
    customer_rows.append(f"{c_id_str},{c_name},{age},{gender},{occ},{emp},{base_inc},{credit_score},{band},{dti},{seg},{home},{b_id},{cust_since.strftime('%Y-%m-%d')}")

with open(os.path.join(DATA_DIR, "Dim_Customers.csv"), "w", encoding="utf-8") as f:
    f.write("\n".join(customer_rows))
print("-> Dim_Customers.csv created")

# -------------------------------------------------------------
# 3. Fact_Loans.csv & Fact_Repayments.csv (8,500+ Disbursed Loans & Tracking)
# -------------------------------------------------------------
products = [
    ("PRD-MORT", 0.0625, 240, 360, (200000, 850000)),
    ("PRD-AUTO", 0.0780, 36, 72, (15000, 65000)),
    ("PRD-PERS", 0.1250, 12, 48, (3000, 35000)),
    ("PRD-SME", 0.0950, 24, 84, (50000, 450000)),
    ("PRD-EDU", 0.0690, 48, 120, (10000, 80000)),
    ("PRD-EQUIP", 0.0890, 24, 60, (25000, 180000))
]

loan_rows = ["LoanID,CustomerID,ProductID,BranchID,DisbursalDateKey,DisbursalDate,MaturityDate,LoanAmountUSD,InterestRate,TenureMonths,MonthlyEMI_USD,LoanPurpose,CollateralValueUSD,ApprovalRiskRating,LoanStatus,IsNonPerformingAsset,WriteOffAmountUSD"]
repay_rows = ["RepaymentID,LoanID,CustomerID,DueDateKey,DueDate,PaymentDateKey,PaymentDate,ScheduledAmountUSD,PaidAmountUSD,DaysPastDue,DelinquencyBucket,IsLatePayment,LatePenaltyUSD"]

loan_counter = 10001
repay_counter = 100001

purposes_map = {
    "PRD-MORT": ["Primary Residence Purchase", "Refinance Existing Mortgage", "Investment Property Buy"],
    "PRD-AUTO": ["New EV Purchase", "Certified Pre-Owned Luxury Car", "Fleet Commercial Van"],
    "PRD-PERS": ["Debt Consolidation", "Home Renovation", "Emergency Medical Exp", "Wedding & Family"],
    "PRD-SME": ["Working Capital Expansion", "Inventory Stocking Q4", "Technology & IT Modernization", "New Branch Expansion"],
    "PRD-EDU": ["Master of Science in Data Analytics", "MBA Program Tuition", "Medical Residency Program"],
    "PRD-EQUIP": ["Industrial CNC Machine", "Warehouse Forklift Fleet", "Medical Imaging Scanner"]
}

# Generate 5,000 loans
for l_idx in range(5000):
    loan_id = f"LN-{loan_counter}"
    loan_counter += 1
    
    cust = random.choice(customers_data)
    cid = cust["CustomerID"]
    bid = cust["BranchID"]
    
    # Choose loan product fitting customer
    prod_id, base_rate, min_ten, max_ten, (min_amt, max_amt) = random.choice(products)
    
    # Disbursal date
    d_days = random.randint(0, 1250)
    disb_date = start_date + datetime.timedelta(days=d_days)
    disb_dkey = disb_date.strftime("%Y%m%d")
    
    tenure = random.choice([12, 24, 36, 48, 60, 84, 120, 240, 360])
    tenure = max(min_ten, min(max_ten, tenure))
    
    maturity_date = disb_date + datetime.timedelta(days=int(tenure * 30.4375))
    
    # Loan amount
    loan_amt = round(random.uniform(min_amt, max_amt), -2)
    
    # Interest rate adjusted for credit score
    risk_spread = 0.045 if cust["CreditScore"] < 580 else (0.025 if cust["CreditScore"] < 670 else (0.005 if cust["CreditScore"] < 740 else -0.005))
    interest_rate = round(base_rate + risk_spread, 4)
    
    # Monthly EMI calculation (P * r * (1+r)^n / ((1+r)^n - 1))
    r = interest_rate / 12.0
    n = tenure
    emi = round((loan_amt * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1), 2)
    
    purpose = random.choice(purposes_map[prod_id])
    
    # Collateral
    collateral = round(loan_amt * random.uniform(1.15, 1.6), 2) if prod_id in ["PRD-MORT", "PRD-AUTO", "PRD-SME", "PRD-EQUIP"] else 0.0
    
    # Risk Rating
    if cust["CreditScore"] >= 750 and cust["DTI"] < 0.35:
        risk_rating = "AAA - Low Risk"
    elif cust["CreditScore"] >= 680 and cust["DTI"] < 0.45:
        risk_rating = "BBB - Moderate Risk"
    elif cust["CreditScore"] >= 600:
        risk_rating = "CCC - Elevated Risk"
    else:
        risk_rating = "DDD - High Default Probability"
        
    # Loan Status logic based on credit risk & elapsed time
    days_since_disb = (datetime.date(2026, 12, 31) - disb_date).days
    months_elapsed = max(1, days_since_disb // 30)
    
    default_prob = 0.28 if "DDD" in risk_rating else (0.12 if "CCC" in risk_rating else (0.03 if "BBB" in risk_rating else 0.008))
    
    is_default = random.random() < default_prob
    
    if months_elapsed >= tenure and not is_default:
        status = "Fully Paid"
        npa = 0
        write_off = 0.0
    elif is_default:
        status = random.choice(["In Default (90+ DPD)", "Charged Off / Written Off", "Under Restructuring"])
        npa = 1
        write_off = round(loan_amt * random.uniform(0.4, 0.85), 2) if "Charged Off" in status else 0.0
    else:
        status = random.choices(["Current / Performing", "Delinquent (31-60 DPD)", "Delinquent (61-90 DPD)"], weights=[0.88, 0.08, 0.04])[0]
        npa = 1 if "90" in status else 0
        write_off = 0.0
        
    loan_rows.append(f"{loan_id},{cid},{prod_id},{bid},{disb_dkey},{disb_date.strftime('%Y-%m-%d')},{maturity_date.strftime('%Y-%m-%d')},{loan_amt},{interest_rate},{tenure},{emi},{purpose},{collateral},{risk_rating},{status},{npa},{write_off}")
    
    # Generate Repayment schedule records (sample up to 6 months tracking)
    num_tracked_cycles = min(months_elapsed, 8)
    for c_idx in range(1, num_tracked_cycles + 1):
        due_d = disb_date + datetime.timedelta(days=int(c_idx * 30.4375))
        if due_d > datetime.date(2026, 12, 31):
            break
            
        due_dkey = due_d.strftime("%Y%m%d")
        
        # Determine DPD (Days Past Due)
        if "Default" in status or "Charged Off" in status:
            dpd = random.randint(65, 120)
        elif "Delinquent (61-90" in status:
            dpd = random.randint(61, 89)
        elif "Delinquent (31-60" in status:
            dpd = random.randint(31, 60)
        else:
            dpd = random.choices([0, 0, 0, 0, random.randint(1, 15)], weights=[0.7, 0.15, 0.08, 0.04, 0.03])[0]
            
        pay_d = due_d + datetime.timedelta(days=dpd)
        pay_dkey = pay_d.strftime("%Y%m%d") if dpd < 90 else "99991231" # Unpaid if severely defaulted
        pay_d_str = pay_d.strftime("%Y-%m-%d") if dpd < 90 else "Unpaid"
        
        if dpd == 0:
            bucket = "0 - Current"
            paid_amt = emi
            is_late = 0
            penalty = 0.0
        elif dpd <= 30:
            bucket = "1-30 Days Past Due"
            paid_amt = emi
            is_late = 1
            penalty = 25.0
        elif dpd <= 60:
            bucket = "31-60 Days Past Due"
            paid_amt = round(emi * random.uniform(0.5, 1.0), 2)
            is_late = 1
            penalty = 50.0
        elif dpd <= 90:
            bucket = "61-90 Days Past Due"
            paid_amt = round(emi * random.uniform(0.0, 0.5), 2)
            is_late = 1
            penalty = 75.0
        else:
            bucket = "90+ Days (Non-Performing)"
            paid_amt = 0.0
            is_late = 1
            penalty = 120.0
            
        repay_rows.append(f"REP-{repay_counter},{loan_id},{cid},{due_dkey},{due_d.strftime('%Y-%m-%d')},{pay_dkey},{pay_d_str},{emi},{paid_amt},{dpd},{bucket},{is_late},{penalty}")
        repay_counter += 1

with open(os.path.join(DATA_DIR, "Fact_Loans.csv"), "w", encoding="utf-8") as f:
    f.write("\n".join(loan_rows))
print(f"-> Fact_Loans.csv created: {len(loan_rows)-1} loans")

with open(os.path.join(DATA_DIR, "Fact_Repayments.csv"), "w", encoding="utf-8") as f:
    f.write("\n".join(repay_rows))
print(f"-> Fact_Repayments.csv created: {len(repay_rows)-1} repayments")

print("\nAll Banking datasets generated successfully!")
