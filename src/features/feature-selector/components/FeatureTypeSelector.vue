<template>
  <div class="feature-type-selector">
    <label for="featureType">Select Type of Feature:</label>
    <select 
      id="featureType" 
      :value="selectedFeatureType" 
      @change="handleFeatureTypeChange"
      class="form-control"
    >
      <option disabled value="">-- Select --</option>
      <option value="nearest">Nearest Amenity</option>
      <option value="count">Amenity Count</option>
      <option value="present">Amenity Present</option>
      <option value="district">District Feature</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'FeatureTypeSelector',
  props: {
    selectedFeatureType: {
      type: String,
      default: ''
    }
  },
  emits: ['feature-type-changed'],
  setup(props, { emit }) {
    const handleFeatureTypeChange = (event) => {
      emit('feature-type-changed', event.target.value);
    };

    return {
      handleFeatureTypeChange
    };
  }
};
</script>

<style scoped>
.feature-type-selector {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
}
</style> 