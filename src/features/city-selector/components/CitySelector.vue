<template>
  <div class="city-selector mt-4">
    <label>Select City:</label>
    <div v-for="cityName in cityNames" :key="cityName" class="form-check">
      <input
        class="form-check-input"
        type="radio"
        name="city"
        :id="`city-${cityName}`"
        :value="cityName"
        :checked="selectedCity === cityName"
        @change="handleCityChange"
      />
      <label class="form-check-label" :for="`city-${cityName}`">
        {{ cityName }}
      </label>
    </div>
  </div>
</template>

<script>
import { useCityData } from '../composables/useCityData.js';

export default {
  name: 'CitySelector',
  setup(props, { emit }) {
    const { selectedCity, cityNames } = useCityData();

    const handleCityChange = (event) => {
      const newCity = event.target.value;
      emit('city-changed', newCity);
    };

    return {
      selectedCity,
      cityNames,
      handleCityChange
    };
  }
};
</script>

<style scoped>
.city-selector {
  margin-bottom: 1rem;
}

.form-check {
  margin-bottom: 0.5rem;
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  cursor: pointer;
}
</style> 