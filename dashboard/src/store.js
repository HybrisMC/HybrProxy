import { randomUUID } from 'crypto';
import { createStore } from 'vuex';

const store = createStore({
  state: {
    activeTab: 'Home',
    ws: null,
    ready: false,
    data: null,
    notification: {
      showing: false,
      data: null,
      id: null,
    },
    failedPackets: [],
    showingAddPluginPage: false,
    moduleSettingsMenu: {
      open: false,
      module: null,
    },
    msaRequest: null,
  },
  getters: {
    isConnected(state) {
      return !!state.ws;
    },
  },
  actions: {
    sendMessage(context, raw) {
      let save = true;
      if (raw.dontSave) {
        save = false;
        delete raw.dontSave;
      }
      const data = JSON.stringify(raw);
      if (store.getters.isConnected) store.state.ws.send(data);
      else if (save) store.state.failedPackets.push(data);
    },
  },
});

/**
 * Show a Notification
 * @param {string} message The Notification Message/Body
 * @param {"info" | "success" | "error"} type The Notification Type
 * @param {number} duration The Length to show the Notification in MS
 */
export async function showNotification(message, type, duration = 2500) {
  const id = randomUUID();

  store.state.notification = {
    showing: true,
    data: {
      message,
      type,
    },
    id,
  };

  await new Promise((res) => setTimeout(res, duration));
  if (store.state.notification.id !== id) return;

  store.state.notification.showing = false;
  await new Promise((res) => setTimeout(res, 500));
  if (store.state.notification.id !== id) return;
  store.state.notification.data = null;
  store.state.notification.id = null;
}

export default store;
