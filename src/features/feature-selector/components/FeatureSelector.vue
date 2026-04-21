<template>
  <div class="feature-selector">
    <FeatureTypeSelector
      v-if="expertMode"
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

    <div v-if="expertMode" class="apply-feature-row mt-2">
      <button
        type="button"
        class="btn btn-primary apply-feature-btn"
        :disabled="!isValidFeature"
        :title="applyButtonHint"
        @click="acceptFeature"
      >
        Apply Feature
      </button>
    </div>

    <FeatureSlider
      v-if="expertMode && sliderFeatures.length > 0"
      :features="sliderFeatures"
      @feature-removed="removeFeature"
      @feature-weight-updated="updateFeatureWeight"
    />

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
    },
    expertMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-features', 'build-model', 'reset-map', 'action-button-state'],
  setup(props, { emit, expose }) {
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

    const canBuildModel = computed(() => sliderFeatures.value.length > 0);

    const applyButtonHint = computed(() => {
      if (!selectedFeatureType.value) return 'Select a feature type first';
      if (DYNAMIC_FEATURE_TYPES.includes(selectedFeatureType.value)) {
        if (!selectedAmenity.value) return 'Select an amenity';
        if (selectedDistance.value < 201) return 'Set distance to at least 200 m';
      }
      if (selectedFeatureType.value === 'district' && !selectedDistrictFeature.value) {
        return 'Select a district feature';
      }
      return '';
    });

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
        
        try {
          const districtAttributesResponse = await cityApi.getDistrictAttributes(cityName);
          if (districtAttributesResponse && districtAttributesResponse.length > 0) {
            districtFeatures.value = districtAttributesResponse;
            return;
          }
        } catch (districtError) {
          console.warn('Could not load district attributes, trying hexagons endpoint:', districtError);
        }

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

      const isDuplicate = sliderFeatures.value.some((f) => f.id === featureId);
      if (isDuplicate) {
        showErrorPopup.value = true;
        errorMessage.value =
          'This feature is already added.';
        return;
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

    const applyProfile = (profile) => {
      sliderFeatures.value = [];

      if (profile?.districtFeatures) {
        profile.districtFeatures.forEach((feature) => {
          selectedFeatureType.value = 'district';
          selectedDistrictFeature.value = feature.name;
          acceptFeature();

          const districtFeature = sliderFeatures.value.find(
            (f) => f.type === 'district' && f.districtFeature === feature.name
          );
          if (districtFeature) {
            districtFeature.weight = feature.weight;
          }
        });
      }

      if (profile?.nearestAmenities) {
        profile.nearestAmenities.forEach((amenity) => {
          selectedFeatureType.value = 'nearest';
          selectedAmenity.value = amenity.name;
          selectedDistance.value = amenity.distance;
          selectedPenalty.value = amenity.penalty;
          acceptFeature();

          const nearestFeature = sliderFeatures.value.find(
            (f) => f.type === 'nearest' && f.amenity === amenity.name
          );
          if (nearestFeature) {
            nearestFeature.weight = amenity.weight;
          }
        });
      }

      if (profile?.presentAmenities) {
        profile.presentAmenities.forEach((amenity) => {
          selectedFeatureType.value = 'present';
          selectedAmenity.value = amenity.name;
          selectedDistance.value = amenity.distance;
          acceptFeature();

          const presentFeature = sliderFeatures.value.find(
            (f) => f.type === 'present' && f.amenity === amenity.name
          );
          if (presentFeature) {
            presentFeature.weight = amenity.weight;
          }
        });
      }

      if (profile?.countAmenities) {
        profile.countAmenities.forEach((amenity) => {
          selectedFeatureType.value = 'count';
          selectedAmenity.value = amenity.name;
          selectedDistance.value = amenity.distance;
          acceptFeature();

          const countFeature = sliderFeatures.value.find(
            (f) => f.type === 'count' && f.amenity === amenity.name
          );
          if (countFeature) {
            countFeature.weight = amenity.weight;
          }
        });
      }

      if (profile && profile.freeTerm !== undefined) {
        const freeTermFeature = sliderFeatures.value.find((f) => f.id === 'free-term');
        if (freeTermFeature) {
          freeTermFeature.weight = profile.freeTerm;
        }
      }

      emitFeatures();
    };

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
      selectedAmenity.value = ''; 
    };

    onMounted(() => {
      loadAmenities();
    });

    watch(() => props.selectedCity, () => {
      loadAmenities();
      districtFeatures.value = [];
    });

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

    const emitActionButtonState = () => {
      emit('action-button-state', {
        isValidFeature: isValidFeature.value,
        canBuildModel: canBuildModel.value,
        applyButtonHint: applyButtonHint.value,
        buildModelHint: canBuildModel.value ? 'Build the model using current features' : 'Add at least one feature first'
      });
    };
    watch([isValidFeature, canBuildModel, applyButtonHint], emitActionButtonState, { immediate: true });
    watch(sliderFeatures, emitActionButtonState, { deep: true });

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
      resetInputs,
      resetMap,
      isValidFeature,
      canBuildModel,
      applyProfile
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
      applyButtonHint,
      canBuildModel,
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
  padding: 0;
}

.apply-feature-btn:not(:disabled),
.build-model-btn:not(:disabled) {
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.35);
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
}

.apply-feature-row {
  margin-top: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
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
  background: var(--color-background, white);
  color: var(--color-text, #333);
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