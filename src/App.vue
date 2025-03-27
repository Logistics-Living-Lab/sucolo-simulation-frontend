<template>
    <div>
        <div id="map"></div>
        <FeatureSelector @update-features="updateSelectedFeatures" />
        <button @click="sendQuery">Apply</button>
    </div>
</template>
  
  <script>
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { gridDisk, cellToBoundary } from "h3-js";
  import axios from 'axios';
  import FeatureSelector from './components/FeatureSelector.vue';
  
  export default {
    components: { FeatureSelector },
    data() {
      return {
        map: null,
        hexLayer: null,
        selectedFeatures: [],
        hexagons: []
      };
    },
    mounted() {
      this.initMap();
    },
    methods: {
      initMap() {
        this.map = L.map('map').setView([52.52, 13.405], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        this.loadHexagons();
      },
      loadHexagons() {
        const hexes = gridDisk("8828308281fffff", 2);
        this.hexagons = hexes.map(hex => ({ id: hex, color: '#3388ff' }));
        this.renderHexagons();
      },
      renderHexagons() {
        if (this.hexLayer) this.hexLayer.clearLayers();
        this.hexLayer = L.layerGroup();
        this.hexagons.forEach(({ id, color }) => {
          const coords = cellToBoundary(id);
          const polygon = L.polygon(coords, { color }).addTo(this.hexLayer);
        });
        this.hexLayer.addTo(this.map);
      },
      async sendQuery() {
        try {
          const response = await axios.post('/api/predict', { features: this.selectedFeatures });
          this.hexagons = response.data.hexagons;
          this.renderHexagons();
        } catch (error) {
          console.error("Error fetching data", error);
        }
      },
      updateSelectedFeatures(features) {
        this.selectedFeatures = features;
      }
    }
  };
  </script>
  
  <style>
  #map { height: 500px; }
  .controls { padding: 10px; }
  </style>
