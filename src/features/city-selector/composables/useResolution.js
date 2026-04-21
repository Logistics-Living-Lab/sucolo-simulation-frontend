import { ref } from 'vue';
import { DEFAULT_RESOLUTIONS, DEFAULT_RESOLUTION, CITY_RESOLUTIONS, CITY_DEFAULT_RESOLUTION } from '../constants/resolutions';
import { cityApi } from '../api/cityApi';

const RESOLUTION_LABELS = Object.fromEntries(
  DEFAULT_RESOLUTIONS.map((r) => [r.value, { label: r.label, description: r.description }])
);

function resolutionsToOptions(values) {
  return values.map((value) => {
    const meta = RESOLUTION_LABELS[value];
    return {
      value,
      label: meta ? meta.label : `Resolution ${value}`,
      description: meta ? meta.description : `${value} hexagons`,
    };
  });
}

export function useResolution() {
  const selectedResolution = ref(DEFAULT_RESOLUTION);
  const availableResolutions = ref(DEFAULT_RESOLUTIONS);
  const isLoading = ref(false);
  const error = ref(null);

  const setResolution = (resolution) => {
    if (availableResolutions.value.some((r) => r.value === resolution)) {
      selectedResolution.value = resolution;
    }
  };

  const loadResolutions = async (cityName) => {
    if (!cityName) {
      availableResolutions.value = DEFAULT_RESOLUTIONS;
      return;
    }
    const cityValues = CITY_RESOLUTIONS[cityName];
    if (cityValues && cityValues.length > 0) {
      availableResolutions.value = resolutionsToOptions(cityValues);
      const defaultRes = CITY_DEFAULT_RESOLUTION[cityName];
      const effectiveDefault = defaultRes !== undefined && cityValues.includes(defaultRes)
        ? defaultRes
        : cityValues[0];
      selectedResolution.value = effectiveDefault;
      return;
    }
    isLoading.value = true;
    error.value = null;
    try {
      const resolutions = await cityApi.getResolutions(cityName);
      if (resolutions && Array.isArray(resolutions) && resolutions.length > 0) {
        availableResolutions.value = resolutions.map((res) => {
          if (typeof res === 'number') {
            const meta = RESOLUTION_LABELS[res];
            return {
              value: res,
              label: meta ? meta.label : `Resolution ${res}`,
              description: meta ? meta.description : `${res}km hexagons`,
            };
          }
          return res;
        });
        const values = availableResolutions.value.map((r) => r.value);
        const defaultRes = CITY_DEFAULT_RESOLUTION[cityName];
        if (defaultRes !== undefined && values.includes(defaultRes)) {
          selectedResolution.value = defaultRes;
        } else if (!values.includes(selectedResolution.value)) {
          selectedResolution.value = values[0];
        }
      } else {
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