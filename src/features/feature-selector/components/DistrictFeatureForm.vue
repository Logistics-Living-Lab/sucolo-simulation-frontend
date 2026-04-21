<template>
  <div v-if="selectedFeatureType === 'district'" class="district-feature-form">
    <label>Select District Feature:</label>
    <select :value="selectedDistrictFeature" @change="handleDistrictFeatureChange" class="form-control">
      <option disabled value="">-- Select District Feature --</option>
      <option v-for="feature in districtFeatures" :key="feature" :value="feature">
        {{ feature }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'DistrictFeatureForm',
  props: {
    selectedFeatureType: {
      type: String,
      required: true
    },
    selectedDistrictFeature: {
      type: String,
      default: ''
    },
    districtFeatures: {
      type: Array,
      default: () => []
    }
  },
  emits: ['district-feature-changed'],
  setup(props, { emit }) {
    const handleDistrictFeatureChange = (event) => {
      emit('district-feature-changed', event.target.value);
    };

    return {
      handleDistrictFeatureChange
    };
  }
};
</script>

<style scoped>
.district-feature-form {
  margin-bottom: 0.65rem;
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