import joblib
from flask import Flask, request, jsonify
from sklearn.datasets import load_breast_cancer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from pyngrok import ngrok

# Kill any previous ngrok session
ngrok.kill()

# Charger le dataset
dataset = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(dataset.data, dataset.target, test_size=0.2, random_state=42)

# Entraîner un modèle
k = 3
model = KNeighborsClassifier(n_neighbors=k)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# Sauvegarder le modèle
joblib.dump(model, "KNeighbors.pkl")

# Charger le modèle
model = joblib.load("KNeighbors.pkl")

# Initialiser Flask
app = Flask(__name__)

#Very unsecure -> complete with your auth token
ngrok.set_auth_token("")

@app.route('/predict', methods=['GET'])
def predict():
    try:
        # Faire une prédiction
        prediction = accuracy_score(y_test, y_pred)

        # Retourner le résultat
        return jsonify({"model": "KNeighbors", "prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    # Assurez-vous qu'aucune session précédente ne tourne
    ngrok.kill()

    # Lancer une nouvelle connexion
    public_url = ngrok.connect(5001).public_url
    print(f"Public URL: {public_url}")

    app.run(port=5001, debug=False)
