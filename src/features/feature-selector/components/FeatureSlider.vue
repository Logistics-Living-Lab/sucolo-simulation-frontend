<template>
  <div class="selected-features">
    <h4>Selected Features</h4>
    <div v-for="(feature, index) in sortedFeatures" :key="feature.id" class="selected-item-row">
      <button v-if="feature.id !== 'free-term'" class="remove-button" @click="removeFeature(feature.originalIndex)">×</button>
      
      <div class="feature-info">
        <div class="feature-name">{{ getFeatureDisplayName(feature) }}</div>
        <div v-if="feature.type !== 'district' && feature.type !== 'free-term'" class="feature-details">
          {{ getFeatureDetails(feature) }}
        </div>
      </div>
      
      <input 
        v-if="feature.id === 'free-term'"
        type="number" 
        :value="feature.weight"
        @input="updateFeatureWeight(feature.originalIndex, $event)"
        min="-10" 
        max="10" 
        step="0.1"
        class="number-input"
      />
      <input 
        v-else
        type="range" 
        :value="feature.weight"
        @input="updateFeatureWeight(feature.originalIndex, $event)"
        min="-10" 
        max="10" 
        step="0.1"
        class="slider"
      />
      <span class="weight-value">{{ feature.weight }}</span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'FeatureSlider',
  props: {
    features: {
      type: Array,
      default: () => []
    }
  },
  emits: ['feature-removed', 'feature-weight-updated'],
  setup(props, { emit }) {
    const sortedFeatures = computed(() => {
      return props.features
        .map((feature, index) => ({ ...feature, originalIndex: index }))
        .sort((a, b) => {
          // Free Term should always be first
          if (a.id === 'free-term') return -1;
          if (b.id === 'free-term') return 1;
          // Other features maintain their original order
          return a.originalIndex - b.originalIndex;
        });
    });

    const getFeatureDisplayName = (feature) => {
      if (feature.type === 'free-term') return 'Free Term';
      if (feature.type === 'district') return `district: ${feature.districtFeature}`;
      
      // For amenity features, show the feature type prefix and amenity name
      const amenityName = feature.amenity || feature.label.split(' ')[1] || feature.label;
      
      switch (feature.type) {
        case 'nearest':
          return `nearest: ${amenityName}`;
        case 'count':
          return `count: ${amenityName}`;
        case 'present':
          return `present: ${amenityName}`;
        default:
          return amenityName;
      }
    };

    const getFeatureDetails = (feature) => {
      if (feature.type === 'free-term' || feature.type === 'district') return '';
      
      let details = `${feature.distance}m`;
      if (feature.type === 'nearest' && feature.penalty > 0) {
        details += ` [penalty: ${feature.penalty}]`;
      }
      return details;
    };

    const removeFeature = (index) => {
      emit('feature-removed', index);
    };

    const updateFeatureWeight = (index, event) => {
      const weight = parseFloat(event.target.value);
      emit('feature-weight-updated', { index, weight });
    };

    return {
      sortedFeatures,
      getFeatureDisplayName,
      getFeatureDetails,
      removeFeature,
      updateFeatureWeight
    };
  }
};
</script>

<style scoped>
.selected-features {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.selected-item-row {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  gap: 0.5rem;
  min-height: 50px;
}

.remove-button {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
  flex-shrink: 0;
}

.remove-button:hover {
  background: #c82333;
}

.feature-info {
  flex: 1;
  min-width: 0; 
}

.feature-name {
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.2;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-details {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slider {
  flex: 1;
  margin: 0 0.5rem;
  min-width: 120px;
  flex-shrink: 0;
}

.number-input {
  width: 80px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-shrink: 0;
}

.weight-value {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
  flex-shrink: 0;
}
</style> 