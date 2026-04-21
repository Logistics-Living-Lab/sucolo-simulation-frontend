<template>
  <div class="feature-type-selector">
    <label for="featureType" class="section-heading">3. Select Type of Feature:</label>
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
.section-heading {
  color: var(--color-heading);
  font-size: 1rem;
  font-weight: bold;
}

.feature-type-selector {
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
</style> 