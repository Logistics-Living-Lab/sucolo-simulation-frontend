<template>
  <div class="app-header">
    <h3>Location Finder App</h3>
    <a href="https://sucolo.eu/" target="_blank" rel="noopener">
      <img :src="logoUrl" alt="Logo" class="control-image" />
    </a>
  </div>
</template>

<script>
import logoUrl from '../assets/SuCoLo_Logo_cmyk.png';

export default {
  name: 'AppHeader',
  setup() {
    return {
      logoUrl
    };
  }
};
</script>

<style scoped>
.app-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.app-header h3 {
  font-weight: bold;
  margin-bottom: 1rem;
}

.control-image {
  max-width: 40%;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style> 