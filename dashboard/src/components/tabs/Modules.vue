<template>
  <div id="modules">
    <div id="home-grid">
      <div
        class="box"
        v-for="m in [
          ...$store.state.data.modules,
          ...$store.state.data.crashedModules,
        ]"
        v-bind:key="m.name"
      >
        <h2>{{ m.name }}</h2>
        <h4
          v-bind:class="{
            'module-description-lower':
              !$store.state.data.settingsSchemas[m.key],
          }"
        >
          {{ m.description }}
        </h4>
        <h5 v-if="m.createdBy">
          <i
            >Created by Plugin
            <span @click="setActiveTab('Plugins')">{{
              m.createdBy.name
            }}</span></i
          >
        </h5>
        <button
          v-if="$store.state.data.crashedModules.includes(m)"
          class="module-toggle-btn module-toggle-btn-crashed"
        >
          CRASHED
        </button>
        <button
          class="module-toggle-btn"
          @click="toggleModule(m.name)"
          v-bind:class="{
            'module-toggle-btn-disabled': !m.enabled,
            'module-toggle-btn-enabled': m.enabled,
          }"
          v-else
        >
          {{ m.enabled ? 'ENABLED' : 'DISABLED' }}
        </button>
        <button
          class="module-options-btn fa-regular fa-gear"
          @click="openModuleSettings(m)"
          v-if="$store.state.data.settingsSchemas[m.key]"
        ></button>
      </div>
    </div>

    <ModuleSettingsPage
      v-if="$store.state.moduleSettingsMenu.open"
    ></ModuleSettingsPage>
  </div>
</template>

<script>
import ModuleSettingsPage from '../extras/ModuleSettingsPage.vue';

export default {
  components: { ModuleSettingsPage },
  name: 'Modules',
  methods: {
    toggleModule(name) {
      this.$store.state.data.modules.find((i) => i.name == name).enabled =
        !this.$store.state.data.modules.find((i) => i.name == name).enabled;
      this.$store.dispatch('sendMessage', {
        op: 'toggleModule',
        data: {
          name,
          enabled: this.$store.state.data.modules.find((i) => i.name == name)
            .enabled,
        },
      });
    },
    setActiveTab(tab) {
      this.$store.state.activeTab = tab;
    },
    openModuleSettings(module) {
      this.$store.state.moduleSettingsMenu.open =
        !this.$store.state.moduleSettingsMenu.open;

      if (this.$store.state.moduleSettingsMenu.open) {
        this.$store.state.moduleSettingsMenu.module = module;
      } else {
        this.$store.state.moduleSettingsMenu.module = null;
      }
    },
  },
};
</script>

<style scoped>
#home-grid {
  margin: 6.5vh 4.75vw;
  width: 85vw;
  height: 75vh;
  padding: calc(2.5vh - 10px) calc(2.5vw - 20px);
  background-color: var(--color-light-bg);
  border-radius: 30px;
  display: grid;
  grid-template-columns: repeat(3, 32.5%);
  grid-template-rows: repeat(2, 250px);
  grid-column-gap: 15px;
  grid-row-gap: 25px;
  justify-content: center;
  overflow-y: scroll;
  overflow-x: hidden;
}

.box {
  background-color: var(--color-lightest-bg);
  width: 95%;
  height: 260px;
  border-radius: 20px;
  transition: background-color 0.15s;
  box-shadow: rgb(0 0 0 / 13%) 0px 1px 5px 0px;
  position: relative;
  align-items: center;
  text-align: center;
  padding: 0px 2.5%;
}
.box > h2 {
  user-select: text;
}
.box > h4 {
  font-size: 0.8rem;
}
.module-description-lower {
  padding-top: 25px;
}
.box > h5 > i > span {
  text-decoration: underline;
  color: aqua;
  transition: filter 0.2s ease-in-out;
}
.box > h5 > i > span:hover {
  cursor: pointer;
  filter: brightness(1.2);
}

.module-toggle-btn {
  width: 96%;
  height: 43px;
  border-radius: 16px;
  text-shadow: var(--text-shadow);
  font-size: 15px;
  letter-spacing: 5px;
  font-weight: 600;
  position: absolute;
  bottom: 7px;
  cursor: pointer;
  margin-left: -48%;
  z-index: 100;
}
.module-toggle-btn-disabled {
  background-color: var(--color-gray);
  border: none;
  transition: background-color 0.3s;
}
.module-toggle-btn-disabled:hover {
  background-color: var(--color-slightly-light-gray);
}
.module-toggle-btn-enabled {
  background-color: var(--color-green);
  border: none;
  transition: background-color 0.3s;
}
.module-toggle-btn-enabled:hover {
  background-color: var(--color-green-hover);
}
.module-toggle-btn-crashed {
  background-color: var(--color-red);
  border: none;
  transition: background-color 0.3s;
}
.module-toggle-btn:hover {
  cursor: default;
}

.module-options-btn {
  text-align: center;
  text-shadow: var(--text-shadow);
  font-size: 28px;
  font-weight: 600;
  position: absolute;
  cursor: pointer;
  left: 87.5%;
  bottom: 85%;
  background-color: rgba(0, 0, 0, 0);
  border: none;
  transition: filter 0.2s ease-in-out;
  filter: brightness(0.5);
  border-radius: 100px;
  z-index: 99;
}
.module-options-btn:hover {
  filter: brightness(0.85);
  cursor: default;
}
</style>
