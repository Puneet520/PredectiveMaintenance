from flask import Flask, jsonify, render_template, send_file, session, redirect, url_for, request
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
# import gspread
# from oauth2client.service_account import ServiceAccountCredentials
import json
import time
from datetime import datetime
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for session management

# Custom JSON encoder to handle types that aren't JSON serializable by default
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.bool_):
            return bool(obj)
        return super().default(obj)

app.json_encoder = CustomJSONEncoder

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('landing'))
        return f(*args, **kwargs)
    return decorated_function

# --------- Define Alert Thresholds ---------
THRESHOLDS = {
    'temperature': {'warning': 80, 'critical': 90},
    'pressure': {'warning': 9, 'critical': 10},
    'vibration': {'warning': 15, 'critical': 20},
    'current': {'warning': 19, 'critical': 21}
}

# Cache for data processing
data_cache = []
last_processed_index = 0
trained_model = None
all_data_processed = False

# --------- Load Data from CSV ---------
def load_all_data():
    try:
        # # Refresh credentials if needed
        # global client, sheet
        # if getattr(client, '_auth', None) and hasattr(client._auth, 'token_expiry'):
        #     if client._auth.token_expiry <= datetime.now():
        #         client = gspread.authorize(creds)
        #         sheet = client.open("lala_realtime").sheet1
        
        # data = sheet.get_all_records()
        # df = pd.DataFrame(data)
        df = pd.read_csv('sensor_data.csv')
        
        # Ensure all required columns exist
        required_columns = ['timestamp', 'temperature', 'pressure', 'vibration', 'current']
        for col in required_columns:
            if col not in df.columns:
                print(f"Missing required column: {col}")
                # Create timestamp column if missing
                if col == 'timestamp':
                    df['timestamp'] = [datetime.now().strftime("%Y-%m-%d %H:%M:%S") for _ in range(len(df))]
                else:
                    df[col] = 0  # Add column with default values
        
        df = df[required_columns]  # Select only needed columns
        df.dropna(subset=['temperature', 'pressure', 'vibration', 'current'], inplace=True)
        
        # Fix timestamp issues - set current time if timestamp is null/empty
        df['timestamp'] = df['timestamp'].apply(lambda x: 
                                           datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
                                           if x is None or str(x).strip() == "" or str(x).lower() == "null" 
                                           else x)
        
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return pd.DataFrame()

# --------- Load New Data Only ---------
def load_new_data(last_index=0):
    global last_processed_index, all_data_processed
    df = load_all_data()
    if df.empty:
        return pd.DataFrame()
    
    # Only process new rows
    if last_index < len(df):
        new_df = df.iloc[last_index:]
        last_processed_index = len(df)
        return new_df
    else:
        all_data_processed = True
        return pd.DataFrame()

# --------- Train Isolation Forest Model ---------
def train_model(df):
    global trained_model
    if trained_model is None or len(df) > 100:  # Retrain if dataset is large
        model = IsolationForest(contamination=0.05, random_state=42)
        features_df = df[['temperature', 'pressure', 'vibration', 'current']].astype(float)
        model.fit(features_df)
        trained_model = model
        return model
    return trained_model

# --------- Process Data Function ---------
def process_data(df, is_incremental=False):
    if df.empty:
        return []
    
    # Select numerical features
    features_df = df[['temperature', 'pressure', 'vibration', 'current']].astype(float)
    
    # Train or use cached model
    model = train_model(features_df)
    
    # Make predictions
    predictions = model.predict(features_df)
    
    # Process each reading
    processed_data = []
    for i, row in df.iterrows():
        reading = row.to_dict()
        # Check traditional alerts
        traditional_alerts = {}
        for sensor in ['temperature', 'pressure', 'vibration', 'current']:
            try:
                value = float(reading.get(sensor, 0))
            except:
                value = 0
                
            if value >= THRESHOLDS[sensor]['critical']:
                level = 'critical'
            elif value >= THRESHOLDS[sensor]['warning']:
                level = 'warning'
            else:
                level = 'normal'
                
            traditional_alerts[sensor] = {'value': value, 'level': level}
        
        # Check ML anomaly for this row's index in the predictions array
        idx = df.index.get_loc(i)
        ml_anomaly = bool(predictions[idx] == -1)
        
        # Get timestamp - use current time if null
        timestamp = reading['timestamp']
        if timestamp is None or str(timestamp).strip() == "" or str(timestamp).lower() == "null":
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        processed_data.append({
            "timestamp": str(timestamp),
            "temperature": float(reading['temperature']),
            "pressure": float(reading['pressure']),
            "vibration": float(reading['vibration']),
            "current": float(reading['current']),
            "traditional_alerts": traditional_alerts,
            "ml_anomaly": ml_anomaly
        })
    
    # If incremental processing, add processing delay for realistic effect
    if is_incremental:
        time.sleep(0.8)  # Increased delay for more realistic processing
    
    return processed_data

# --------- Process Initial Data (limited amount) ---------
def process_initial_data(limit=5):
    df = load_all_data()
    if df.empty:
        return []
    
    # Only process first few readings for initial display
    initial_df = df.head(limit)
    processed_data = process_data(initial_df)
    
    # Update last processed index
    global last_processed_index
    last_processed_index = limit
    
    return processed_data

# --------- Process Next Batch (for realistic incremental loading) ---------
def process_next_batch(batch_size=1):
    global data_cache, last_processed_index, all_data_processed
    df = load_all_data()
    if df.empty or last_processed_index >= len(df):
        all_data_processed = True
        return []
    
    # Calculate end index for this batch
    end_idx = min(last_processed_index + batch_size, len(df))
    
    # Process next batch
    batch_df = df.iloc[last_processed_index:end_idx]
    processed_data = process_data(batch_df, is_incremental=True)
    
    # Update last processed index
    last_processed_index = end_idx
    
    # Check if we've processed all data
    if last_processed_index >= len(df):
        all_data_processed = True
    
    # Update cache
    if data_cache:
        data_cache.extend(processed_data)
    else:
        data_cache = processed_data
    
    return processed_data

# --------- Flask Routes ---------
@app.route('/')
def landing():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('lnd.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('index.html')

@app.route('/auth/google', methods=['POST'])
def google_auth():
    try:
        # Get the credential from the request
        credential = request.json.get('credential')
        if not credential:
            return jsonify({'error': 'No credential provided'}), 400

        # Here you would typically verify the credential with Google
        # For demo purposes, we'll just store it in the session
        session['user'] = {
            'name': 'Demo User',
            'email': 'demo@example.com'
        }
        
        return jsonify({'status': 'success', 'redirect': url_for('dashboard')})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('landing'))

@app.route('/initial-data')
@login_required
def get_initial_data():
    global all_data_processed
    all_data_processed = False
    processed_data = process_initial_data(limit=3)  # Start with just 3 points
    if not processed_data:
        return jsonify({"error": "No data available"}), 404
    
    return jsonify({
        "data": processed_data,
        "total_records": len(processed_data),
        "all_processed": all_data_processed
    })

@app.route('/next-batch')
@login_required
def get_next_batch():
    processed_data = process_next_batch(batch_size=1)  # Process 1 at a time for realism
    
    return jsonify({
        "data": processed_data,
        "total_records": len(processed_data),
        "all_processed": all_data_processed
    })

@app.route('/status')
@login_required
def get_status():
    return jsonify({
        "all_processed": all_data_processed,
        "records_processed": len(data_cache),
        "user": session.get('user')  # Add user information to the response
    })

@app.route('/all-data')
@login_required
def get_all_data():
    global data_cache
    if data_cache:
        return jsonify({
            "data": data_cache,
            "total_records": len(data_cache),
            "all_processed": all_data_processed
        })
    
    # If cache is empty, process all at once (fallback)
    df = load_all_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 404
    
    processed_data = process_data(df)
    data_cache = processed_data
    all_data_processed = True
    
    return jsonify({
        "data": processed_data,
        "total_records": len(processed_data),
        "all_processed": all_data_processed
    })

@app.route('/refresh-data')
@login_required
def refresh_data():
    """Manually refresh data from CSV"""
    global last_processed_index, data_cache, all_data_processed
    # Reset processing index to start fresh
    last_processed_index = 0
    data_cache = []
    all_data_processed = False
    return jsonify({"status": "success", "message": "Data cache cleared and will reload from CSV"})

@app.route('/download/log.csv')
@login_required
def download_log():
    df = load_all_data()
    if not df.empty:
        # Add anomaly detection
        features_df = df[['temperature', 'pressure', 'vibration', 'current']].astype(float)
        model = train_model(features_df)
        predictions = model.predict(features_df)
        df['ml_anomaly'] = [1 if x == -1 else 0 for x in predictions]
        
        # Add traditional alerts
        for sensor in ['temperature', 'pressure', 'vibration', 'current']:
            df[f'{sensor}_alert'] = df[sensor].apply(
                lambda x: 'critical' if float(x) >= THRESHOLDS[sensor]['critical'] 
                else 'warning' if float(x) >= THRESHOLDS[sensor]['warning'] 
                else 'normal'
            )
        
        # Save to temporary file
        temp_file = "temp_log.csv"
        df.to_csv(temp_file, index=False)
        
        return send_file(temp_file, as_attachment=True, download_name="anomaly_log.csv")
    
    return jsonify({"error": "No data available for download"}), 404

# --------- Run App ---------
if __name__ == '__main__':
    app.run(debug=True)