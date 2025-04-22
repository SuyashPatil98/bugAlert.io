def load_data(file_path):
    # Function to load data from a specified file path
    import pandas as pd
    data = pd.read_csv(file_path)
    return data

def clean_data(data):
    # Function to clean the data
    # Example: Remove duplicates and handle missing values
    data = data.drop_duplicates()
    data = data.fillna(method='ffill')
    return data

def transform_data(data):
    # Function to transform the data
    # Example: Normalize numerical features
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    numerical_cols = data.select_dtypes(include=['float64', 'int']).columns
    data[numerical_cols] = scaler.fit_transform(data[numerical_cols])
    return data

def save_processed_data(data, output_path):
    # Function to save the processed data to a specified output path
    data.to_csv(output_path, index=False)

def preprocess(file_path, output_path):
    # Main function to execute the preprocessing steps
    data = load_data(file_path)
    data = clean_data(data)
    data = transform_data(data)
    save_processed_data(data, output_path)