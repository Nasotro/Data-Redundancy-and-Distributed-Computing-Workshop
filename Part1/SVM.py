import json
import numpy as np
import joblib
from flask import Flask, request, jsonify
from sklearn.datasets import load_breast_cancer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from pyngrok import ngrok

# Kill any previous ngrok session
ngrok.kill()

# Charger le dataset
cancer = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(cancer.data, cancer.target, test_size=0.2, random_state=42)

# Entraîner un modèle
model = SVC(gamma='auto')
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
# Sauvegarder le modèle
joblib.dump(model, "svc.pkl")

# Charger le modèle
model = joblib.load("svc.pkl")

# Initialiser Flask
app = Flask(__name__)

#Very unsecure -> complete with your own ngrok auth token
ngrok.set_auth_token("")

@app.route('/predict', methods=['GET'])
def predict():
    try:
        prediction = accuracy_score(y_test, y_pred)
        
        # Retourner le résultat
        return jsonify({"model": "svc", "prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    # Assurez-vous qu'aucune session précédente ne tourne
    ngrok.kill()

    # Lancer une nouvelle connexion
    public_url = ngrok.connect(5004).public_url
    print(f"Public URL: {public_url}")

    app.run(port=5004, debug=False)
