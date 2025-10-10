<template>
  <div class="profile-component">
    <p>Optimized for young working / students</p>
    <button @click="applyProfile" class="btn btn-primary">Apply Profile 3</button>
  </div>
</template>

<script>
import { Profiles } from '../constants/profiles';

export default {
  name: 'StudentProfile',
  emits: ['profile-applied'],
  setup(props, { emit }) {
    const applyProfile = () => {
      const profile = Profiles.STUDENT;
      emit('profile-applied', profile);
    };

    return {
      applyProfile
    };
  }
};
</script>

<style scoped>
.profile-component {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 1rem 0;
  width: 200px;
  height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.profile-component p {
  margin: 0;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style> 