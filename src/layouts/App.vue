<template>
  <div class="app-container">
    <div class="control-panel">
      <AppHeader />
      
      <CitySelector @city-changed="handleCityChange" />
      
      <ResolutionSelector 
        :cityName="getCurrentCityName()" 
        @resolution-changed="handleResolutionChange" 
      />

      <FeatureSelector 
        @update-features="updateFeatures" 
        @build-model="buildModel" 
        class="mt-4"
        :ref="setFeatureSelectorRef"
        :selectedCity="selectedCity"
      />

      <ProfileButtons @profile-applied="handleProfileApplied" />
    </div>
    
    <div class="map-wrapper">
      <Map 
        :features="currentFeatures" 
        ref="mapRef" 
        :center="currentCityCoords" 
        :selectedCity="selectedCity"
      />
    </div>

    <LoadingPopup :isLoading="isLoading" message="Building model" />
    <BackendStatus />
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue';
import AppHeader from './AppHeader.vue';
import LoadingPopup from './LoadingPopup.vue';
import BackendStatus from '../shared/components/BackendStatus.vue';
import CitySelector from '../features/city-selector/components/CitySelector.vue';
import ResolutionSelector from '../features/city-selector/components/ResolutionSelector.vue';
import FeatureSelector from '../features/feature-selector/components/FeatureSelector.vue';
import ProfileButtons from '../features/profiles/components/ProfileButtons.vue';
import Map from '../features/map/components/Map.vue';

import { useCityData } from '../features/city-selector/composables/useCityData.js';

export default {
  name: 'App',
  components: {
    AppHeader,
    LoadingPopup,
    BackendStatus,
    CitySelector,
    ResolutionSelector,
    FeatureSelector,
    ProfileButtons,
    Map
  },
  setup() {
    const { 
      selectedCity, 
      currentCityCoords, 
      currentCityZoom,
      getCurrentCityName, 
      setCity 
    } = useCityData();
    
    const currentFeatures = ref({});
    const isLoading = ref(false);
    const mapRef = ref(null);
    const featureSelectorRef = ref(null);
    
    const setFeatureSelectorRef = (el) => {
      featureSelectorRef.value = el;
    };

    const handleCityChange = (cityName) => {
      setCity(cityName);
      if (mapRef.value) {
        mapRef.value.setCenter(currentCityCoords.value, currentCityZoom.value);
      }
    };

    const handleResolutionChange = (resolution) => {
      if (mapRef.value) {
        mapRef.value.setResolution(resolution);
      }
    };

    const updateFeatures = (features) => {
      currentFeatures.value = features;
    };

    const buildModel = async (features) => {
      isLoading.value = true;
      try {
        if (!mapRef.value) return;
        
        const featureData = {
          city: selectedCity.value,
          features: features
        };
        
        await mapRef.value.buildModel(featureData);
      } catch (error) {
        console.error('Error in buildModel:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const handleProfileApplied = (profile) => {
      
      // Use nextTick to ensure the component is mounted
      nextTick(() => {
        if (featureSelectorRef.value) {
        // Clear existing features
        featureSelectorRef.value.sliderFeatures = [];
        
        // Apply district features
        if (profile.districtFeatures) {
          profile.districtFeatures.forEach(feature => {
            featureSelectorRef.value.selectedFeatureType = 'district';
            featureSelectorRef.value.selectedDistrictFeature = feature.name;
            featureSelectorRef.value.acceptFeature();
            
            // Set the weight after adding the feature
            const districtFeature = featureSelectorRef.value.sliderFeatures.find(f => 
              f.type === 'district' && f.districtFeature === feature.name
            );
            if (districtFeature) {
              districtFeature.weight = feature.weight;
            }
          });
        }

        // Apply nearest amenities
        if (profile.nearestAmenities) {
          profile.nearestAmenities.forEach(amenity => {
            featureSelectorRef.value.selectedFeatureType = 'nearest';
            featureSelectorRef.value.selectedAmenity = amenity.name;
            featureSelectorRef.value.selectedDistance = amenity.distance;
            featureSelectorRef.value.selectedPenalty = amenity.penalty;
            featureSelectorRef.value.acceptFeature();
            
            // Set the weight after adding the feature
            const nearestFeature = featureSelectorRef.value.sliderFeatures.find(f => 
              f.type === 'nearest' && f.amenity === amenity.name
            );
            if (nearestFeature) {
              nearestFeature.weight = amenity.weight;
            }
          });
        }

        // Apply present amenities
        if (profile.presentAmenities) {
          profile.presentAmenities.forEach(amenity => {
            featureSelectorRef.value.selectedFeatureType = 'present';
            featureSelectorRef.value.selectedAmenity = amenity.name;
            featureSelectorRef.value.selectedDistance = amenity.distance;
            featureSelectorRef.value.acceptFeature();
            
            // Set the weight after adding the feature
            const presentFeature = featureSelectorRef.value.sliderFeatures.find(f => 
              f.type === 'present' && f.amenity === amenity.name
            );
            if (presentFeature) {
              presentFeature.weight = amenity.weight;
            }
          });
        }

        // Apply count amenities
        if (profile.countAmenities) {
          profile.countAmenities.forEach(amenity => {
            featureSelectorRef.value.selectedFeatureType = 'count';
            featureSelectorRef.value.selectedAmenity = amenity.name;
            featureSelectorRef.value.selectedDistance = amenity.distance;
            featureSelectorRef.value.acceptFeature();
            
            // Set the weight after adding the feature
            const countFeature = featureSelectorRef.value.sliderFeatures.find(f => 
              f.type === 'count' && f.amenity === amenity.name
            );
            if (countFeature) {
              countFeature.weight = amenity.weight;
            }
          });
        }

        // Apply free term from profile
        if (profile.freeTerm !== undefined) {
          const freeTermFeature = featureSelectorRef.value.sliderFeatures.find(f => 
            f.id === 'free-term'
          );
          if (freeTermFeature) {
            freeTermFeature.weight = profile.freeTerm;
          }
        }

        // Emit the features to update the model
        featureSelectorRef.value.emitFeatures();
        } 
      });
    };

    // Load resolutions when city changes
    watch(() => selectedCity.value, async (newCity) => {
      if (newCity) {
        // Reset all chosen features when city changes
        if (featureSelectorRef.value) {
          // Clear all selected features
          featureSelectorRef.value.sliderFeatures = [];
          // Reset input fields
          featureSelectorRef.value.resetInputs();
          // Emit empty features to clear the model
          featureSelectorRef.value.emitFeatures();
        }
        
        // Reset the map
        if (mapRef.value) {
          mapRef.value.resetMap();
        }
        
        // Reset current features
        currentFeatures.value = {};
        
        // Reset loading state
        isLoading.value = false;

      }
    });

    return {
      selectedCity,
      currentCityCoords,
      currentFeatures,
      isLoading,
      mapRef,
      featureSelectorRef,
      setFeatureSelectorRef,
      getCurrentCityName,
      handleCityChange,
      handleResolutionChange,
      updateFeatures,
      buildModel,
      handleProfileApplied
    };
  }
};
</script>

<style>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.control-panel {
  width: 520px;
  max-width: 100%;
  background: white;
  padding: 20px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  height: 100vh;
}

.map-wrapper {
  flex: 1;
  height: 100%;
}

.mt-4 {
  margin-top: 1rem;
}
</style> 