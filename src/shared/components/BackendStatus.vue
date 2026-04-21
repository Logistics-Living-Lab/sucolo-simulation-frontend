<template>
  <div v-if="showStatus" class="backend-status" :class="statusClass">
    <span class="status-icon">{{ statusIcon }}</span>
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { cityApi } from '../../features/city-selector/api/cityApi';

export default {
  name: 'BackendStatus',
  setup() {
    const isConnected = ref(true);
    const showStatus = ref(false);

    const checkBackendStatus = async () => {
      try {
        const healthStatus = await cityApi.healthCheck();
        isConnected.value = healthStatus.status === 'healthy';
        showStatus.value = true; 
        
        if (healthStatus.status === 'healthy') {
          setTimeout(() => {
            showStatus.value = false;
          }, 5000);
        }
      } catch (error) {
        console.error('Health check failed:', error);
        isConnected.value = false;
        showStatus.value = true; 
      }
    };

    onMounted(() => {
      setTimeout(checkBackendStatus, 2000);
    });

    const statusClass = computed(() => ({
      'backend-status--connected': isConnected.value,
      'backend-status--disconnected': !isConnected.value
    }));

    const statusIcon = computed(() => 
      isConnected.value ? '✅' : '⚠️'
    );

    const statusText = computed(() => 
      isConnected.value ? 'Backend connected' : 'Backend not available'
    );

    return {
      isConnected,
      showStatus,
      statusClass,
      statusIcon,
      statusText
    };
  }
};
</script>

<style scoped>
.backend-status {
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 6px;
}

.backend-status--connected {
  background-color: rgba(212, 237, 218, 0.5);
  color: #000;
  border: 1px solid rgba(187, 194, 189, 0.4);
}

.backend-status--disconnected {
  background-color: rgba(248, 215, 218, 0.5);
  color: #000;
  border: 1px solid rgba(245, 198, 203, 0.4);
}

.status-icon {
  font-size: 14px;
}

.status-text {
  white-space: nowrap;
}
</style> 