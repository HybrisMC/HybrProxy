<template>
  <div id="titlebar">
    <img id="icon" src="../assets/icon.png" />
    <div id="mini-buttons">
      <i
        class="fa-solid fa-minus mini-button minus-button"
        @click="minimizeWindow()"
      ></i>
      <i class="fa-solid fa-x mini-button x-button" @click="hideWindow()"></i>
    </div>
    <div id="tabs">
      <button
        class="tab"
        v-bind:class="{
          'tab-selected': $store.state.activeTab == tab,
        }"
        @click="setActiveTab(tab)"
        v-for="tab in tabs"
        v-bind:key="tab"
      >
        {{ tab.toUpperCase() }}
      </button>
    </div>
    <div id="actions">
      <button
        class="action fa-solid fa-arrow-rotate-left"
        @click="if ($store.getters.isConnected) reloadConfig();"
        style="
          color: rgb(59, 161, 219);
          background-color: rgba(59, 161, 219, 0.2);
        "
        v-bind:class="{
          disabled: !$store.getters.isConnected,
        }"
        @mouseenter="
          $store.getters.isConnected
            ? showTooltip(
                'Reload Config',
                'Checks and Reloads if the Config File has been Updated'
              )
            : hideTooltip()
        "
        @mousemove="
          $store.getters.isConnected ? moveTooltip($event) : hideTooltip()
        "
        @mouseleave="hideTooltip"
      ></button>
      <button
        class="action fa-solid fa-play"
        @click="if (!$store.getters.isConnected) startProcess();"
        style="
          color: rgb(59, 219, 104);
          background-color: rgba(59, 219, 104, 0.2);
        "
        v-bind:class="{
          disabled: $store.getters.isConnected,
        }"
        @mouseenter="
          !$store.getters.isConnected
            ? showTooltip('Start', 'Start the HybrProxy process')
            : hideTooltip()
        "
        @mousemove="
          !$store.getters.isConnected ? moveTooltip($event) : hideTooltip()
        "
        @mouseleave="hideTooltip"
      ></button>
      <button
        class="action fa-solid fa-skull"
        @click="if ($store.getters.isConnected) killProcess();"
        style="
          color: rgb(219, 59, 104);
          background-color: rgba(219, 59, 104, 0.2);
        "
        v-bind:class="{
          disabled: !$store.getters.isConnected,
        }"
        @mouseenter="
          $store.getters.isConnected
            ? showTooltip('Kill', 'Kill the HybrProxy Process')
            : hideTooltip()
        "
        @mousemove="
          $store.getters.isConnected ? moveTooltip($event) : hideTooltip()
        "
        @mouseleave="hideTooltip"
      ></button>
    </div>
    <div
      ref="tooltip"
      v-show="tooltip.show"
      :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      class="tooltip"
    >
      <h3>
        {{ tooltip.name }}
      </h3>
      <p>
        {{ tooltip.description }}
      </p>
    </div>
  </div>
</template>

<script>
import { getCurrentWindow } from '@electron/remote';
import { showNotification } from '../store';
import { proc, startProcess } from '../main';

export default {
  name: 'TitleBar',
  data: () => ({
    tooltip: {
      show: false,
      x: 0,
      y: 0,
      name: '',
      description: '',
    },
    tabs: ['Home', 'Modules', 'Plugins'],
  }),
  methods: {
    minimizeWindow() {
      const window = getCurrentWindow();
      if (window.minimizable) window.minimize();
      else this.hideWindow();
    },
    hideWindow() {
      getCurrentWindow().hide();
    },

    startProcess() {
      startProcess();
      showNotification('Started HybrProxy!', 'success');
    },
    killProcess() {
      this.$store.dispatch('sendMessage', {
        op: 'kill',
        dontSave: true,
      });
      this.$store.state.ws?.close?.();
      showNotification('Successfully killed the HybrProxy process!', 'success');
    },
    reloadConfig() {
      this.$store.dispatch('sendMessage', {
        op: 'reloadConfig',
        dontSave: true,
      });
    },

    showTooltip(name, description) {
      this.tooltip.name = name;
      this.tooltip.description = description;
      this.tooltip.show = true;
    },
    moveTooltip(event) {
      this.tooltip.x = event.clientX - 100;
      this.tooltip.y = event.clientY + 20;
    },
    hideTooltip() {
      this.tooltip.show = false;
    },
    setActiveTab(tab) {
      this.$store.state.activeTab = tab;
    },
  },
  async beforeMount() {
    while (true) {
      if (proc && this.$store.getters.isConnected)
        this.tabs = ['Home', 'Process', 'Modules', 'Plugins'];
      else this.tabs = ['Home', 'Modules', 'Plugins'];
      await new Promise((res) => setTimeout(res));
    }
  },
};
</script>

<style scoped>
#titlebar {
  height: 75px;
  width: 100%;
  background-color: var(--color-dark-bg);
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
}

#icon {
  width: 55px;
  margin: 10px 15px;
}

#mini-buttons {
  -webkit-app-region: none;
  position: absolute;
  right: 0px;
  top: 0px;
  border-bottom-left-radius: 10px;
}
.mini-button {
  padding: 5px 15px;
  background-color: var(--color-lightest-bg);
  transition: background-color 0.1s ease, color 0.1s ease;
}
.mini-button:hover {
  cursor: pointer;
}
.x-button:hover {
  background-color: var(--color-red);
}
.minus-button {
  border-bottom-left-radius: 10px;
}
.minus-button:hover {
  background-color: var(--color-yellow);
  color: var(--color-lightest-bg);
}

#actions {
  -webkit-app-region: none;
  position: absolute;
  right: 100px;
  top: 10px;
  display: flex;
}
.action {
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  border-radius: 0.35rem;
  outline: none;
  border: none;
  margin: 5px;
  cursor: pointer;
  transition: filter 0.2s ease-in-out;
  font-size: 1.6rem;
}
.action:hover {
  filter: brightness(1.2);
}
.action.disabled {
  filter: brightness(0.6);
  cursor: default;
}

#tabs {
  -webkit-app-region: none;
  position: absolute;
  left: 125px;
  top: 10px;
  display: flex;
}
.tab {
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0px 20px;
  border-radius: 10px;
  outline: none;
  border: none;
  margin: 5px;
  cursor: pointer;
  transition: filter 0.3s ease-in-out;
  font-size: 1.6rem;
  background-color: var(--color-light-bg);
}
.tab:hover {
  filter: brightness(1.25);
}
.tab-selected {
  filter: brightness(1.5);
}
.tab-selected:hover {
  filter: brightness(1.5);
  cursor: default;
}
</style>
