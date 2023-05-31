<template>
  <div id="plugins">
    <div id="home-grid">
      <div
        class="box"
        v-for="p in $store.state.data.plugins"
        v-bind:key="p.name"
      >
        <h2>{{ p.name }}</h2>
        <h4>{{ p.description }}</h4>
        <h5>
          {{ p.version || '1.0.0'
          }}{{ typeof p.author === 'string' ? ` • ${p.author}` : '' }}
        </h5>
      </div>
    </div>
    <button id="add-plugin" @click="$store.state.showingAddPluginPage = true">
      +
    </button>
    <PluginAddPage></PluginAddPage>
  </div>
</template>

<script>
import PluginAddPage from '../extras/PluginAddPage.vue';

export default {
  name: 'Plugins',
  components: { PluginAddPage },
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
  grid-row-gap: 15px;
  justify-content: center;
  overflow-y: scroll;
  overflow-x: hidden;
}

.box {
  background-color: var(--color-lightest-bg);
  width: 95%;
  height: 160px;
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

#add-plugin {
  position: fixed;
  right: 8vw;
  bottom: 10vh;
  padding: 4px 15px 6px 15px;
  border-radius: 10px;
  border: none;
  background-color: var(--color-lightest-bg);
  box-shadow: rgb(0 0 0 / 13%) 0px 1px 5px 0px;
  font-size: 2rem;
  filter: brightness(1.2);
  transition: filter 0.2s ease-in-out;
  z-index: 1000;
}
#add-plugin:hover {
  filter: brightness(1.5);
  cursor: pointer;
}
</style>
