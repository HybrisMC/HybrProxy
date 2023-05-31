import { validate } from 'jsonschema';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { reloadConfig } from '..';
import Logger from '../Classes/Logger';
import { Config, ModuleSettings, ModuleSettingsSchema } from '../Types';

const customConfigPath = process.argv
  .find((arg) => arg.startsWith('--config='))
  ?.split('=')[1];
export const filePath = customConfigPath || './config.json';

export function getConfig(): Config {
  const exists = existsSync(filePath);

  if (!exists) {
    Logger.info(
      'Config does not exists! Creating a new one with default values...'
    );
    writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
  }

  const data = readConfigSync();

  reloadConfig?.(data);

  return data;
}

export async function getConfigAsync(): Promise<Config> {
  const exists = existsSync(filePath);

  if (!exists) {
    Logger.info(
      'Config does not exists! Creating a new one with default values...'
    );
    await writeFile(filePath, JSON.stringify(defaultConfig, null, 2));
  }

  const data = await readConfig();

  reloadConfig?.(data);

  return data;
}

export async function setValue(key: string, value: unknown): Promise<void> {
  const config = await getConfigAsync();
  config[key] = value;
  await writeFile(filePath, JSON.stringify(config, null, 2));
  reloadConfig?.(config, false);
}
export function setValueSync(key: string, value: unknown): void {
  const config = getConfig();
  config[key] = value;
  writeFileSync(filePath, JSON.stringify(config, null, 2));
  reloadConfig?.(config, false);
}

export async function readConfig(): Promise<Config> {
  const data = await readFile(filePath, 'utf8');

  try {
    const parsed = JSON.parse(data);
    if (validate(parsed, configSchema).valid) {
      return parsed;
    } else {
      throw new Error("Can't validate config file");
    }
  } catch (error) {
    Logger.error('Error while processing config file');
    throw error;
  }
}

export function readConfigSync(): Config {
  const data = readFileSync(filePath, 'utf8');

  try {
    const parsed = JSON.parse(data);
    if (validate(parsed, configSchema).valid) {
      return parsed;
    } else {
      throw new Error("Can't validate config file");
    }
  } catch (error) {
    Logger.error('Error while processing config file');
    throw error;
  }
}

export function isValidModuleSettingsSchema(
  schema: ModuleSettingsSchema
): schema is ModuleSettingsSchema {
  if (typeof schema !== 'object') return false;

  for (const property of Object.keys(schema)) {
    switch (typeof schema[property]) {
      case 'string':
        if (
          !['string', 'number', 'boolean'].includes(schema[property] as string)
        )
          return false;
        break;

      case 'object':
        if (
          !isValidModuleSettingsSchema(schema[property] as ModuleSettingsSchema)
        )
          return false;
        break;

      default:
        return false;
    }
  }

  return true;
}

export function isValidModuleSettings(
  settings: ModuleSettings,
  schema: ModuleSettingsSchema
): any {
  if (typeof settings !== 'object') return false;
  if (!isValidModuleSettingsSchema(schema)) return false;

  // Ensure no stray values
  for (const property of Object.keys(settings)) {
    if (typeof schema[property] === 'undefined') return false;
  }

  // We now know that all values are in the schema, so we find ones that should be there but aren't
  // We also type check those that are there
  for (const property of Object.keys(schema)) {
    if (typeof settings[property] === 'undefined') return false;

    switch (schema[property]) {
      // Generic Types
      case 'string':
      case 'number':
      case 'boolean': {
        if (typeof settings[property] != schema[property]) return false;
        break;
      }

      // Object Types
      default: {
        if (
          !isValidModuleSettings(
            settings[property] as ModuleSettings,
            schema[property] as ModuleSettingsSchema
          )
        )
          return false;
        break;
      }
    }
  }

  return true;
}

// Automatically generated schema by `typescript-json-schema`
// Use `npm run generateConfigSchema` to regenerate
export const configSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    apiKey: {
      type: 'string',
    },
    autoDownloadUpdates: {
      type: 'boolean',
    },
    checkForUpdates: {
      type: 'boolean',
    },
    customEmotes: {
      additionalProperties: {
        type: 'string',
      },
      type: 'object',
    },
    dashboard: {
      properties: {
        enabled: {
          type: 'boolean',
        },
        port: {
          type: 'number',
        },
      },
      type: 'object',
    },
    modules: {
      additionalProperties: {
        type: 'boolean',
      },
      type: 'object',
    },
    settings: {
      type: 'object',
    },
    proxyPort: {
      type: 'number',
    },
    server: {
      properties: {
        host: {
          type: 'string',
        },
        port: {
          type: 'number',
        },
      },
      type: 'object',
    },
    statistics: {
      type: 'boolean',
    },
  },
  type: 'object',
};

export const defaultConfig: Config = {
  apiKey: "I can't provide a key, sorry!",
  server: {
    host: 'hypixel.net',
    port: 25565,
  },
  dashboard: {
    enabled: true,
    port: 7777,
  },
  proxyPort: 25556,
  customEmotes: {},
  checkForUpdates: true,
  autoDownloadUpdates: true,
  modules: {
    discordRichPresence: true,
    staffMods: true,
    parkourTimer: true,
    heightLimitDelayFix: true,
    lunarCooldowns: true,
    bridgePlayerDistance: true,
  },
  settings: {},
};
