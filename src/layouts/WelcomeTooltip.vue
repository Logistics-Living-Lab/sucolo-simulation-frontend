<template>
  <div class="welcome-tooltip-root">
    <button
      type="button"
      class="glasses-trigger"
      @click="toggle"
      :aria-label="visible ? 'Close tips' : 'Show tips'"
      :title="visible ? 'Close tips' : 'Show tips'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M9 18h6" />
        <path d="M10.5 21h3" />
        <path
          d="M12 3a6 6 0 0 0-3 11.25V16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.75A6 6 0 0 0 12 3z"
        />
      </svg>
    </button>
  </div>
  <Teleport to="body">
    <div v-if="visible" class="welcome-tooltip">
      <button class="welcome-tooltip-close" @click="dismiss" aria-label="Close">×</button>
      <p class="welcome-tooltip-title">
        <span class="welcome-tooltip-title-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6.5a4.5 4.5 0 0 1 8 2.5c0 2.2-1.8 3.5-3.5 4.2L12 14" />
            <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span class="welcome-tooltip-title-text">How to get started</span>
      </p>
      <ol class="welcome-tooltip-steps">
        <li>Choose a <strong>city</strong></li>
        <li>Choose a <strong>resolution</strong> (hexagon size)</li>
        <li>Choose a <strong>profile</strong></li>
        <li>Click <strong>Build Model</strong> to see the scores on the map</li>
      </ol>
      <p class="welcome-tooltip-note">
        <span class="welcome-tooltip-note-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </span>
        <span class="welcome-tooltip-note-text">Optionally use <strong>Expert Mode</strong> to create your own profiles.</span>
      </p>
      <ol class="welcome-tooltip-steps">
        <li>Choose a type of <strong>feature</strong></li>
        <li>Choose an <strong>amenity</strong> with or without distance settings – and <em>Apply Feature</em></li>
        <li>
          Set the <strong>weights</strong> from -10 to +10 using the slider
          <br />
          <em>Optionally:</em> add more amenities and weights
        </li>
        <li>Click <strong>Build Model</strong> to see the scores on the map</li>
      </ol>
    </div>
  </Teleport>
</template>

<script>
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'sucolo-welcome-dismissed-v2';

export default {
  name: 'WelcomeTooltip',
  setup() {
    const visible = ref(false);

    onMounted(() => {
      try {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
          visible.value = true;
        }
      } catch {
        visible.value = true;
      }
    });

    const dismiss = () => {
      visible.value = false;
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {}
    };

    const showAgain = () => {
      visible.value = true;
    };

    const toggle = () => {
      if (visible.value) {
        dismiss();
      } else {
        showAgain();
      }
    };

    return {
      visible,
      dismiss,
      showAgain,
      toggle
    };
  }
};
</script>

<style scoped>
.welcome-tooltip-root {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.glasses-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border, #dee2e6);
  background: var(--widget-btn-bg, #e0e0e0);
  color: var(--color-text, #6c757d);
  cursor: pointer;
  border-radius: 6px;
}

.glasses-trigger:hover {
  color: var(--color-heading, #212529);
  background: var(--widget-btn-hover-bg, #d0d0d0);
  border-color: var(--color-border-hover, #ced4da);
}

.glasses-trigger svg {
  display: block;
}

.welcome-tooltip {
  position: fixed;
  top: 1rem;
  right: 1rem;
  max-width: 280px;
  padding: 1rem 1.5rem 1rem 1rem;
  background: var(--color-background, white);
  border: 1px solid var(--color-border, #dee2e6);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--color-text, #333);
}

.welcome-tooltip::after {
  content: '';
  position: absolute;
  top: 1.25rem;
  right: -8px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid var(--color-background, white);
  filter: drop-shadow(1px 0 1px rgba(0, 0, 0, 0.08));
}

.welcome-tooltip::before {
  content: '';
  position: absolute;
  top: 1.25rem;
  right: -9px;
  width: 0;
  height: 0;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
  border-left: 9px solid var(--color-border, #dee2e6);
  z-index: -1;
}

.welcome-tooltip-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text, #6c757d);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
}

.welcome-tooltip-close:hover {
  color: var(--color-heading, #333);
  background: var(--color-background-soft, #f0f0f0);
}

.welcome-tooltip-title {
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: var(--color-heading, #212529);
}

.welcome-tooltip-title-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c00;
}

.welcome-tooltip-title-text {
  min-width: 0;
}

.welcome-tooltip-steps {
  margin: 0;
  padding-left: 1.25rem;
}

.welcome-tooltip-steps li {
  margin-bottom: 0.35rem;
}

.welcome-tooltip-steps li:last-child {
  margin-bottom: 0;
}

.welcome-tooltip-steps strong {
  font-weight: 600;
}

.welcome-tooltip-note {
  margin: 1.5rem 0 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.welcome-tooltip-note-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text, #333);
  opacity: 0.85;
  margin-top: 0.15rem;
}

.welcome-tooltip-note-text {
  min-width: 0;
  line-height: 1.4;
}

.welcome-tooltip-note strong {
  font-weight: 600;
}
</style>