import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

# Synthetic data generation
np.random.seed(42)
N = 1000

def random_bool(p):
    return np.random.rand(N) < p

# Features
scorePercent = np.random.randint(0, 101, size=N)
correctCount = (scorePercent * np.random.normal(0.2, 0.05, size=N)).astype(int)
wrongCount = 100 - correctCount
weakTopicCount = np.random.poisson(1.5, size=N)
timeSpentSec = np.random.randint(60, 1800, size=N)
# Errors by difficulty
easyWrong = np.random.binomial(wrongCount, 0.5)
mediumWrong = np.random.binomial(wrongCount - easyWrong, 0.3)
hardWrong = wrongCount - easyWrong - mediumWrong
practiceRequired = random_bool(0.3).astype(int)
practiceScorePercent = np.where(practiceRequired, np.random.randint(0, 101, size=N), 0)
practiceCompleted = np.where(practiceRequired, random_bool(0.7).astype(int), 0)
attemptNumber = np.random.randint(1, 5, size=N)

# Target labels (0=weak,1=moderate,2=strong)
labels = []
for sp, wt in zip(scorePercent, weakTopicCount):
    if sp < 50:
        labels.append(0)
    elif sp >= 80 and wt == 0:
        labels.append(2)
    else:
        labels.append(1)
labels = np.array(labels)

X = pd.DataFrame({
    'scorePercent': scorePercent,
    'correctCount': correctCount,
    'wrongCount': wrongCount,
    'weakTopicCount': weakTopicCount,
    'timeSpentSec': timeSpentSec,
    'easyWrong': easyWrong,
    'mediumWrong': mediumWrong,
    'hardWrong': hardWrong,
    'practiceRequired': practiceRequired,
    'practiceScorePercent': practiceScorePercent,
    'practiceCompleted': practiceCompleted,
    'attemptNumber': attemptNumber
})

y = labels

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=200, random_state=42)
clf.fit(X_train, y_train)

# Save model
model_dir = os.path.join(os.path.dirname(__file__), 'model')
os.makedirs(model_dir, exist_ok=True)
joblib.dump(clf, os.path.join(model_dir, 'performance_model.pkl'))

print('Training complete. Model saved to model/performance_model.pkl')
