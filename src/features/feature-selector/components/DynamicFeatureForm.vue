<template>
  <div v-if="isDynamicFeature" class="dynamic-feature-form">
    <label class="mt-2">
      <input type="checkbox" :checked="wheelchairAccessible" @change="handleWheelchairChange" />
      Wheelchair Accessible
    </label>

    <div class="mt-2">
      <label>Select Amenity:</label>
      <select :value="selectedAmenity" @change="handleAmenityChange" class="form-control">
        <option disabled value="">-- Select Amenity --</option>
        <option v-for="amenity in filteredAmenities" :key="amenity" :value="amenity">
          {{ amenity }}
        </option>
      </select>
    </div>

    <div v-if="isDynamicFeature" class="mt-2">
      <label>Distance (min. 201 meters):</label>
      <input 
        type="number" 
        :value="selectedDistance" 
        @input="handleDistanceChange"
        class="form-control" 
        min="201" 
      />
    </div>

    <div v-if="selectedFeatureType === 'nearest'" class="mt-2">
      <label>Penalty:</label>
      <input 
        type="number" 
        :value="selectedPenalty" 
        @input="handlePenaltyChange"
        class="form-control" 
        min="0" 
        step="0.1" 
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'DynamicFeatureForm',
  props: {
    selectedFeatureType: {
      type: String,
      required: true
    },
    selectedAmenity: {
      type: String,
      default: ''
    },
    selectedDistance: {
      type: Number,
      default: 201
    },
    selectedPenalty: {
      type: Number,
      default: 0
    },
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    amenities: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'amenity-changed',
    'distance-changed', 
    'penalty-changed',
    'wheelchair-changed'
  ],
  setup(props, { emit }) {
    const isDynamicFeature = computed(() => {
      return ['nearest', 'count', 'present'].includes(props.selectedFeatureType);
    });

    const filteredAmenities = computed(() => {
      if (!props.wheelchairAccessible) {
        return props.amenities.filter(amenity => !amenity.includes('_wheelchair'));
      }
      return props.amenities.filter(amenity => amenity.includes('_wheelchair'));
    });

    const handleAmenityChange = (event) => {
      emit('amenity-changed', event.target.value);
    };

    const handleDistanceChange = (event) => {
      emit('distance-changed', parseInt(event.target.value));
    };

    const handlePenaltyChange = (event) => {
      emit('penalty-changed', parseFloat(event.target.value));
    };

    const handleWheelchairChange = (event) => {
      emit('wheelchair-changed', event.target.checked);
    };

    return {
      isDynamicFeature,
      filteredAmenities,
      handleAmenityChange,
      handleDistanceChange,
      handlePenaltyChange,
      handleWheelchairChange
    };
  }
};
</script>

<style scoped>
.dynamic-feature-form {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
}

.mt-2 {
  margin-top: 8px;
}
</style> 