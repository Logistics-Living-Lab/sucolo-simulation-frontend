<template>
  <div class="profile-component">
    <p>Optimized for <span class="bold-text">pick-up stations</span></p>
    <button
      @click="applyProfile"
      class="btn"
      :class="applied ? 'btn-success' : 'btn-primary'"
    >
      {{ applied ? 'Profile applied' : 'Apply Profile 5' }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { getProfilesForCity } from '../constants/profiles';

export default {
  name: 'PickupStationProfile',
  props: {
    selectedCity: { type: String, default: 'Leipzig, Germany' }
  },
  emits: ['profile-applied'],
  setup(props, { emit }) {
    const applied = ref(false);

    const applyProfile = () => {
      const profiles = getProfilesForCity(props.selectedCity);
      emit('profile-applied', profiles.PICKUP_STATION);

      applied.value = true;
      setTimeout(() => {
        applied.value = false;
      }, 1600);
    };

    return {
      applied,
      applyProfile
    };
  }
};
</script>

<style scoped>
.profile-component {
  padding: 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  margin: 0.65rem 0;
  width: 165px;
  height: 155px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  background-color: var(--color-background-mute, #f5f5f5);
  color: var(--color-text, #333);
}

.profile-component p {
  margin: 0;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: var(--color-text, #333);
}

.bold-text {
  font-weight: bold;
}

.btn {
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: inherit;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-success {
  background-color: #4cd964;
  color: white;
}

.btn-success:hover {
  background-color: #32cd50;
}
</style>
