const axios = require('axios');

// URL of the Python ML service (ensure the service is running)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001/predict-performance';

/**
 * Calls the external ML prediction service with the provided feature object.
 * Returns the parsed JSON response or throws an error.
 * @param {Object} features – feature payload matching the ML model schema
 * @returns {Promise<Object>} prediction result
 */
async function predictPerformance(features) {
  try {
    const response = await axios.post(ML_SERVICE_URL, features, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (err) {
    console.error('Error calling ML prediction service:', err.message || err);
    // Return null to indicate failure, allowing caller to fallback gracefully
    return null;
  }
}

module.exports = { predictPerformance };
