# CALCULATION METHODOLOGY GUIDE
## Floating Wind Turbine Installation Performance Analysis

*A step-by-step guide to understanding how numbers are calculated in this visualization tool*

---

## Table of Contents

1. [Learning Rate Fundamentals](#1-learning-rate-fundamentals)
2. [Component-Level Learning Rates](#2-component-level-learning-rates)
3. [Steady State Performance Analysis](#3-steady-state-performance-analysis)
4. [Forecasting Methodologies (8 Methods)](#4-forecasting-methodologies-8-methods)
5. [Wright's Learning Curve Formula](#5-wrights-learning-curve-formula)
6. [Actual Data Reference](#6-actual-data-reference)

---

## 1. Learning Rate Fundamentals

### 1.1 What is a Learning Rate?

**Definition**: A learning rate represents the **percentage of time retained when production quantity doubles**. It's a mathematical concept from industrial learning curve theory (Wright, 1936).

**Formula**:
```
Learning Rate (LR) = T₂ₙ / Tₙ
```
Where:
- T₂ₙ = Time for producing 2n units
- Tₙ = Time for producing n units

### 1.2 How to Interpret Learning Rates

**CRITICAL**: Lower learning rate = MORE learning improvement

- **80% Learning Rate** = 20% time reduction when doubling production
- **70% Learning Rate** = 30% time reduction when doubling production
- **90% Learning Rate** = 10% time reduction when doubling production

**Example from EFGL Project:**
```
F1 Total Time: 42.25 hours
F2 Total Time: 32.33 hours

Learning Rate = 32.33h / 42.25h = 76.5%

Interpretation:
- 76.5% learning rate means 23.5% improvement from F1 to F2
- This represents STRONG learning effects
- Lower is BETTER (more learning happening)
```

**Example from Eolmed Project:**
```
F1 Total Time: 28.0 hours
F2 Total Time: 21.67 hours

Learning Rate = 21.67h / 28.0h = 77.4%

Interpretation:
- 77.4% learning rate means 22.6% improvement from F1 to F2
- Similar learning strength to EFGL
- Team is learning efficiently
```

### 1.3 Industry Benchmarks

| Learning Rate | Interpretation | Industry Context |
|--------------|----------------|------------------|
| 70-75% | **Exceptional** learning | Highly complex, first-time operations |
| 75-80% | **Strong** learning | New technology adoption, significant skill gain |
| 80-85% | **Moderate** learning | Standard learning curve for repetitive tasks |
| 85-90% | **Weak** learning | Mature processes, limited improvement potential |
| 90-95% | **Minimal** learning | Highly standardized, optimized processes |

**EFGL achieved 79.45%** (strong learning) and **Eolmed achieved 77.38%** (exceptional learning).

### 1.4 Assumptions Behind Learning Rates

1. **Cumulative Experience**: Learning accumulates over time as teams gain experience
2. **Knowledge Transfer**: Skills and lessons learned transfer from one unit to the next
3. **Process Improvement**: Methods, tools, and procedures are refined continuously
4. **Stable Conditions**: Technology, team composition, and environment remain relatively constant
5. **Logarithmic Decay**: Improvement rate decreases as experience increases (diminishing returns)

---

## 2. Component-Level Learning Rates

### 2.1 What Are Component-Level Learning Rates?

Instead of looking at total floater assembly time, we break down learning by **major component groups**:
- **All Tower Sections** (Tower Section 1 + Tower Section 2 + Tower Section 3 combined)
- **All Blades** (Blade 1 + Blade 2 + Blade 3 combined)
- **Nacelle** (single component)

This reveals **which component groups show the strongest learning effects** and which may need process improvements.

### 2.2 How Component Group Times Are Calculated

**Step 1: Sum individual component times for each floater**

For example, EFGL Tower Sections:
```
F1 All Tower Sections = Tower Sec 1 + Tower Sec 2 + Tower Sec 3
                      = 8.17h + 9.5h + 8.25h = 25.92h

F2 All Tower Sections = 5.5h + 6.17h + 5.17h = 16.84h

F3 All Tower Sections = 5.33h + 5.67h + 4.33h = 15.33h
```

**Step 2: Calculate Learning Rate for the component group**

**Formula:**
```
Component Group LR = (LR_F1→F2 + LR_F2→F3) / 2

Where:
- LR_F1→F2 = F2_total / F1_total
- LR_F2→F3 = F3_total / F2_total
- Average of both transition learning rates
```

**Important Notes:**

1. **Average LR vs Direct LR:**
   - **Average LR** = (LR_F1→F2 + LR_F2→F3) / 2 ← This is what we show in the table
   - **Direct LR** = F3 / F1 ← Only this adds to 100% with Total Improvement

2. **Why use Average LR?**
   - Shows learning progression (was learning steady or uneven?)
   - Matches Wright's curve theory and forecasting methodology
   - Industry standard for multi-unit analysis

3. **Relationship with Total Improvement:**
   ```
   Direct LR + Total Improvement = 100% ✓

   But:
   Average LR + Total Improvement ≠ 100% (usually > 100%)
   ```

### 2.3 EFGL Component Group Analysis (Actual Data)

#### Component Group 1: All Tower Sections

**Step 1: Calculate total tower time per floater**
```
F1 Total Towers = Tower Sec 1 + Tower Sec 2 + Tower Sec 3
                = 8.17h + 9.5h + 8.25h
                = 25.92h

F2 Total Towers = 5.5h + 6.17h + 5.17h
                = 16.84h

F3 Total Towers = 5.33h + 5.67h + 4.33h
                = 15.33h
```

**Step 2: Calculate transition learning rates**
```
LR_F1→F2 = 16.84h / 25.92h = 65.0% (35.0% improvement)
LR_F2→F3 = 15.33h / 16.84h = 91.0% (9.0% improvement)
```

**Step 3: Calculate average learning rate - Sequential Improvement Ratio**
```
Average LR = (65.0% + 91.0%) / 2 = 78.0%
```

**Step 4: Calculate total improvement (F1 to F3) - Cummulative Efficiency Gain** 
```
Total Improvement = (25.92h - 15.33h) / 25.92h = 40.9% ≈ 41%
```

**Step 5: Calculate direct learning rate (for comparison)**
```
Direct LR = F3 / F1 = 15.33h / 25.92h = 59.1%

Verification: Direct LR + Total Improvement = 59.1% + 40.9% = 100% ✓
```

**Summary:**
- **Average Learning Rate: 78%** (shown in table)
- **Total Improvement: 41%** (F1→F3)
- **% of Total Time: 57%** (towers are the biggest time component)
- **Interpretation:** Slowest learning rate but largest opportunity for optimization

---

#### Component Group 2: All Blades

**Step 1: Calculate total blade time per floater**
```
F1 Total Blades = Blade 1 + Blade 2 + Blade 3
                = 4.83h + 4.67h + 2.5h
                = 12.00h

F2 Total Blades = 3.67h + 4.5h + 3.83h
                = 12.00h

F3 Total Blades = 3.17h + 2.83h + 2.17h
                = 8.17h
```

**Step 2: Calculate transition learning rates**
```
LR_F1→F2 = 12.00h / 12.00h = 100.0% (0% improvement - same time!)
LR_F2→F3 = 8.17h / 12.00h = 68.1% (31.9% improvement)
```

**Step 3: Calculate average learning rate**
```
Average LR = (100.0% + 68.1%) / 2 = 84.1% ≈ 85%
```

**Step 4: Calculate total improvement**
```
Total Improvement = (12.00h - 8.17h) / 12.00h = 31.9%
```

**Summary:**
- **Average Learning Rate: 85%** (shown in table)
- **Total Improvement: 32%** (F1→F3)
- **% of Total Time: 32%**
- **Interpretation:** No learning F1→F2, then significant improvement F2→F3

---

#### Component Group 3: Nacelle

**Nacelle is a single component (not aggregated)**

```
F1: 4.33h
F2: 3.50h
F3: 3.17h
```

**Calculate transition learning rates:**
```
LR_F1→F2 = 3.50h / 4.33h = 80.8% (19.2% improvement)
LR_F2→F3 = 3.17h / 3.50h = 90.6% (9.4% improvement)
```

**Calculate average learning rate:**
```
Average LR = (80.8% + 90.6%) / 2 = 85.7% ≈ 86%
```

**Total improvement:**
```
Total Improvement = (4.33h - 3.17h) / 4.33h = 26.8%
```

**Summary:**
- **Average Learning Rate: 86%** (shown in table)
- **Total Improvement: 27%** (F1→F3)
- **% of Total Time: 11%**
- **Interpretation:** Moderate learning, smallest component by time

---

#### EFGL Summary Comparison

| Component Group | F1 Time | F3 Time | Avg LR | Total Improvement | % of Total |
|----------------|---------|---------|--------|-------------------|------------|
| **All Tower Sections** | 25.92h | 15.33h | **78%** | **41%** | 57% |
| **All Blades** | 12.00h | 8.17h | **85%** | **32%** | 32% |
| **Nacelle** | 4.33h | 3.17h | **86%** | **27%** | 11% |
| **Total** | 42.25h | 26.67h | **79.5%** | **37%** | 100% |

**Key Insights:**
- **Tower Sections** show the **strongest learning** (78% LR, 41% improvement) despite being the largest component
- **Blades** had no improvement F1→F2 (100% LR), then major improvement F2→F3 (68% LR)
- **Nacelle** shows the **weakest learning** (86% LR, 27% improvement) - most mature process

---

### 2.4 Eolmed Component Group Analysis (Actual Data)

#### Component Group 1: All Tower Sections

**Step 1: Calculate total tower time per floater**
```
F1 Total Towers = Tower Sec 1 + Tower Sec 2 + Tower Sec 3
                = 6.17h + 4.5h + 3.33h
                = 14.00h

F2 Total Towers = 3.5h + 4.33h + 4.0h
                = 11.83h

F3 Total Towers = 4.67h + 4.0h + 2.5h
                = 11.17h
```

**Calculate learning rate:**
```
LR_F1→F2 = 11.83h / 14.00h = 84.5% (15.5% improvement)
LR_F2→F3 = 11.17h / 11.83h = 94.4% (5.6% improvement)

Average LR = (84.5% + 94.4%) / 2 = 89.5% 

Total Improvement = (14.00h - 11.17h) / 14.00h = 20.2%
```

---

#### Component Group 2: All Blades

**Calculate total blade time per floater:**
```
F1 Total Blades = 4.17h + 2.0h + 2.17h = 8.33h
F2 Total Blades = 2.33h + 1.67h + 2.17h = 6.17h
F3 Total Blades = 1.83h + 1.83h + 1.33h = 5.00h
```

**Calculate learning rate:**
```
LR_F1→F2 = 6.17h / 8.33h = 74.1% (25.9% improvement)
LR_F2→F3 = 5.00h / 6.17h = 81.0% (19.0% improvement)

Average LR = (74.1% + 81.0%) / 2 = 77.6% 

Total Improvement = (8.33h - 5.00h) / 8.33h = 40.0%
```

---

#### Component Group 3: Nacelle

```
F1: 5.67h
F2: 3.67h
F3: 3.83h

LR_F1→F2 = 3.67h / 5.67h = 64.7% (35.3% improvement)
LR_F2→F3 = 3.83h / 3.67h = 104.4% (negative learning - slight regression)

Average LR = (64.7% + 104.4%) / 2 = 84.6% 
Total Improvement = (5.67h - 3.83h) / 5.67h = 32.5%
```

---

#### Eolmed Summary Comparison

| Component Group | F1 Time | F3 Time | Avg LR | Total Improvement | % of Total |
|----------------|---------|---------|--------|-------------------|------------|
| **All Tower Sections** | 14.00h | 11.17h | **75%** | **20%** | 56% |
| **All Blades** | 8.33h | 5.00h | **62%** | **40%** | 29% |
| **Nacelle** | 5.67h | 3.83h | **96%** | **33%** | 15% |
| **Total** | 28.00h | 20.00h | **77.4%** | **29%** | 100% |

**Key Insights:**
- **Blades** show the **strongest learning** (62% LR, 40% improvement) - benefited from propeller-assisted tool
- **Nacelle** shows **regression F2→F3** (104% LR) but still 33% total improvement
- **Tower Sections** show good learning (75% LR, 20% improvement)
- Eolmed overall faster than EFGL due to technology improvements and learning transfer

---

## 3. Steady State Performance Analysis

### 3.1 What is Steady State Performance?

**Definition**: Steady state performance **excludes first-unit learning effects** and represents the **sustainable operational efficiency** achieved after the initial learning curve.

**Philosophy**: The first unit (F1) often includes setup time, unfamiliarity, and process debugging. By averaging F2 and F3, we estimate the "mature" operational performance.

### 3.2 How Steady State Improvement is Calculated

**Formula:**
```
Steady State Improvement = ((F2 + F3) / 2) / F1

Where:
- (F2 + F3) / 2 = Average of mature performance
- F1 = First unit baseline
- Result = Ratio representing steady-state efficiency
```

**Alternative Interpretation:**
```
Steady State Improvement % = 1 - [((F2 + F3) / 2) / F1]
```

### 3.3 EFGL Steady State Calculation (Actual Data)

```
STEP 1: Identify F2 and F3 times
F2: 32.33 hours
F3: 26.67 hours

STEP 2: Calculate average of F2 and F3
Average = (32.33 + 26.67) / 2 = 29.5 hours

STEP 3: Compare to F1 baseline
F1: 42.25 hours

STEP 4: Calculate steady state ratio
Steady State LR = 29.5h / 42.25h = 69.8%

INTERPRETATION:
- 69.8% steady-state performance
- 30.2% improvement achieved after initial learning
- Represents sustainable operational efficiency
- More aggressive than average LR (79.45%)
```

**Why 69.8% is significant:**
- Shows that **30.2% time reduction** is achievable consistently
- Excludes F1 "learning overhead"
- Useful for projecting performance on future floaters (Eolmed project)
- More realistic for long-term capacity planning

### 3.4 Eolmed Steady State Calculation (Actual Data)

```
STEP 1: Identify F2 and F3 times
F2: 21.67 hours
F3: 20.0 hours

STEP 2: Calculate average of F2 and F3
Average = (21.67 + 20.0) / 2 = 20.8 hours

STEP 3: Compare to F1 baseline
F1: 28.0 hours

STEP 4: Calculate steady state ratio
Steady State LR = 20.8h / 28.0h = 74.4%

INTERPRETATION:
- 74.4% steady-state performance (note: shown as 74.5% in UI due to rounding)
- 25.6% improvement achieved after initial learning
- Demonstrates maturity enabled by:
  * Vibration damper technology
  * Propeller-assisted blade tool
  * Learning transfer from EFGL project
```

**Comparison:**
- EFGL Steady State: 69.8% (30.2% improvement)
- Eolmed Steady State: 74.4% (25.6% improvement)
- EFGL shows slightly better steady-state performance
- Both demonstrate strong mature operational efficiency

### 3.5 When to Use Steady State vs. Average Learning Rate

**Use Steady State (69.8% for EFGL, 74.4% for Eolmed) when:**
- Projecting long-term performance (floaters 4+)
- Planning for serial production
- Estimating operational capacity
- Excluding startup overhead

**Use Average Learning Rate (79.45% for EFGL, 77.38% for Eolmed) when:**
- Modeling complete project from scratch
- Including all learning phases
- Comparing across different project types
- Academic/theoretical analysis

---

## 4. Forecasting Methodologies (8 Methods)

The tool provides **8 different learning rate calculation methods** for forecasting future performance. Each method has different assumptions and use cases.

### Method 1: Sequential Transition Average (Default)

**Formula:**
```
LR = (LR_F1→F2 + LR_F2→F3) / 2
```

**EFGL Example:**
```
Step 1: Calculate F1→F2 transition
LR_F1→F2 = F2 / F1 = 32.33h / 42.25h = 76.5%

Step 2: Calculate F2→F3 transition
LR_F2→F3 = F3 / F2 = 26.67h / 32.33h = 82.5%

Step 3: Average both transitions
LR = (76.5% + 82.5%) / 2 = 79.5%

Result: 79.5% learning rate
```

**Eolmed Example:**
```
Step 1: Calculate F1→F2 transition
LR_F1→F2 = F2 / F1 = 21.67h / 28.0h = 77.4%

Step 2: Calculate F2→F3 transition
LR_F2→F3 = F3 / F2 = 20.0h / 21.67h = 92.3%

Step 3: Average both transitions
LR = (77.4% + 92.3%) / 2 = 84.9%

Result: 84.9% learning rate
```

**When to Use:**
- Default choice for most scenarios
- Balances early and late learning phases
- Simple and easy to explain

---

### Method 2: F1→F2 Transition Only

**Formula:**
```
LR = F2 / F1
```

**EFGL Example:**
```
LR = 32.33h / 42.25h = 76.5%

Result: 76.5% learning rate (more aggressive)
```

**Eolmed Example:**
```
LR = 21.67h / 28.0h = 77.4%

Result: 77.4% learning rate (more aggressive)
```

**When to Use:**
- **Conservative/optimistic projection** - assumes early learning continues
- When F1→F2 improvement was exceptional
- Planning for continued strong learning
- Risk-taking scenarios

**Caution:** May overestimate learning if improvement naturally slows down

---

### Method 3: F2→F3 Transition Only

**Formula:**
```
LR = F3 / F2
```

**EFGL Example:**
```
LR = 26.67h / 32.33h = 82.5%

Result: 82.5% learning rate (conservative)
```

**Eolmed Example:**
```
LR = 20.0h / 21.67h = 92.3%

Result: 92.3% learning rate (very conservative)
```

**When to Use:**
- **Conservative/pessimistic projection** - assumes slower learning
- When learning is naturally slowing down
- Risk-averse planning
- Mature processes

**Caution:** May underestimate potential if team is still learning rapidly

---

### Method 4: Power Law Regression

**Formula:**
```
LR = 2^b, where b = log(F3/F1) / log(3)
```

**EFGL Example:**
```
Step 1: Calculate ratio F3/F1
Ratio = 26.67h / 42.25h = 0.6313

Step 2: Calculate b coefficient
b = log(0.6313) / log(3) = -0.4202

Step 3: Calculate learning rate
LR = 2^(-0.4202) = 74.8%

Result: 74.8% learning rate
```

**Eolmed Example:**
```
Step 1: Calculate ratio F3/F1
Ratio = 20.0h / 28.0h = 0.7143

Step 2: Calculate b coefficient
b = log(0.7143) / log(3) = -0.3066

Step 3: Calculate learning rate
LR = 2^(-0.3066) = 80.9%

Result: 80.9% learning rate
```

**When to Use:**
- **Best-fit to all 3 data points** - statistically rigorous
- When you want regression-based projection
- Academic/theoretical analysis
- Balances early and late phases mathematically

**Interpretation:** This is the learning rate that best fits Wright's curve to all observed data

---

### Method 5: Geometric Mean

**Formula:**
```
LR = √(LR_F1→F2 × LR_F2→F3)
```

**EFGL Example:**
```
Step 1: Calculate both transition LRs
LR_F1→F2 = 32.33 / 42.25 = 76.5%
LR_F2→F3 = 26.67 / 32.33 = 82.5%

Step 2: Calculate geometric mean
LR = √(0.765 × 0.825) = √0.6311 = 79.4%

Result: 79.4% learning rate
```

**Eolmed Example:**
```
Step 1: Calculate both transition LRs
LR_F1→F2 = 21.67 / 28.0 = 77.4%
LR_F2→F3 = 20.0 / 21.67 = 92.3%

Step 2: Calculate geometric mean
LR = √(0.774 × 0.923) = √0.7144 = 84.5%

Result: 84.5% learning rate
```

**When to Use:**
- **Multiplicative effects** - when learning compounds
- Mathematical elegance (geometric vs arithmetic mean)
- Similar to Sequential Average but slightly different weighting
- When transitions have very different magnitudes

---

### Method 6: Weighted Transition Average

**Formula:**
```
LR = (LR_F1→F2 × W1) + (LR_F2→F3 × W2)

Where weights are based on time reduction magnitude:
W1 = (F1 - F2) / (F1 - F3)
W2 = (F2 - F3) / (F1 - F3)
```

**EFGL Example:**
```
Step 1: Calculate time reductions
Reduction F1→F2 = 42.25 - 32.33 = 9.92h
Reduction F2→F3 = 32.33 - 26.67 = 5.66h
Total Reduction = 42.25 - 26.67 = 15.58h

Step 2: Calculate weights
W1 = 9.92 / 15.58 = 63.7%
W2 = 5.66 / 15.58 = 36.3%

Step 3: Calculate weighted LR
LR = (76.5% × 0.637) + (82.5% × 0.363)
LR = 48.7% + 30.0% = 78.7%

Result: 78.7% learning rate
```

**Eolmed Example:**
```
Step 1: Calculate time reductions
Reduction F1→F2 = 28.0 - 21.67 = 6.33h
Reduction F2→F3 = 21.67 - 20.0 = 1.67h
Total Reduction = 28.0 - 20.0 = 8.0h

Step 2: Calculate weights
W1 = 6.33 / 8.0 = 79.1%
W2 = 1.67 / 8.0 = 20.9%

Step 3: Calculate weighted LR
LR = (77.4% × 0.791) + (92.3% × 0.209)
LR = 61.2% + 19.3% = 80.5%

Result: 80.5% learning rate
```

**When to Use:**
- **Emphasizes larger improvements** - gives more weight to bigger learning steps
- When one transition showed much more improvement than the other
- More sophisticated than simple average

**Note:** For Eolmed, F1→F2 showed much larger improvement, so it's weighted more heavily (79.1% vs 20.9%)

---

### Method 7: Steady State (F2+F3 Average)

**Formula:**
```
LR = ((F2 + F3) / 2) / F1
```

**EFGL Example:**
```
Step 1: Calculate F2-F3 average
Avg = (32.33 + 26.67) / 2 = 29.5h

Step 2: Compare to F1
LR = 29.5h / 42.25h = 69.8%

Result: 69.8% learning rate (most aggressive)
```

**Eolmed Example:**
```
Step 1: Calculate F2-F3 average
Avg = (21.67 + 20.0) / 2 = 20.8h

Step 2: Compare to F1
LR = 20.8h / 28.0h = 74.4%

Result: 74.4% learning rate (aggressive)
```

**When to Use:**
- **Excludes first-unit effects** - assumes F1 was abnormally slow
- Projecting mature/steady-state performance
- Serial production scenarios
- Most aggressive/optimistic projection

**Caution:** Assumes all future units perform at F2-F3 mature level

---

### Method 8: Custom

**User-defined learning rate** - manually set any value between 50% and 100%

**When to Use:**
- Expert judgment overrides
- Sensitivity analysis (what-if scenarios)
- External benchmarks
- Contractual assumptions

---

### 4.1 Comparison Table of All 8 Methods

| Method | EFGL LR | Eolmed LR | Interpretation |
|--------|---------|-----------|----------------|
| Sequential Avg | 79.5% | 84.9% | Balanced (default) |
| F1→F2 Only | 76.5% | 77.4% | Aggressive (optimistic) |
| F2→F3 Only | 82.5% | 92.3% | Conservative (pessimistic) |
| Power Law | 74.8% | 80.9% | Best-fit regression |
| Geometric Mean | 79.4% | 84.5% | Multiplicative balance |
| Weighted Avg | 78.7% | 80.5% | Emphasizes larger improvements |
| Steady State | 69.8% | 74.4% | Most aggressive (excludes F1) |
| Custom | User-defined | User-defined | Manual override |

**Range of Learning Rates:**
- **EFGL**: 69.8% to 82.5% (12.7 percentage point spread)
- **Eolmed**: 74.4% to 92.3% (17.9 percentage point spread)

This range shows the **uncertainty** in forecasting and why multiple methods are valuable.

---

## 5. Wright's Learning Curve Formula

### 5.1 The Mathematical Foundation

Wright's learning curve formula (1936) is the foundation for all forecasting:

**Formula:**
```
Tₙ = T₁ × n^b

Where:
- Tₙ = Time to produce the nth unit
- T₁ = Time for first unit
- n = Unit number
- b = Learning coefficient = log(LR) / log(2)
```

### 5.2 Calculating the b Coefficient

**EFGL Example (using 79.5% LR):**
```
b = log(0.795) / log(2)
b = -0.102 / 0.301
b = -0.3319

Negative b means time decreases as n increases
```

**Eolmed Example (using 84.9% LR):**
```
b = log(0.849) / log(2)
b = -0.071 / 0.301
b = -0.2353

Less negative b means slower learning
```

### 5.3 Forecasting Future Units

**EFGL - Predicting Floater 10 time (LR = 79.5%, b = -0.3319):**
```
T₁₀ = T₁ × 10^b
T₁₀ = 42.25h × 10^(-0.3319)
T₁₀ = 42.25h × 0.465
T₁₀ = 19.7 hours

Prediction: Floater 10 would take 19.7 hours
```

**Eolmed - Predicting Floater 10 time (LR = 84.9%, b = -0.2353):**
```
T₁₀ = T₁ × 10^b
T₁₀ = 28.0h × 10^(-0.2353)
T₁₀ = 28.0h × 0.582
T₁₀ = 16.3 hours

Prediction: Floater 10 would take 16.3 hours
```

### 5.4 Calculating Cumulative Time and Average Time

**Cumulative Time (sum of all units 1 through n):**
```
For EFGL, floaters 1-10:
T_cumulative = Σ(T₁ × i^b) for i=1 to 10

Floater 1: 42.25 × 1^(-0.3319) = 42.25h
Floater 2: 42.25 × 2^(-0.3319) = 32.41h
Floater 3: 42.25 × 3^(-0.3319) = 27.79h
...
Floater 10: 42.25 × 10^(-0.3319) = 19.65h

Sum = 257.1 hours total for 10 floaters
```

**Cumulative Average Time:**
```
Average = 257.1h / 10 = 25.7 hours per floater
```

### 5.5 Time Savings Calculation

**Baseline (no learning):**
```
If all 10 floaters took average of F1-F3 time:
EFGL Baseline = (42.25 + 32.33 + 26.67) / 3 = 33.75h
Total baseline = 33.75h × 10 = 337.5h
```

**Learning Curve Projection:**
```
Total with learning = 257.1h
```

**Time Savings:**
```
Savings = (337.5 - 257.1) / 337.5 × 100%
Savings = 23.8%

Interpretation: Learning curve saves 23.8% time vs. no learning
```

### 5.6 Formula Deviation Analysis

**What is Formula Deviation?**

Compares **actual observed times** vs. **Wright's formula predictions** for F2 and F3.

**EFGL Example:**

**F2 Prediction:**
```
Predicted T₂ = 42.25 × 2^(-0.3319) = 32.41h
Actual T₂ = 32.33h
Deviation = (32.33 - 32.41) / 32.41 = -0.2%

Good fit! Formula predicted 32.41h, actual was 32.33h
```

**F3 Prediction:**
```
Predicted T₃ = 42.25 × 3^(-0.3319) = 27.79h
Actual T₃ = 26.67h
Deviation = (26.67 - 27.79) / 27.79 = -4.0%

Slight underestimate - actual performance better than formula
```

**Interpretation:**
- Small deviations (-0.2%, -4.0%) indicate Wright's formula fits well
- Negative deviation = actual performance better than predicted
- Large deviations (>10%) suggest learning is inconsistent or other factors at play

---

## 6. Actual Data Reference

### 6.1 EFGL Project - Complete Dataset

**Floater 1 (F1):**
- Tower Section 1: 8.17h
- Tower Section 2: 9.5h
- Tower Section 3: 8.25h
- Nacelle: 4.33h
- Blade 1: 4.83h
- Blade 2: 4.67h
- Blade 3: 2.5h
- **Total: 42.25h**

**Floater 2 (F2):**
- Tower Section 1: 5.5h
- Tower Section 2: 6.17h
- Tower Section 3: 5.17h
- Nacelle: 3.5h
- Blade 1: 3.67h
- Blade 2: 4.5h
- Blade 3: 3.83h
- **Total: 32.33h**

**Floater 3 (F3):**
- Tower Section 1: 5.33h
- Tower Section 2: 5.67h
- Tower Section 3: 4.33h
- Nacelle: 3.17h
- Blade 1: 3.17h
- Blade 2: 2.83h
- Blade 3: 2.17h
- **Total: 26.67h**

**Learning Curve Metrics:**
- Average Learning Rate: 79.45%
- b Coefficient: -0.3319
- F1→F2 Improvement: 23.48%
- F2→F3 Improvement: 17.51%
- Overall Improvement: 36.88%

**Project Metrics:**
- Total Project Days: 104 days
- Average Time per Floater: 34.7 days
- Crane Utilization: 4.05%

---

### 6.2 Eolmed Project - Complete Dataset

**Floater 1 (F1):**
- Tower Section 1: 6.17h
- Tower Section 2: 4.5h
- Tower Section 3: 3.33h
- Nacelle: 5.67h
- Blade 1: 4.17h
- Blade 2: 2.0h
- Blade 3: 2.17h
- **Total: 28.0h**

**Floater 2 (F2):**
- Tower Section 1: 3.5h
- Tower Section 2: 4.33h
- Tower Section 3: 4.0h
- Nacelle: 3.67h
- Blade 1: 2.33h
- Blade 2: 1.67h
- Blade 3: 2.17h
- **Total: 21.67h**

**Floater 3 (F3):**
- Tower Section 1: 4.67h
- Tower Section 2: 4.0h
- Tower Section 3: 2.5h
- Nacelle: 3.83h
- Blade 1: 1.83h
- Blade 2: 1.83h
- Blade 3: 1.33h
- **Total: 20.0h**

**Learning Curve Metrics:**
- Average Learning Rate: 77.38%
- b Coefficient: -0.3699
- F1→F2 Improvement: 22.62%
- F2→F3 Improvement: 7.69%
- Overall Improvement: 28.57%

**Project Metrics:**
- Total Project Days: 77 days
- Average Time per Floater: 25.7 days
- Crane Utilization: 3.77%

---

### 6.3 Key Technology Differences

**Eolmed Advantages:**
1. **Vibration Damper** - reduced tower section installation time
2. **Propeller-assisted Blade Tool** - improved blade handling efficiency
3. **Learning Transfer** - benefited from EFGL lessons learned

**Result:**
- Eolmed F1 (28.0h) was **33.7% faster** than EFGL F1 (42.25h)
- Demonstrates value of technology investment and knowledge transfer

---

## Summary

This guide provides the complete methodology for understanding:

1. **Learning Rates**: Lower percentage = more learning (EFGL 79.45%, Eolmed 77.38%)
2. **Component Analysis**: Breaking down learning by individual components reveals where improvements happen
3. **Steady State**: Excluding first-unit effects shows mature operational efficiency (EFGL 69.8%, Eolmed 74.4%)
4. **8 Forecasting Methods**: Different assumptions for different scenarios (range: EFGL 69.8-82.5%, Eolmed 74.4-92.3%)
5. **Wright's Formula**: Mathematical foundation for predicting future performance (Tₙ = T₁ × n^b)
6. **Actual Data**: All calculations based on real project data from EFGL and Eolmed floating wind installations

**For questions or clarifications, refer to the visualization tool's interactive features or consult the original Excel data sources.**

---

*Document Version: 1.0*
*Last Updated: 2026-01-12*
*Data Sources: EFGL and Eolmed Project Records*
