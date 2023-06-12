import {
  LunarClientMod,
  LunarClientPlayer,
  Waypoint as LunarWaypoint,
  NotificationLevel,
  ServerRuleEnum,
  ServerRuleValue,
  StaffMod,
  TeammatePlayer,
} from '@minecraft-js/lunarbukkitapi';
import { UUID, parseUUID } from '@minecraft-js/uuid';
import Player from './Player';

export default class PlayerCustomClient {
  public readonly player: Player;

  public lunar: LunarClientPlayer = null;

  constructor(player: Player) {
    this.player = player;
  }

  public connect() {
    this.lunar = new LunarClientPlayer({
      playerUUID: parseUUID(this.player.uuid),
      customHandling: {
        registerPluginChannel: (channel) => {
          this.player.client.write('custom_payload', {
            channel: 'REGISTER',
            data: Buffer.from(`${channel}\0`),
          });
        },
        sendPacket: (buffer, channel) => {
          this.player.client.write('custom_payload', {
            channel: channel,
            data: buffer,
          });
        },
      },
    });

    this.lunar.connect();
  }

  public disconnect() {
    this.lunar = null;
  }

  public addWaypoint(waypoint: LunarWaypoint) {
    this.lunar?.addWaypoint(waypoint);
  }
  public remoteWaypoint(waypoint: string | LunarWaypoint) {
    this.lunar?.removeWaypoint(waypoint);
  }
  public removeAllWaypoints() {
    this.lunar?.removeAllWaypoints();
  }

  public sendNotification(
    message: string,
    duration: number,
    level: NotificationLevel = NotificationLevel.INFO
  ) {
    this.lunar?.sendNotification(message, duration, level);
  }

  public addTeammate(teammate: TeammatePlayer) {
    this.lunar?.addTeammate(teammate);
  }
  public removeTeammate(teammate: string | UUID | TeammatePlayer) {
    this.lunar?.removeTeammate(teammate);
  }
  public removeAllTeammates() {
    this.lunar?.removeAllTeammates();
  }
  public sendTeammateList() {
    // @ts-expect-error - Hidden function in lunarbukkitapi lib
    this.lunar?.sendTeammateList();
  }

  public addCooldown(id: string, duration: number, iconItemID: number) {
    this.lunar?.addCooldown(id, duration, iconItemID);
  }
  public removeCooldown(id: string) {
    this.lunar?.removeCooldown(id);
  }

  public setStaffModState(mod: StaffMod, state: boolean) {
    this.lunar?.setStaffModState(mod, state);
  }
  public setAllStaffModStates(states: boolean) {
    for (const mod in StaffMod) {
      this.lunar?.setStaffModState(StaffMod[mod], states);
    }
  }

  public setServerRule(
    serverRule: ServerRuleEnum,
    value: boolean | number | string,
    valueType?: ServerRuleValue
  ) {
    this.lunar?.setServerRule(serverRule, value, valueType);
  }
  public setServerRules(
    ...serverRules: {
      serverRule: ServerRuleEnum;
      value: boolean | number | string;
      valueType?: ServerRuleValue;
    }[]
  ) {
    this.lunar?.setServerRules(...serverRules);
  }

  public forceModSettings(
    mod: LunarClientMod,
    enabled: boolean,
    properties: {
      [key: string]: unknown;
    } = {}
  ) {
    this.lunar?.addModSetting(mod, enabled, properties);
  }
  public unforceModSettings(mod: LunarClientMod) {
    this.lunar?.removeModSetting(mod);
  }
  public sendForcedModSettings() {
    // @ts-expect-error - Hidden function in lunarbukkitapi lib
    this.lunar?.sendModSettings();
  }
}
