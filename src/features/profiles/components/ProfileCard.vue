<template>
  <div class="profile-component">
    <p>{{ description }}</p>
    <button
      type="button"
      @click="applyProfile"
      class="btn"
      :class="applied ? 'btn-success' : 'btn-primary'"
    >
      {{ applied ? 'Profile applied' : `Apply Profile ${index}` }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { getProfilesForCity } from '../constants/profiles';

export default {
  name: 'ProfileCard',
  props: {
    selectedCity: {
      type: String,
      default: 'Leipzig, Germany'
    },
    label: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    profileKey: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  emits: ['profile-applied'],
  setup(props, { emit }) {
    const applied = ref(false);

    const applyProfile = () => {
      const profiles = getProfilesForCity(props.selectedCity);
      const profile = profiles?.[props.profileKey];
      if (!profile) return;

      emit('profile-applied', profile);

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
</style>
