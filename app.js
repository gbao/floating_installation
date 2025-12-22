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
                { name: "Tower Section 3", duration: 24.333333 },
                { name: "Nacelle", duration: 4.333333 },
                { name: "Blade 1", duration: 4.833333 },
                { name: "Blade 2", duration: 4.666667 },
                { name: "Blade 3", duration: 2.5 }
            ],
            total_hours: 58.33,
            total_days: 2.43
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
        avg_learning_rate: 0.6895,
        b_coefficient: -0.5363,
        f1_to_f2_improvement_pct: 44.57,
        f2_to_f3_improvement_pct: 17.53,
        overall_improvement_pct: 54.29
    },
    project_metrics: {
        total_project_days: 104.78,
        avg_time_per_wtg_days: 34.93,
        crane_utilization_pct: 4.67
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
    learningRate: 0.6895,
    bCoefficient: -0.5363
};

// ==================== TAB MANAGEMENT ====================
function switchTab(tabName) {
    currentTab = tabName;

    // Update URL hash
    window.location.hash = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.add('active');
    }

    // Initialize tab-specific content
    if (tabName === 'eolmed' && !document.getElementById('eolmed-metrics')) {
        initializeEolmedTab();
    } else if (tabName === 'comparison' && !comparisonCharts.towers) {
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
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} hours`;
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
    const ctx = document.getElementById('learning-curve-chart').getContext('2d');

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
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
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

    const timeData = predictions.map(p => p.time);
    const avgData = predictions.map(p => p.average);

    charts.scaling = new Chart(ctx, {
        type: 'line',
        data: {
            labels: predictions.map(p => `T${p.turbine}`),
            datasets: [
                {
                    label: 'Individual Assembly Time',
                    data: timeData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Average Assembly Time',
                    data: avgData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Predicted Performance for ${currentSettings.turbineCount} Turbines`,
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
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (hours)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Turbine'
                    }
                }
            }
        }
    });
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

    document.getElementById('predicted-turbines').textContent = currentSettings.turbineCount;
    document.getElementById('pred-avg-time').textContent = `${lastPrediction.average.toFixed(1)} hours`;
    document.getElementById('pred-total-time').textContent = `${lastPrediction.cumulative.toFixed(1)} hours`;

    const baseTime = turbineData.floaters[0].total_hours;
    const savings = ((baseTime - lastPrediction.average) / baseTime) * 100;
    document.getElementById('pred-savings').textContent = `${savings.toFixed(1)}%`;
}

// ==================== EVENT LISTENERS ====================
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
        currentSettings.learningRate = parseFloat(e.target.value);
        learningRateValue.textContent = `${(currentSettings.learningRate * 100).toFixed(0)}%`;
        currentSettings.bCoefficient = Math.log(currentSettings.learningRate) / Math.log(2);
    });

    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', () => {
        updatePredictions();
        updateCharts();
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        currentSettings.turbineCount = 10;
        currentSettings.learningRate = 0.6895;
        currentSettings.bCoefficient = -0.5363;

        turbineCountInput.value = 10;
        turbineCountValue.textContent = '10';
        learningRateInput.value = 0.6895;
        learningRateValue.textContent = '69%';

        updatePredictions();
        updateCharts();
    });
}

function updateCharts() {
    // Update scaling chart
    if (charts.scaling) {
        charts.scaling.destroy();
    }
    createScalingChart();

    // Update learning curve chart
    if (charts.learningCurve) {
        charts.learningCurve.destroy();
    }
    createLearningCurveChart();
}

// ==================== EOLMED TAB INITIALIZATION ====================
function initializeEolmedTab() {
    console.log('Initializing Eolmed tab...');

    const placeholder = document.getElementById('eolmed-content-placeholder');
    if (!placeholder) return;

    // Create Eolmed content structure (clone of EFGL structure)
    const eolmedHTML = `
        <section class="metrics-grid" id="eolmed-metrics">
            <div class="metric-card">
                <div class="metric-label">Overall Improvement</div>
                <div class="metric-value">${eolmedData.learning_curve.overall_improvement_pct}%</div>
                <div class="metric-desc">Floater 1 → 3</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Learning Rate</div>
                <div class="metric-value">${(eolmedData.learning_curve.avg_learning_rate * 100).toFixed(0)}%</div>
                <div class="metric-desc">Wright's Model</div>
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

        <section class="chart-section">
            <h2>Component Assembly Timeline - All Floaters</h2>
            <div class="chart-container">
                <canvas id="eolmed-timeline-chart"></canvas>
            </div>
        </section>

        <section class="chart-section">
            <h2>Learning Curve Progression</h2>
            <div class="chart-container">
                <canvas id="eolmed-learning-curve-chart"></canvas>
            </div>
        </section>

        <section class="chart-section">
            <h2>Component-Level Efficiency Improvements</h2>
            <div class="chart-container">
                <canvas id="eolmed-component-chart"></canvas>
            </div>
        </section>
    `;

    placeholder.innerHTML = eolmedHTML;

    // Create Eolmed charts
    createEolmedCharts();
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
    createLearningCurveChart();
    createComponentChart();
    createScalingChart();
    createUtilizationChart();

    // Populate data table
    populateDataTable();

    // Update predictions
    updatePredictions();

    // Setup event listeners
    setupEventListeners();

    console.log('Initialization complete!');
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);
