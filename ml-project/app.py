import joblib
import numpy as np
from flask import Flask, request, jsonify

# Initialize Flask app
app = Flask(__name__)

# Load models
rf_model = joblib.load('random_forest_model.pkl')
xgb_model = joblib.load('xgboost_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    # Parse input JSON
    data = request.get_json()
    features = np.array(data['features']).reshape(1, -1)  # Ensure input is 2D

    # Predict using both models
    rf_prediction = rf_model.predict(features).tolist()
    xgb_prediction = xgb_model.predict(features).tolist()

    # Return predictions
    return jsonify({
        'RandomForest': rf_prediction,
        'XGBoost': xgb_prediction
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)