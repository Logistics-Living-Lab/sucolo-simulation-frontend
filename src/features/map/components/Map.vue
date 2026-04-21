<template>
  <div class="map-container" ref="mapContainer"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import * as h3 from 'h3-js';
import { colorUtils } from '../helpers/colorUtils';
import { useHexagonModel } from '../composables/useHexagonModel';

export default {
  name: 'Map',
  props: {
    features: {
      type: Object,
      default: () => ({})
    },
    center: {
      type: Array,
      required: true
    },
    selectedCity: {
      type: String,
      required: true
    },
    legendVisible: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  emits: ['close-legend'],
  setup(props, { expose, emit }) {
    const mapContainer = ref(null);
    const map = ref(null);
    const tileLayerRef = ref(null);
    const legendControlRef = ref(null);
    const hexagonLayer = ref(null);
    const compassControlRef = ref(null);
    const currentZoom = ref(12);
    const selectedResolution = ref(9);
    const hexagonTransparency = ref(60);

    const { 
      buildModel, 
      resetModel 
    } = useHexagonModel();

    const initializeMap = () => {
      if (!mapContainer.value) return;

      map.value = L.map(mapContainer.value, {
        center: props.center,
        zoom: currentZoom.value,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true
      });

      setTileLayer(map.value, props.theme);

      addCompassControl();
      L.control
        .zoom({
          position: 'topleft'
        })
        .addTo(map.value);

      map.value.invalidateSize();
    };

    const TILE_LAYERS = {
      light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 3
        }
      },
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        options: {
          attribution: '© OpenStreetMap © CARTO',
          maxZoom: 19,
          minZoom: 3
        }
      }
    };

    function setTileLayer(mapInstance, theme) {
      if (!mapInstance) return;
      if (tileLayerRef.value) {
        mapInstance.removeLayer(tileLayerRef.value);
        tileLayerRef.value = null;
      }
      const config = TILE_LAYERS[theme === 'dark' ? 'dark' : 'light'];
      const layer = L.tileLayer(config.url, {
        ...config.options,
        crossOrigin: true,
        noWrap: true,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      });
      layer.addTo(mapInstance);
      tileLayerRef.value = layer;
    }

    const addCompassControl = () => {
      if (!map.value || compassControlRef.value) return;

      const CompassControl = L.Control.extend({
        onAdd() {
          const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-compass');
          container.innerHTML = `
            <div class="compass-circle">
              <div class="compass-arrow"></div>
              <span class="compass-label">N</span>
            </div>
          `;

          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);

          return container;
        }
      });

      compassControlRef.value = new CompassControl({ position: 'topleft' });
      compassControlRef.value.addTo(map.value);
    };

    const addLegend = () => {
      if (!map.value || legendControlRef.value) return;
      const legend = L.control({ position: 'bottomleft' });

      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const isDark = props.theme === 'dark';
        div.style.backgroundColor = isDark ? 'rgba(40, 40, 40, 0.92)' : 'rgba(255, 255, 255, 0.6)';
        div.style.color = isDark ? '#e0e0e0' : '#333';
        div.style.border = 'none';
        div.style.boxShadow = 'none';
        div.style.position = 'relative';
        
        const gradientStops = [];
        for (let i = 0; i <= 20; i++) {
          const score = i * 0.1;
          const color = colorUtils.getColorForScore(score);
          const position = (i * 100) / 10;
          gradientStops.push(`${color} ${position}%`);
        }
        
        const gradient = `linear-gradient(to right, ${gradientStops.join(', ')})`;
        
        div.innerHTML = `
          <button
            type="button"
            class="legend-close-btn"
            aria-label="Close score scale"
            style="
              position: absolute;
              top: 2px;
              right: 4px;
              width: 16px;
              height: 16px;
              border: none;
              padding: 0;
              margin: 0;
              background: transparent;
              color: ${isDark ? '#e0e0e0' : '#000'};
              font-size: 12px;
              line-height: 1;
              cursor: pointer;
            "
          >
            ×
          </button>
          <h4 style="margin: 0 18px 2px 0;">Score Scale</h4>
          <div class="gradient-bar" style="background: ${gradient}; height: 20px; width: 100%; border: 1px solid #333; margin: 5px 0;"></div>
          <div class="gradient-labels" style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
            <span>0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
          <div class="hexagon-transparency" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid ${isDark ? '#555' : '#ccc'};">
            <label style="display: block; font-size: 13px; margin-bottom: 4px; font-weight: 700;">Layer transparency</label>
            <input type="range" min="0" max="100" value="${hexagonTransparency.value}" class="hexagon-transparency-slider" style="width: 100%; margin: 0;">
            <div class="hexagon-transparency-labels" style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 2px;">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        `;
        
        const closeBtn = div.querySelector('.legend-close-btn');
        const transparencySlider = div.querySelector('.hexagon-transparency-slider');
        if (transparencySlider) {
          transparencySlider.value = hexagonTransparency.value;
          transparencySlider.addEventListener('input', () => {
            const pct = parseInt(transparencySlider.value, 10);
            hexagonTransparency.value = pct;
            const opacity = pct / 100;
            if (hexagonLayer.value) {
              hexagonLayer.value.eachLayer((layer) => {
                if (layer.setStyle) layer.setStyle({ fillOpacity: opacity });
              });
            }
          });
        }
        if (closeBtn) {
          closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            emit('close-legend');
          });
        }
        
        return div;
      };

      legend.addTo(map.value);
      legendControlRef.value = legend;
    };

    const removeLegend = () => {
      if (map.value && legendControlRef.value) {
        map.value.removeControl(legendControlRef.value);
        legendControlRef.value = null;
      }
    };

    watch(
      () => [props.legendVisible, map.value],
      ([visible, m]) => {
        if (!m) return;
        if (visible) addLegend();
        else removeLegend();
      },
      { immediate: true }
    );

    watch(
      () => props.theme,
      (newTheme) => {
        if (map.value) {
          setTileLayer(map.value, newTheme);
          if (props.legendVisible && legendControlRef.value) {
            removeLegend();
            addLegend();
          }
        }
      }
    );

    const setCenter = (coords, zoom) => {
      if (map.value) {
        currentZoom.value = zoom;
        map.value.setView(coords, zoom);
      }
    };

    const setResolution = (resolution) => {
      if (map.value) {
        selectedResolution.value = resolution;
      }
    };

    const buildModelWithData = async (featureData, resolutionOverride) => {
        if (hexagonLayer.value) {
          map.value.removeLayer(hexagonLayer.value);
          hexagonLayer.value = null;
        }

        const resolutionToUse = resolutionOverride !== undefined && resolutionOverride !== null
          ? Number(resolutionOverride)
          : selectedResolution.value;
        if (resolutionToUse !== selectedResolution.value) {
          selectedResolution.value = resolutionToUse;
        }

        const modelData = await buildModel(featureData, props.selectedCity, resolutionToUse);
        
        if (modelData && modelData.length > 0) {
          const hexagonPolygons = modelData.map(hexData => {
            try {
              const hexBoundary = h3.cellToBoundary(hexData.hexId);
              const latLngs = hexBoundary.map(point => [point[1], point[0]]);
              
              const color = colorUtils.getColorForScore(hexData.score);
              
              const opacity = hexagonTransparency.value / 100;
              const hexagon = L.polygon(latLngs, {
                fillColor: color,
                fillOpacity: opacity,
                weight: 1,
                color: '#666',
                opacity: 0.5
              });
              
              const popupContent = createPopupContent(hexData.data, hexData.score, featureData);
              hexagon.bindPopup(popupContent);
              hexagon._index = hexData.index;
              
              return hexagon;
            } catch (err) {
              console.error('Error creating hexagon polygon:', err);
              return null;
            }
          }).filter(Boolean);

          if (hexagonPolygons.length > 0) {
            hexagonLayer.value = L.layerGroup(hexagonPolygons);
            hexagonLayer.value.addTo(map.value);

            const bounds = L.latLngBounds(hexagonPolygons.map(hex => hex.getBounds()));
            map.value.fitBounds(bounds);
          }
        }
        return Array.isArray(modelData) ? modelData : [];
     };

    const buildScoreBarGradient = () => {
      const stops = [];
      for (let i = 0; i <= 20; i++) {
        const s = i * 0.05;
        const color = colorUtils.getColorForScore(s);
        stops.push(`${color} ${i * 5}%`);
      }
      return `linear-gradient(to right, ${stops.join(', ')})`;
    };

    const createPopupContent = (data, score, featureData) => {
      const features = featureData.features || featureData;
      const borderColor = '#555';
      const markerBg = '#e0e0e0';
      const markerRing = '#222';

      if (!Array.isArray(features)) {
        console.error('Features is not an array in createPopupContent:', features);
        return `<b>Score: ${score.toFixed(2)}</b><br>Error: Invalid features data`;
      }
      
      const selectedFeatures = features.filter(feature => 
        feature.type !== 'free-term' && feature.weight !== 0
      );

      const normalizedScore = Math.max(0, Math.min(1, score));
      const markerPercent = normalizedScore * 100;
      const gradient = buildScoreBarGradient();

      const scoreBarHtml = `
        <div class="leaflet-popup-score-row" style="display: flex; align-items: center; gap: 10px; margin: 0 0 4px 0;">
          <span style="font-weight: bold; white-space: nowrap;">Score: ${score.toFixed(2)}</span>
          <div class="leaflet-popup-score-bar" style="flex: 1; min-width: 80px; max-width: 160px; height: 16px; border-radius: 4px; border: 1px solid ${borderColor}; background: ${gradient}; position: relative; overflow: visible;">
            <span class="leaflet-popup-score-marker" style="position: absolute; left: ${markerPercent}%; top: 50%; transform: translate(-50%, -50%); width: 4px; height: 20px; background: ${markerBg}; border-radius: 2px; box-shadow: 0 0 0 1px ${markerRing}; pointer-events: none;"></span>
          </div>
        </div>`;

      let popupContent = scoreBarHtml;
      
      const featureContent = selectedFeatures.map(feature => {
        let value;
        let displayName;
        
        switch (feature.type) {
          case 'nearest':
            displayName = feature.amenity || feature.label;
            value = data[`nearest_${feature.amenity}`];
            if (value === undefined) return null;
            
            const distanceThreshold = feature.distance || 0;
            
            if (distanceThreshold > 0 && value > distanceThreshold) {
              return `${displayName} distance: >${distanceThreshold.toFixed(2)}m`;
            }
            
            return `${displayName} distance: ${value.toFixed(2)}m`;
          case 'count':
            displayName = feature.amenity || feature.label;
            value = data[`count_${feature.amenity}`];
            return value !== undefined ? `${displayName} count: ${value}` : null;
          case 'present':
            displayName = feature.amenity || feature.label;
            value = data[`present_${feature.amenity}`];
            return value !== undefined ? `${displayName}: ${value ? 'Yes' : 'No'}` : null;
          case 'district':
            displayName = feature.districtFeature || feature.label;
            value = data[feature.districtFeature];
            return value !== undefined ? `${displayName}: ${value.toFixed(2)}` : null;
          default:
            return null;
        }
      })
      .filter(Boolean)
      .join('<br>');

      popupContent += featureContent
        ? `<div style="margin-top: 4px; line-height: 1.25;">${featureContent}</div>`
        : `<div class="leaflet-popup-muted" style="margin-top: 4px;">No data available</div>`;

      return popupContent;
    };

    const resetMap = () => {

      resetModel();
      if (hexagonLayer.value) {
        map.value.removeLayer(hexagonLayer.value);
        hexagonLayer.value = null;
      }
      
    };

    watch(() => props.center, (newCenter) => {
      if (map.value && newCenter) {
        setCenter(newCenter, currentZoom.value);
      }
    });

    onMounted(() => {
      initializeMap();
    });

    onUnmounted(() => {
      if (map.value) {
        map.value.remove();
      }
    });

    expose({
      setCenter,
      setResolution,
      buildModel: buildModelWithData,
      resetMap
    });

    return {
      mapContainer
    };
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

:deep(.leaflet-control-compass) {
  padding: 1px;
  background: var(--color-background-soft, #f2f2f2);
  border-radius: 4px 4px 0 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  margin-bottom: 0;
  border: 1px solid var(--color-border, #dee2e6);
  border-bottom: none;
}

:deep(.leaflet-top.leaflet-left .leaflet-control-zoom) {
  margin-top: 0; 
}

:deep(.leaflet-control-compass .compass-circle) {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-border, #333);
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 30% 30%,
    var(--color-background-soft, #ffffff),
    var(--color-background-mute, #e6e6e6)
  );
}

:deep(.leaflet-control-compass .compass-arrow) {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 9px solid #d32f2f;
  transform: translateY(-1px);
}

:deep(.leaflet-control-compass .compass-label) {
  position: absolute;
  bottom: 1px;
  font-size: 8px;
  font-weight: 700;
  color: var(--color-text, #e0e0e0);
}

:deep(.info.legend) {
  background-color: rgba(255, 255, 255, 0.6) !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.leaflet-popup-content) {
  margin: 6px 12px;
  line-height: 1.25;
}
</style> 