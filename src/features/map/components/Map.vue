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
    }
  },
  setup(props, { expose }) {
    const mapContainer = ref(null);
    const map = ref(null);
    const hexagonLayer = ref(null);
    const currentZoom = ref(12);
    const selectedResolution = ref(9);

    // Use hexagon model composable
    const { 
      buildModel, 
      resetModel 
    } = useHexagonModel();

    const initializeMap = () => {
      if (!mapContainer.value) return;

      // Initialize the map
      map.value = L.map(mapContainer.value, {
        center: props.center,
        zoom: currentZoom.value,
        zoomControl: true,
        attributionControl: false,
        preferCanvas: true
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        crossOrigin: true,
        maxZoom: 19,
        minZoom: 3,
        noWrap: true,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }).addTo(map.value);

      // Add legend
      addLegend();

      // Invalidate size to ensure proper rendering
      map.value.invalidateSize();
    };

    const addLegend = () => {
      const legend = L.control({ position: 'bottomleft' });

      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 0.2, 0.4, 0.6, 0.8];
        const labels = [];

        div.innerHTML = '<h4>Score Scale</h4>';

        for (let i = 0; i < grades.length; i++) {
          const from = grades[i];
          const to = grades[i + 1] || 1.0; // Default to 1.0 for the last range
          const color = colorUtils.getColorForScore(from);

          labels.push(
            `<i style="background:${color}"></i> ${from.toFixed(1)}&ndash;${to.toFixed(1)}`
          );
        }

        div.innerHTML += labels.join('<br>');
        return div;
      };

      legend.addTo(map.value);
    };

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

    const buildModelWithData = async (featureData) => {
      try {
        // Clear existing hexagon layer
        if (hexagonLayer.value) {
          map.value.removeLayer(hexagonLayer.value);
          hexagonLayer.value = null;
        }

        // Build the model
        const modelData = await buildModel(featureData, props.selectedCity, selectedResolution.value);
        
        if (modelData && modelData.length > 0) {
          // Create hexagon polygons
          const hexagonPolygons = modelData.map(hexData => {
            try {
              const hexBoundary = h3.cellToBoundary(hexData.hexId);
              const latLngs = hexBoundary.map(point => [point[1], point[0]]);
              
              const color = colorUtils.getColorForScore(hexData.score);
              
              const hexagon = L.polygon(latLngs, {
                fillColor: color,
                fillOpacity: 0.7,
                weight: 1,
                color: '#666',
                opacity: 0.5
              });
              
              // Create popup content
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
            // Create a layer group and add all hexagons
            hexagonLayer.value = L.layerGroup(hexagonPolygons);
            hexagonLayer.value.addTo(map.value);
            
            // Fit map bounds to show all hexagons
            const bounds = L.latLngBounds(hexagonPolygons.map(hex => hex.getBounds()));
            map.value.fitBounds(bounds);
          }
        }
      } catch (err) {
        console.error('Error building model:', err);
      }
    };

    const createPopupContent = (data, score, featureData) => {
      // Extract features array
      const features = featureData.features || featureData;
      
      // Ensure features is an array
      if (!Array.isArray(features)) {
        console.error('Features is not an array in createPopupContent:', features);
        return `<b>Score: ${score.toFixed(2)}</b><br>Error: Invalid features data`;
      }
      
      // Selected features
      const selectedFeatures = features.filter(feature => 
        feature.type !== 'free-term' && feature.weight !== 0
      );

      // Create popup content
      let popupContent = `<b>Score: ${score.toFixed(2)}</b><br>`;
      
      const featureContent = selectedFeatures.map(feature => {
        let value;
        let displayName;
        
        switch (feature.type) {
          case 'nearest':
            displayName = feature.amenity || feature.label;
            value = data[`nearest_${feature.amenity}`];
            return value !== undefined ? `${displayName} distance: ${value.toFixed(2)}m` : null;
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

      popupContent += featureContent;

      // If no data was found, show a message
      return popupContent === `<b>Score: ${score.toFixed(2)}</b><br>` ? 'No data available' : popupContent;
    };

    const resetMap = () => {
      // Reset the model and hexagon layer
      resetModel();
      if (hexagonLayer.value) {
        map.value.removeLayer(hexagonLayer.value);
        hexagonLayer.value = null;
      }
      
    };

    // Watch for center changes
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

    // Expose methods for parent component
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
</style> 