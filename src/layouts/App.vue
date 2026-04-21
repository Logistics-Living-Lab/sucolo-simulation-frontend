<template>
  <div class="app-container">
    <div class="control-panel-wrap">
      <div
        class="control-panel"
        :class="{ 'control-panel--collapsed': panelCollapsed }"
      >
        <WidgetPane
          :legend-visible="legendVisible"
          :can-download-results="canDownloadResults"
          @toggle-legend="legendVisible = !legendVisible"
          @save-features="handleSaveFeatures"
          @upload-features="handleUploadFeatures"
          @download-results="handleDownloadResults"
        />

        <div class="control-panel__main" v-show="!panelCollapsed">
          <AppHeader />
      
      <CitySelector @city-changed="handleCityChange" />

      <ResolutionSelector 
        :cityName="getCurrentCityName()" 
        @resolution-changed="handleResolutionChange" 
      />

      <ProfileButtons :selected-city="selectedCity" @profile-applied="handleProfileApplied" />

      <div class="button-row mt-3">
        <button
          type="button"
          class="btn btn-primary build-model-btn"
          :disabled="!actionButtonState.canBuildModel"
          :title="actionButtonState.buildModelHint"
          @click="onBuildModel"
        >
          Build Model
        </button>
        <button
          type="button"
          class="btn btn-danger"
          @click="onResetModel"
        >
          Reset Model
        </button>
      </div>

      <div class="expert-mode-toggle">
        <label class="expert-mode-switch">
          <span class="expert-mode-switch__label">Expert Mode</span>
          <input
            type="checkbox"
            class="expert-mode-switch__input"
            v-model="expertMode"
          />
          <span class="expert-mode-switch__track" aria-hidden="true" />
        </label>
      </div>

      <FeatureSelector 
        @update-features="updateFeatures" 
        @build-model="buildModel"
        @action-button-state="onActionButtonState"
        class="mt-4"
        :ref="setFeatureSelectorRef"
        :selectedCity="selectedCity"
        :expert-mode="expertMode"
      />
        </div>
      </div>

      <button
        type="button"
        class="control-panel__collapse-btn"
        :title="panelCollapsed ? 'Expand panel' : 'Collapse panel'"
        :aria-label="panelCollapsed ? 'Expand panel' : 'Collapse panel'"
        @click="panelCollapsed = !panelCollapsed"
      >
        {{ panelCollapsed ? '›' : '‹' }}
      </button>
    </div>
    
    <div class="map-wrapper">
      <Map 
        :features="currentFeatures" 
        ref="mapRef" 
        :center="currentCityCoords" 
        :selectedCity="selectedCity"
        :legend-visible="legendVisible"
        :theme="theme"
        @close-legend="legendVisible = false"
      />
    </div>

    <LoadingPopup :isLoading="isLoading" message="Building model" />
    <ErrorPopup 
      :showError="showError" 
      :title="errorTitle" 
      :message="errorMessage"
      @close="closeErrorPopup"
    />
    <BackendStatus />
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue';
import AppHeader from './AppHeader.vue';
import LoadingPopup from './LoadingPopup.vue';
import ErrorPopup from './ErrorPopup.vue';
import BackendStatus from '../shared/components/BackendStatus.vue';
import CitySelector from '../features/city-selector/components/CitySelector.vue';
import ResolutionSelector from '../features/city-selector/components/ResolutionSelector.vue';
import FeatureSelector from '../features/feature-selector/components/FeatureSelector.vue';
import ProfileButtons from '../features/profiles/components/ProfileButtons.vue';
import Map from '../features/map/components/Map.vue';
import WidgetPane from './WidgetPane.vue';

import { useCityData } from '../features/city-selector/composables/useCityData.js';
import { useTheme } from '../composables/useTheme.js';
import { getCityName } from '../features/city-selector/constants/cities.js';
import { CITY_DEFAULT_RESOLUTION } from '../features/city-selector/constants/resolutions.js';

export default {
  name: 'App',
  components: {
    AppHeader,
    LoadingPopup,
    ErrorPopup,
    BackendStatus,
    CitySelector,
    ResolutionSelector,
    FeatureSelector,
    ProfileButtons,
    Map,
    WidgetPane
  },
  setup() {
    const { 
      selectedCity, 
      currentCityCoords, 
      currentCityZoom,
      getCurrentCityName, 
      setCity 
    } = useCityData();
    const { theme } = useTheme();

    const currentFeatures = ref({});
    const isLoading = ref(false);
    const mapRef = ref(null);
    const featureSelectorRef = ref(null);
    const currentResolution = ref(9);
    const showError = ref(false);
    const errorTitle = ref('');
    const errorMessage = ref('');
    const panelCollapsed = ref(false);
    const legendVisible = ref(true);
    const expertMode = ref(false);
    const canDownloadResults = ref(false);
    const modelResults = ref([]);
    const actionButtonState = ref({
      isValidFeature: false,
      canBuildModel: false,
      applyButtonHint: '',
      buildModelHint: 'Add at least one feature first'
    });

    const setFeatureSelectorRef = (el) => {
      featureSelectorRef.value = el;
    };

    const handleSaveFeatures = () => {
      const selector = featureSelectorRef.value;
      const features = selector?.sliderFeatures || [];

      if (!Array.isArray(features) || features.length === 0) {
        errorTitle.value = 'Save features';
        errorMessage.value = 'No features to save. Please add features first.';
        showError.value = true;
        return;
      }

      const cityName = getCurrentCityName();

      const payload = {
        city: cityName || null,
        features
      };

      const content = JSON.stringify(payload, null, 2);

      try {
        const blob = new Blob([content], {
          type: 'application/json;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        const safeCity = cityName ? cityName.replace(/[^a-z0-9_-]+/gi, '_') : 'unknown';

        link.href = url;
        link.download = `sucolo-features-${safeCity}-${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Failed to trigger features download:', e);
      }
    };

    const handleUploadFeatures = () => {
      const selector = featureSelectorRef.value;
      if (!selector) return;

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';

      input.addEventListener('change', async (event) => {
        const target = event.target;
        const file = target && target.files && target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const parsed = JSON.parse(text);

          // Accept either { features: [...] } or bare array [...]
          const features = Array.isArray(parsed) ? parsed : parsed.features;
          if (!Array.isArray(features) || features.length === 0) {
            errorTitle.value = 'Upload features';
            errorMessage.value =
              'The uploaded file does not contain any features. Please export and upload a features JSON from SuCoLo.';
            showError.value = true;
            return;
          }

          selector.sliderFeatures = features;
          if (selector.emitFeatures) {
            selector.emitFeatures();
          }
        } catch (error) {
          errorTitle.value = 'Upload features';
          errorMessage.value =
            'The selected file is not valid JSON. Please choose a JSON file exported from SuCoLo.';
          showError.value = true;
          console.error('Failed to read uploaded features JSON:', error);
        } finally {
          // Clean up input element
          input.value = '';
        }
      });

      input.click();
    };

    const onActionButtonState = (state) => {
      actionButtonState.value = { ...state };
    };

    const onApplyFeature = () => {
      featureSelectorRef.value?.acceptFeature?.();
    };

    const onBuildModel = () => {
      const fs = featureSelectorRef.value;
      const raw = fs?.sliderFeatures;
      const list = Array.isArray(raw) ? raw : (raw?.value ?? []);
      if (list.length > 0) {
        buildModel(list);
      } else {
        showError.value = true;
        errorTitle.value = 'Build Model';
        errorMessage.value = 'Please add at least one feature before building the model.';
      }
    };

    const onResetModel = () => {
      featureSelectorRef.value?.resetMap?.();
    };

    const handleCityChange = (cityName) => {
      setCity(cityName);
      const cityKey = getCityName(cityName);
      const defaultRes = CITY_DEFAULT_RESOLUTION[cityKey];
      if (defaultRes !== undefined) {
        currentResolution.value = defaultRes;
      }
      if (mapRef.value) {
        mapRef.value.setCenter(currentCityCoords.value, currentCityZoom.value);
        mapRef.value.setResolution(currentResolution.value);
      }
    };

    const handleResolutionChange = (resolution) => {
      currentResolution.value = resolution;
      if (mapRef.value) {
        mapRef.value.setResolution(resolution);
      }
    };

    const updateFeatures = (features) => {
      currentFeatures.value = features;
    };

    const buildModel = async (features) => {
      isLoading.value = true;
      showError.value = false; // Reset error state
      try {
        if (!mapRef.value) return;
        
        const featureData = {
          city: selectedCity.value,
          features: features
        };
        const resolution = currentResolution.value ?? 9;
        const builtResults = await mapRef.value.buildModel(featureData, resolution);
        modelResults.value = Array.isArray(builtResults) ? builtResults : [];
        canDownloadResults.value = true;
      } catch (error) {
        canDownloadResults.value = false;
        modelResults.value = [];
        // Check if it's a 404 error
        if (error.statusCode === 404) {
          errorTitle.value = 'Feature Not Found';
          errorMessage.value = 'The requested feature is not available in the backend. Please check your feature selection and try again.';
          showError.value = true;
        } else {
          // For other errors, show a generic message
          errorTitle.value = 'Error Building Model';
          errorMessage.value = error.message || 'An error occurred while building the model. Please try again.';
          showError.value = true;
        }
      } finally {
        isLoading.value = false;
      }
    };

    const handleDownloadResults = () => {
      if (!canDownloadResults.value || modelResults.value.length === 0) {
        return;
      }

      const selector = featureSelectorRef.value;
      const features = selector?.sliderFeatures || [];
      const selectedFeatures = Array.isArray(features)
        ? features.filter((feature) => feature.type !== 'free-term')
        : [];
      const freeTermFeature = Array.isArray(features)
        ? features.find((feature) => feature.type === 'free-term' || feature.id === 'free-term')
        : null;

      const cityName = getCurrentCityName();
      const selectedResolutionValue = currentResolution.value ?? null;
      const payload = {
        exportMode: 'extended',
        city: cityName || null,
        cityCode: selectedCity.value || null,
        resolution: selectedResolutionValue,
        generatedAt: new Date().toISOString(),
        selectedFeatures: selectedFeatures.map((feature) => ({
          type: feature.type,
          label: feature.label || null,
          amenity: feature.amenity || null,
          districtFeature: feature.districtFeature || null,
          distance: feature.distance ?? null,
          penalty: feature.penalty ?? null,
          weight: feature.weight ?? 0
        })),
        freeTerm: freeTermFeature?.weight ?? 0,
        results: modelResults.value.map((result) => ({
          hexId: result.hexId,
          score: result.score,
          rawFeatureValues: result.data || {}
        }))
      };

      const content = JSON.stringify(payload, null, 2);
      try {
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        const safeCity = cityName ? cityName.replace(/[^a-z0-9_-]+/gi, '_') : 'unknown';

        link.href = url;
        link.download = `sucolo-results-${safeCity}-${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Failed to trigger results download:', e);
      }
    };

    const closeErrorPopup = () => {
      showError.value = false;
      errorTitle.value = '';
      errorMessage.value = '';
    };

    const handleProfileApplied = (profile) => {
      nextTick(() => {
        featureSelectorRef.value?.applyProfile?.(profile);
      });
    };

    // Load resolutions when city changes
    watch(() => selectedCity.value, async (newCity) => {
      if (newCity) {
        // Reset all chosen features when city changes
        if (featureSelectorRef.value) {
          featureSelectorRef.value.sliderFeatures = [];
          featureSelectorRef.value.resetInputs();
          featureSelectorRef.value.emitFeatures();
        }
        
        if (mapRef.value) {
          mapRef.value.resetMap();
        }
        
        currentFeatures.value = {};
        canDownloadResults.value = false;
        modelResults.value = [];
        
        isLoading.value = false;

      }
    });

    return {
      panelCollapsed,
      legendVisible,
      expertMode,
      canDownloadResults,
      theme,
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
      actionButtonState,
      onActionButtonState,
      onApplyFeature,
      onBuildModel,
      onResetModel,
      handleProfileApplied,
      showError,
      errorTitle,
      errorMessage,
      closeErrorPopup,
      handleSaveFeatures,
      handleUploadFeatures,
      handleDownloadResults
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

.control-panel-wrap {
  position: relative;
  display: flex;
  flex-shrink: 0;
  height: 100vh;
  overflow: visible;
  z-index: 1000;
}

.control-panel {
  width: 440px;
  max-width: 100%;
  background: var(--color-background, #fff);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  transition: width 0.25s ease;
}

.control-panel--collapsed {
  width: 56px;
}

.control-panel--collapsed .control-panel__main {
  width: 0;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  visibility: hidden;
}

.control-panel__main {
  flex: 1;
  min-width: 0;
  padding: 12px;
  font-size: 0.85rem;
  overflow-y: auto;
  transition: width 0.25s ease, padding 0.25s ease;
}

.control-panel__collapse-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: -20px;
  z-index: 1001;
  width: 24px;
  min-width: 24px;
  height: 56px;
  padding: 0;
  border: 1px solid var(--color-border, #ddd);
  border-left: none;
  border-radius: 0 6px 6px 0;
  background: var(--color-background-soft, #f8f8f8);
  color: var(--color-text, #555);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}

.control-panel__collapse-btn:hover {
  background: var(--color-background-mute, #eee);
  border-color: var(--color-border-hover, #ccc);
}

:root[data-theme='light'] .control-panel__collapse-btn {
  background: #ffffff;
}

:root[data-theme='light'] .control-panel__collapse-btn:hover {
  background: #f5f5f5;
}

.control-panel__main .button-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.control-panel__main .button-row .btn {
  min-width: 8.5rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
}

.control-panel__main .btn {
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: inherit;
}

.control-panel__main .btn-primary {
  background-color: #28a745;
  color: white;
}

.control-panel__main .btn-primary:hover:not(:disabled) {
  background-color: #218838;
}

.control-panel__main .btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.control-panel__main .apply-feature-btn:not(:disabled),
.control-panel__main .build-model-btn:not(:disabled) {
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.35);
  background-color: #218838;
}

.control-panel__main .btn-danger {
  background-color: #dc3545;
  color: white;
}

.control-panel__main .btn-danger:hover {
  background-color: #c82333;
}

.expert-mode-toggle {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.expert-mode-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.expert-mode-switch__label {
  font-size: 1rem;
  font-weight: bold;
  color: var(--color-heading, #333);
}

.expert-mode-switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.expert-mode-switch__track {
  position: relative;
  flex-shrink: 0;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--color-border, #ccc);
  transition: background 0.2s;
}

.expert-mode-switch__track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.expert-mode-switch__input:checked + .expert-mode-switch__track {
  background: var(--color-primary, #007bff);
}

.expert-mode-switch__input:checked + .expert-mode-switch__track::after {
  transform: translateX(16px);
}

.expert-mode-switch:hover .expert-mode-switch__track {
  background: var(--color-border-hover, #bbb);
}

.expert-mode-switch:hover .expert-mode-switch__input:checked + .expert-mode-switch__track {
  background: #0056b3;
}

.map-wrapper {
  flex: 1;
  height: 100%;
}

.mt-4 {
  margin-top: 0.75rem;
}
</style>