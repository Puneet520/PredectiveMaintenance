🚀 Predictive Maintenance for Smart Manufacturing
💡 Overview
Welcome to our intelligent Predictive Maintenance System designed for Smart Manufacturing environments. This project harnesses the power of real-time sensor data, machine learning, and interactive 3D visualization to predict equipment failures before they occur—minimizing downtime and maximizing operational efficiency.

🎯 Problem Statement
In modern manufacturing, unexpected equipment failures can lead to significant delays and losses. Our solution leverages real-time sensor data, anomaly detection algorithms, and predictive forecasting to alert factory managers about potential issues before they become critical.

We aim to simulate real-world industrial conditions, detect equipment faults before they happen, and visualize trends to support proactive decision-making.

🧠 Key Features
🔍 Anomaly Detection using Isolation Forest & statistical techniques

📈 Predictive Failure Forecasting powered by ML models

🖥 3D Monitoring Dashboard with interactive equipment simulation via Three.js

⏱ Real-Time Sensor Streaming via Google Sheets + Python + Flask

🛠 Smart Maintenance Scheduling integration

📊 Historical Data Analysis & visualization using D3.js or Plotly

🔧 Technologies Used
Front-End	Back-End	ML & Data	Auth & Cloud
HTML5, CSS3	Python (Flask)	Pandas, Scikit-learn	Google Auth API
JavaScript (ES6)	RESTful APIs	Isolation Forest	Google Sheets API
Three.js (3D)	Data Fetching via Flask	CSV & JSON Sensor Data	Google Cloud Platform
Chart.js / Plotly	Template Rendering (Jinja2)	Anomaly Threshold Tuning	GCP IAM & Auth
🌐 Architecture Overview
static/
│
├── images/
│   └── (Folder for static image assets)
│
├── sounds/
│   └── (Folder for static sound assets)
│
├── pr.js
│   └── (JavaScript file, likely for handling pull requests or related functionality)
│
├── profile.js
│   └── (JavaScript file, possibly for user profile management)
│
├── script.js
│   └── (Main JavaScript file for the application)
│
├── scripts.js
│   └── (Additional JavaScript file for various scripts)
│
└── templates/
    ├── index.html
    │   └── (Main HTML template file)
    │
    └── Lnd.html
        └── (Additional HTML template file)

app.py
├── machine_failure_dataset.csv
│   └── (CSV dataset file, likely used for machine failure analysis)
│
├── realtimelala-d3148a75b442.json
│   └── (JSON file, possibly for real-time data or configuration)
│
├── sensor_data.csv
│   └── (CSV file containing sensor data)
│
├── sensor_data.json
│   └── (JSON file containing sensor data)
│
└── temp_log.csv
    └── (CSV file for logging temperature data)
🛠 Setup & Installation
=====================================================================🚀 Getting Started==========================================================================================================================
Clone the Repository:

First, you need to clone the repository to your local machine. Open your terminal and run:
Copy
git clone https://github.com/your-username/your-repo.git
cd your-repo
Set Up the Environment:

Ensure you have Python and Node.js installed on your machine. You can download them from their official websites:
Python 🐍
Node.js 🌐
Install Dependencies:

Navigate to the project directory and install the required dependencies. For the Python part, you can use pip:
Copy
pip install -r requirements.txt
For the JavaScript part, use npm:
Copy
npm install
Run the Python Application:

The main application logic is in app.py. You can run it using:
Copy
python app.py
This will start the application, and it will process the data from the CSV and JSON files. 📊
Serve the Static Files:

If you want to serve the static files (HTML, images, sounds), you can use a simple HTTP server. Navigate to the static directory and run:
Copy
python -m http.server 8000
Open your browser and go to http://localhost:8000 to see the static content. 🌐
Run the JavaScript Files:

If you have any JavaScript files that need to be run (e.g., for frontend functionality), you can open them in your browser or use a tool like live-server to serve them:
Copy
npm install -g live-server
live-server
This will start a local server and automatically open your default browser to display the content. 💻
Explore the Data:

The application processes data from various files like machine_failure_dataset.csv, sensor_data.csv, and temp_log.csv. You can explore these files to understand the data being used. 📈
The JSON files like realtimelala-d3148a75b442.json and sensor_data.json contain real-time data and sensor information.
Contribute:


📸 Demo Preview
![WhatsApp Image 2025-04-13 at 14 18 19_ab1b90e3](https://github.com/user-attachments/assets/ea23110c-772a-4a9f-a260-56c29baaa137)

![WhatsApp Image 2025-04-13 at 14 18 20_76499d44](https://github.com/user-attachments/assets/ad08771f-bf0a-442f-a13c-d8216f52fdf2)
![WhatsApp Image 2025-04-13 at 14 18 20_5152583f](https://github.com/user-attachments/assets/705bd940-dbb2-4f19-9aef-db7c701df31d)
![WhatsApp Image 2025-04-13 at 14 18 22_3b3e9339](https://github.com/user-attachments/assets/be6ed9b1-df95-41fb-8024-15a9e0501a23)



![Screenshot 2025-04-13 142943](https://github.com/user-attachments/assets/9a1b4e75-7b1f-4a72-9c13-0ddbb2e93a2c)
![WhatsApp Image 2025-04-13 at 14 30 36_1a4cdc75](https://github.com/user-attachments/assets/e0e4d4af-88d4-4a75-8694-e2c3f33ce9da)
🤝 Contribution Guidelines
We welcome contributions! Please open an issue first to discuss what you'd like to change. Fork this repo, create a branch, and submit a pull request.
