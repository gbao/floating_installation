// Turbine Assembly Visualization App
// Learning Curve Analysis for Floating Wind Turbines
// Now supports EFGL and Eolmed project comparison

// ==================== DATA STRUCTURE ====================
const efglData = {
    floaters: [
        {
            id: 1,
            operations: [
                { name: "Tower Section 1", duration: 8.166667 },
                { name: "Tower Section 2", duration: 9.5 },
                { name: "Tower Section 3", duration: 8.25 },
                { name: "Nacelle", duration: 4.333333 },
                { name: "Blade 1", duration: 4.833333 },
                { name: "Blade 2", duration: 4.666667 },
                { name: "Blade 3", duration: 2.5 }
            ],
            total_hours: 42.25,
            total_days: 1.76
        },
        {
            id: 2,
            operations: [
                { name: "Tower Section 1", duration: 5.5 },
                { name: "Tower Section 2", duration: 6.166667 },
                { name: "Tower Section 3", duration: 5.166667 },
                { name: "Nacelle", duration: 3.5 },
                { name: "Blade 1", duration: 3.666667 },
                { name: "Blade 2", duration: 4.5 },
                { name: "Blade 3", duration: 3.833333 }
            ],
            total_hours: 32.33,
            total_days: 1.35
        },
        {
            id: 3,
            operations: [
                { name: "Tower Section 1", duration: 5.333333 },
                { name: "Tower Section 2", duration: 5.666667 },
                { name: "Tower Section 3", duration: 4.333333 },
                { name: "Nacelle", duration: 3.166667 },
                { name: "Blade 1", duration: 3.166667 },
                { name: "Blade 2", duration: 2.833333 },
                { name: "Blade 3", duration: 2.166667 }
            ],
            total_hours: 26.67,
            total_days: 1.11
        }
    ],
    learning_curve: {
        avg_learning_rate: 0.7945,
        b_coefficient: -0.3319,
        f1_to_f2_improvement_pct: 23.48,
        f2_to_f3_improvement_pct: 17.51,
        overall_improvement_pct: 36.88
    },
    project_metrics: {
        total_project_days: 104.11,
        avg_time_per_wtg_days: 34.70,
        crane_utilization_pct: 4.05
    }
};

// Alias for backward compatibility
const turbineData = efglData;

// ==================== GLOBAL VARIABLES ====================
let charts = {};
let eolmedCharts = {};
let comparisonCharts = {};
let currentTab = 'efgl';
let currentSettings = {
    turbineCount: 10,
    learningRate: 0.7945,
    bCoefficient: -0.3319
};

// ==================== TAB MANAGEMENT ====================
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    currentTab = tabName;

    // Update URL hash
    window.location.hash = tabName;

    // Update tab buttons - remove active from all first
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        // Remove inline styles that might interfere
        btn.style.background = '';
        btn.style.color = '';
        btn.style.border = '';
    });

    // Add active to selected button
    const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        // Ensure active button is styled
        activeButton.style.background = 'linear-gradient(135deg, #2563eb, #0ea5e9)';
        activeButton.style.color = 'white';
        activeButton.style.border = '2px solid #2563eb';
    }

    // Update tab content - hide all first
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // Show active content
    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
        console.log('Activated tab content:', `tab-${tabName}`);
    } else {
        console.error('Could not find tab content:', `tab-${tabName}`);
    }

    // Initialize tab-specific content
    if (tabName === 'eolmed' && !document.getElementById('eolmed-metrics')) {
        console.log('Initializing Eolmed tab for first time...');
        initializeEolmedTab();
    } else if (tabName === 'comparison' && !comparisonCharts.towers) {
        console.log('Initializing Comparison tab for first time...');
        initializeComparisonTab();
    }
}

function setupTabNavigation() {
    // Tab button click handlers
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });

    // Handle URL hash on load and navigation
    function handleHash() {
        const hash = window.location.hash.slice(1);
        if (hash && ['efgl', 'eolmed', 'comparison'].includes(hash)) {
            switchTab(hash);
        } else {
            switchTab('efgl');
        }
    }

    window.addEventListener('hashchange', handleHash);
    handleHash(); // Initial load
}

// ==================== UTILITY FUNCTIONS ====================
function calculatePredictions(count, learningRate) {
    const baseTime = turbineData.floaters[0].total_hours;
    const b = Math.log(learningRate) / Math.log(2);

    let predictions = [];
    let cumulativeTime = 0;

    for (let n = 1; n <= count; n++) {
        const predictedTime = baseTime * Math.pow(n, b);
        cumulativeTime += predictedTime;

        predictions.push({
            turbine: n,
            time: predictedTime,
            cumulative: cumulativeTime,
            average: cumulativeTime / n
        });
    }

    return predictions;
}

// ==================== LEARNING RATE CALCULATION METHODS ====================
function calculateLearningRateMethods() {
    const f1 = efglData.floaters[0].total_hours;  // 42.25
    const f2 = efglData.floaters[1].total_hours;  // 32.33
    const f3 = efglData.floaters[2].total_hours;  // 26.67

    const lr_f1_f2 = f2 / f1;  // 0.765
    const lr_f2_f3 = f3 / f2;  // 0.825

    return {
        'sequential-avg': {
            name: 'Sequential Transition Average',
            value: (lr_f1_f2 + lr_f2_f3) / 2,
            description: 'Average of F1→F2 (76.5%) and F2→F3 (82.5%) transitions',
            formula: '(LR_F1→F2 + LR_F2→F3) / 2'
        },
        'f1-f2-only': {
            name: 'F1→F2 Transition Only',
            value: lr_f1_f2,
            description: 'Early learning phase (more conservative)',
            formula: 'F2 / F1 = 32.33 / 42.25'
        },
        'f2-f3-only': {
            name: 'F2→F3 Transition Only',
            value: lr_f2_f3,
            description: 'Later learning phase (slower improvement)',
            formula: 'F3 / F2 = 26.67 / 32.33'
        },
        'power-law': {
            name: 'Power Law Regression',
            value: Math.pow(2, Math.log(f3/f1) / Math.log(3)),
            description: 'Regression fit to all 3 data points',
            formula: '2^b where b = log(F3/F1) / log(3)'
        },
        'geometric-mean': {
            name: 'Geometric Mean',
            value: Math.sqrt(lr_f1_f2 * lr_f2_f3),
            description: 'Geometric average of both transitions',
            formula: '√(LR_F1→F2 × LR_F2→F3)'
        },
        'weighted-avg': {
            name: 'Weighted Transition Average',
            value: calculateWeightedLR(f1, f2, f3),
            description: 'Weighted by time reduction magnitude',
            formula: 'Weighted by reduction: F1→F2 (63.7%), F2→F3 (36.3%)'
        },
        'steady-state': {
            name: 'Steady State (F2+F3 Avg)',
            value: ((f2 + f3) / 2) / f1,
            description: 'Excludes first-unit effects (more aggressive)',
            formula: '((F2 + F3) / 2) / F1'
        }
    };
}

function calculateWeightedLR(f1, f2, f3) {
    const reduction_f1_f2 = f1 - f2;
    const reduction_f2_f3 = f2 - f3;
    const total_reduction = reduction_f1_f2 + reduction_f2_f3;

    const weight_f1_f2 = reduction_f1_f2 / total_reduction;
    const weight_f2_f3 = reduction_f2_f3 / total_reduction;

    const lr_f1_f2 = f2 / f1;
    const lr_f2_f3 = f3 / f2;

    return (lr_f1_f2 * weight_f1_f2) + (lr_f2_f3 * weight_f2_f3);
}

function calculateComponentImprovements() {
    const components = turbineData.floaters[0].operations.map(op => op.name);
    const improvements = [];

    components.forEach((component, idx) => {
        const f1 = turbineData.floaters[0].operations[idx].duration;
        const f2 = turbineData.floaters[1].operations[idx].duration;
        const f3 = turbineData.floaters[2].operations[idx].duration;

        const imp_f1_f2 = ((f1 - f2) / f1) * 100;
        const imp_f2_f3 = ((f2 - f3) / f2) * 100;
        const imp_total = ((f1 - f3) / f1) * 100;

        improvements.push({
            component,
            f1, f2, f3,
            imp_f1_f2,
            imp_f2_f3,
            imp_total
        });
    });

    return improvements;
}

// ==================== CHART CREATION ====================

function createTimelineChart() {
    const ctx = document.getElementById('timeline-chart').getContext('2d');

    const datasets = turbineData.floaters.map((floater, idx) => {
        const colors = ['#ef4444', '#f59e0b', '#10b981'];
        return {
            label: `Floater ${floater.id}`,
            data: floater.operations.map(op => op.duration),
            backgroundColor: colors[idx],
            borderColor: colors[idx],
            borderWidth: 2
        };
    });

    charts.timeline = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: turbineData.floaters[0].operations.map(op => op.name),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Assembly Time Comparison Across All Components',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = `${context.dataset.label}: ${context.parsed.y.toFixed(2)} hours`;
                            // Add asterisk for Tower Section 3 Floater 1 corrected value
                            if (context.label === 'Tower Section 3' && context.datasetIndex === 0) {
                                return [label + ' *', '(Corrected from 24.33h - see note below)'];
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Duration (hours)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Component'
                    }
                }
            }
        }
    });
}

function createLearningCurveChart() {
    const chartElement = document.getElementById('learning-curve-chart');
    if (!chartElement) {
        console.log('Learning curve chart element not found - skipping (chart removed)');
        return;
    }
    const ctx = chartElement.getContext('2d');

    const actualData = turbineData.floaters.map(f => ({
        x: f.id,
        y: f.total_hours
    }));

    const predictions = calculatePredictions(30, currentSettings.learningRate);
    const predictedData = predictions.map(p => ({
        x: p.turbine,
        y: p.time
    }));

    charts.learningCurve = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Actual Performance',
                    data: actualData,
                    borderColor: '#ef4444',
                    backgroundColor: '#ef4444',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    borderWidth: 3
                },
                {
                    label: 'Predicted (Learning Curve)',
                    data: predictedData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Assembly Time vs Turbine Number (Wright\'s Learning Curve)',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} hours`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Turbine Number'
                    },
                    min: 0,
                    max: 30
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Assembly Time (hours)'
                    }
                }
            }
        }
    });
}

function createComponentChart() {
    const ctx = document.getElementById('component-chart').getContext('2d');
    const improvements = calculateComponentImprovements();

    charts.component = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: improvements.map(i => i.component),
            datasets: [
                {
                    label: 'F1 → F2 Improvement (%)',
                    data: improvements.map(i => i.imp_f1_f2),
                    backgroundColor: '#3b82f6'
                },
                {
                    label: 'F2 → F3 Improvement (%)',
                    data: improvements.map(i => i.imp_f2_f3),
                    backgroundColor: '#10b981'
                },
                {
                    label: 'Total Improvement (%)',
                    data: improvements.map(i => i.imp_total),
                    backgroundColor: '#8b5cf6'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Efficiency Gains by Component',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                            // Note Tower Section 3's F1 corrected value
                            if (context.label === 'Tower Section 3' && context.datasetIndex === 0) {
                                return [label, '(F1 corrected from 24.33h to 8.25h)'];
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Improvement (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Component'
                    }
                }
            }
        }
    });
}

function createScalingChart() {
    const ctx = document.getElementById('scaling-chart').getContext('2d');

    const predictions = calculatePredictions(currentSettings.turbineCount, currentSettings.learningRate);

    // Actual EFGL data points
    const actualData = [
        { x: 1, y: 42.25 },  // F1
        { x: 2, y: 32.33 },  // F2
        { x: 3, y: 26.67 }   // F3
    ];

    // Separate formula predictions into F1-F3 (solid) and F4+ (dashed)
    const formulaF1toF3 = predictions.slice(0, 3).map((p, i) => ({ x: i + 1, y: p.time }));
    const formulaF4Plus = predictions.slice(2).map((p, i) => ({ x: i + 3, y: p.time })); // Start from F3 for continuity

    // Cumulative average line
    const cumulativeAvg = predictions.map((p, i) => ({ x: i + 1, y: p.average }));

    charts.scaling = new Chart(ctx, {
        type: 'line',
        data: {
            labels: predictions.map((p, i) => `F${i + 1}`),
            datasets: [
                // Dataset 1: Actual EFGL Data (Orange Dots)
                {
                    label: 'EFGL Actual Data (F1-F3)',
                    data: actualData,
                    borderColor: '#f97316',
                    backgroundColor: '#f97316',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    pointStyle: 'circle',
                    showLine: false, // Only show dots, no connecting line
                    order: 1 // Draw on top
                },
                // Dataset 2: Wright's Formula F1-F3 (Blue Solid Line)
                {
                    label: "Wright's Formula (F1-F3)",
                    data: formulaF1toF3,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    borderDash: [], // Solid line
                    pointRadius: 0,
                    order: 2
                },
                // Dataset 3: Prediction Zone F4+ (Blue Dashed Line)
                {
                    label: 'Prediction Zone (F4+)',
                    data: formulaF4Plus,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    borderWidth: 3,
                    fill: false,
                    borderDash: [10, 5], // Dashed line
                    pointRadius: 0,
                    order: 3
                },
                // Dataset 4: Cumulative Average F1-F3 (Solid Green - based on actual data)
                {
                    label: 'Cumulative Average (F1-F3)',
                    data: cumulativeAvg.slice(0, 3),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    borderDash: [], // Solid line
                    pointRadius: 0,
                    order: 4
                },
                // Dataset 5: Cumulative Average F3+ (Dashed Green - based on predictions)
                {
                    label: 'Cumulative Average (F4+)',
                    data: cumulativeAvg.slice(2), // Start from F3 for continuity
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderWidth: 2,
                    fill: false,
                    borderDash: [5, 5], // Dashed line
                    pointRadius: 0,
                    order: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false // Removed - using HTML title instead
                },
                legend: {
                    display: false // Hidden - using custom HTML legend below chart
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.parsed.y.toFixed(2);

                            // Show actual vs formula for F1-F3
                            if (context.datasetIndex === 0) {
                                // Actual data point
                                const floaterNum = context.parsed.x;
                                const formulaPred = predictions[floaterNum - 1].time;
                                const deviation = ((context.parsed.y - formulaPred) / formulaPred * 100).toFixed(1);
                                return [
                                    `Actual: ${value}h`,
                                    `Formula: ${formulaPred.toFixed(2)}h`,
                                    `Deviation: ${deviation}%`
                                ];
                            }

                            return `${datasetLabel}: ${value}h`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: 3,
                            xMax: 3,
                            borderColor: '#94a3b8',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: 'Prediction Zone',
                                position: 'start'
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Assembly Time (hours)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        color: '#e2e8f0'
                    }
                },
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Floater Number',
                        font: { size: 12, weight: 'bold' }
                    },
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return `F${value}`;
                        }
                    },
                    grid: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });

    // Update formula details box
    updateFormulaDetailsBox();
}

// ==================== UPDATE FORMULA DETAILS BOX ====================
function updateFormulaDetailsBox() {
    const predictions = calculatePredictions(currentSettings.turbineCount, currentSettings.learningRate);

    // Actual EFGL data
    const actualF1 = 42.25;
    const actualF2 = 32.33;
    const actualF3 = 26.67;

    // Formula predictions for F1-F3
    const formulaF2 = predictions[1].time;  // Index 1 = F2
    const formulaF3 = predictions[2].time;  // Index 2 = F3

    // Calculate deviations (actual vs formula)
    const deviationF2 = ((actualF2 - formulaF2) / formulaF2 * 100);
    const deviationF3 = ((actualF3 - formulaF3) / formulaF3 * 100);

    // Get F10 prediction (if available)
    const f10Index = Math.min(9, predictions.length - 1); // Index 9 = F10
    const f10Prediction = predictions[f10Index];

    // Calculate cumulative average for F1-F10
    const cumulativeAvgF10 = f10Prediction ? f10Prediction.average : 0;

    // Get current method name
    const methodSelector = document.getElementById('learning-rate-method');
    const selectedMethod = methodSelector ? methodSelector.value : 'sequential-avg';

    // Get method details
    const learningRateMethods = calculateLearningRateMethods();
    const currentMethod = learningRateMethods[selectedMethod] || learningRateMethods['sequential-avg'];
    const methodName = currentMethod ? currentMethod.name : 'Sequential Transition Average';

    // Update display elements
    const formulaMethodDisplay = document.getElementById('formula-method-display');
    const formulaLrDisplay = document.getElementById('formula-lr-display');
    const formulaEquationDisplay = document.getElementById('formula-equation-display');
    const formulaF10Display = document.getElementById('formula-f10-display');
    const formulaAvgDisplay = document.getElementById('formula-avg-display');
    const f2DeviationDisplay = document.getElementById('f2-deviation');
    const f3DeviationDisplay = document.getElementById('f3-deviation');

    if (formulaMethodDisplay) {
        formulaMethodDisplay.textContent = `${methodName} (${(currentSettings.learningRate * 100).toFixed(1)}%)`;
    }

    if (formulaLrDisplay) {
        formulaLrDisplay.textContent = `${(currentSettings.learningRate * 100).toFixed(1)}%`;
    }

    if (formulaEquationDisplay) {
        const bCoeffDisplay = currentSettings.bCoefficient.toFixed(3);
        formulaEquationDisplay.innerHTML = `T<sub>n</sub> = 42.25 × n<sup>${bCoeffDisplay}</sup>`;
    }

    if (formulaF10Display && f10Prediction) {
        formulaF10Display.textContent = `${f10Prediction.time.toFixed(1)}h`;
    }

    if (formulaAvgDisplay) {
        formulaAvgDisplay.textContent = `${cumulativeAvgF10.toFixed(1)}h`;
    }

    if (f2DeviationDisplay) {
        const sign = deviationF2 >= 0 ? '+' : '';
        f2DeviationDisplay.textContent = `${sign}${deviationF2.toFixed(1)}%`;
    }

    if (f3DeviationDisplay) {
        const sign = deviationF3 >= 0 ? '+' : '';
        f3DeviationDisplay.textContent = `${sign}${deviationF3.toFixed(1)}%`;
    }
}

function createUtilizationChart() {
    const ctx = document.getElementById('utilization-chart').getContext('2d');

    const utilized = turbineData.project_metrics.crane_utilization_pct;
    const idle = 100 - utilized;

    charts.utilization = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active Assembly', 'Idle/Transit Time'],
            datasets: [{
                data: [utilized, idle],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Crane Utilization',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });
}

// ==================== PATTERN 3: UTILIZATION BAR CHART ====================
function createUtilizationBarChart() {
    const chartElement = document.getElementById('utilization-bar-chart');
    if (!chartElement) {
        console.log('Utilization bar chart element not found - skipping');
        return;
    }
    const ctx = chartElement.getContext('2d');

    // Floater data: work hours, available hours, calendar days
    const floaters = [
        { name: 'F1', days: 39, work: 42.25, available: 390 },
        { name: 'F2', days: 26, work: 32.33, available: 260 },
        { name: 'F3', days: 22, work: 26.67, available: 220 }
    ];

    // Calculate percentages
    const activePercentages = floaters.map(f => (f.work / f.available) * 100);
    const idlePercentages = floaters.map(f => 100 - (f.work / f.available) * 100);

    charts.utilizationBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: floaters.map(f => `${f.name}\n(${f.days} days)`),
            datasets: [
                {
                    label: 'Active (Crane Work)',
                    data: activePercentages,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 2
                },
                {
                    label: 'Idle',
                    data: idlePercentages,
                    backgroundColor: '#e5e7eb',
                    borderColor: '#9ca3af',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const floater = floaters[context.dataIndex];
                            if (context.datasetIndex === 0) {
                                return `Active: ${context.parsed.y.toFixed(1)}% (${floater.work}h work)`;
                            } else {
                                return `Idle: ${context.parsed.y.toFixed(1)}%`;
                            }
                        },
                        afterLabel: function(context) {
                            const floater = floaters[context.dataIndex];
                            return `Available: ${floater.available}h total`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Floater',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Utilization (%)',
                        font: { size: 12, weight: 'bold' }
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
}

// ==================== DATA TABLE ====================
function populateDataTable() {
    const improvements = calculateComponentImprovements();
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '';

    improvements.forEach(item => {
        const row = document.createElement('tr');

        const formatImprovement = (val) => {
            const className = val >= 0 ? 'improvement-positive' : 'improvement-negative';
            const sign = val >= 0 ? '+' : '';
            return `<span class="${className}">${sign}${val.toFixed(2)}%</span>`;
        };

        // Add asterisk to Tower Section 3 F1 as outlier
        const f1Display = item.component === 'Tower Section 3'
            ? `${item.f1.toFixed(2)}*`
            : item.f1.toFixed(2);

        row.innerHTML = `
            <td>${item.component}</td>
            <td>${f1Display}</td>
            <td>${item.f2.toFixed(2)}</td>
            <td>${item.f3.toFixed(2)}</td>
            <td>${formatImprovement(item.imp_f1_f2)}</td>
            <td>${formatImprovement(item.imp_f2_f3)}</td>
            <td>${formatImprovement(item.imp_total)}</td>
        `;

        tbody.appendChild(row);
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.style.backgroundColor = '#f1f5f9';

    const f1Total = turbineData.floaters[0].total_hours;
    const f2Total = turbineData.floaters[1].total_hours;
    const f3Total = turbineData.floaters[2].total_hours;

    const totalF1F2 = ((f1Total - f2Total) / f1Total) * 100;
    const totalF2F3 = ((f2Total - f3Total) / f2Total) * 100;
    const totalOverall = ((f1Total - f3Total) / f1Total) * 100;

    const formatImprovement = (val) => {
        const className = val >= 0 ? 'improvement-positive' : 'improvement-negative';
        const sign = val >= 0 ? '+' : '';
        return `<span class="${className}">${sign}${val.toFixed(2)}%</span>`;
    };

    totalRow.innerHTML = `
        <td>TOTAL</td>
        <td>${f1Total.toFixed(2)}</td>
        <td>${f2Total.toFixed(2)}</td>
        <td>${f3Total.toFixed(2)}</td>
        <td>${formatImprovement(totalF1F2)}</td>
        <td>${formatImprovement(totalF2F3)}</td>
        <td>${formatImprovement(totalOverall)}</td>
    `;

    tbody.appendChild(totalRow);
}

// ==================== UPDATE PREDICTIONS ====================
function updatePredictions() {
    const predictions = calculatePredictions(currentSettings.turbineCount, currentSettings.learningRate);
    const lastPrediction = predictions[predictions.length - 1];

    // Update predicted turbines count
    const predictedTurbinesEl = document.getElementById('predicted-turbines');
    if (predictedTurbinesEl) {
        predictedTurbinesEl.textContent = currentSettings.turbineCount;
    }

    // Update Floater N time display (formula-f10-display shows time for the last floater)
    const formulaFNDisplay = document.getElementById('formula-f10-display');
    if (formulaFNDisplay) {
        formulaFNDisplay.textContent = `${lastPrediction.time.toFixed(1)}h`;
    }

    // Update cumulative average display
    const formulaAvgDisplay = document.getElementById('formula-avg-display');
    if (formulaAvgDisplay) {
        formulaAvgDisplay.textContent = `${lastPrediction.average.toFixed(1)}h`;
    }

    // Update total project time (sum of all floater times)
    const predTotalTime = document.getElementById('pred-total-time');
    if (predTotalTime) {
        predTotalTime.textContent = `${lastPrediction.cumulative.toFixed(1)}h`;
    }

    // Update time savings (compared to baseline of average F1-F3 speed for all floaters)
    const predSavings = document.getElementById('pred-savings');
    if (predSavings) {
        // Use average of first 3 floaters as baseline (not just F1)
        const avgF1F2F3 = (turbineData.floaters[0].total_hours +
                          turbineData.floaters[1].total_hours +
                          turbineData.floaters[2].total_hours) / 3; // = 33.75h
        const baselineTotal = avgF1F2F3 * currentSettings.turbineCount; // Baseline without additional learning
        const actualTotal = lastPrediction.cumulative; // With learning curve
        const savings = ((baselineTotal - actualTotal) / baselineTotal) * 100;
        predSavings.textContent = `${savings.toFixed(1)}%`;
    }
}

// ==================== UPDATE CALCULATION DETAIL BOX ====================
function updateCalculationDetail(methodKey) {
    const calculationBox = document.getElementById('method-calculation');
    if (!calculationBox) return;

    const f1 = 42.25;
    const f2 = 32.33;
    const f3 = 26.67;

    let html = '';

    switch(methodKey) {
        case 'sequential-avg':
            html = `
                <div class="calc-step"><strong>Step 1:</strong> LR<sub>F1→F2</sub> = ${f2}h / ${f1}h = 76.5%</div>
                <div class="calc-step"><strong>Step 2:</strong> LR<sub>F2→F3</sub> = ${f3}h / ${f2}h = 82.5%</div>
                <div class="calc-step"><strong>Step 3:</strong> Average LR = (76.5% + 82.5%) / 2 = <strong>79.5%</strong></div>
            `;
            break;
        case 'f1-f2-only':
            html = `
                <div class="calc-step"><strong>Step 1:</strong> LR<sub>F1→F2</sub> = ${f2}h / ${f1}h = <strong>76.5%</strong></div>
                <div class="calc-step">Uses only the first transition (early learning phase)</div>
            `;
            break;
        case 'f2-f3-only':
            html = `
                <div class="calc-step"><strong>Step 1:</strong> LR<sub>F2→F3</sub> = ${f3}h / ${f2}h = <strong>82.5%</strong></div>
                <div class="calc-step">Uses only the second transition (later learning phase)</div>
            `;
            break;
        case 'power-law':
            html = `
                <div class="calc-step"><strong>Step 1:</strong> b = log(${f3}/${f1}) / log(3) = -0.332</div>
                <div class="calc-step"><strong>Step 2:</strong> LR = 2<sup>b</sup> = 2<sup>-0.332</sup> = <strong>79.5%</strong></div>
                <div class="calc-step">Regression fit to all 3 data points</div>
            `;
            break;
        case 'geometric-mean':
            html = `
                <div class="calc-step"><strong>Step 1:</strong> LR<sub>F1→F2</sub> = 76.5%, LR<sub>F2→F3</sub> = 82.5%</div>
                <div class="calc-step"><strong>Step 2:</strong> Geometric Mean = √(76.5% × 82.5%) = <strong>79.5%</strong></div>
            `;
            break;
        case 'weighted-avg':
            html = `
                <div class="calc-step"><strong>Step 1:</strong> Reduction F1→F2 = 9.92h (63.7% weight)</div>
                <div class="calc-step"><strong>Step 2:</strong> Reduction F2→F3 = 5.66h (36.3% weight)</div>
                <div class="calc-step"><strong>Step 3:</strong> Weighted LR = (76.5% × 0.637) + (82.5% × 0.363) = <strong>78.7%</strong></div>
            `;
            break;
        case 'steady-state':
            html = `
                <div class="calc-step"><strong>Step 1:</strong> Steady state avg = (${f2}h + ${f3}h) / 2 = 29.5h</div>
                <div class="calc-step"><strong>Step 2:</strong> LR = 29.5h / ${f1}h = <strong>69.8%</strong></div>
                <div class="calc-step">Excludes first-unit learning effects</div>
            `;
            break;
        case 'custom':
            html = `
                <div class="calc-step">Manual override - user-specified learning rate</div>
                <div class="calc-step">Use the slider below to adjust</div>
            `;
            break;
        default:
            html = '<div class="calc-step">Calculation details will appear here</div>';
    }

    calculationBox.innerHTML = html;
}

// ==================== EVENT LISTENERS ====================
function initializeLearningRateMethod() {
    const methodSelector = document.getElementById('learning-rate-method');
    const learningRateMethods = calculateLearningRateMethods();

    // Set default to sequential-avg
    methodSelector.value = 'sequential-avg';

    // Initialize display
    const method = learningRateMethods['sequential-avg'];
    document.getElementById('method-name').textContent = method.name;
    document.getElementById('method-formula').textContent = method.formula;
    document.getElementById('method-description').textContent = method.description;
    document.getElementById('calculated-lr-value').textContent = `${(method.value * 100).toFixed(1)}%`;

    // Initialize calculation detail box
    updateCalculationDetail('sequential-avg');

    // Set current settings
    currentSettings.learningRate = method.value;
    currentSettings.bCoefficient = Math.log(method.value) / Math.log(2);
}

function setupEventListeners() {
    // Turbine count slider
    const turbineCountInput = document.getElementById('turbine-count');
    const turbineCountValue = document.getElementById('turbine-count-value');

    turbineCountInput.addEventListener('input', (e) => {
        currentSettings.turbineCount = parseInt(e.target.value);
        turbineCountValue.textContent = currentSettings.turbineCount;
    });

    // Learning rate slider
    const learningRateInput = document.getElementById('learning-rate-adjust');
    const learningRateValue = document.getElementById('learning-rate-adjust-value');

    learningRateInput.addEventListener('input', (e) => {
        if (document.getElementById('learning-rate-method').value === 'custom') {
            currentSettings.learningRate = parseFloat(e.target.value);
            learningRateValue.textContent = `${(currentSettings.learningRate * 100).toFixed(0)}%`;
            document.getElementById('calculated-lr-value').textContent = `${(currentSettings.learningRate * 100).toFixed(1)}%`;
            currentSettings.bCoefficient = Math.log(currentSettings.learningRate) / Math.log(2);

            // Update main metric card
            document.getElementById('learning-rate').textContent = `${(currentSettings.learningRate * 100).toFixed(0)}%`;

            // Auto-update predictions and charts
            updatePredictions();
            updateCharts();
        }
    });

    // Learning rate method selector
    const methodSelector = document.getElementById('learning-rate-method');
    const methodInfoName = document.getElementById('method-name');
    const methodInfoFormula = document.getElementById('method-formula');
    const methodInfoDescription = document.getElementById('method-description');
    const calculatedLRValue = document.getElementById('calculated-lr-value');
    const manualLRControl = document.getElementById('manual-lr-control');

    const learningRateMethods = calculateLearningRateMethods();

    methodSelector.addEventListener('change', (e) => {
        const selectedMethod = e.target.value;

        if (selectedMethod === 'custom') {
            // Show manual slider
            manualLRControl.style.display = 'block';

            // Use current slider value
            currentSettings.learningRate = parseFloat(learningRateInput.value);
            calculatedLRValue.textContent = `${(currentSettings.learningRate * 100).toFixed(1)}%`;

            methodInfoName.textContent = 'Custom (Manual Override)';
            methodInfoFormula.textContent = 'User-specified value';
            methodInfoDescription.textContent = 'Use the slider below to set a custom learning rate';

            // Update calculation detail box for custom mode
            updateCalculationDetail('custom');
        } else {
            // Hide manual slider
            manualLRControl.style.display = 'none';

            // Get method data
            const method = learningRateMethods[selectedMethod];

            // Update learning rate
            currentSettings.learningRate = method.value;
            currentSettings.bCoefficient = Math.log(method.value) / Math.log(2);

            // Update info display
            methodInfoName.textContent = method.name;
            methodInfoFormula.textContent = method.formula;
            methodInfoDescription.textContent = method.description;
            calculatedLRValue.textContent = `${(method.value * 100).toFixed(1)}%`;

            // Update calculation detail box
            updateCalculationDetail(selectedMethod);

            // Update main metric card
            document.getElementById('learning-rate').textContent = `${(method.value * 100).toFixed(0)}%`;
        }

        // Auto-update predictions and charts
        updatePredictions();
        updateCharts();
    });

    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', () => {
        updatePredictions();
        updateCharts();
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        currentSettings.turbineCount = 10;
        currentSettings.learningRate = 0.7945;
        currentSettings.bCoefficient = -0.3319;

        turbineCountInput.value = 10;
        turbineCountValue.textContent = '10';
        learningRateInput.value = 0.7945;
        learningRateValue.textContent = '79%';

        // Reset method dropdown to default
        methodSelector.value = 'sequential-avg';
        manualLRControl.style.display = 'none';

        // Reset method info display
        const defaultMethod = learningRateMethods['sequential-avg'];
        methodInfoName.textContent = defaultMethod.name;
        methodInfoFormula.textContent = defaultMethod.formula;
        methodInfoDescription.textContent = defaultMethod.description;
        calculatedLRValue.textContent = `${(defaultMethod.value * 100).toFixed(1)}%`;

        // Update main metric card
        document.getElementById('learning-rate').textContent = `${(defaultMethod.value * 100).toFixed(0)}%`;

        updatePredictions();
        updateCharts();
    });

    // ========== OPTION C: SUB-TAB NAVIGATION ==========
    // EFGL Sub-tab switching
    const efglSubTabBtns = document.querySelectorAll('.efgl-sub-tab-btn');
    const efglSubTabContents = document.querySelectorAll('.efgl-sub-tab-content');

    console.log('Setting up EFGL sub-tab navigation...');
    console.log('Found sub-tab buttons:', efglSubTabBtns.length);
    console.log('Found sub-tab contents:', efglSubTabContents.length);

    efglSubTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSubTab = btn.getAttribute('data-subtab');
            console.log('Sub-tab clicked:', targetSubTab);

            // Remove active class from all sub-tab buttons
            efglSubTabBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Hide all sub-tab contents
            efglSubTabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Show target sub-tab content
            // Handle special case: Forecasting is split into two divs
            if (targetSubTab === 'forecasting') {
                // Show both forecasting divs
                document.getElementById('subtab-forecasting').classList.add('active');
                const forecastingCharts = document.getElementById('subtab-forecasting-charts');
                if (forecastingCharts) {
                    forecastingCharts.classList.add('active');
                }
            } else {
                // Show single sub-tab
                const targetElement = document.getElementById(`subtab-${targetSubTab}`);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            }
        });
    });

    // ========== METRIC TOOLTIP TOGGLES ==========
    const metricInfoBtns = document.querySelectorAll('.metric-info-btn');

    metricInfoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Toggle active state
            const isActive = btn.classList.contains('active');

            // Close all other tooltips
            metricInfoBtns.forEach(b => b.classList.remove('active'));

            // Toggle current tooltip
            if (!isActive) {
                btn.classList.add('active');
            }
        });
    });

    // Close tooltips when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.metric-card')) {
            metricInfoBtns.forEach(btn => btn.classList.remove('active'));
        }
    });
}

function updateCharts() {
    // Update scaling chart
    if (charts.scaling) {
        charts.scaling.destroy();
    }
    createScalingChart();

    // Update learning curve chart - REMOVED (redundant with scaling chart)
    // if (charts.learningCurve) {
    //     charts.learningCurve.destroy();
    // }
    // createLearningCurveChart();
}

// ==================== EOLMED TAB INITIALIZATION ====================
function initializeEolmedTab() {
    console.log('Initializing Eolmed tab...');

    const placeholder = document.getElementById('eolmed-content-placeholder');
    if (!placeholder) return;

    // Create Eolmed content structure (COMPLETE clone of EFGL structure)
    const eolmedHTML = `
        <!-- Project Overview Section -->
        <section class="project-overview">
            <h2>Project Overview</h2>
            <div class="overview-grid">
                <div class="overview-item">
                    <span class="overview-label">Project:</span>
                    <span class="overview-value">Eolmed (PLN) Floating Wind Project</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Location:</span>
                    <span class="overview-value">Mediterranean Sea, France</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Period:</span>
                    <span class="overview-value">2024 - 2025</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Scope:</span>
                    <span class="overview-value">3 floating wind foundations</span>
                </div>
            </div>
        </section>

        <!-- Technical Specifications -->
        <section class="tech-specs-section">
            <h2>Technical Specifications</h2>

            <div class="specs-category">
                <h3>Wind Turbine Generator (WTG)</h3>
                <div class="specs-grid">
                    <div class="spec-item">
                        <span class="spec-icon">⚡</span>
                        <div class="spec-content">
                            <div class="spec-label">Model</div>
                            <div class="spec-value">Vestas V164-10.0 MW</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">🔌</span>
                        <div class="spec-content">
                            <div class="spec-label">Unit Power</div>
                            <div class="spec-value">10 MW</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">↔️</span>
                        <div class="spec-content">
                            <div class="spec-label">Rotor Diameter</div>
                            <div class="spec-value">164 m</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">📏</span>
                        <div class="spec-content">
                            <div class="spec-label">Blade Length</div>
                            <div class="spec-value">80 m</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">⚖️</span>
                        <div class="spec-content">
                            <div class="spec-label">Blade Weight</div>
                            <div class="spec-value">34 tonnes</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">📐</span>
                        <div class="spec-content">
                            <div class="spec-label">Hub Height</div>
                            <div class="spec-value">104 m</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">⚙️</span>
                        <div class="spec-content">
                            <div class="spec-label">Total Mass</div>
                            <div class="spec-value">500 tonnes</div>
                            <div class="spec-note">(rotor assembly, mast, nacelle)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="specs-category">
                <h3>Floating Platform</h3>
                <div class="specs-grid">
                    <div class="spec-item">
                        <span class="spec-icon">🔷</span>
                        <div class="spec-content">
                            <div class="spec-label">Technology</div>
                            <div class="spec-value">BW Ideol Semi-Submersible Barge</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">📦</span>
                        <div class="spec-content">
                            <div class="spec-label">Optimized Dimensions</div>
                            <div class="spec-value">45m × 45m × 17m</div>
                            <div class="spec-note">(for easy port integration)</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">↕️</span>
                        <div class="spec-content">
                            <div class="spec-label">Total Height</div>
                            <div class="spec-value">17 m</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">⚓</span>
                        <div class="spec-content">
                            <div class="spec-label">Operating Draft</div>
                            <div class="spec-value">7 - 10 m</div>
                            <div class="spec-note">(shallow draft design)</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">⭕</span>
                        <div class="spec-content">
                            <div class="spec-label">Hull Design</div>
                            <div class="spec-value">Ring with Central Opening</div>
                            <div class="spec-note">(Damping pool© for swell dampening)</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">🌊</span>
                        <div class="spec-content">
                            <div class="spec-label">Swell Management</div>
                            <div class="spec-value">Extended Bottom Structure</div>
                            <div class="spec-note">(dampens swell frequencies)</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">🔗</span>
                        <div class="spec-content">
                            <div class="spec-label">Turbine Connection</div>
                            <div class="spec-value">Transition Piece to Deck</div>
                            <div class="spec-note">(rear deck attachment)</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">🏗️</span>
                        <div class="spec-content">
                            <div class="spec-label">Construction</div>
                            <div class="spec-value">Semi-Submersible Steel Barge</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="specs-category">
                <h3>Installation Site Characteristics</h3>
                <div class="specs-grid">
                    <div class="spec-item">
                        <span class="spec-icon">🌍</span>
                        <div class="spec-content">
                            <div class="spec-label">Location</div>
                            <div class="spec-value">Mediterranean Sea</div>
                            <div class="spec-note">(off Gruissan, Southern France)</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">📍</span>
                        <div class="spec-content">
                            <div class="spec-label">Distance to Coast</div>
                            <div class="spec-value">18 km</div>
                            <div class="spec-note">(Gruissan coastline)</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">🌊</span>
                        <div class="spec-content">
                            <div class="spec-label">Sea Depth Range</div>
                            <div class="spec-value">60 - 90 m</div>
                            <div class="spec-note">(anchored around 60m depth)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="specs-category">
                <h3>Assembly Facility & Equipment</h3>
                <div class="specs-grid">
                    <div class="spec-item">
                        <span class="spec-icon">🏭</span>
                        <div class="spec-content">
                            <div class="spec-label">Assembly Port</div>
                            <div class="spec-value">Port-La Nouvelle</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">🏗️</span>
                        <div class="spec-content">
                            <div class="spec-label">Crane Model</div>
                            <div class="spec-value">Mammoet Terex Demag CC 8800-1</div>
                            <div class="spec-note">(Crawler crane, 1,600 tonne capacity)</div>
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">📏</span>
                        <div class="spec-content">
                            <div class="spec-label">Boom Height</div>
                            <div class="spec-value">>145 m</div>
                            <div class="spec-note">(over 145 meters)</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Key Metrics Summary -->
        <section class="metrics-grid" id="eolmed-metrics">
            <div class="metric-card">
                <div class="metric-label">Overall Improvement</div>
                <div class="metric-value">${eolmedData.learning_curve.overall_improvement_pct}%</div>
                <div class="metric-desc">Floater 1 → 3</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Learning Rate</div>
                <div class="metric-value">${(eolmedData.learning_curve.avg_learning_rate * 100).toFixed(0)}%</div>
                <div class="metric-desc">Mathematical Relationship</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Floater 1 Time</div>
                <div class="metric-value">${eolmedData.floaters[0].total_hours}h</div>
                <div class="metric-desc">Initial baseline</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Floater 3 Time</div>
                <div class="metric-value">${eolmedData.floaters[2].total_hours}h</div>
                <div class="metric-desc">Latest performance</div>
            </div>
        </section>

        <!-- Learning Rate Methodology -->
        <section class="methodology-section">
            <h2>Learning Rate Methodology</h2>
            <p class="methodology-intro">
                The learning rate of ${(eolmedData.learning_curve.avg_learning_rate * 100).toFixed(1)}% is calculated using two complementary mathematical methods,
                rather than Wright's Law which assumes production doubling. This approach is more appropriate
                for sequential foundation assembly where production doesn't double.
            </p>
            <div class="methodology-grid">
                <div class="method-card">
                    <h3>Method 1: Sequential Transition Analysis</h3>
                    <div class="calculation-box">
                        <div class="calc-step">
                            <span class="calc-label">F1 → F2 Transition:</span>
                            <span class="calc-value">${eolmedData.floaters[1].total_hours.toFixed(2)} / ${eolmedData.floaters[0].total_hours.toFixed(2)} = ${((eolmedData.floaters[1].total_hours / eolmedData.floaters[0].total_hours) * 100).toFixed(1)}%</span>
                        </div>
                        <div class="calc-step">
                            <span class="calc-label">F2 → F3 Transition:</span>
                            <span class="calc-value">${eolmedData.floaters[2].total_hours.toFixed(2)} / ${eolmedData.floaters[1].total_hours.toFixed(2)} = ${((eolmedData.floaters[2].total_hours / eolmedData.floaters[1].total_hours) * 100).toFixed(1)}%</span>
                        </div>
                        <div class="calc-step final">
                            <span class="calc-label">Average Learning Rate:</span>
                            <span class="calc-value">~${(eolmedData.learning_curve.avg_learning_rate * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <p class="method-desc">
                        This method analyzes the sequential improvement between consecutive foundations,
                        providing insight into the rate of improvement at each stage of the project.
                    </p>
                </div>
                <div class="method-card">
                    <h3>Method 2: Power Law Regression</h3>
                    <div class="calculation-box">
                        <div class="calc-step">
                            <span class="calc-label">Regression Model:</span>
                            <span class="calc-value">Y = aX<sup>b</sup></span>
                        </div>
                        <div class="calc-step">
                            <span class="calc-label">Power Coefficient:</span>
                            <span class="calc-value">b = ${eolmedData.learning_curve.b_coefficient.toFixed(3)}</span>
                        </div>
                        <div class="calc-step final">
                            <span class="calc-label">Learning Rate:</span>
                            <span class="calc-value">2<sup>b</sup> = ${(eolmedData.learning_curve.avg_learning_rate * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <p class="method-desc">
                        Power law regression fits the assembly time data to a mathematical curve,
                        capturing the overall learning trend across all three foundations.
                    </p>
                </div>
            </div>
        </section>

        <!-- Interactive Controls -->
        <section class="controls-section">
            <h2>Scenario Planning</h2>
            <div class="controls-grid">
                <div class="control-group">
                    <label for="eolmed-turbine-count">Number of Turbines:</label>
                    <input type="range" id="eolmed-turbine-count" min="3" max="50" value="10" step="1">
                    <span id="eolmed-turbine-count-value">10</span>
                </div>
                <div class="control-group">
                    <label for="eolmed-learning-rate-adjust">Learning Rate Adjustment:</label>
                    <input type="range" id="eolmed-learning-rate-adjust" min="0.5" max="1.0" value="${eolmedData.learning_curve.avg_learning_rate}" step="0.01">
                    <span id="eolmed-learning-rate-adjust-value">${(eolmedData.learning_curve.avg_learning_rate * 100).toFixed(0)}%</span>
                </div>
                <div class="control-group">
                    <button id="eolmed-reset-btn" class="btn-secondary">Reset to Default</button>
                    <button id="eolmed-calculate-btn" class="btn-primary">Recalculate Predictions</button>
                </div>
            </div>
            <div class="prediction-summary">
                <h3>Predicted Results for <span id="eolmed-predicted-turbines">10</span> Turbines:</h3>
                <div class="prediction-grid">
                    <div class="prediction-item">
                        <span class="pred-label">Avg Assembly Time:</span>
                        <span class="pred-value" id="eolmed-pred-avg-time">-</span>
                    </div>
                    <div class="prediction-item">
                        <span class="pred-label">Total Project Time:</span>
                        <span class="pred-value" id="eolmed-pred-total-time">-</span>
                    </div>
                    <div class="prediction-item">
                        <span class="pred-label">Time Savings:</span>
                        <span class="pred-value" id="eolmed-pred-savings">-</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Component Timeline Comparison -->
        <section class="chart-section">
            <h2>Component Assembly Timeline - All Floaters</h2>
            <div class="chart-container">
                <canvas id="eolmed-timeline-chart"></canvas>
            </div>
        </section>

        <!-- Learning Curve Visualization -->
        <section class="chart-section">
            <h2>Learning Curve Progression</h2>
            <div class="chart-container">
                <canvas id="eolmed-learning-curve-chart"></canvas>
            </div>
        </section>

        <!-- Component Breakdown -->
        <section class="chart-section">
            <h2>Component-Level Efficiency Improvements</h2>
            <div class="chart-container">
                <canvas id="eolmed-component-chart"></canvas>
            </div>
        </section>

        <!-- Scaling Predictions -->
        <section class="chart-section">
            <h2>Scaling Predictions (10, 20, 30+ Turbines)</h2>
            <div class="chart-container">
                <canvas id="eolmed-scaling-chart"></canvas>
            </div>
        </section>

        <!-- Resource Utilization -->
        <section class="chart-section">
            <h2>Resource Utilization Analysis</h2>
            <div class="chart-grid">
                <div class="chart-container-small">
                    <canvas id="eolmed-utilization-chart"></canvas>
                </div>
                <div class="utilization-insights">
                    <h3>Key Insights</h3>
                    <ul>
                        <li><strong>Crane Utilization:</strong> <span id="eolmed-crane-util">${eolmedData.project_metrics.crane_utilization_pct.toFixed(2)}%</span> - Significant improvement opportunity</li>
                        <li><strong>Total Project Duration:</strong> <span id="eolmed-project-duration">${eolmedData.project_metrics.total_project_days.toFixed(1)} days</span></li>
                        <li><strong>Active Assembly Time:</strong> <span id="eolmed-active-time">${((eolmedData.floaters[0].total_hours + eolmedData.floaters[1].total_hours + eolmedData.floaters[2].total_hours) / 24).toFixed(1)} days</span></li>
                        <li><strong>Idle/Transit Time:</strong> <span id="eolmed-idle-time">${(eolmedData.project_metrics.total_project_days - ((eolmedData.floaters[0].total_hours + eolmedData.floaters[1].total_hours + eolmedData.floaters[2].total_hours) / 24)).toFixed(1)} days</span></li>
                    </ul>
                    <div class="insight-box">
                        <strong>Recommendation:</strong> Optimize logistics and scheduling to increase crane utilization.
                        Parallel operations and reduced transit times could significantly reduce overall project duration.
                    </div>
                </div>
            </div>
        </section>

        <!-- Data Table -->
        <section class="data-section">
            <h2>Detailed Assembly Data</h2>
            <div class="table-responsive">
                <table id="eolmed-data-table">
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Floater 1 (hrs)</th>
                            <th>Floater 2 (hrs)</th>
                            <th>Floater 3 (hrs)</th>
                            <th>F1→F2 Improvement</th>
                            <th>F2→F3 Improvement</th>
                            <th>Total Improvement</th>
                        </tr>
                    </thead>
                    <tbody id="eolmed-data-table-body">
                        <!-- Populated by JavaScript -->
                    </tbody>
                </table>
            </div>
            <div class="table-footnote">
                <p>The Eolmed project shows more consistent learning patterns across components,
                benefiting from lessons learned during the earlier EFGL project execution.</p>
            </div>
        </section>
    `;

    placeholder.innerHTML = eolmedHTML;

    // Create Eolmed charts
    createEolmedCharts();

    // Populate Eolmed data table
    populateEolmedDataTable();

    // Setup Eolmed event listeners
    setupEolmedEventListeners();

    // Update Eolmed predictions
    updateEolmedPredictions();
}

function createEolmedCharts() {
    // Timeline Chart
    const timelineCtx = document.getElementById('eolmed-timeline-chart');
    if (timelineCtx) {
        const datasets = eolmedData.floaters.map((floater, idx) => {
            const colors = ['#3b82f6', '#06b6d4', '#10b981'];
            return {
                label: `Floater ${floater.id}`,
                data: floater.operations.map(op => op.duration),
                backgroundColor: colors[idx],
                borderColor: colors[idx],
                borderWidth: 2
            };
        });

        eolmedCharts.timeline = new Chart(timelineCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: eolmedData.floaters[0].operations.map(op => op.name),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Eolmed - Assembly Time Comparison Across All Components',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Duration (hours)' }},
                    x: { title: { display: true, text: 'Component' }}
                }
            }
        });
    }

    // Learning Curve Chart
    const learningCtx = document.getElementById('eolmed-learning-curve-chart');
    if (learningCtx) {
        const actualData = eolmedData.floaters.map(f => ({ x: f.id, y: f.total_hours }));
        const predictions = [];
        const baseTime = eolmedData.floaters[0].total_hours;
        const b = eolmedData.learning_curve.b_coefficient;

        for (let n = 1; n <= 30; n++) {
            predictions.push({ x: n, y: baseTime * Math.pow(n, b) });
        }

        eolmedCharts.learningCurve = new Chart(learningCtx.getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Actual Performance',
                        data: actualData,
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        pointRadius: 8,
                        borderWidth: 3
                    },
                    {
                        label: 'Predicted (Learning Curve)',
                        data: predictions,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Eolmed - Assembly Time vs Turbine Number',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    x: { type: 'linear', title: { display: true, text: 'Turbine Number' }, min: 0, max: 30 },
                    y: { beginAtZero: true, title: { display: true, text: 'Assembly Time (hours)' }}
                }
            }
        });
    }

    // Component Chart
    const componentCtx = document.getElementById('eolmed-component-chart');
    if (componentCtx) {
        const improvements = [];
        eolmedData.floaters[0].operations.forEach((op, idx) => {
            const f1 = eolmedData.floaters[0].operations[idx].duration;
            const f2 = eolmedData.floaters[1].operations[idx].duration;
            const f3 = eolmedData.floaters[2].operations[idx].duration;
            improvements.push({
                component: op.name,
                imp_total: ((f1 - f3) / f1) * 100
            });
        });

        eolmedCharts.component = new Chart(componentCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: improvements.map(i => i.component),
                datasets: [{
                    label: 'Total Improvement (%)',
                    data: improvements.map(i => i.imp_total),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Eolmed - Efficiency Gains by Component',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Improvement (%)' }},
                    x: { title: { display: true, text: 'Component' }}
                }
            }
        });
    }

    // Scaling Chart
    const scalingCtx = document.getElementById('eolmed-scaling-chart');
    if (scalingCtx) {
        const predictions = calculatePredictionsForData(10, eolmedData);
        const timeData = predictions.map(p => p.time);
        const avgData = predictions.map(p => p.average);

        eolmedCharts.scaling = new Chart(scalingCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: predictions.map(p => `T${p.turbine}`),
                datasets: [
                    {
                        label: 'Individual Assembly Time',
                        data: timeData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Average Assembly Time',
                        data: avgData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Eolmed - Predicted Performance for 10 Turbines',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Time (hours)' }},
                    x: { title: { display: true, text: 'Turbine' }}
                }
            }
        });
    }

    // Utilization Chart
    const utilizationCtx = document.getElementById('eolmed-utilization-chart');
    if (utilizationCtx) {
        const utilized = eolmedData.project_metrics.crane_utilization_pct;
        const idle = 100 - utilized;

        eolmedCharts.utilization = new Chart(utilizationCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Active Assembly', 'Idle/Transit Time'],
                datasets: [{
                    data: [utilized, idle],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Eolmed - Crane Utilization',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: { display: true, position: 'bottom' }
                }
            }
        });
    }
}

function calculatePredictionsForData(count, data) {
    const baseTime = data.floaters[0].total_hours;
    const b = data.learning_curve.b_coefficient;
    let predictions = [];
    let cumulativeTime = 0;

    for (let n = 1; n <= count; n++) {
        const predictedTime = baseTime * Math.pow(n, b);
        cumulativeTime += predictedTime;
        predictions.push({
            turbine: n,
            time: predictedTime,
            cumulative: cumulativeTime,
            average: cumulativeTime / n
        });
    }

    return predictions;
}

function populateEolmedDataTable() {
    const tbody = document.getElementById('eolmed-data-table-body');
    if (!tbody) return;

    const improvements = [];
    eolmedData.floaters[0].operations.forEach((op, idx) => {
        const f1 = eolmedData.floaters[0].operations[idx].duration;
        const f2 = eolmedData.floaters[1].operations[idx].duration;
        const f3 = eolmedData.floaters[2].operations[idx].duration;

        const imp_f1_f2 = ((f1 - f2) / f1) * 100;
        const imp_f2_f3 = ((f2 - f3) / f2) * 100;
        const imp_total = ((f1 - f3) / f1) * 100;

        improvements.push({
            component: op.name,
            f1, f2, f3,
            imp_f1_f2,
            imp_f2_f3,
            imp_total
        });
    });

    tbody.innerHTML = '';
    improvements.forEach(item => {
        const row = document.createElement('tr');
        const formatImprovement = (val) => {
            const className = val >= 0 ? 'improvement-positive' : 'improvement-negative';
            const sign = val >= 0 ? '+' : '';
            return `<span class="${className}">${sign}${val.toFixed(2)}%</span>`;
        };

        row.innerHTML = `
            <td>${item.component}</td>
            <td>${item.f1.toFixed(2)}</td>
            <td>${item.f2.toFixed(2)}</td>
            <td>${item.f3.toFixed(2)}</td>
            <td>${formatImprovement(item.imp_f1_f2)}</td>
            <td>${formatImprovement(item.imp_f2_f3)}</td>
            <td>${formatImprovement(item.imp_total)}</td>
        `;
        tbody.appendChild(row);
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.style.backgroundColor = '#f1f5f9';

    const f1Total = eolmedData.floaters[0].total_hours;
    const f2Total = eolmedData.floaters[1].total_hours;
    const f3Total = eolmedData.floaters[2].total_hours;

    const totalF1F2 = ((f1Total - f2Total) / f1Total) * 100;
    const totalF2F3 = ((f2Total - f3Total) / f2Total) * 100;
    const totalOverall = ((f1Total - f3Total) / f1Total) * 100;

    const formatImprovement = (val) => {
        const className = val >= 0 ? 'improvement-positive' : 'improvement-negative';
        const sign = val >= 0 ? '+' : '';
        return `<span class="${className}">${sign}${val.toFixed(2)}%</span>`;
    };

    totalRow.innerHTML = `
        <td>TOTAL</td>
        <td>${f1Total.toFixed(2)}</td>
        <td>${f2Total.toFixed(2)}</td>
        <td>${f3Total.toFixed(2)}</td>
        <td>${formatImprovement(totalF1F2)}</td>
        <td>${formatImprovement(totalF2F3)}</td>
        <td>${formatImprovement(totalOverall)}</td>
    `;
    tbody.appendChild(totalRow);
}

let eolmedSettings = {
    turbineCount: 10,
    learningRate: eolmedData.learning_curve.avg_learning_rate,
    bCoefficient: eolmedData.learning_curve.b_coefficient
};

function updateEolmedPredictions() {
    const predictions = calculatePredictionsForData(eolmedSettings.turbineCount, eolmedData);
    const lastPrediction = predictions[predictions.length - 1];

    const turbinesEl = document.getElementById('eolmed-predicted-turbines');
    const avgTimeEl = document.getElementById('eolmed-pred-avg-time');
    const totalTimeEl = document.getElementById('eolmed-pred-total-time');
    const savingsEl = document.getElementById('eolmed-pred-savings');

    if (turbinesEl) turbinesEl.textContent = eolmedSettings.turbineCount;
    if (avgTimeEl) avgTimeEl.textContent = `${lastPrediction.average.toFixed(1)} hours`;
    if (totalTimeEl) totalTimeEl.textContent = `${lastPrediction.cumulative.toFixed(1)} hours`;

    const baseTime = eolmedData.floaters[0].total_hours;
    const savings = ((baseTime - lastPrediction.average) / baseTime) * 100;
    if (savingsEl) savingsEl.textContent = `${savings.toFixed(1)}%`;
}

function setupEolmedEventListeners() {
    const turbineCountInput = document.getElementById('eolmed-turbine-count');
    const turbineCountValue = document.getElementById('eolmed-turbine-count-value');

    if (turbineCountInput) {
        turbineCountInput.addEventListener('input', (e) => {
            eolmedSettings.turbineCount = parseInt(e.target.value);
            if (turbineCountValue) turbineCountValue.textContent = eolmedSettings.turbineCount;
        });
    }

    const learningRateInput = document.getElementById('eolmed-learning-rate-adjust');
    const learningRateValue = document.getElementById('eolmed-learning-rate-adjust-value');

    if (learningRateInput) {
        learningRateInput.addEventListener('input', (e) => {
            eolmedSettings.learningRate = parseFloat(e.target.value);
            if (learningRateValue) learningRateValue.textContent = `${(eolmedSettings.learningRate * 100).toFixed(0)}%`;
            eolmedSettings.bCoefficient = Math.log(eolmedSettings.learningRate) / Math.log(2);
        });
    }

    const calculateBtn = document.getElementById('eolmed-calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            updateEolmedPredictions();
            updateEolmedCharts();
        });
    }

    const resetBtn = document.getElementById('eolmed-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            eolmedSettings.turbineCount = 10;
            eolmedSettings.learningRate = eolmedData.learning_curve.avg_learning_rate;
            eolmedSettings.bCoefficient = eolmedData.learning_curve.b_coefficient;

            if (turbineCountInput) turbineCountInput.value = 10;
            if (turbineCountValue) turbineCountValue.textContent = '10';
            if (learningRateInput) learningRateInput.value = eolmedSettings.learningRate;
            if (learningRateValue) learningRateValue.textContent = `${(eolmedSettings.learningRate * 100).toFixed(0)}%`;

            updateEolmedPredictions();
            updateEolmedCharts();
        });
    }
}

function updateEolmedCharts() {
    // Update scaling chart
    if (eolmedCharts.scaling) {
        eolmedCharts.scaling.destroy();
    }
    const scalingCtx = document.getElementById('eolmed-scaling-chart');
    if (scalingCtx) {
        const predictions = calculatePredictionsForData(eolmedSettings.turbineCount, eolmedData);
        const timeData = predictions.map(p => p.time);
        const avgData = predictions.map(p => p.average);

        eolmedCharts.scaling = new Chart(scalingCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: predictions.map(p => `T${p.turbine}`),
                datasets: [
                    {
                        label: 'Individual Assembly Time',
                        data: timeData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Average Assembly Time',
                        data: avgData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Eolmed - Predicted Performance for ${eolmedSettings.turbineCount} Turbines`,
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Time (hours)' }},
                    x: { title: { display: true, text: 'Turbine' }}
                }
            }
        });
    }
}

// ==================== COMPARISON TAB INITIALIZATION ====================
function initializeComparisonTab() {
    console.log('Initializing Comparison tab...');

    // Populate comparison summary table
    populateComparisonTable();

    // Create comparison charts
    createComparisonCharts();

    // Populate insights
    populateInsights();
}

function populateComparisonTable() {
    const tbody = document.getElementById('comparison-summary-table');
    if (!tbody) return;

    const metrics = [
        {
            name: 'Floater 1 Assembly Time',
            efgl: `${efglData.floaters[0].total_hours.toFixed(2)}h`,
            eolmed: `${eolmedData.floaters[0].total_hours.toFixed(2)}h`,
            diff: efglData.floaters[0].total_hours - eolmedData.floaters[0].total_hours
        },
        {
            name: 'Floater 3 Assembly Time',
            efgl: `${efglData.floaters[2].total_hours.toFixed(2)}h`,
            eolmed: `${eolmedData.floaters[2].total_hours.toFixed(2)}h`,
            diff: efglData.floaters[2].total_hours - eolmedData.floaters[2].total_hours
        },
        {
            name: 'Overall Improvement',
            efgl: `${efglData.learning_curve.overall_improvement_pct.toFixed(2)}%`,
            eolmed: `${eolmedData.learning_curve.overall_improvement_pct.toFixed(2)}%`,
            diff: eolmedData.learning_curve.overall_improvement_pct - efglData.learning_curve.overall_improvement_pct
        },
        {
            name: 'Learning Rate',
            efgl: `${(efglData.learning_curve.avg_learning_rate * 100).toFixed(0)}%`,
            eolmed: `${(eolmedData.learning_curve.avg_learning_rate * 100).toFixed(0)}%`,
            diff: (eolmedData.learning_curve.avg_learning_rate - efglData.learning_curve.avg_learning_rate) * 100
        },
        {
            name: 'Project Duration',
            efgl: `${efglData.project_metrics.total_project_days.toFixed(2)} days`,
            eolmed: `${eolmedData.project_metrics.total_project_days.toFixed(2)} days`,
            diff: efglData.project_metrics.total_project_days - eolmedData.project_metrics.total_project_days
        }
    ];

    tbody.innerHTML = metrics.map(m => `
        <tr>
            <td><strong>${m.name}</strong></td>
            <td>${m.efgl}</td>
            <td>${m.eolmed}</td>
            <td class="${m.diff > 0 ? 'difference-positive' : 'difference-negative'}">
                ${m.diff > 0 ? '+' : ''}${m.diff.toFixed(2)}${m.name.includes('%') || m.name.includes('Rate') ? '' : (m.name.includes('days') ? ' days' : 'h')}
            </td>
        </tr>
    `).join('');
}

function createComparisonCharts() {
    // Tower comparison chart
    const towerCtx = document.getElementById('comparison-tower-chart');
    if (towerCtx) {
        comparisonCharts.towers = new Chart(towerCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Tower Section 1', 'Tower Section 2', 'Tower Section 3'],
                datasets: [
                    {
                        label: 'EFGL Average',
                        data: [
                            (efglData.floaters[0].operations[0].duration + efglData.floaters[1].operations[0].duration + efglData.floaters[2].operations[0].duration) / 3,
                            (efglData.floaters[0].operations[1].duration + efglData.floaters[1].operations[1].duration + efglData.floaters[2].operations[1].duration) / 3,
                            (efglData.floaters[0].operations[2].duration + efglData.floaters[1].operations[2].duration + efglData.floaters[2].operations[2].duration) / 3
                        ],
                        backgroundColor: '#ef4444'
                    },
                    {
                        label: 'Eolmed Average',
                        data: [
                            (eolmedData.floaters[0].operations[0].duration + eolmedData.floaters[1].operations[0].duration + eolmedData.floaters[2].operations[0].duration) / 3,
                            (eolmedData.floaters[0].operations[1].duration + eolmedData.floaters[1].operations[1].duration + eolmedData.floaters[2].operations[1].duration) / 3,
                            (eolmedData.floaters[0].operations[2].duration + eolmedData.floaters[1].operations[2].duration + eolmedData.floaters[2].operations[2].duration) / 3
                        ],
                        backgroundColor: '#3b82f6'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Average Tower Erection Time: EFGL vs Eolmed', font: { size: 16, weight: 'bold' }}
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Duration (hours)' }}
                }
            }
        });
    }

    // Blade comparison chart
    const bladeCtx = document.getElementById('comparison-blade-chart');
    if (bladeCtx) {
        comparisonCharts.blades = new Chart(bladeCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Blade 1', 'Blade 2', 'Blade 3'],
                datasets: [
                    {
                        label: 'EFGL Average',
                        data: [
                            (efglData.floaters[0].operations[4].duration + efglData.floaters[1].operations[4].duration + efglData.floaters[2].operations[4].duration) / 3,
                            (efglData.floaters[0].operations[5].duration + efglData.floaters[1].operations[5].duration + efglData.floaters[2].operations[5].duration) / 3,
                            (efglData.floaters[0].operations[6].duration + efglData.floaters[1].operations[6].duration + efglData.floaters[2].operations[6].duration) / 3
                        ],
                        backgroundColor: '#ef4444'
                    },
                    {
                        label: 'Eolmed Average',
                        data: [
                            (eolmedData.floaters[0].operations[4].duration + eolmedData.floaters[1].operations[4].duration + eolmedData.floaters[2].operations[4].duration) / 3,
                            (eolmedData.floaters[0].operations[5].duration + eolmedData.floaters[1].operations[5].duration + eolmedData.floaters[2].operations[5].duration) / 3,
                            (eolmedData.floaters[0].operations[6].duration + eolmedData.floaters[1].operations[6].duration + eolmedData.floaters[2].operations[6].duration) / 3
                        ],
                        backgroundColor: '#3b82f6'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Average Blade Installation Time: EFGL vs Eolmed', font: { size: 16, weight: 'bold' }}
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Duration (hours)' }}
                }
            }
        });
    }

    // Learning curve comparison
    const learningCtx = document.getElementById('comparison-learning-curve');
    if (learningCtx) {
        comparisonCharts.learning = new Chart(learningCtx.getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'EFGL Actual',
                        data: efglData.floaters.map(f => ({ x: f.id, y: f.total_hours })),
                        borderColor: '#ef4444',
                        backgroundColor: '#ef4444',
                        pointRadius: 8,
                        borderWidth: 3
                    },
                    {
                        label: 'Eolmed Actual',
                        data: eolmedData.floaters.map(f => ({ x: f.id, y: f.total_hours })),
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        pointRadius: 8,
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Learning Curve Comparison', font: { size: 16, weight: 'bold' }}
                },
                scales: {
                    x: { type: 'linear', title: { display: true, text: 'Floater Number' }, min: 0, max: 4 },
                    y: { beginAtZero: true, title: { display: true, text: 'Assembly Time (hours)' }}
                }
            }
        });
    }

    // Total time progression
    const totalCtx = document.getElementById('comparison-total-time');
    if (totalCtx) {
        comparisonCharts.total = new Chart(totalCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Floater 1', 'Floater 2', 'Floater 3'],
                datasets: [
                    {
                        label: 'EFGL',
                        data: efglData.floaters.map(f => f.total_hours),
                        backgroundColor: '#ef4444'
                    },
                    {
                        label: 'Eolmed',
                        data: eolmedData.floaters.map(f => f.total_hours),
                        backgroundColor: '#3b82f6'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Total Assembly Time per Floater', font: { size: 16, weight: 'bold' }}
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Duration (hours)' }}
                }
            }
        });
    }

    // Combined Learning Curve Across Projects
    const combinedCtx = document.getElementById('combined-learning-curve');
    if (combinedCtx) {
        // Sequential data points: EFGL F1, F2, F3, then Eolmed F1, F2, F3
        // Using original F1-P1 value (58.33h) for total improvement visualization
        const combinedData = [
            { x: 1, y: 58.33, label: 'F1-P1', project: 'EFGL', note: 'Original (pre-correction)' },
            { x: 2, y: 32.33, label: 'F2-P1', project: 'EFGL' },
            { x: 3, y: 26.67, label: 'F3-P1', project: 'EFGL' },
            { x: 4, y: 28.00, label: 'F1-P2', project: 'Eolmed', note: 'Site setup penalty' },
            { x: 5, y: 21.67, label: 'F2-P2', project: 'Eolmed' },
            { x: 6, y: 20.00, label: 'F3-P2', project: 'Eolmed' }
        ];

        comparisonCharts.combined = new Chart(combinedCtx.getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'EFGL Project (P1)',
                        data: combinedData.slice(0, 3),
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 3,
                        segment: {
                            borderDash: [0, 0]
                        }
                    },
                    {
                        label: 'Eolmed Project (P2)',
                        data: combinedData.slice(3, 6),
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 3
                    },
                    {
                        label: 'Project Transition',
                        data: [combinedData[2], combinedData[3]],
                        borderColor: '#f59e0b',
                        backgroundColor: '#f59e0b',
                        borderWidth: 2,
                        borderDash: [10, 5],
                        pointRadius: 0,
                        showLine: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sequential Learning Progression: EFGL → Eolmed',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const dataPoint = context[0].raw;
                                return dataPoint.label + (dataPoint.note ? ' (' + dataPoint.note + ')' : '');
                            },
                            label: function(context) {
                                const dataPoint = context.raw;
                                const lines = [
                                    `Assembly Time: ${dataPoint.y.toFixed(2)} hours`,
                                    `Project: ${dataPoint.project}`
                                ];

                                // Add improvement calculation
                                if (context.dataIndex > 0) {
                                    const prevY = combinedData[context.dataIndex - 1 + (context.datasetIndex === 1 ? 3 : 0)].y;
                                    const improvement = ((prevY - dataPoint.y) / prevY * 100);
                                    if (context.datasetIndex < 2) {
                                        lines.push(`Improvement from previous: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);
                                    }
                                }

                                // Add total improvement from F1-P1
                                const totalImprovement = ((58.33 - dataPoint.y) / 58.33 * 100);
                                lines.push(`Total improvement from start: ${totalImprovement.toFixed(1)}%`);

                                return lines;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            projectDivider: {
                                type: 'line',
                                xMin: 3.5,
                                xMax: 3.5,
                                borderColor: '#9ca3af',
                                borderWidth: 2,
                                borderDash: [10, 5],
                                label: {
                                    content: 'Project Boundary',
                                    display: true,
                                    position: 'start',
                                    backgroundColor: 'rgba(156, 163, 175, 0.8)',
                                    color: 'white'
                                }
                            },
                            siteSetupPenalty: {
                                type: 'label',
                                xValue: 4,
                                yValue: 30,
                                content: ['⚠️ Site Setup', 'Penalty', '+5.0%'],
                                backgroundColor: 'rgba(245, 158, 11, 0.9)',
                                color: 'white',
                                font: {
                                    size: 11,
                                    weight: 'bold'
                                },
                                padding: 6,
                                borderRadius: 4
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0.5,
                        max: 6.5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const labels = ['', 'F1', 'F2', 'F3', 'F1', 'F2', 'F3', ''];
                                return labels[value] || '';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Sequential Assembly (◄─ EFGL (P1) ─►  ◄─ Eolmed (P2) ─►)',
                            font: { size: 12 }
                        },
                        grid: {
                            color: function(context) {
                                return context.tick.value === 3.5 ? '#9ca3af' : 'rgba(0, 0, 0, 0.1)';
                            },
                            lineWidth: function(context) {
                                return context.tick.value === 3.5 ? 2 : 1;
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 65,
                        title: {
                            display: true,
                            text: 'Assembly Time (hours)'
                        }
                    }
                }
            }
        });
    }
}

function populateInsights() {
    const towerEfglAvg = efglData.floaters.reduce((sum, f) => sum + f.operations[0].duration + f.operations[1].duration + f.operations[2].duration, 0) / 3;
    const towerEolmedAvg = eolmedData.floaters.reduce((sum, f) => sum + f.operations[0].duration + f.operations[1].duration + f.operations[2].duration, 0) / 3;
    const towerDiff = ((towerEfglAvg - towerEolmedAvg) / towerEfglAvg * 100);

    const bladeEfglAvg = efglData.floaters.reduce((sum, f) => sum + f.operations[4].duration + f.operations[5].duration + f.operations[6].duration, 0) / 3;
    const bladeEolmedAvg = eolmedData.floaters.reduce((sum, f) => sum + f.operations[4].duration + f.operations[5].duration + f.operations[6].duration, 0) / 3;
    const bladeDiff = ((bladeEfglAvg - bladeEolmedAvg) / bladeEfglAvg * 100);

    document.getElementById('insight-towers').textContent =
        `Eolmed achieved ${Math.abs(towerDiff).toFixed(1)}% ${towerDiff > 0 ? 'faster' : 'slower'} average tower erection times compared to EFGL, demonstrating ${towerDiff > 0 ? 'improved' : 'different'} methodologies in tower installation.`;

    document.getElementById('insight-blades').textContent =
        `Blade installation shows ${Math.abs(bladeDiff).toFixed(1)}% ${bladeDiff > 0 ? 'improvement' : 'difference'} in Eolmed, indicating ${bladeDiff > 0 ? 'significant learning from EFGL experience' : 'varying approaches'}.`;

    const overallDiff = efglData.project_metrics.total_project_days - eolmedData.project_metrics.total_project_days;
    document.getElementById('insight-overall').textContent =
        `Overall project duration: EFGL completed in ${efglData.project_metrics.total_project_days.toFixed(1)} days while Eolmed took ${eolmedData.project_metrics.total_project_days.toFixed(1)} days, ${overallDiff > 0 ? 'showing' : 'indicating'} ${Math.abs(overallDiff).toFixed(1)} days ${overallDiff > 0 ? 'improvement' : 'difference'}.`;

    document.getElementById('insight-learning').textContent =
        `EFGL's learning rate of ${(efglData.learning_curve.avg_learning_rate * 100).toFixed(0)}% compared to Eolmed's ${(eolmedData.learning_curve.avg_learning_rate * 100).toFixed(0)}% indicates that ${eolmedData.learning_curve.avg_learning_rate > efglData.learning_curve.avg_learning_rate ? 'Eolmed had a slower learning curve' : 'EFGL had a slower learning curve'}, benefiting from iterative process improvements.`;
}

// ==================== INITIALIZATION ====================
function init() {
    console.log('Initializing Turbine Assembly Visualization...');

    // Setup tab navigation first
    setupTabNavigation();

    // Create EFGL charts (Tab 1)
    createTimelineChart();
    // createLearningCurveChart(); // REMOVED - redundant with scaling chart
    createComponentChart();
    createScalingChart();
    createUtilizationChart();
    createUtilizationBarChart(); // Pattern 3 chart

    // Populate data table
    populateDataTable();

    // Update predictions
    updatePredictions();

    // Initialize learning rate method selector
    initializeLearningRateMethod();

    // Setup event listeners
    setupEventListeners();

    console.log('Initialization complete!');
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);
