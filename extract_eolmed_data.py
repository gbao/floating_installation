import pandas as pd
import numpy as np
import json

# Read the Eolmed data from PLN Excel file
pln_path = r"Follow-up erections PLN.xlsx"

print("="*80)
print("EXTRACTING EOLMED DATA FOR WEB VISUALIZATION")
print("="*80)
print()

# Read the Eolmed sheet
eolmed_df = pd.read_excel(pln_path, sheet_name='Data Eolmed', header=None)

print("Eolmed DataFrame shape:", eolmed_df.shape)
print("\nFirst 35 rows:")
print(eolmed_df.head(35))
print()

# Extract operation durations for each floater
# Based on the structure, rows contain: operation name, start time, in position, end time, duration (hours)

floaters_data = []

# Floater 1: rows 3-9 (tower sections 1-3, nacelle, blades 1-3)
floater_1_ops = []
for idx in [3, 4, 5, 6, 7, 8, 9]:  # Tower 1-3, Nacelle, Blade 1-3
    duration = eolmed_df.iloc[idx, 4]  # Column 4 is duration in hours
    op_name = eolmed_df.iloc[idx, 0]  # Column 0 is operation name
    print(f"Floater 1 - Row {idx}: {op_name} = {duration} hours")
    floater_1_ops.append(duration)

# Floater 2: rows 14-20
floater_2_ops = []
for idx in [14, 15, 16, 17, 18, 19, 20]:  # Tower 1-3, Nacelle, Blade 1-3
    duration = eolmed_df.iloc[idx, 4]
    op_name = eolmed_df.iloc[idx, 0]
    print(f"Floater 2 - Row {idx}: {op_name} = {duration} hours")
    floater_2_ops.append(duration)

# Floater 3: rows 25-31
floater_3_ops = []
for idx in [25, 26, 27, 28, 29, 30, 31]:  # Tower 1-3, Nacelle, Blade 1-3
    duration = eolmed_df.iloc[idx, 4]
    op_name = eolmed_df.iloc[idx, 0]
    print(f"Floater 3 - Row {idx}: {op_name} = {duration} hours")
    floater_3_ops.append(duration)

print()
print("="*80)

# Calculate totals
f1_total = sum(floater_1_ops)
f2_total = sum(floater_2_ops)
f3_total = sum(floater_3_ops)

print(f"\nFloater 1 Total: {f1_total:.2f} hours ({f1_total/24:.2f} days)")
print(f"Floater 2 Total: {f2_total:.2f} hours ({f2_total/24:.2f} days)")
print(f"Floater 3 Total: {f3_total:.2f} hours ({f3_total/24:.2f} days)")

# Calculate learning curve metrics
f1_to_f2_improvement = ((f1_total - f2_total) / f1_total) * 100
f2_to_f3_improvement = ((f2_total - f3_total) / f2_total) * 100
overall_improvement = ((f1_total - f3_total) / f1_total) * 100

print(f"\nF1 -> F2 Improvement: {f1_to_f2_improvement:.2f}%")
print(f"F2 -> F3 Improvement: {f2_to_f3_improvement:.2f}%")
print(f"Overall F1 -> F3 Improvement: {overall_improvement:.2f}%")

# Calculate learning rate using Wright's model
# T_n = T_1 * n^b where b = log(learning_rate) / log(2)
# We can calculate learning rate from actual data points
if f1_total > 0 and f2_total > 0:
    # Using F1 and F2 to calculate learning rate
    b = np.log(f2_total / f1_total) / np.log(2)
    learning_rate = 2 ** b
    print(f"\nCalculated Learning Rate: {learning_rate:.4f} ({learning_rate*100:.2f}%)")
    print(f"B Coefficient: {b:.4f}")
else:
    learning_rate = 0.7
    b = -0.515

# Get project timeline data from the DataFrame
# Search for the row with overall time
print("\nSearching for overall time data...")
overall_time_row = None
for idx in range(35, len(eolmed_df)):
    cell_value = str(eolmed_df.iloc[idx, 0])
    print(f"  Row {idx}: {cell_value[:50]}...")
    if 'Overall time until erection of last blade' in cell_value:
        overall_time_row = idx
        break

if overall_time_row and not pd.isna(eolmed_df.iloc[overall_time_row, 4]):
    overall_time = eolmed_df.iloc[overall_time_row, 4]
    avg_time_per_wtg = eolmed_df.iloc[overall_time_row + 1, 4]
    print(f"\nFound! Overall time until last blade: {overall_time:.2f} days")
    print(f"Average time per WTG: {avg_time_per_wtg:.2f} days")
else:
    # Use values from our previous comparison analysis
    overall_time = 77.09  # From our previous analysis
    avg_time_per_wtg = 25.70
    print(f"\nUsing pre-calculated values:")
    print(f"Overall time until last blade: {overall_time:.2f} days")
    print(f"Average time per WTG: {avg_time_per_wtg:.2f} days")

# Calculate crane utilization
total_assembly_hours = f1_total + f2_total + f3_total
total_assembly_days = total_assembly_hours / 24
crane_utilization = (total_assembly_days / overall_time) * 100

print(f"\nTotal Assembly Time: {total_assembly_hours:.2f} hours ({total_assembly_days:.2f} days)")
print(f"Crane Utilization: {crane_utilization:.2f}%")

# Create the data structure in JavaScript format
eolmed_data = {
    "floaters": [
        {
            "id": 1,
            "operations": [
                {"name": "Tower Section 1", "duration": round(floater_1_ops[0], 6)},
                {"name": "Tower Section 2", "duration": round(floater_1_ops[1], 6)},
                {"name": "Tower Section 3", "duration": round(floater_1_ops[2], 6)},
                {"name": "Nacelle", "duration": round(floater_1_ops[3], 6)},
                {"name": "Blade 1", "duration": round(floater_1_ops[4], 6)},
                {"name": "Blade 2", "duration": round(floater_1_ops[5], 6)},
                {"name": "Blade 3", "duration": round(floater_1_ops[6], 6)}
            ],
            "total_hours": round(f1_total, 2),
            "total_days": round(f1_total / 24, 2)
        },
        {
            "id": 2,
            "operations": [
                {"name": "Tower Section 1", "duration": round(floater_2_ops[0], 6)},
                {"name": "Tower Section 2", "duration": round(floater_2_ops[1], 6)},
                {"name": "Tower Section 3", "duration": round(floater_2_ops[2], 6)},
                {"name": "Nacelle", "duration": round(floater_2_ops[3], 6)},
                {"name": "Blade 1", "duration": round(floater_2_ops[4], 6)},
                {"name": "Blade 2", "duration": round(floater_2_ops[5], 6)},
                {"name": "Blade 3", "duration": round(floater_2_ops[6], 6)}
            ],
            "total_hours": round(f2_total, 2),
            "total_days": round(f2_total / 24, 2)
        },
        {
            "id": 3,
            "operations": [
                {"name": "Tower Section 1", "duration": round(floater_3_ops[0], 6)},
                {"name": "Tower Section 2", "duration": round(floater_3_ops[1], 6)},
                {"name": "Tower Section 3", "duration": round(floater_3_ops[2], 6)},
                {"name": "Nacelle", "duration": round(floater_3_ops[3], 6)},
                {"name": "Blade 1", "duration": round(floater_3_ops[4], 6)},
                {"name": "Blade 2", "duration": round(floater_3_ops[5], 6)},
                {"name": "Blade 3", "duration": round(floater_3_ops[6], 6)}
            ],
            "total_hours": round(f3_total, 2),
            "total_days": round(f3_total / 24, 2)
        }
    ],
    "learning_curve": {
        "avg_learning_rate": round(learning_rate, 4),
        "b_coefficient": round(b, 4),
        "f1_to_f2_improvement_pct": round(f1_to_f2_improvement, 2),
        "f2_to_f3_improvement_pct": round(f2_to_f3_improvement, 2),
        "overall_improvement_pct": round(overall_improvement, 2)
    },
    "project_metrics": {
        "total_project_days": round(overall_time, 2),
        "avg_time_per_wtg_days": round(avg_time_per_wtg, 2),
        "crane_utilization_pct": round(crane_utilization, 2)
    }
}

# Save as JSON
with open('eolmed_data.json', 'w') as f:
    json.dump(eolmed_data, f, indent=2)

print("\n" + "="*80)
print("DATA EXPORTED TO: eolmed_data.json")
print("="*80)

# Also create a JavaScript file that can be directly included
js_content = f"""// Eolmed Turbine Assembly Data
// Extracted from Follow-up erections PLN.xlsx

const eolmedData = {json.dumps(eolmed_data, indent=4)};
"""

with open('eolmed-data.js', 'w') as f:
    f.write(js_content)

print("JAVASCRIPT FILE CREATED: eolmed-data.js")
print("="*80)
print()

# Print summary for verification
print("EOLMED DATA SUMMARY:")
print(f"  Floater 1: {f1_total:.2f}h | Floater 2: {f2_total:.2f}h | Floater 3: {f3_total:.2f}h")
print(f"  Overall Improvement: {overall_improvement:.2f}%")
print(f"  Learning Rate: {learning_rate*100:.0f}%")
print(f"  Project Duration: {overall_time:.2f} days")
print()
