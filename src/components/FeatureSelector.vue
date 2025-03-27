<template>
<div class="feature-selector">
    <input v-model="searchQuery" placeholder="Search features..." />
    <ul v-if="filteredFeatures.length">
    <li v-for="feature in filteredFeatures" :key="feature" @click="selectFeature(feature)">
        {{ feature }}
    </li>
    </ul>
    <div class="selected-features">
    <span v-for="feature in selectedFeatures" :key="feature" class="selected-item">
        {{ feature }} <button @click="removeFeature(feature)">x</button>
    </span>
    </div>
</div>
</template>

<script>
import axios from "axios";

export default {
data() {
    return {
    allFeatures: [],
    selectedFeatures: [],
    searchQuery: "",
    };
},
computed: {
    filteredFeatures() {
    if (!this.searchQuery) return this.allFeatures;
    return this.allFeatures.filter((f) =>
        f.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    },
},
async created() {
    try {
        const response = await axios.get("http://127.0.0.1:5000/features");
        console.log(response)
        this.allFeatures = response.data;
    } catch (error) {
        console.error("Error fetching features:", error);
    }
},
methods: {
    selectFeature(feature) {
    if (!this.selectedFeatures.includes(feature)) {
        this.selectedFeatures.push(feature);
        this.$emit("update-features", this.selectedFeatures);
    }
    },
    removeFeature(feature) {
    this.selectedFeatures = this.selectedFeatures.filter((f) => f !== feature);
    this.$emit("update-features", this.selectedFeatures);
    },
},
};
</script>

<style>
.feature-selector {
  margin: 10px;
}
input {
  width: 100%;
  padding: 5px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  cursor: pointer;
  padding: 5px;
  border-bottom: 1px solid #ddd;
}
.selected-features {
  margin-top: 10px;
}
.selected-item {
  display: inline-block;
  background: #ddd;
  padding: 5px;
  margin: 5px;
  border-radius: 4px;
}
button {
  margin-left: 5px;
  cursor: pointer;
}
</style>
