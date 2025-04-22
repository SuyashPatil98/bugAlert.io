import os
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load the trained model
model_path = os.path.join('src', 'packaging', 'model.pkl')
model = joblib.load(model_path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    prediction = model.predict([data['features']])
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)