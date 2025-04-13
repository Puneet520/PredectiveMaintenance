// Configuration
const CONFIG = {
    trendWindow: 10,
    updateInterval: 2000,
    maxChartPoints: 30,
    processingDelay: 1200,
    processingVariation: 400,
    initialDataPoints: 5
};

// Data storage
const trendData = {
    temperature: [],
    pressure: [],
    vibration: [],
    current: []
};

// State tracking
let isProcessing = false;
let processingIndicator = null;
let sensorChart = null;
let dataCounter = 0;

// Sound effects
const warningSound = new Audio('/static/sounds/warning.mp3');
const criticalSound = new Audio('/static/sounds/critical.mp3');

// Notification permission
if ('Notification' in window) {
    Notification.requestPermission();
}

function playAlertSound(level) {
    if (level === 'critical') {
        criticalSound.play();
    } else if (level === 'warning') {
        warningSound.play();
    }
}

function showBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/static/images/alert-icon.png'
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('sensorChart').getContext('2d');

    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }

    createProcessingIndicator();

    sensorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                },
                {
                    label: 'Pressure (bar)',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                },
                {
                    label: 'Vibration (mm/s)',
                    data: [],
                    borderColor: 'rgb(255, 205, 86)',
                    backgroundColor: 'rgba(255, 205, 86, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                },
                {
                    label: 'Current (A)',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuad'
            },
            scales: {
                x: {
                    title: { display: true, text: 'Timestamp', color: '#aaa' },
                    ticks: { color: '#aaa', maxRotation: 45, minRotation: 45 },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#aaa' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }
            }
        }
    });

    function createProcessingIndicator() {
        const container = document.querySelector('.mb-8') || document.getElementById('sensorChart').parentNode;
        processingIndicator = document.createElement('div');
        processingIndicator.className = 'bg-blue-800 text-white px-4 py-2 rounded-lg mb-4 flex items-center justify-between';
        processingIndicator.innerHTML = `
            <div class="flex items-center">
                <div class="animate-pulse mr-2">⚙️</div>
                <span>Processing sensor data...</span>
            </div>
            <div class="text-sm bg-blue-900 px-2 py-1 rounded">
                <span id="dataCounter">0</span> readings processed
            </div>
        `;
        container.after(processingIndicator);
        processingIndicator.style.display = 'none';
    }

    function showProcessingIndicator() {
        if (processingIndicator) processingIndicator.style.display = 'flex';
    }

    function hideProcessingIndicator() {
        if (processingIndicator) processingIndicator.style.display = 'none';
    }

    function updateDataCounter() {
        const counterElement = document.getElementById('dataCounter');
        if (counterElement) counterElement.textContent = dataCounter;
    }

    function calculateTrendStats(dataArray) {
        if (dataArray.length === 0) return { average: 0, min: 0, max: 0 };
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;
        const min = Math.min(...dataArray);
        const max = Math.max(...dataArray);
        return {
            average: average.toFixed(2),
            min: min.toFixed(2),
            max: max.toFixed(2)
        };
    }

    function updateTrendAnalysis(temp, pressure, vib, current) {
        trendData.temperature.push(temp);
        trendData.pressure.push(pressure);
        trendData.vibration.push(vib);
        trendData.current.push(current);

        if (trendData.temperature.length > CONFIG.trendWindow) {
            trendData.temperature.shift();
            trendData.pressure.shift();
            trendData.vibration.shift();
            trendData.current.shift();
        }

        const updateTrendElement = (id, stats) => {
            const element = document.getElementById(id);
            if (element) {
                element.querySelector('.text-blue-400').textContent = stats.average;
                element.querySelector('.text-green-400').textContent = stats.min;
                element.querySelector('.text-red-400').textContent = stats.max;
            }
        };

        updateTrendElement('tempTrend', calculateTrendStats(trendData.temperature));
        updateTrendElement('pressureTrend', calculateTrendStats(trendData.pressure));
        updateTrendElement('vibrationTrend', calculateTrendStats(trendData.vibration));
        updateTrendElement('currentTrend', calculateTrendStats(trendData.current));
    }

    function formatTimestamp(date = new Date()) {
        return date.toLocaleTimeString(); // Using time-only format for cleaner display
    }

    function updateAlerts(traditional_alerts, ml_anomaly, temp, pressure, vib, current, timestamp) {
        const traditionalDiv = document.getElementById('traditionalAlerts');
        const mlDiv = document.getElementById('mlAlerts');
        const tableBody = document.getElementById('sensorTable');

        if (timestamp) {
            traditionalDiv.innerHTML = '';
            mlDiv.innerHTML = '';
        }

        let hasCritical = false, hasWarning = false;

        for (const [sensor, data] of Object.entries(traditional_alerts)) {
            const { value, level } = data;
            let alertClass = 'bg-gray-500 text-white', emoji = '⚠️';

            if (level === 'critical') {
                hasCritical = true;
                playAlertSound('critical');
                showBrowserNotification('Critical Alert', `${sensor} = ${value}`);
                if (sensor === 'temperature') emoji = '🔥';
                else if (sensor === 'vibration') emoji = '🔧';
                alertClass = 'bg-red-600 text-white';
            } else if (level === 'warning') {
                hasWarning = true;
                playAlertSound('warning');
                if (sensor === 'pressure') alertClass = 'bg-blue-500 text-white';
                else if (sensor === 'vibration') alertClass = 'bg-yellow-400 text-black';
            }

            traditionalDiv.innerHTML += `<span class="${alertClass} px-3 py-1 rounded">${emoji} ${sensor} ${value}</span> `;
        }

        if (ml_anomaly) {
            mlDiv.innerHTML = `<span class="bg-purple-600 text-white px-3 py-1 rounded animate-pulse">🤖 ML Anomaly Detected</span>`;
            if (!hasCritical && !hasWarning) {
                playAlertSound('warning');
                showBrowserNotification('ML Anomaly', 'ML model detected abnormal data');
            }
        } else {
            mlDiv.innerHTML = `<span class="bg-green-600 text-white px-3 py-1 rounded">✅ Normal</span>`;
        }

        // Always create a properly formatted timestamp for the table
        const formattedTimestamp = formatTimestamp();
        
        if (tableBody) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedTimestamp}</td>
                <td>${temp}</td>
                <td>${pressure}</td>
                <td>${vib}</td>
                <td>${current}</td>
                <td>${ml_anomaly ? 'Anomaly' : 'Normal'}</td>
            `;
            tableBody.prepend(row);
        }
    }

    function addChartData(timestamp, temp, pressure, vib, current) {
        if (sensorChart.data.labels.length >= CONFIG.maxChartPoints) {
            sensorChart.data.labels.shift();
            for (let dataset of sensorChart.data.datasets) {
                dataset.data.shift();
            }
        }

        sensorChart.data.labels.push(timestamp);
        sensorChart.data.datasets[0].data.push(temp);
        sensorChart.data.datasets[1].data.push(pressure);
        sensorChart.data.datasets[2].data.push(vib);
        sensorChart.data.datasets[3].data.push(current);
        sensorChart.update();
    }

    function simulateFetchReading() {
        const temp = +(Math.random() * 40 + 20).toFixed(2);
        const pressure = +(Math.random() * 2 + 1).toFixed(2);
        const vibration = +(Math.random() * 10).toFixed(2);
        const current = +(Math.random() * 10).toFixed(2);

        const traditional_alerts = {
            temperature: {
                value: temp,
                level: temp > 55 ? 'critical' : temp > 45 ? 'warning' : 'normal'
            },
            pressure: {
                value: pressure,
                level: pressure > 3.5 ? 'critical' : pressure > 2.5 ? 'warning' : 'normal'
            },
            vibration: {
                value: vibration,
                level: vibration > 7 ? 'critical' : vibration > 5 ? 'warning' : 'normal'
            },
            current: {
                value: current,
                level: current > 8 ? 'critical' : current > 6 ? 'warning' : 'normal'
            }
        };

        const ml_anomaly = Math.random() < 0.1;

        return {
            temperature: temp,
            pressure,
            vibration,
            current,
            timestamp: formatTimestamp(),
            traditional_alerts,
            ml_anomaly
        };
    }

    function fetchDataAndUpdate() {
        if (isProcessing) return;

        isProcessing = true;
        showProcessingIndicator();

        setTimeout(() => {
            const {
                temperature,
                pressure,
                vibration,
                current,
                timestamp,
                traditional_alerts,
                ml_anomaly
            } = simulateFetchReading();

            addChartData(timestamp, temperature, pressure, vibration, current);
            updateTrendAnalysis(temperature, pressure, vibration, current);
            updateAlerts(traditional_alerts, ml_anomaly, temperature, pressure, vibration, current, timestamp);

            dataCounter++;
            updateDataCounter();

            isProcessing = false;
            hideProcessingIndicator();
        }, CONFIG.processingDelay + Math.random() * CONFIG.processingVariation);
    }

    // Initialize with some data points
    for (let i = 0; i < CONFIG.initialDataPoints; i++) {
        fetchDataAndUpdate();
    }

    setInterval(fetchDataAndUpdate, CONFIG.updateInterval);
});