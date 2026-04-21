<template>
  <div class="city-selector mt-4">
    <label class="section-heading">1. Select City:</label>
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
      <label
        class="form-check-label"
        :class="{ 'form-check-label--selected': selectedCity === cityName }"
        :for="`city-${cityName}`"
      >
        {{ getCityDisplayName(cityName) }}
        <span class="city-flag" v-if="getCityFlag(cityName)" :title="getCityFlag(cityName) === '🇩🇪' ? 'Germany' : 'Italy'">{{ getCityFlag(cityName) }}</span>
      </label>
    </div>
  </div>
</template>

<script>
import { useCityData } from '../composables/useCityData.js';
import { getCityDisplayName, getCityFlag } from '../constants/cities.js';

export default {
  name: 'CitySelector',
  setup(props, { emit }) {
    const { selectedCity, cityNames } = useCityData();

    const handleCityChange = (event) => {
      const newCity = event.target.value;
      selectedCity.value = newCity;
      emit('city-changed', newCity);
    };

    return {
      selectedCity,
      cityNames,
      handleCityChange,
      getCityDisplayName,
      getCityFlag
    };
  }
};
</script>

<style scoped>
.section-heading {
  color: var(--color-heading);
  font-size: 1rem;
  font-weight: bold;
}

.city-selector {
  margin-bottom: 0.65rem;
}

.form-check {
  margin-bottom: 0.35rem;
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.form-check-label--selected {
  font-weight: bold;
}

.city-flag {
  font-size: 1.1em;
  line-height: 1;
}
</style> 