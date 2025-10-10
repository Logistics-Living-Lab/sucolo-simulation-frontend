<template>
  <div class="resolution-selector mt-4">
    <label>Hexagon Resolution:</label>
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
.resolution-selector {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
}

.loading-indicator {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.error-indicator {
  font-size: 0.8rem;
  color: #dc3545;
  margin-top: 0.25rem;
}
</style> 