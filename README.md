# Floating Wind Turbine Assembly Visualization

An interactive web application for visualizing the assembly process of floating wind turbines and predicting efficiency improvements through learning curve analysis.

## Overview

This project analyzes the assembly data from the EFGL Floating Wind Turbine project, tracking the installation of 3 turbine floaters and using Wright's Learning Curve model to predict future efficiency gains.

## Key Features

### 1. Interactive Timeline Visualization
- Side-by-side comparison of all 3 floater assemblies
- Component-level breakdown (Tower Sections, Nacelle, Blades)
- Visual representation of efficiency improvements

### 2. Learning Curve Analysis
- **54.29% overall improvement** from Floater 1 to Floater 3
- **69% learning rate** using Wright's Cumulative Average Model
- Real-time predictions for scaled projects (10, 20, 30+ turbines)

### 3. Performance Metrics

**Assembly Times:**
- Floater 1: 58.3 hours (baseline)
- Floater 2: 32.3 hours (44.57% improvement)
- Floater 3: 26.7 hours (54.29% improvement from F1)

**Component Improvements:**
- Tower Section 3: 82% improvement (24.3h → 4.3h)
- Tower Section 2: 40% improvement (9.5h → 5.7h)
- Blades: 13-39% improvement across all three blades

### 4. Interactive Scenario Planning
- Adjust number of turbines (3-50)
- Modify learning rate to test different scenarios
- Real-time prediction updates
- Export-ready visualizations

### 5. Resource Utilization Analysis
- **Crane Utilization: 4.67%** - significant optimization opportunity
- Total project time: 104.8 days
- Active assembly time: 4.9 days (4.67%)
- Recommendations for improving logistics and scheduling

## Scaling Predictions

Based on the 69% learning curve:

| Turbines | Avg Time per Turbine | Total Project Time | Time Savings |
|----------|---------------------|-------------------|--------------|
| 3 | 39.1 hours | 117.3 hours | 33% |
| 10 | 28.0 hours | 280.2 hours | 52% |
| 20 | 20.8 hours | 416.3 hours | 64% |
| 30 | 17.3 hours | 519.5 hours | 70% |

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Visualization:** Chart.js v4.4.0
- **Data Processing:** Wright's Learning Curve Model
- **Hosting:** GitHub Pages

## Data Source

Assembly data from EFGL Floating Wind Turbine Installation Project:
- 3 Floater units with complete assembly timelines
- 7 operations per floater (3 tower sections, 1 nacelle, 3 blades)
- Timestamps and duration tracking for each operation
- Project timeline: May 2025 - August 2025

## Usage

### View Online
Visit the live demo at: `https://[your-github-username].github.io/floating_installation/`

### Run Locally
1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process required - pure HTML/CSS/JS

### Interact with Predictions
1. Use the **Number of Turbines** slider to test different project scales
2. Adjust the **Learning Rate** to model different improvement scenarios
3. Click **Recalculate Predictions** to update all charts
4. Click **Reset to Default** to return to baseline settings

## Learning Curve Model

This application uses **Wright's Cumulative Average Model**:

```
T_n = T_1 × n^b
```

Where:
- `T_n` = Time for nth unit
- `T_1` = Time for first unit (58.33 hours)
- `n` = Unit number
- `b` = Learning coefficient (-0.5363)

**Learning Rate = 69%** means that each doubling of cumulative production reduces assembly time to 69% of the previous level.

## Key Insights

1. **Exceptional Learning Curve:** 69% learning rate is better than industry standard (75-85%)
2. **Tower Section 3 Breakthrough:** 82% improvement suggests major process optimization
3. **Low Resource Utilization:** 4.67% crane utilization indicates significant opportunity for parallel operations
4. **Consistent Improvement:** All components show learning, with minimal variance

## Recommendations

1. **Optimize Logistics:** Reduce idle/transit time (currently 95.33% of total)
2. **Parallel Operations:** Low crane utilization allows for concurrent assemblies
3. **Best Practice Sharing:** Document Tower Section 3 improvements for other components
4. **Scaling Opportunity:** Strong learning curve supports large-scale projects

## File Structure

```
floating_installation/
├── index.html              # Main web page
├── styles.css              # Styling and layout
├── app.js                  # Application logic and charts
├── turbine_data.json       # Processed assembly data
├── Follow-up erection EFGL (1).xlsx  # Source data
└── README.md              # This file
```

## Future Enhancements

- [ ] 3D visualization of turbine assembly process
- [ ] Weather/environmental factor integration
- [ ] Cost analysis and ROI calculations
- [ ] Export data to CSV/Excel
- [ ] Multi-project comparison
- [ ] Machine learning predictions

## License

MIT License - Feel free to use and modify for your projects

## Contact

For questions or collaboration opportunities, please open an issue on GitHub.

---

**Built with data from EFGL Floating Wind Turbine Installation Project**
