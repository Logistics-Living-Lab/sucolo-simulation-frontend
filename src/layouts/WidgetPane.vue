<template>
  <aside class="widget-pane">
    <a
      href="https://sucolo.eu/"
      target="_blank"
      rel="noopener"
      class="widget-pane__logo"
      title="Go to SuCoLo website"
    >
      <img :src="logoUrl" alt="SuCoLo" />
    </a>
    <WelcomeTooltip />
    <button
      type="button"
      class="widget-pane__legend-toggle"
      :title="legendVisible ? 'Hide legend' : 'Show legend'"
      :aria-label="legendVisible ? 'Hide legend' : 'Show legend'"
      @click="$emit('toggle-legend')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="5" y="3" width="14" height="10" rx="1" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="9" x2="14" y2="9" />
        <path d="M12 13v8M9 21h6" />
      </svg>
    </button>
    <button
      type="button"
      class="widget-pane__theme-toggle"
      :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    >
      <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
    <button
      type="button"
      class="widget-pane__save-features"
      title="Upload selected features"
      aria-label="Upload selected features"
      @click="$emit('upload-features')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 20h14a2 2 0 0 0 2-2v-3" />
        <path d="M3 15v3a2 2 0 0 0 2 2" />
        <polyline points="12 3 12 14" />
        <polyline points="8 7 12 3 16 7" />
      </svg>
    </button>
    <button
      type="button"
      class="widget-pane__save-features"
      title="Save selected features"
      aria-label="Save selected features"
      @click="$emit('save-features')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    </button>
    <button
      type="button"
      class="widget-pane__result-summary"
      :disabled="!canDownloadResults"
      :title="canDownloadResults ? 'Download model results' : 'Build Model first to enable results download'"
      :aria-label="canDownloadResults ? 'Download model results' : 'Build Model first to enable results download'"
      @click="$emit('download-results')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="4" y="3" width="16" height="14" rx="2" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="12" y2="11" />
        <polyline points="12 17 12 22" />
        <polyline points="9 19 12 22 15 19" />
      </svg>
    </button>
    <a
      href="https://github.com/Logistics-Living-Lab/sucolo-simulation-frontend"
      target="_blank"
      rel="noopener noreferrer"
      class="widget-pane__github"
      title="GitHub Repository"
      aria-label="Open GitHub repository"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    </a>
  </aside>
</template>

<script>
import WelcomeTooltip from './WelcomeTooltip.vue';
import logoUrl from '../assets/SuCoLo_Logo_cmyk.png';
import { useTheme } from '../composables/useTheme.js';

export default {
  name: 'WidgetPane',
  components: {
    WelcomeTooltip
  },
  props: {
    legendVisible: {
      type: Boolean,
      default: true
    },
    canDownloadResults: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-legend', 'save-features', 'upload-features', 'download-results'],
  setup() {
    const { theme, toggleTheme } = useTheme();
    return {
      logoUrl,
      theme,
      toggleTheme
    };
  }
};
</script>

<style scoped>
.widget-pane {
  width: 56px;
  flex-shrink: 0;
  background: var(--color-background-mute, #f2f2f2);
  border-right: 1px solid var(--color-border, #eee);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
  gap: 0.5rem;
}

.widget-pane__logo {
  display: block;
  flex-shrink: 0;
  padding: 0 4px;
  margin-bottom: 0.75rem;
}

.widget-pane__logo img {
  display: block;
  width: 100%;
  max-width: 48px;
  height: auto;
  object-fit: contain;
}

.widget-pane__legend-toggle {
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
  flex-shrink: 0;
}

.widget-pane__legend-toggle:hover {
  background: var(--widget-btn-hover-bg, #d0d0d0);
  border-color: var(--color-border-hover, #ced4da);
}

.widget-pane__legend-toggle svg {
  display: block;
}

.widget-pane__theme-toggle {
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
  flex-shrink: 0;
}

.widget-pane__theme-toggle:hover {
  background: var(--widget-btn-hover-bg, #d0d0d0);
  border-color: var(--color-border-hover, #ced4da);
}

.widget-pane__theme-toggle svg {
  display: block;
}

.widget-pane__result-summary {
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
  flex-shrink: 0;
}

.widget-pane__result-summary:hover {
  background: var(--widget-btn-hover-bg, #d0d0d0);
  border-color: var(--color-border-hover, #ced4da);
}

.widget-pane__result-summary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.widget-pane__result-summary:disabled:hover {
  background: var(--widget-btn-bg, #e0e0e0);
  border-color: var(--color-border, #dee2e6);
}

.widget-pane__result-summary svg {
  display: block;
}

.widget-pane__save-features {
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
  flex-shrink: 0;
}

.widget-pane__save-features:hover {
  background: var(--widget-btn-hover-bg, #d0d0d0);
  border-color: var(--color-border-hover, #ced4da);
}

.widget-pane__save-features svg {
  display: block;
}

.widget-pane__github {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border, #dee2e6);
  border-radius: 6px;
  background: var(--widget-btn-bg, #e0e0e0);
  color: var(--color-text, #6c757d);
  text-decoration: none;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.widget-pane__github:hover {
  background: var(--widget-btn-hover-bg, #d0d0d0);
  border-color: var(--color-border-hover, #ced4da);
  color: var(--color-text, #333);
}

.widget-pane__github svg {
  display: block;
}
</style>