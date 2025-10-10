import { ref, computed } from 'vue';
import { CITIES, DEFAULT_CITY, getCityName } from '../constants/cities';
import { cityApi } from '../api/cityApi';

export function useCityData() {
  const selectedCity = ref(DEFAULT_CITY);

  const currentCityCoords = computed(() => {
    return CITIES[selectedCity.value]?.coords || [0, 0];
  });

  const currentCityZoom = computed(() => {
    return CITIES[selectedCity.value]?.zoom || 12;
  });

  const cityNames = computed(() => {
    return Object.keys(CITIES);
  });

  const setCity = (cityName) => {
    if (CITIES[cityName]) {
      selectedCity.value = cityName;
    }
  };

  const getCurrentCityName = () => {
    return getCityName(selectedCity.value);
  };

  return {
    selectedCity,
    currentCityCoords,
    currentCityZoom,
    cityNames,
    setCity,
    getCurrentCityName,
    cityApi
  };
} 