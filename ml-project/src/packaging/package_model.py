import joblib
import os

def save_model(model, model_name):
    model_dir = 'models'
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, model_name)
    joblib.dump(model, model_path)
    print(f'Model saved to {model_path}')

def load_model(model_name):
    model_path = os.path.join('models', model_name)
    model = joblib.load(model_path)
    print(f'Model loaded from {model_path}')
    return model