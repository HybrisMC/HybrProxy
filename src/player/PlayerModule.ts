import Item from '../Classes/Item';
import { ModuleSettings, ModuleSettingsSchema } from '../Types';
import {
  getConfig,
  isValidModuleSettings,
  isValidModuleSettingsSchema,
  setValueSync,
} from '../utils/config';
import { PluginInfo } from '../utils/plugins';
import Player from './Player';

export default class PlayerModule {
  public readonly name: string;
  public readonly description: string;
  public player: Player;
  public enabled: boolean;

  public onConfigChange: (enabled: boolean) => void;
  public onSettingsChange: (settings: ModuleSettings) => void;
  public onDisconnect: () => void;

  public settingItem: Item;
  public configKey: string;

  public createdBy?: PluginInfo;

  public settings: ModuleSettings;
  public settingsSchema: ModuleSettingsSchema;

  public constructor(
    name: string,
    description: string,
    settingItem: Item,
    configKey: string
  ) {
    this.name = name;
    this.description = description;

    if (configKey) {
      const config = getConfig();
      this.enabled = config.modules[configKey];
      if (this.enabled === undefined) {
        const newConfig = { ...config.modules };
        newConfig[configKey] = false;
        setValueSync('modules', newConfig);
        this.toggleEnabled(false);
      }
    } else this.enabled = true;

    this.onConfigChange = () => {};
    this.onSettingsChange = () => {};
    this.onDisconnect = () => {};

    this.settingItem = settingItem;
    this.configKey = configKey;
  }

  public setPlayer(player: Player): this {
    this.player = player;
    return this;
  }

  public toggleEnabled(value?: boolean): boolean {
    this.enabled = value != undefined ? value : !this.enabled;
    return this.enabled;
  }

  public setSettings(
    schema: ModuleSettingsSchema,
    defaultValue: ModuleSettings
  ): this {
    if (!this.configKey)
      throw new Error(
        'PlayerModules without Config Keys cannot have Settings!'
      );
    if (!isValidModuleSettingsSchema(schema))
      throw new Error('Invalid PlayerModule Settings Schema!');
    if (!isValidModuleSettings(defaultValue, schema))
      throw new Error('Invalid PlayerModule Default Settings!');

    this.settingsSchema = schema;

    const config = getConfig();

    if (config.settings[this.configKey]) {
      this.settings = config.settings[this.configKey];
      this.onSettingsChange?.(this.settings);
    } else {
      const newConfig = { ...config.settings };
      newConfig[this.configKey] = defaultValue;
      setValueSync('settings', newConfig);
      this.settings = defaultValue;
    }

    return this;
  }
}
