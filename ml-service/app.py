from flask import Flask, request, jsonify
import joblib
import traceback

app = Flask(__name__)

# Load model at startup (will be created by train_model.py)
try:
    model = joblib.load('model/performance_model.pkl')
except Exception as e:
    model = None
    print('Model load error:', e)

@app.route('/predict-performance', methods=['POST'])
def predict_performance():
    try:
        data = request.get_json()
        # Expected features list, ensure ordering matches training
        feature_keys = [
            'scorePercent', 'correctCount', 'wrongCount', 'weakTopicCount',
            'timeSpentSec', 'easyWrong', 'mediumWrong', 'hardWrong',
            'practiceRequired', 'practiceScorePercent', 'practiceCompleted',
            'attemptNumber'
        ]
        features = [data.get(k, 0) for k in feature_keys]
        if not model:
            raise RuntimeError('Model not loaded')
        pred = model.predict([features])[0]
        prob = model.predict_proba([features])[0].max()
        # Map prediction to richer output
        mapping = {
            0: {'predictedMastery': 'weak', 'riskLevel': 'high', 'recommendedAction': 'revisit_lesson'},
            1: {'predictedMastery': 'moderate', 'riskLevel': 'medium', 'recommendedAction': 'summary_then_practice'},
            2: {'predictedMastery': 'strong', 'riskLevel': 'low', 'recommendedAction': 'optional_challenge'}
        }
        result = mapping.get(pred, {})
        result['confidence'] = round(float(prob), 2)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
