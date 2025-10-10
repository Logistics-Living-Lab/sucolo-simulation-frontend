import { ref } from 'vue';
import { DEFAULT_RESOLUTIONS, DEFAULT_RESOLUTION } from '../constants/resolutions';
import { cityApi } from '../api/cityApi';

export function useResolution() {
  const selectedResolution = ref(DEFAULT_RESOLUTION);
  const availableResolutions = ref(DEFAULT_RESOLUTIONS);
  const isLoading = ref(false);
  const error = ref(null);

  const setResolution = (resolution) => {
    if (availableResolutions.value.some(r => r.value === resolution)) {
      selectedResolution.value = resolution;
    }
  };

  const loadResolutions = async (cityName) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const resolutions = await cityApi.getResolutions(cityName);
      if (resolutions && Array.isArray(resolutions) && resolutions.length > 0) {
        // Convert backend resolution format to frontend format if needed
        availableResolutions.value = resolutions.map(res => {
          if (typeof res === 'number') {
            // If backend returns just numbers, convert to our format
            return {
              value: res,
              label: `Resolution ${res}`,
              description: `${res}km hexagons`
            };
          }
          return res; // Assume backend returns proper format
        });
      } else {
        console.warn(`No resolutions available for ${cityName}, using defaults`);
        availableResolutions.value = DEFAULT_RESOLUTIONS;
      }
    } catch (err) {
      console.error(`Error loading resolutions for ${cityName}:`, err);
      error.value = err.message;
      availableResolutions.value = DEFAULT_RESOLUTIONS;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    selectedResolution,
    availableResolutions,
    isLoading,
    error,
    setResolution,
    loadResolutions
  };
} 