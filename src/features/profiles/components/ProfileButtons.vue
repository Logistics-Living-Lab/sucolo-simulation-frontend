<template>
  <div class="profile-buttons">
    <RetireeProfile @profile-applied="handleProfileApplied" />
    <FamilyProfile @profile-applied="handleProfileApplied" />
    <StudentProfile @profile-applied="handleProfileApplied" />
  </div>
</template>

<script>
import RetireeProfile from './RetireeProfile.vue';
import FamilyProfile from './FamilyProfile.vue';
import StudentProfile from './StudentProfile.vue';

export default {
  name: 'ProfileButtons',
  components: {
    RetireeProfile,
    FamilyProfile,
    StudentProfile
  },
  emits: ['profile-applied'],
  setup(props, { emit }) {
    const handleProfileApplied = (profile) => {
      emit('profile-applied', profile);
    };

    return {
      handleProfileApplied
    };
  }
};
</script>

<style scoped>
.profile-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.profile-buttons button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.profile-buttons button:hover {
  background: #f0f0f0;
}
</style> 