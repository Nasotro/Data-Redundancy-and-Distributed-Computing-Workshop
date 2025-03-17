import numpy as np
from collections import defaultdict
from flask import Flask, request, jsonify
import joblib

class ConsensusModel:
    def __init__(self, model_names, classes):
        self.models = {name: [] for name in model_names}  # Stocke les prédictions de classes
        self.weights = {name: 1.0 for name in model_names}  # Poids initiaux (1.0)
        self.alpha = 0.1  # Facteur d'ajustement du poids
        self.classes = classes  # Liste des classes possibles

    def update_predictions(self, predictions):
        """Ajoute une nouvelle série de prédictions."""
        for model_name, pred in predictions.items():
            self.models[model_name].append(pred)
    
    def compute_consensus(self):
        """Calcule la classe majoritaire pondérée comme consensus."""
        class_votes = {cls: 0 for cls in self.classes}
        for model_name in self.models:
            for pred in self.models[model_name]:
                class_votes[pred] += self.weights[model_name]
        consensus = max(class_votes, key=class_votes.get)
        return consensus

    def update_weights(self):
        """Ajuste les poids des modèles en fonction de leur précision relative."""
        consensus = self.compute_consensus()
        for model_name in self.models:
            correct_predictions = sum(1 for pred in self.models[model_name] if pred == consensus)
            total_predictions = len(self.models[model_name])
            accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
            self.weights[model_name] = max(0, self.weights[model_name] + self.alpha * (accuracy - 0.5))
        
    def get_weights(self):
        return self.weights

# Initialisation de Flask
app = Flask(__name__)

# Charger les modèles
model_names = ["KNeighbors","Logisticregression","random_forest_model","svc"]
models = {name: joblib.load(f"{name}.pkl") for name in model_names}
classes = [0, 1]
consensus_model = ConsensusModel(model_names, classes)

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    try:
        # Charger les données
        data = request.json
        X = np.array(data['X']).reshape(1, -1)

        # Faire des prédictions avec chaque modèle
        predictions = defaultdict(int)
        for model_name in models:
            model = models[model_name]
            y_pred = model.predict(X)[0]
            predictions[model_name] = y_pred

        # Mettre à jour les prédictions du consensus
        consensus_model.update_predictions(predictions)

        # Mettre à jour les poids des modèles
        consensus_model.update_weights()
        weights = consensus_model.get_weights()

        # Calculer le consensus
        consensus = consensus_model.compute_consensus()

        return jsonify({"consensus": consensus, "weights": weights})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(port=5001, debug=True)