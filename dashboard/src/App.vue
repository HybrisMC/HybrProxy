<template>
  <div id="app-content" v-if="$store.state.ready">
    <Titlebar />
    <Content />
    <Notification />
  </div>
  <Loading v-else />
</template>

<script>
import Content from './components/Content.vue';
import Loading from './components/Loading.vue';
import Titlebar from './components/Titlebar.vue';
import Notification from './components/Notification.vue';

export default {
  components: { Content, Titlebar, Loading, Notification },
  name: 'App',
  async beforeMount() {},
};
</script>

<style>
.tooltip {
  position: absolute;
  width: 250px;
  font-size: 0.7rem;
  text-align: left;
  border: 1px solid var(--color-darker-gray);
  background-color: rgb(0 0 0 / 40%);
  backdrop-filter: blur(2rem);
  padding: 0px 10px;
}
.tooltip > h3 {
  margin: 0px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-top: 7.5px;
  margin-bottom: 5px;
}
.tooltip > p {
  margin: 0px;
  font-weight: 400;
  color: var(--color-light-gray);
  margin-bottom: 7.5px;
}
</style>
