<template>
  <div id="home-grid">
    <div class="home-grid-row row-2">
      <div class="box box-3">
        <h1>Info</h1>
        <h3>Uptime: {{ uptime }}</h3>
        <h3>
          Server: {{ $store.state.data.config.server.host
          }}{{
            $store.state.data.config.server.port == '25565'
              ? ''
              : `:${$store.state.data.config.server.port}`
          }}
        </h3>
        <h3>
          Proxy IP: 127.0.0.1:{{ $store.state.data.config.proxyPort
          }}<i
            class="fa-solid fa-copy copy-button"
            @click="
              copyToClipboard(`127.0.0.1:${$store.state.data.config.proxyPort}`)
            "
          ></i>
        </h3>
        <h2 id="info-modules-plugins-cEmotes">
          <span
            @mouseenter="
              $store.state.data.modules.length
                ? showTooltip(
                    $store.state.data.modules
                      .map((i) =>
                        i.enabled
                          ? `<span style=\'color: var(--color-green);\'>${i.name}</span>`
                          : `<span style=\'color: var(--color-red);\'>${i.name}</span>`
                      )
                      .join(', ')
                  )
                : ''
            "
            @mousemove="moveTooltip"
            @mouseleave="hideTooltip"
            @click="setActiveTab('Modules')"
            >{{ Object.keys($store.state.data.config.modules).length }}
            <small style="font-weight: 600"
              >Module{{
                Object.keys($store.state.data.config.modules).length == 1
                  ? ''
                  : 's'
              }}</small
            ></span
          >
          •
          <span
            v-if="$store.state.data.crashedModules.length"
            style="color: var(--color-red-hover)"
            @mouseenter="
              $store.state.data.crashedModules.length
                ? showTooltip(
                    $store.state.data.crashedModules
                      .map((i) => i.name)
                      .join(', ')
                  )
                : ''
            "
            @mousemove="moveTooltip"
            @mouseleave="hideTooltip"
          >
            {{ $store.state.data.crashedModules.length }}
            <small style="font-weight: 600; color: var(--color-red-hover)"
              >Crashed Modules</small
            >
            <span> •</span></span
          >
          <span
            @mouseenter="
              $store.state.data.plugins.length
                ? showTooltip(
                    $store.state.data.plugins.map((i) => i.name).join(', ')
                  )
                : ''
            "
            @mousemove="moveTooltip"
            @mouseleave="hideTooltip"
            @click="setActiveTab('Plugins')"
          >
            {{ $store.state.data.plugins.length }}
            <small style="font-weight: 600"
              >Plugin{{
                $store.state.data.plugins.length == 1 ? '' : 's'
              }}</small
            ></span
          >
          •
          <span
            @mouseenter="
              Object.keys($store.state.data.config.customEmotes).length
                ? showTooltip(
                    Object.keys($store.state.data.config.customEmotes)
                      .map(
                        (i) =>
                          `${i} = ${$store.state.data.config.customEmotes[i]}`
                      )
                      .join('<br/>')
                  )
                : ''
            "
            @mousemove="moveTooltip"
            @mouseleave="hideTooltip"
          >
            {{ Object.keys($store.state.data.config.customEmotes).length }}
            <small style="font-weight: 600"
              >Custom Emote{{
                Object.keys($store.state.data.config.customEmotes).length == 1
                  ? ''
                  : 's'
              }}</small
            ></span
          >
        </h2>
      </div>
    </div>
    <div class="home-grid-row row-1" v-if="$store.state.data.player">
      <div class="box box-3">
        <h1>Connected Player</h1>
        <h2>
          {{ $store.state.data.player.username }}
        </h2>
        <h5>{{ $store.state.data.player.uuid }}</h5>
        <h4 v-if="$store.state.data.player.statusMessage">
          {{ $store.state.data.player.statusMessage }}
        </h4>
      </div>
    </div>
    <div
      ref="tooltip"
      v-show="tooltip.show"
      :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      class="tooltip"
    >
      <h3 v-html="tooltip.value"></h3>
    </div>
  </div>
</template>

<script>
import { clipboard } from '@electron/remote';

export default {
  name: 'Home',
  data: () => ({
    uptime: null,
    tooltip: {
      show: false,
      x: 0,
      y: 0,
      value: '',
    },
  }),
  methods: {
    secondsToHms(d) {
      const h = Math.floor(d / 3600);
      const m = Math.floor((d % 3600) / 60);
      const s = Math.floor((d % 3600) % 60);

      const hDisplay = h > 0 ? h + (h == 1 ? ' h ' : ' hrs ') : '';
      const mDisplay = m > 0 ? m + (m == 1 ? ' m ' : ' mins ') : '';
      const sDisplay = s > 0 ? s + (s == 1 ? ' s' : ' s') : '';
      return hDisplay + mDisplay + sDisplay;
    },
    copyToClipboard(data) {
      clipboard.writeText(data, 'clipboard');
    },

    showTooltip(value) {
      this.tooltip.value = value;
      this.tooltip.show = true;
    },
    moveTooltip(event) {
      this.tooltip.x = event.clientX + 20;
      this.tooltip.y = event.clientY - 40;
    },
    hideTooltip() {
      this.tooltip.show = false;
    },

    setActiveTab(tab) {
      this.$store.state.activeTab = tab;
    },
  },
  created() {
    this.uptime = this.secondsToHms(
      Math.floor((Date.now() - this.$store.state.data.startedAt) / 1000)
    );
    setInterval(() => {
      this.uptime = this.secondsToHms(
        Math.floor((Date.now() - this.$store.state.data.startedAt) / 1000)
      );
    }, 200);
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
  display: flex;
  flex-direction: row;
}
.home-grid-row {
  display: flex;
  flex-direction: column;
  margin: 0px 10px;
}
.row-1 {
  flex: 1;
}
.row-2 {
  flex: 2;
}
.row-3 {
  flex: 3;
}

.box {
  padding: 2.5vh 2.5vw;
  border-radius: 30px;
  background-color: var(--color-lightest-bg);
  margin: 10px 0px;
}
.box-1 {
  flex: 1;
}
.box-2 {
  flex: 2;
}
.box-3 {
  flex: 3;
}

.copy-button {
  margin-left: 7.5px;
  transition: color 0.1s ease;
}
.copy-button:hover {
  cursor: pointer;
  color: var(--color-dark-font);
}

#info-modules-plugins-cEmotes:hover {
  cursor: pointer;
}
</style>
