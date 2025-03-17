from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib 
from flask import Flask, request, jsonify
from pyngrok import ngrok

# Kill any previous ngrok session
ngrok.kill()

iris=load_breast_cancer()
X=iris.data
y=iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model=LogisticRegression()
model.fit(X_train,y_train)
y_pred = model.predict(X_test)

joblib.dump(model, "Logisticregression.pkl")

model = joblib.load("Logisticregression.pkl")

app = Flask(__name__)
#Very unsecure -> complete with your auth token
ngrok.set_auth_token("")

@app.route('/predict', methods=['GET'])
def predict():
    try:
        prediction = accuracy_score(y_test, y_pred)
        
        return jsonify({"model": "logistic regression", "prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    # Assurez-vous qu'aucune session précédente ne tourne
    ngrok.kill()

    # Lancer une nouvelle connexion
    public_url = ngrok.connect(5003).public_url
    print(f"Public URL: {public_url}")

    app.run(port=5003, debug=False)
