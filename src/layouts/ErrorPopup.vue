<template>
  <div v-if="showError" class="error-popup">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button @click="close" class="close-button">OK</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorPopup',
  props: {
    showError: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Error'
    },
    message: {
      type: String,
      default: 'An error occurred'
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    return {
      close
    };
  }
};
</script>

<style scoped>
.error-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.error-content {
  background-color: var(--color-background, white);
  color: var(--color-text, #333);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-content h3 {
  margin: 0 0 1rem 0;
  color: #d32f2f;
  font-size: 1.5rem;
}

.error-content p {
  margin: 0 0 1.5rem 0;
  color: var(--color-text, #666);
  line-height: 1.5;
}

.close-button {
  padding: 0.75rem 2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.close-button:hover {
  background: #0056b3;
}

.close-button:active {
  background: #004085;
}
</style>
