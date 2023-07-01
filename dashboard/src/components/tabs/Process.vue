<template>
  <div id="home-grid">
    <div class="home-grid-row row-2">
      <div class="box box-3">
        <div id="console">
          <pre v-for="(line, index) in lines" v-bind:key="index">{{
            line.replace('〉〈', '>  <').replace(/ /g, '&nbsp;')
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { proc } from '../../main';
import { ref } from 'vue';

let { value: consoleLines } = ref([]);

export default {
  name: 'Process',
  data: () => ({
    proc,
  }),
  computed: {
    lines() {
      return consoleLines;
    },
  },
  methods: {
    readLines() {
      consoleLines.push(
        ...(proc?.stdout?.read()?.toString()?.split('\n') || [])
      );
      consoleLines.push(
        ...(proc?.stderr?.read()?.toString()?.split('\n') || [])
      );
    },
  },
  beforeMount() {
    this.readLines();
    proc?.stdout.on('readable', () => this.readLines());

    proc?.on('disconnect', () => {
      consoleLines = [];
    });
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
  margin: 0px 5px;
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
  border-radius: 20px;
  background-color: var(--color-lightest-bg);
  margin: 5px 0px;
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

h1 {
  margin-left: 2.5vw;
}

#console {
  width: 1035px;
  margin-left: 15px;
  height: 550px;
  margin-top: 15px;
  background-color: var(--color-dark-bg);
  border-radius: 20px;
  padding: 5px 15px;
  overflow-y: scroll;
}

pre {
  white-space: initial;
  user-select: text;
  font-family: Courier, monospace;
  line-height: 1px;
}
</style>
