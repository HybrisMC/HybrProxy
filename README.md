# HybrProxy

![GitHub](https://img.shields.io/github/license/TBHGodPro/HybrProxy-Pre?style=for-the-badge)
![Maintenance](https://img.shields.io/maintenance/yes/2023?style=for-the-badge)

Minecraft proxy server for Hypixel. It's like a stats overlay, but better. For now you must build it yourself and enjoy it before a release. And as a lot of our projects, this one is also open source!

**⚠️ But this version may have bugs!**

# Usage ⚒️

To use it you need to have [NodeJS](https://nodejs.org/en/) v16 installed.

# Building from source 🏗️

Clone the repository on your machine using

```bash
$ git clone https://github.com/TBHGodPro/HybrProxy-Pre HybrProxy
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

At the root of the project (or in the same directory as the executable) create a `config.json` file with the following content:

<!-- prettier-ignore-start -->
```json5
{
  "apiKey": "API KEY HERE",
  "server": {
    "host": "hypixel.net",
    "port": 25565
  },
  "customEmotes": {
    ":solar:": "☀",
    ":lunar:": "☾"
  },
  "checkForUpdates": true,
  "autoDownloadUpdates": true,
  "statistics": true,
  "modules": {}
}
```
<!-- prettier-ignore-end -->

## Starting the server 🚀

### With NodeJS

```bash
$ npm start
```

### Arguments

HybrProxy supports the following arguments:

- `--config=/path/to/config.json`: Use a custom config file (default config file is `config.json` in the current working directory)
- `--noTray`: Disable the tray icon

# Authenticating 🔒

When you will login for the first time you will see in the console a message like this:

```
Please login to Microsoft to continue! Go to "https://www.microsoft.com/link" and enter the code XXXXXXXX to authenticate!
```

Open a browser and login with your Microsoft account.
If you have not migrated your account yet you can try to edit the code manually. _(Or migrate your account)_

**⚠️ Mojang accounts wont be supported!**
