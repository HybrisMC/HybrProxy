<div align="center">

<img src="./assets/icon-high-res.png" alt="HyrbisLogo" width="224" height="224" style="margin-bottom: 25px;" />

# HybrProxy

A nice, open-sourced, non-modification server proxy for Hypixel.

<a href="https://www.typescriptlang.org/"><img alt="Typescript" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3.1.1/assets/cozy/built-with/typescript_vector.svg"></a>
<a href="https://discord.gg/hyrbis"><img alt="Discord Server" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/cozy/social/discord-plural_vector.svg"></a>
<a href="https://hybrismc.dev"><img alt="Website" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/cozy/documentation/website_vector.svg"></a>

</div>

## 🤔 Why?

### Easy to use

Designed to be easy for less advanced players! These shouldn't be hard, so we try and ease the setup needed.

### Free and open source

Anyone can view, modify and redistribute the source code. If you have privacy concerns or curiosity, you can ensure yourself that the code is not doing anything malicious.

### Active development

Suggested features are always being considered and sometimes added.

### ⚠️ Requirements

To use it you need to have [NodeJS 16](https://nodejs.org/download/release/v16.20.0/) installed.

**The version may contain bugs, as it's not fully released!**

## 📝 Building from Source

Clone the repository on your machine using

```bash
$ git clone https://github.com/HybrisMC/HybrProxy
```

Once the repo is downloaded move to the directory and install the dependencies

```bash
$ cd HybrProxy
$ npm install
```

You can now build the project, you will be able to use the exe file located in the `dist` folder. Or use the `npm start` command to directly run the compiled TypeScript

```bash
$ npm run build
```

## Configuration ⚙️

At the root of the project (or in the same directory as the executable) create a `config.jsonc` file with the following content:

```jsonc
{
// To get an API key, head to https://developer.hypixel.net/ and log in with your Hypixel Forums Account.
// (NOTE: You need to create an app on the website. After that, you can click create API key and enter that here)
  "apiKey": "API KEY HERE",
  "server": {
    // Change this to the server you are trying to connect, by default it will be set as hypixel.
    // (NOTE: Most other servers will not work)
    "host": "hypixel.net",
    "port": 25565
  },
  "dashboard": {
    // Whether to enable the app-dashboard for HybrProxy.
    "enabled": true
  },
  "proxyPort": 25556, // The port for the proxy, you can connect using "localhost:PORT" as the Server IP
  "customEmotes": {
    // Custom emojis you can add, you can use any symbols minecraft chat supports.
    // Reference: https://justpaste.it/8mnld
    ":solar:": "☀",
    ":lunar:": "☾"
  },
  "checkForUpdates": true, // Whether to automatically check for updates and inform you if there are any.
  "autoDownloadUpdates": true, // Whether to automatically download new updates.
  "statistics": true, // Whether to track statistics about how you use hybris (launches, online usage, etc.).
  "modules": {},
  "settings": {}
}
```

## Starting the server 🚀

### With NodeJS

```bash
$ npm start
```

### Arguments

HybrProxy supports the following arguments:

- `--config=/path/to/config.json(c)`: Use a custom config file (default config file is `config.jsonc` or `config.json` in the current working directory)
- `--noTray`: Disable the tray icon (auto disabled if on a Mac and using the dashboard)

# Authenticating 🔒

When you login with a new account for the first time you will see a console message like this:

```
Please login to Microsoft to continue! Go to "https://www.microsoft.com/link" and enter the code XXXXXXXX to authenticate!
```

Open a browser and login with your Microsoft account.

---

## 🧪 Contributing

If you want to contribute features, please make a [`fork`](https://github.com/HybrisMC/HybrProxy/fork) of the branch.

---

## ⭐ Credits

See the credits in [CREDITS.md](./CREDITS.md).
