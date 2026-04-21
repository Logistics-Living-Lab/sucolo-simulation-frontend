<template>
  <div class="selected-features">
    <h4 class="section-heading">Features & Weights</h4>

    <div v-if="freeTermFeature" class="selected-item-row">
      <span class="header-spacer"></span>
      <div class="feature-info">
        <div class="feature-name">
          Free Term
          <span class="help-icon" :title="freeTermTooltip">?</span>
        </div>
      </div>
      <div class="free-term-input-wrapper">
        <input 
          type="number" 
          :value="freeTermFeature.weight"
          @input="updateFeatureWeight(freeTermFeature.originalIndex, $event)"
          min="-10" 
          max="10" 
          step="0.1"
          class="number-input"
        />
      </div>
      <span class="weight-value">{{ freeTermFeature.weight }}</span>
    </div>

    <div class="selected-item-header">
      <span class="header-spacer"></span>
      <span class="header-feature">Feature</span>
      <span class="header-slider"></span>
      <span class="header-weight">Weight</span>
    </div>
    <div v-for="(feature, index) in otherFeatures" :key="feature.id" class="selected-item-row">
      <button v-if="feature.id !== 'free-term'" class="remove-button" @click="removeFeature(feature.originalIndex)">×</button>
      
      <div class="feature-info">
        <div class="feature-name">
          {{ getFeatureDisplayName(feature) }}
        </div>
        <div v-if="feature.type !== 'district'" class="feature-details">
          {{ getFeatureDetails(feature) }}
        </div>
      </div>
      
      <div class="slider-wrapper">
        <span class="slider-center-line" aria-hidden="true"></span>
        <input 
          type="range" 
          :value="feature.weight"
          @input="updateFeatureWeight(feature.originalIndex, $event)"
          min="-10" 
          max="10" 
          step="0.1"
          class="slider"
        />
        <span class="slider-scale slider-scale--left" aria-hidden="true">−10</span>
        <span class="slider-scale slider-scale--center" aria-hidden="true">0</span>
        <span class="slider-scale slider-scale--right" aria-hidden="true">+10</span>
      </div>
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
    const freeTermTooltip = 'The free term (intercept) is a constant added to every location\'s score. A positive value raises the overall scores; a negative value lowers them. It shifts the baseline level of the map.';
    const sortedFeatures = computed(() => {
      return props.features
        .map((feature, index) => ({ ...feature, originalIndex: index }))
        .sort((a, b) => {
          if (a.id === 'free-term') return -1;
          if (b.id === 'free-term') return 1;
          return a.originalIndex - b.originalIndex;
        });
    });

    const freeTermFeature = computed(() =>
      sortedFeatures.value.find((f) => f.id === 'free-term') ?? null
    );

    const otherFeatures = computed(() =>
      sortedFeatures.value.filter((f) => f.id !== 'free-term')
    );

    const getFeatureDisplayName = (feature) => {
      if (feature.type === 'free-term') return 'Free Term';
      if (feature.type === 'district') return `district: ${feature.districtFeature}`;
      
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
      freeTermFeature,
      otherFeatures,
      freeTermTooltip,
      getFeatureDisplayName,
      getFeatureDetails,
      removeFeature,
      updateFeatureWeight
    };
  }
};
</script>

<style scoped>
.section-heading {
  color: var(--color-heading);
  font-size: 1rem;
  font-weight: bold;
  font-style: italic;
}

.selected-features {
  margin: 0.75rem 0;
  padding: 0.75rem 0 0 0;
}

.selected-item-row {
  display: flex;
  align-items: center;
  margin: 0.35rem 0;
  gap: 0.2cm;
  min-height: 40px;
  min-width: 0;
}

.selected-item-header {
  display: flex;
  align-items: center;
  gap: 0.2cm;
  margin: 0.35rem 0 0.2rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid var(--color-border, #eee);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text, #555);
}

.header-spacer {
  width: 16px;
  flex-shrink: 0;
}

.header-feature {
  flex: 1 1 auto;
  min-width: 120px;
  padding-right: 0;
}

.header-slider {
  width: 160px;
  min-width: 160px;
  flex-shrink: 0;
  margin: 0;
}

.header-weight {
  width: 44px;
  min-width: 44px;
  flex-shrink: 0;
  text-align: right;
}

.remove-button {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.65rem;
  line-height: 1;
  flex-shrink: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  background: #c82333;
}

.feature-info {
  flex: 1 1 auto;
  min-width: 120px;
  padding-right: 0;
}

.feature-name {
  font-weight: 500;
  font-size: 0.85rem;
  line-height: 1.3;
  margin-bottom: 2px;
  white-space: normal;
  word-break: break-word;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text, #333);
}

.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: help;
  flex-shrink: 0;
}

.help-icon:hover {
  background: #5a6268;
}

.feature-details {
  font-size: 0.75rem;
  color: var(--color-text, #666);
  line-height: 1.2;
  white-space: normal;
  word-break: break-word;
}

.slider-wrapper {
  position: relative;
  width: 160px;
  min-width: 160px;
  flex-shrink: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-bottom: 0.35rem;
}

.slider-center-line {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1px;
  height: 18px;
  background: var(--color-border, #999);
  pointer-events: none;
  border-radius: 1px;
  z-index: 1;
}

.slider {
  width: 100%;
  margin: 0;
  display: block;
}

.slider-scale {
  position: absolute;
  bottom: 0;
  font-size: 0.55rem;
  line-height: 1;
  color: var(--color-text, #333);
  opacity: 0.75;
  pointer-events: none;
  white-space: nowrap;
}

.slider-scale--left {
  left: 0;
  transform: translateX(0);
}

.slider-scale--center {
  left: 50%;
  transform: translateX(-50%);
}

.slider-scale--right {
  right: 0;
  left: auto;
  transform: none;
}

.free-term-input-wrapper {
  width: 160px;
  min-width: 160px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.number-input {
  width: 70px;
  padding: 3px 4px;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  font-size: inherit;
  flex-shrink: 0;
  background: var(--color-background, #fff);
  color: var(--color-text, #333);
}

.weight-value {
  width: 44px;
  min-width: 44px;
  flex-shrink: 0;
  text-align: center;
  font-weight: bold;
  color: var(--color-text, #333);
}
</style> 