<template>
  <div id="add-plugin-page" v-if="$store.state.showingAddPluginPage">
    <div id="add-plugin-page-border">
      <div id="add-plugin-page-content">
        <h2 @click="showAddPluginsMenu()">
          Click Here to add Plugins<br /><br />Or Drag-and-Drop the files here
        </h2>
      </div>
    </div>
    <div
      id="add-plugin-page-bg"
      @click="$store.state.showingAddPluginPage = false"
    ></div>
  </div>
</template>

<script>
import * as remote from '@electron/remote';
import { copyFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from '../../cwd';
import { showNotification } from '../../store';
import { existsSync } from 'fs';

export default {
  name: 'PluginAddPage',
  methods: {
    async showAddPluginsMenu() {
      const paths = (
        await remote.dialog.showOpenDialog({
          properties: ['openFile', 'multiSelections'],
          filter: [{ name: 'Plugins', extensions: ['js', 'mjs', 'cjs'] }],
          title: 'Add Plugins',
          dontAddToRecent: true,
        })
      )?.filePaths;

      if (!paths?.length) return;
    },

    async addPlugins(paths) {
      paths = paths.filter(
        (i) => i.endsWith('.js') || i.endsWith('mjs') || i.endsWith('cjs')
      );

      const promises = await Promise.allSettled(
        paths.map(async (path) => {
          let ending = path
            .split('/')
            [path.split('/').length - 1].replace('.js', '')
            .replace('.mjs', '')
            .replace('.cjs', '');
          let done = false;

          do {
            if (existsSync(join(cwd, 'plugins', ending + '.js'))) {
              if (isNaN(ending.charAt(ending.length - 1))) ending += '1';
              else {
                ending =
                  ending.substring(0, ending.length - 1) +
                  (Number(ending.charAt(ending.length - 1)) + 1);
              }
            } else done = true;
          } while (!done);

          return await copyFile(path, join(cwd, 'plugins', ending + '.js'));
        })
      );

      const successes = promises.filter((i) => i.status === 'fulfilled').length;

      if (!successes) {
        return await showNotification(
          'Uh oh, we were unable to add some plugins, make sure they are valid JavaScript files!',
          'error',
          2500
        );
      }

      this.$store.state.showingAddPluginPage = false;
      await showNotification(
        `Successfully Added ${successes} Plugin${
          successes === 1 ? '' : 's'
        }!<br/><br/>Restart HybrProxy to load them.`,
        'success',
        3500
      );
    },
  },
  mounted() {
    document.addEventListener('drop', (event) => {
      if (!this.$store.state.showingAddPluginPage) return;

      event.preventDefault();
      event.stopPropagation();

      this.addPlugins([...event.dataTransfer.files].map((i) => i.path));
    });

    document.addEventListener('dragover', (e) => {
      if (!this.$store.state.showingAddPluginPage) return;

      e.preventDefault();
      e.stopPropagation();
    });
  },
};
</script>

<style scoped>
#add-plugin-page {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 1000000;
}
#add-plugin-page-bg {
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
}
#add-plugin-page-border {
  background-color: var(--color-light-bg);
  position: absolute;
  width: 80%;
  height: 70%;
  left: 10%;
  top: 15%;
  border-radius: 30px;
}
#add-plugin-page-content {
  background-color: var(--color-lightest-bg);
  width: 97.5%;
  height: 96%;
  margin-top: -1%;
  margin-left: 1.25%;
  border-radius: 30px;
  transition: filter 0.2s ease-in-out;
}
#add-plugin-page-content:hover {
  filter: brightness(1.1);
}

#add-plugin-page-content > h2 {
  text-align: center;
  padding-top: 22%;
  cursor: default;
}
</style>
