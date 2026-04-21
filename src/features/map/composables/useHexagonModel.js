import { ref } from 'vue';
import { modelApi } from '../../../utils/api/modelApi';
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
        return requestedFeatures.has(feature);
      })
      .map(([feature, value]) => {
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

  const buildLogisticQuery = (features, selectedResolution) => {
    const isWheelchairSelected = Object.entries(features).some(([key, value]) => {
      const isSelected = key.includes('Wheelchair Accessible') && value !== 0;
      return isSelected;
    });

    const query = {
      selectedFeatures: [],
      nearests: [],
      counts: [],
      presences: [],
      districtFeatureNames: [],
      resolution: Number(selectedResolution)
    };

    Object.entries(features).forEach(([featureType, featureData]) => {
      if (featureType === 'Free Term') {
        query.selectedFeatures.push({
          name: 'Free Term',
          type: 'district',
          weight: featureData
        });
        return;
      }

      if (!featureType.includes(' - ')) {
        query.selectedFeatures.push({
          name: featureType,
          type: 'district',
          weight: featureData
        });
        query.districtFeatureNames.push(featureType);
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
          query.selectedFeatures.push({
            name,
            type: 'nearest',
            weight: featureData
          });
          query.nearests.push({
            amenity: name,
            radius: radius,
            penalty: penalty
          });
          break;
        case 'count':
          query.selectedFeatures.push({
            name,
            type: 'count',
            weight: featureData
          });
          query.counts.push({
            amenity: name,
            radius: radius
          });
          break;
        case 'present':
          query.selectedFeatures.push({
            name,
            type: 'present',
            weight: featureData
          });
          query.presences.push({
            amenity: name,
            radius: radius
          });
          break;
        case 'district':
          query.selectedFeatures.push({
            name,
            type: 'district',
            weight: featureData
          });
          query.districtFeatureNames.push(name);
          break;
      }
    });

    if (!query.nearests.length) delete query.nearests;
    if (!query.counts.length) delete query.counts;
    if (!query.presences.length) delete query.presences;
    if (!query.districtFeatureNames.length) delete query.districtFeatureNames;

    return query;
  };

  const buildModel = async (featureData, selectedCity, selectedResolution) => {
    isLoading.value = true;
    error.value = null;
    
    try {   
      const city = getCityName(selectedCity);
          
      const features = featureData.features || featureData;
      
      if (!Array.isArray(features)) {
        throw new Error('Features must be an array');
      }
      
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

      const query = buildLogisticQuery(featuresObject, selectedResolution);
      
      let responseData;
      try {
        responseData = await modelApi.getLogisticHexagonScores(city, query);
      } catch (apiError) {
        const status = apiError?.response?.status;
        const errorData = apiError?.response?.data;
        const errorMessage = errorData ? JSON.stringify(errorData) : apiError.message;
        
        const error = new Error(`API call failed: ${status} ${errorMessage}`);
        error.statusCode = status;
        error.originalError = apiError;
        throw error;
      }
      
      if (!responseData) {
        throw new Error('No response data received from API');
      }
      
      const results = Array.isArray(responseData?.results) ? responseData.results : [];
      const newHexagonData = results
        .filter(result => result?.hex_id && typeof result.score === 'number')
        .map((result, index) => ({
          hexId: result.hex_id,
          score: result.score,
          data: result.features || {},
          index
        }));

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