module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      outputDir: 'dist',
      builderOptions: {
        appId: 'com.hybrproxy.dashboard',
        productName: 'HybrProxy Dashboard',
        win: {
          target: 'portable',
          icon: 'build/icons/win/icon.ico',
          publisherName: 'HybrProxy Dashboard',
          verifyUpdateCodeSignature: true,
          requestedExecutionLevel: 'asInvoker',
        },
        linux: {
          target: 'AppImage',
          maintainer: 'HybrProxy Dashboard',
          vendor: 'HybrProxy',
          icon: 'build/icons/linux/icon.png',
          synopsis: 'HybrProxy Dashboard',
          description: 'HybrProxy Dashboard',
          category: 'Game',
        },
        mac: {
          target: 'dmg',
          category: 'Game',
          icon: 'build/icons/macos/icon.icns',
        },
      },
    },
  },
};
