<template>
  <div id="module-settings-page">
    <div id="module-settings-border">
      <div id="module-settings-content">
        <div
          class="setting"
          v-for="setting of Object.keys(activeSettingsSchema)"
          v-bind:key="setting"
        >
          <span class="setting-name">{{ setting }}</span>
          <input
            class="setting-value string"
            v-if="
              activeSettingsSchema[setting] === 'string' ||
              activeSettingsSchema[setting] === 'number'
            "
            :value="activeSettings[setting]"
            @input="
              ($event) => {
                if (
                  activeSettingsSchema[setting] === 'number' &&
                  isValidNumber($event.target.value)
                )
                  activeSettings[setting] =
                    $event.target.value == ''
                      ? ''
                      : parseInt($event.target.value);
                else if (activeSettingsSchema[setting] === 'string')
                  activeSettings[setting] = $event.target.value;
                else {
                  const v = activeSettings[setting];
                  if (v.length) activeSettings[setting] = '';
                  else activeSettings[setting] = '(empty)';
                  activeSettings[setting] = v;
                }
              }
            "
          />
          <span
            class="setting-value boolean"
            v-bind:class="{
              'boolean-on': activeSettings[setting],
              'boolean-off': !activeSettings[setting],
            }"
            v-else-if="activeSettingsSchema[setting] === 'boolean'"
            @click="activeSettings[setting] = !activeSettings[setting]"
          ></span>
          <span class="setting-value new-menu" v-else @click="openPath(setting)"
            ><span>></span></span
          >
        </div>
      </div>
    </div>
    <div
      id="module-settings-bg"
      @click="
        save();
        $store.state.moduleSettingsMenu.open = false;
      "
    ></div>
    <div id="back-button" v-if="paths.length" @click="back()">
      <i class="fa-arrow-left fa-solid" style="margin-right: 3px"></i> BACK
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModuleSettingsPage',

  data: () => ({
    item: null,
    settings: null,
    settingsSchema: null,

    paths: [],

    get activeSettings() {
      return this.paths.length
        ? this.paths[this.paths.length - 1][0]
        : this.settings;
    },
    get activeSettingsSchema() {
      return this.paths.length
        ? this.paths[this.paths.length - 1][1]
        : this.settingsSchema;
    },

    set activeSettings(value) {
      if (this.paths.length) {
        this.paths[this.paths.length - 1][0] = value;
      } else {
        this.settings = value;
      }
    },
  }),
  beforeMount() {
    this.item = { ...this.$store.state.moduleSettingsMenu.module };
    this.settings = { ...this.$store.state.data.settings[this.item.key] };
    this.settingsSchema = {
      ...this.$store.state.data.settingsSchemas[this.item.key],
    };
    this.paths = [];
  },

  methods: {
    isValidNumber(number) {
      if (isNaN(number) || number?.toString?.()?.includes?.('.')) return false;
      return true;
    },

    openPath(key) {
      this.paths.push([
        this.paths.length
          ? this.paths[this.paths.length - 1][0][key]
          : this.settings[key],
        this.paths.length
          ? this.paths[this.paths.length - 1][1][key]
          : this.settingsSchema[key],
        key,
      ]);
    },
    back() {
      if (!this.paths.length) return;

      const [item] = this.paths.splice(this.paths.length - 1, 1);

      if (this.paths.length) {
        this.paths[this.paths.length - 1][0][item[2]] = item[0];
      } else {
        this.settings[item[2]] = item[0];
      }
    },

    save() {
      console.log('e');
      while (this.paths.length) this.back();
      console.log('f', this.settings);

      this.$store.dispatch('sendMessage', {
        op: 'updateSettings',
        data: {
          moduleKey: this.item.key,
          settings: this.settings,
        },
      });
    },
  },
};
</script>

<style scoped>
#module-settings-page {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 1000000;
}

#module-settings-bg {
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
}
#back-button {
  position: fixed;
  top: 10.5%;
  left: 16.5%;
  padding: 6px 20px;
  border-radius: 10px;
  background-color: var(--color-light-bg);
  border: 3px solid var(--color-bg);
  transition: filter 0.2s ease;
}
#back-button:hover {
  cursor: pointer;
  filter: brightness(1.15);
}

#module-settings-border {
  background-color: var(--color-light-bg);
  filter: brightness(0.95);
  position: absolute;
  width: 70%;
  height: 70%;
  left: 15%;
  top: 16%;
  border-radius: 30px;
}
#module-settings-content {
  background-color: var(--color-lightest-bg);
  width: 97.5%;
  height: 96%;
  margin-top: 1%;
  margin-left: 1.25%;
  border-radius: 30px;
  overflow-y: scroll;
}

.setting {
  padding: 13px 10px;
  transition: background-color 0.1s ease-in-out;
  border-radius: 5px;
}

.setting-name {
  font-size: 1.2rem;
  margin-left: 4px;
}

.setting-value {
  position: fixed;
  margin-top: 3.25px;
  right: 30px;
}

.string {
  border: 2px solid var(--color-bg);
  background-color: var(--color-light-bg);
  border-radius: 15px;
  width: 100px;
  padding: 7.5px 15px;
  margin-top: -7px;
  font-size: 1.1rem;
}

.setting:has(.new-menu):hover {
  background-color: var(--color-super-light-bg);
}
.new-menu {
  margin-top: -2px;
  font-size: 1.3rem;
  right: 0px;
  width: 100%;
  padding: 13px 0px;
  height: 22.5px;
}
.new-menu > span {
  position: absolute;
  right: 40px;
  margin-top: -12px;
}

.boolean {
  display: flex;
  position: absolute;
  right: 57px;
  margin-top: -35px;
  justify-content: center;
  align-items: center;
  height: 30px;
  border-radius: 5px;
  background: none;
  padding: 10px 15px;
  text-shadow: var(--text-shadow);
  outline: none;
  cursor: pointer;
  font-weight: 550;
}

.boolean::before {
  position: absolute;
  padding: 17.5px 44px;
  width: 10px;
  content: '';
  border: 2px solid var(--color-bg);
  background-color: var(--color-light-bg);
  border-radius: 5px;
  border-radius: 25px;
}

.boolean::after {
  transition: left 0.2s ease, background-color 0.2s ease;
}

.boolean-on {
  border: none;
}

.boolean-on::after {
  position: relative;
  padding: 5px 10px;
  content: 'ON';
  background-color: var(--color-green);
  box-shadow: 0 0 0 2px var(--color-green-outline);
  border-radius: 25px;
  left: -24px;
}

.boolean-off {
  border: none;
}

.boolean-off::after {
  position: relative;
  padding: 5px 8px;
  content: 'OFF';
  background-color: var(--color-gray);
  box-shadow: 0 0 0 2px var(--color-gray-outline);
  border-radius: 25px;
  left: 24px;
}
</style>
