/**
 * Calculates the logistic regression score for a set of features
 * @param {Array} features - Array of objects with name, value, weight, type, and radius properties
 * @returns {number} - Score between 0 and 1
 */

//Maps hexagon resolution levels to radius values for spatial calculations
const RESOLUTION_TO_RADIUS = {
  7: 1406, 
  8: 531,
  9: 200
}
const HEX_RADIUS = RESOLUTION_TO_RADIUS[9]; 
const MAX_COUNT = 5; //Maximum value for count normalization
const LINEAR_SCALING_FACTOR = 3; //Multiplier applied before the sigmoid function, affects how sensitive the logistic regression model is to changes in the input features

//implements Free Term bias
const isFreeTerm = (f) => f?.name === 'Free Term' || f?.label === 'Free Term';

//Value normalization = converts different feature types to 0-1 scale
const normalizeValue = (feature) => {
  if (isFreeTerm(feature)) return 1;
  const value = feature.value;
  if (value == null || isNaN(value)) return 0;
  switch (feature.type) {
    case 'nearest': {
      const min = HEX_RADIUS; 
      const max = Math.max(min + 1e-6, (feature.radius || 0) + (feature.penalty || 0));
      const result = Math.max(0, Math.min(1, 1 - ((value - min) / (max - min))));
      return result
    }
    case 'count':
      return Math.min(1, value / MAX_COUNT);
    case 'present':
      return value ? 1 : 0;
    case 'district': {
      const name = feature.name || '';
      const thresholds = {
        'Average age': 100,
        'Employed income': 10000,
        'Gross monthly wages': 10000,
        'Household income': 10000,
        'Other income': 10000,
        'Pensions': 10000,
        'Unemployment benefits': 10000,
        'Households with 1 person': 1000,
        'Households with 2 people': 1000,
        'Households with 3 people': 1000,
        'Households with 4 people': 1000,
        'Households with 5 or more people': 1000,
        'Housing': 1000,
        'Population density': 10000,
        'Total employed': 10000,
        'Total population': 10000,
        'Total unemployed': 10000,
      };
      const divisor = thresholds[name] || 10000;
      return Math.min(1, Math.max(0, value / divisor));
    }
    default:
      return 0;
  }
};

//regression
export function logisticRegression(features) {
  if (!Array.isArray(features) || features.length === 0) return 0.5; //neutral scor of 0,5 if input is invalid
  const processed = features
  //processing of the features
    .map(f => {
      if (!f) return null;
      const weight = typeof f.weight === 'number' && !isNaN(f.weight) ? f.weight : 0; //weight default set to 0 if invalid
      const normalizedValue = normalizeValue(f);
      return {
        ...f,
        weight,
        normalizedValue,
      };
    })
    .filter(Boolean); //removes 'null' entries
  if (processed.length === 0) return 0.5;
  let bias = 0;
  let weightedSum = 0;
  let count = 0;
  for (const f of processed) {
    if (isFreeTerm(f)) {
      bias = f.weight;
    } else {
      weightedSum += f.weight * f.normalizedValue; //uses normalized values
      count++;
    }
  }
  const scaledSum = weightedSum / Math.max(1, count); //averaging weighted sum
  const total = (scaledSum + bias) * LINEAR_SCALING_FACTOR; //adding bias and scaling
  const score = 1 / (1 + Math.exp(-total)); //sigmoid function
  const result = Math.max(0, Math.min(1, score)); //makes sure that the result is between 0 and 1
  return result;
} 