<template>
  <div id="content">
    <!-- Shows the component corresponding to the current active tab -->
    <component
      v-if="$store.getters.isConnected"
      v-bind:is="$store.state.activeTab"
    />
    <div v-if="!$store.getters.isConnected" id="offline-error">
      <h1>OFFLINE</h1>
    </div>
  </div>
</template>

<script>
import Home from './tabs/Home.vue';
import Modules from './tabs/Modules.vue';
import Plugins from './tabs/Plugins.vue';

export default {
  name: 'Content',
  components: {
    Home,
    Modules,
    Plugins,
  },
};
</script>

<style scoped>
#content {
  margin: -10px 20px;
}

#offline-error {
  position: absolute;
  background-color: var(--color-light-bg);
  border-radius: 30px;
  top: 45%;
  left: 42.5%;
  width: 15%;
  text-align: center;
}
</style>
