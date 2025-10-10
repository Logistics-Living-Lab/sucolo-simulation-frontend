<template>
  <div class="feature-selector">
    <FeatureTypeSelector 
      :selectedFeatureType="selectedFeatureType"
      @feature-type-changed="handleFeatureTypeChange"
    />

    <DynamicFeatureForm
      :selectedFeatureType="selectedFeatureType"
      :selectedAmenity="selectedAmenity"
      :selectedDistance="selectedDistance"
      :selectedPenalty="selectedPenalty"
      :wheelchairAccessible="wheelchairAccessible"
      :amenities="amenities"
      @amenity-changed="handleAmenityChange"
      @distance-changed="handleDistanceChange"
      @penalty-changed="handlePenaltyChange"
      @wheelchair-changed="handleWheelchairChange"
    />

    <DistrictFeatureForm
      :selectedFeatureType="selectedFeatureType"
      :selectedDistrictFeature="selectedDistrictFeature"
      :districtFeatures="districtFeatures"
      @district-feature-changed="handleDistrictFeatureChange"
    />

    <FeatureSlider
      v-if="sliderFeatures.length > 0"
      :features="sliderFeatures"
      @feature-removed="removeFeature"
      @feature-weight-updated="updateFeatureWeight"
    />

    <div class="d-flex justify-content-between align-items-center mt-3">
      <button @click="acceptFeature" class="btn btn-primary" :disabled="!isValidFeature">Apply</button>
      <button @click="buildModel" class="btn btn-primary">Build Model</button>
      <button @click="resetMap" class="btn btn-danger">Reset</button>
    </div>

    <!-- Error Popup -->
    <div v-if="showErrorPopup" class="error-popup">
      <div class="error-content">
        <p>{{ errorMessage }}</p>
        <button @click="closeErrorPopup" class="close-button">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import FeatureTypeSelector from './FeatureTypeSelector.vue';
import DynamicFeatureForm from './DynamicFeatureForm.vue';
import DistrictFeatureForm from './DistrictFeatureForm.vue';
import FeatureSlider from './FeatureSlider.vue';
import { cityApi } from '../../city-selector/api/cityApi';
import { getCityName } from '../../city-selector/constants/cities';
import { DYNAMIC_FEATURE_TYPES } from '../../city-selector/constants/resolutions';

export default {
  name: 'FeatureSelector',
  components: {
    FeatureTypeSelector,
    DynamicFeatureForm,
    DistrictFeatureForm,
    FeatureSlider
  },
  props: {
    selectedCity: {
      type: String,
      required: true
    }
  },
  emits: ['update-features', 'build-model', 'reset-map'],
  setup(props, { emit, expose }) {
    // Reactive state
    const selectedFeatureType = ref('');
    const selectedAmenity = ref('');
    const selectedDistance = ref(201);
    const selectedPenalty = ref(0);
    const selectedDistrictFeature = ref('');
    const wheelchairAccessible = ref(false);
    const sliderFeatures = ref([]);
    const amenities = ref([]);
    const districtFeatures = ref([]);
    const showErrorPopup = ref(false);
    const errorMessage = ref('');

    // Computed properties
    const isValidFeature = computed(() => {
      if (!selectedFeatureType.value) return false;
      
      if (DYNAMIC_FEATURE_TYPES.includes(selectedFeatureType.value)) {
        return selectedAmenity.value && selectedDistance.value >= 201;
      }
      
      if (selectedFeatureType.value === 'district') {
        return selectedDistrictFeature.value;
      }
      
      return false;
    });

    // Methods
    const loadAmenities = async () => {
      try {
        const cityName = getCityName(props.selectedCity);
        const data = await cityApi.getAmenities(cityName);
        if (data) {
          amenities.value = data;
        }
      } catch (error) {
        console.error('Error loading amenities:', error);
        amenities.value = [];
      }
    };

    const loadDistrictFeatures = async () => {
      if (districtFeatures.value.length > 0) return;
      
      try {
        const cityName = getCityName(props.selectedCity);
        
        // First try to get district attributes directly
        try {
          const districtAttributesResponse = await cityApi.getDistrictAttributes(cityName);
          if (districtAttributesResponse && districtAttributesResponse.length > 0) {
            districtFeatures.value = districtAttributesResponse;
            return;
          }
        } catch (districtError) {
          console.warn('Could not load district attributes, trying hexagons endpoint:', districtError);
        }
        
        // Fallback to default resolution
        const hexagonsResponse = await cityApi.getHexagons(cityName, 8, []);
        
        if (hexagonsResponse && Object.keys(hexagonsResponse).length > 0) {
          const firstHexagonData = Object.values(hexagonsResponse)[0];
          if (firstHexagonData) {
            districtFeatures.value = Object.keys(firstHexagonData).filter(key => 
              !key.includes('nearest_') && 
              !key.includes('count_') && 
              !key.includes('present_')
            );
          }
        }
      } catch (error) {
        console.error('Error loading district features:', error);
        districtFeatures.value = [];
      }
    };

    const closeErrorPopup = () => {
      showErrorPopup.value = false;
      errorMessage.value = '';
    };

    const acceptFeature = () => {
      if (!isValidFeature.value) return;

      let featureLabel = '';
      let featureId = '';

      if (DYNAMIC_FEATURE_TYPES.includes(selectedFeatureType.value)) {
        featureLabel = `${selectedFeatureType.value} ${selectedAmenity.value} (${selectedDistance.value}m)`;
        featureId = `${selectedFeatureType.value}_${selectedAmenity.value}_${selectedDistance.value}`;
        
        if (selectedFeatureType.value === 'nearest') {
          featureLabel += ` [penalty: ${selectedPenalty.value}]`;
        }
      } else if (selectedFeatureType.value === 'district') {
        featureLabel = `District: ${selectedDistrictFeature.value}`;
        featureId = `district_${selectedDistrictFeature.value}`;
      }

      const newFeature = {
        id: featureId,
        label: featureLabel,
        weight: 0,
        type: selectedFeatureType.value,
        amenity: selectedAmenity.value,
        distance: selectedDistance.value,
        penalty: selectedPenalty.value,
        districtFeature: selectedDistrictFeature.value,
        wheelchairAccessible: wheelchairAccessible.value
      };

      sliderFeatures.value.push(newFeature);
      
      // Add Free Term
      if (sliderFeatures.value.length === 1) {
        const hasFreeTerm = sliderFeatures.value.some(f => f.id === 'free-term');
        if (!hasFreeTerm) {
          sliderFeatures.value.push({
            id: 'free-term',
            label: 'Free Term',
            weight: 0,
            type: 'free-term'
          });
        }
      }
      
      resetInputs();
      emitFeatures();
    };

    const buildModel = async () => {
      if (sliderFeatures.value.length === 0) {
        showErrorPopup.value = true;
        errorMessage.value = 'Please add at least one feature before building the model.';
        return;
      }

      emit('build-model', sliderFeatures.value);
    };

    const removeFeature = (index) => {
      sliderFeatures.value.splice(index, 1);
      emitFeatures();
    };

    const updateFeatureWeight = ({ index, weight }) => {
      if (sliderFeatures.value[index]) {
        sliderFeatures.value[index].weight = weight;
        emitFeatures();
      }
    };

    const emitFeatures = () => {
      const featuresToEmit = sliderFeatures.value.length > 0 ? sliderFeatures.value : {};
      // Pass empty object if no features, otherwise pass the features array
      emit('update-features', featuresToEmit);
    };

    const resetInputs = () => {
      selectedFeatureType.value = '';
      selectedAmenity.value = '';
      selectedDistance.value = 201;
      selectedPenalty.value = 0;
      selectedDistrictFeature.value = '';
      wheelchairAccessible.value = false;
      showErrorPopup.value = false;
      errorMessage.value = '';
    };

    const resetMap = () => {
      window.location.reload();
    };

    // Event handlers
    const handleFeatureTypeChange = (type) => {
      selectedFeatureType.value = type;
      if (type === 'district' && districtFeatures.value.length === 0) {
        loadDistrictFeatures();
      }
    };

    const handleAmenityChange = (amenity) => {
      selectedAmenity.value = amenity;
    };

    const handleDistanceChange = (distance) => {
      selectedDistance.value = distance;
    };

    const handlePenaltyChange = (penalty) => {
      selectedPenalty.value = penalty;
    };

    const handleDistrictFeatureChange = (feature) => {
      selectedDistrictFeature.value = feature;
    };

    const handleWheelchairChange = (accessible) => {
      wheelchairAccessible.value = accessible;
      selectedAmenity.value = ''; // Reset amenity when wheelchair preference changes
    };

    onMounted(() => {
      loadAmenities();
    });

    watch(() => props.selectedCity, () => {
      loadAmenities();
      districtFeatures.value = [];
    });

    // Watch sliderFeatures to validate Free Term weight
    watch(sliderFeatures, (newFeatures) => {
      const freeTerm = newFeatures.find(f => f.id === 'free-term');
      if (freeTerm) {
        if (freeTerm.weight < -10) {
          freeTerm.weight = -10;
        } else if (freeTerm.weight > 10) {
          freeTerm.weight = 10;
        }
      }
    }, { deep: true });



    // Expose methods and properties for parent component access
    expose({
      sliderFeatures,
      selectedFeatureType,
      selectedAmenity,
      selectedDistance,
      selectedPenalty,
      selectedDistrictFeature,
      wheelchairAccessible,
      acceptFeature,
      emitFeatures,
      resetInputs
    });

    return {
      selectedFeatureType,
      selectedAmenity,
      selectedDistance,
      selectedPenalty,
      selectedDistrictFeature,
      wheelchairAccessible,
      sliderFeatures,
      amenities,
      districtFeatures,
      showErrorPopup,
      errorMessage,
      isValidFeature,
      closeErrorPopup,
      acceptFeature,
      buildModel,
      removeFeature,
      updateFeatureWeight,
      resetInputs,
      resetMap,
      handleFeatureTypeChange,
      handleAmenityChange,
      handleDistanceChange,
      handlePenaltyChange,
      handleDistrictFeatureChange,
      handleWheelchairChange,
      emitFeatures
    };
  }
};
</script>

<style scoped>
.feature-selector {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.mt-3 {
  margin-top: 1rem;
}

.error-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.error-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.close-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>