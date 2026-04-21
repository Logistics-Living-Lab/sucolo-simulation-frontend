<template>
  <div class="resolution-selector mt-4">
    <label class="section-heading">2. Planning Resolution:</label>
    <select 
      :value="selectedResolution" 
      @change="handleResolutionChange"
      class="form-control"
      :disabled="isLoading"
    >
      <option v-for="res in availableResolutions" :key="res.value" :value="res.value">
        {{ res.label }} ({{ res.description }})
      </option>
    </select>
    <div v-if="isLoading" class="loading-indicator">
      Loading resolutions...
    </div>
    <div v-if="error" class="error-indicator">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { watch, onMounted } from 'vue';
import { useResolution } from '../composables/useResolution.js';

export default {
  name: 'ResolutionSelector',
  props: {
    cityName: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const {
      selectedResolution,
      availableResolutions,
      isLoading,
      error,
      setResolution,
      loadResolutions
    } = useResolution();

    const handleResolutionChange = (event) => {
      const newResolution = parseInt(event.target.value);
      setResolution(newResolution);
      emit('resolution-changed', newResolution);
    };

    const loadForCity = async () => {
      if (!props.cityName) return;
      await loadResolutions(props.cityName);
      emit('resolution-changed', selectedResolution.value);
    };

    onMounted(loadForCity);
    watch(() => props.cityName, loadForCity);

    return {
      selectedResolution,
      availableResolutions,
      isLoading,
      error,
      handleResolutionChange
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

.resolution-selector {
  margin-bottom: 0.65rem;
  padding-top: 1rem;
}

.form-control {
  width: 100%;
  padding: 5px 6px;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  margin-top: 2px;
  font-size: 0.875rem;
  background: var(--color-background, #fff);
  color: var(--color-text, #333);
}

.loading-indicator {
  font-size: 0.8rem;
  color: var(--color-text, #666);
  margin-top: 0.25rem;
}

.error-indicator {
  font-size: 0.8rem;
  color: #dc3545;
  margin-top: 0.25rem;
}
</style> 