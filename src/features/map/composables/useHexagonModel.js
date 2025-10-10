import { ref } from 'vue';
import { modelApi } from '../../../utils/api/modelApi';
import { logisticRegression } from '../../../utils/regression/logisticRegression';
import { getCityName } from '../../city-selector/constants/cities';

export function useHexagonModel() {
  const hexagonData = ref([]);
  const isModelBuilt = ref(false);
  const isLoading = ref(false);
  const error = ref(null);

  const extractFeatures = (hexData, features) => {
    // Ensure features is an array
    if (!Array.isArray(features)) {
      console.error('Features is not an array in extractFeatures:', features);
      return [];
    }
    
    // Get the list of features that were actually requested
    const requestedFeatures = new Set();
    
    features.forEach(feature => {
      if (feature.type === 'free-term') return;
      
      switch (feature.type) {
        case 'nearest':
          requestedFeatures.add(`nearest_${feature.amenity}`);
          break;
        case 'count':
          requestedFeatures.add(`count_${feature.amenity}`);
          break;
        case 'present':
          requestedFeatures.add(`present_${feature.amenity}`);
          break;
        case 'district':
          requestedFeatures.add(feature.districtFeature);
          break;
      }
    });

    const extractedFeatures = Object.entries(hexData.data)
      .filter(([feature]) => {
        return requestedFeatures.has(feature) || feature === 'Free Term';
      })
      .map(([feature, value]) => {
        // Special handling for Free Term
        if (feature === 'Free Term') {
          const freeTermFeature = features.find(f => f.type === 'free-term');
          return {
            name: 'Free Term',
            label: 'Free Term',
            value: 1,
            weight: freeTermFeature ? freeTermFeature.weight : 0,
            type: 'free-term'
          };
        }

        // Find the matching feature by comparing the feature name
        const matchingFeature = features.find(f => {
          if (f.type === 'free-term') return false;
          
          switch (f.type) {
            case 'nearest':
              return feature.startsWith('nearest_') && 
                     feature.replace('nearest_', '') === f.amenity;
            case 'count':
              return feature.startsWith('count_') && 
                     feature.replace('count_', '') === f.amenity;
            case 'present':
              return feature.startsWith('present_') && 
                     feature.replace('present_', '') === f.amenity;
            case 'district':
              return feature === f.districtFeature;
            default:
              return false;
          }
        });

        if (!matchingFeature) {
          console.log(`No matching feature found for: ${feature}`);
          return null;
        }

        const numericValue = typeof value === 'string' ? parseFloat(value) : value;

        return {
          name: matchingFeature.type === 'district' ? matchingFeature.districtFeature : feature,
          value: numericValue,
          weight: matchingFeature.weight || 0,
          type: matchingFeature.type,
          radius: matchingFeature.distance || matchingFeature.radius || 0,
          penalty: matchingFeature.penalty || 0
        };
      })
      .filter(Boolean);

    // add Free Term 
    const freeTermFeature = features.find(f => f.type === 'free-term');
    if (freeTermFeature) {
      extractedFeatures.push({
        name: 'Free Term',
        label: 'Free Term',
        value: 1,
        weight: freeTermFeature.weight,
        type: 'free-term'
      });
    }

    return extractedFeatures;
  };

  const buildQuery = (features, selectedCity, selectedResolution) => {
    const city = getCityName(selectedCity);
    
    const isWheelchairSelected = Object.entries(features).some(([key, value]) => {
      const isSelected = key.includes('Wheelchair Accessible') && value !== 0;
      return isSelected;
    });

    const query = {
      nearests: [],
      counts: [],
      presences: [],
      hexagons: { features: [] },
      resolution: selectedResolution
    };

    // any district features selected
    let hasDistrictFeatures = false;

    Object.entries(features).forEach(([featureType, featureData]) => {
      if (featureType === 'Free Term') return;

      if (!featureType.includes(' - ')) {
        query.hexagons.features.push(featureType);
        hasDistrictFeatures = true;
        return;
      }

      const parts = featureType.split(' - ');
      const name = parts[0];
      const type = parts[1];
      const radius = parseInt(parts[2]) || 500;
      let penalty = 0;
      if (parts.length === 4) {
        penalty = parseInt(parts[3]) || 0;
      }

      if (isWheelchairSelected && !name.includes('_wheelchair')) {
        return;
      }

      switch (type) {
        case 'nearest':
          query.nearests.push({
            amenity: name,
            radius: radius,
            penalty: penalty
          });
          break;
        case 'count':
          query.counts.push({
            amenity: name,
            radius: radius
          });
          break;
        case 'present':
          query.presences.push({
            amenity: name,
            radius: radius
          });
          break;
        case 'district':
          query.hexagons.features.push(name);
          hasDistrictFeatures = true;
          break;
      }
    });

    if (!hasDistrictFeatures) {
      delete query.hexagons;
    }

    return query;
  };

  const buildModel = async (featureData, selectedCity, selectedResolution) => {
    isLoading.value = true;
    error.value = null;
    
    try {   
      const city = getCityName(selectedCity);
      
      // Check if backend is accessible
      try {
        const testResponse = await fetch(`${window.config.apiUrl}/health`);
      } catch (healthError) {
        console.warn('Backend health check failed:', healthError);
      }
      
      // Extract features array from featureData object
      const features = featureData.features || featureData;
      
      if (!Array.isArray(features)) {
        throw new Error('Features must be an array');
      }
      
      // Convert features array to the expected object format
      const featuresObject = {};
      features.forEach(feature => {
        if (feature.type === 'free-term') {
          featuresObject['Free Term'] = feature.weight;
        } else if (feature.type === 'nearest') {
          const key = `${feature.amenity} - nearest - ${feature.distance} - ${feature.penalty}`;
          featuresObject[key] = feature.weight;
        } else if (feature.type === 'count') {
          const key = `${feature.amenity} - count - ${feature.distance}`;
          featuresObject[key] = feature.weight;
        } else if (feature.type === 'present') {
          const key = `${feature.amenity} - present - ${feature.distance}`;
          featuresObject[key] = feature.weight;
        } else if (feature.type === 'district') {
          const key = `${feature.districtFeature}`;
          featuresObject[key] = feature.weight;
        }
      });
      
      console.log('Features object for buildQuery:', featuresObject);
      const query = buildQuery(featuresObject, selectedCity, selectedResolution);
      
      let responseData;
      try {
        responseData = await modelApi.getMultipleFeatures(city, query);
        console.log('API response data:', responseData);
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw new Error(`API call failed: ${apiError.message}`);
      }
      
      if (!responseData) {
        throw new Error('No response data received from API');
      }

      console.log('Building model with', Object.keys(responseData).length, 'hexagons');

      const hexagonIds = Object.keys(responseData);
      const newHexagonData = [];

      hexagonIds.forEach((hexId, index) => {
        try {
          const data = responseData[hexId];
          if (!data) {
            return;
          }

          const extractedFeatures = extractFeatures({ data }, features);
          
          if (!extractedFeatures.length) {
            console.log(`No features extracted for hexagon ${hexId}`);
            return;
          }
            
          const score = logisticRegression(extractedFeatures);
          
          newHexagonData.push({
            hexId,
            score,
            data,
            index
          });
        } catch (err) {
          console.error('Error processing hexagon:', err);
        }
      });

      hexagonData.value = newHexagonData;
      isModelBuilt.value = true;
      
      return newHexagonData;
    } catch (err) {
      error.value = err.message;
      console.error('Error building model:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const resetModel = () => {
    hexagonData.value = [];
    isModelBuilt.value = false;
    error.value = null;
  };

  return {
    hexagonData,
    isModelBuilt,
    isLoading,
    error,
    buildModel,
    resetModel,
    extractFeatures
  };
} 