<template>
  <div class="profile-buttons">
    <label class="profile-heading">Select a profile:</label>
    <div class="profile-buttons__rows">
      <div
        v-for="(row, rowIndex) in profileRows"
        :key="rowIndex"
        class="profile-buttons__list"
      >
        <ProfileCard
          v-for="card in row"
          :key="card.profileKey"
          :selected-city="selectedCity"
          :label="card.label"
          :description="card.description"
          :profile-key="card.profileKey"
          :index="card.index"
          @profile-applied="handleProfileApplied"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { toRef } from 'vue';
import ProfileCard from './ProfileCard.vue';

const PROFILE_ROWS = [
  [
    {
      label: 'Retiree',
      description: 'Optimized for accessibility needs',
      profileKey: 'RETIREE',
      index: 1
    },
    {
      label: 'Family',
      description: 'Optimized for families with children',
      profileKey: 'FAMILY',
      index: 2
    },
    {
      label: 'Student',
      description: 'Optimized for young adults',
      profileKey: 'STUDENT',
      index: 3
    }
  ],
  [
    {
      label: 'Micro hub',
      description: 'Optimized for micro-hubs',
      profileKey: 'MICRO_HUB',
      index: 4
    },
    {
      label: 'Pickup station',
      description: 'Optimized for pick-up stations',
      profileKey: 'PICKUP_STATION',
      index: 5
    },
    {
      label: 'Mobility hub',
      description: 'Optimized for mobility hubs',
      profileKey: 'MOBILITY_HUB',
      index: 6
    }
  ]
];

export default {
  name: 'ProfileButtons',
  components: {
    ProfileCard
  },
  props: {
    selectedCity: { type: String, default: 'Leipzig, Germany' }
  },
  emits: ['profile-applied'],
  setup(props, { emit }) {
    const handleProfileApplied = (profile) => {
      emit('profile-applied', profile);
    };

    return {
      selectedCity: toRef(props, 'selectedCity'),
      handleProfileApplied,
      profileRows: PROFILE_ROWS
    };
  }
};
</script>

<style scoped>
.profile-buttons {
  margin-top: 2rem;
  padding-top: 0;
}

.profile-heading {
  color: var(--color-heading);
  font-size: 1rem;
  font-weight: bold;
  display: block;
  margin-bottom: 0.35rem;
}

.profile-buttons__rows {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.profile-buttons__list {
  display: flex;
  gap: 0.4rem;
}

.profile-buttons__list button {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  background: var(--color-background, white);
  color: var(--color-text, #333);
  cursor: pointer;
  font-size: inherit;
}

.profile-buttons__list button:hover {
  background: var(--color-background-soft, #f0f0f0);
}

.profile-buttons__list :deep(.profile-component:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: var(--color-border-hover, #bbb);
}
</style> 