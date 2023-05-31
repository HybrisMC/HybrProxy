import { player } from '../..';
import { EntityMetadata } from '../../PacketTypings';
import { Direction, Location } from '../../Types';

// Y: 33 blocks in the direction facing (negative pitch is up, positive is down)
// X and Z: 32 blocks in the direction facing

function calculateBlock(pos: Location, dir: Direction): Location {
  // Calculate X

  // -180 to 180
  // We want -90 to 90 (which is actually 90 to 270)
  let yaw = dir.yaw - 180;

  // -90 to 90
  if (yaw < -90) yaw += (Math.abs(yaw) - 90) * 2;
  if (yaw > 90) yaw -= (yaw - 90) * 2;

  const x = yaw / 2.8125;

  // Calculate Z

  // 0 to 360
  // We want 0 and 360 (as the same) to 180
  yaw = dir.yaw;

  // 0 to 180
  if (yaw > 180) yaw -= (yaw - 180) * 2;

  // -90 to 90
  yaw = yaw - 90;

  const z = yaw / 2.8125;

  return {
    x: (pos.x + x) * 32,
    y: (pos.y - dir.pitch / 2.7272727272) * 32,
    z: (pos.z - z) * 32,
  };
}

export default class BossBar {
  public ID = -1244;
  public text: string;
  public health: number;
  public spawned: boolean;

  public realBossBar: any = null;
  public realLocation: Location;

  public get location(): Location {
    return (
      this.realLocation ??
      (player.location && player.direction
        ? calculateBlock(player.location, player.direction)
        : {
            x: 0,
            y: 0,
            z: 0,
          })
    );
  }

  public get metadata(): EntityMetadata {
    return [
      {
        type: 0,
        key: 3,
        value: 1,
      },
      {
        type: 0,
        key: 0,
        value: 32,
      },
      {
        type: 3,
        key: 6,
        value: this.health,
      },
      {
        type: 2,
        key: 19,
        value: 0,
      },
      {
        type: 2,
        key: 20,
        value: 1000,
      },
      {
        type: 4,
        key: 2,
        value: this.text,
      },
      {
        type: 2,
        key: 17,
        value: 0,
      },
      {
        type: 2,
        key: 18,
        value: 0,
      },
    ];
  }

  constructor(text: string, health: number) {
    this.spawned = false;

    if (typeof text !== 'string')
      throw new Error('BossBar Text must be a string');
    this.text = text;

    if (isNaN(health)) throw new Error('BossBar Health must be a number');
    health = Number(health);
    if (health < 0 || health > 300)
      throw new Error('BossBar Health must be between 0 and 300');
    this.health = health;

    player.listener.on('switch_server', () => {
      if (this.spawned) this.render();
    });

    player.proxyHandler.on('fromServer', ({ data, name }) => {
      if (
        name === 'spawn_entity_living' &&
        data.type === 64 &&
        data.metadata?.find(
          (m) => m.type === 4 && m.key === 2 && typeof m.value === 'string'
        ) &&
        data.metadata.find(
          (m) => m.type === 3 && m.key === 6 && typeof m.value === 'number'
        )
      ) {
        this.realLocation = {
          x: data.x,
          y: data.y,
          z: data.z,
        };
        this.realBossBar = data;
        if (this.spawned) this.spawn(true);
        return !this.spawned;
      } else if (
        name === 'entity_metadata' &&
        this.realBossBar &&
        data.entityId === this.realBossBar.entityId
      ) {
        this.realBossBar.metadata = data.metadata;
        if (this.spawned) this.render();
        return !this.spawned;
      } else if (
        name === 'entity_destroy' &&
        this.realBossBar &&
        data.entityIds.includes(this.realBossBar.entityId)
      ) {
        this.realBossBar = null;
        return !this.spawned;
      } else if (
        name === 'entity_teleport' &&
        this.realBossBar &&
        data.entityId === this.realBossBar.entityId
      ) {
        this.realLocation = {
          x: data.x,
          y: data.y,
          z: data.z,
        };
        this.realBossBar = {
          ...this.realBossBar,
          ...this.realLocation,
        };
        if (this.spawned) this.render();
        return !this.spawned;
      }
    });

    setInterval(() => this.updatePosition(), 250);
  }

  public render(skipSpawnedCheck = false) {
    if (!skipSpawnedCheck && !this.spawned) return this.spawn();

    this.updatePosition(skipSpawnedCheck);
    player.client?.write('entity_metadata', {
      entityId: this.ID,
      metadata: this.metadata,
    });
  }

  public updatePosition(skipSpawnedCheck = false) {
    if (!skipSpawnedCheck && !this.spawned) return;

    player.client?.write('entity_teleport', {
      entityId: this.ID,
      ...this.location,
      yaw: 0,
      pitch: 0,
      onGround: false,
    });
  }

  public spawn(skipSpawnedCheck = false) {
    if (!skipSpawnedCheck && this.spawned) return this.render();
    this.spawned = true;

    if (this.realBossBar)
      player.client?.write('entity_destroy', {
        entityIds: [this.realBossBar.entityId],
      });

    player.client?.write('spawn_entity_living', {
      entityId: this.ID,
      type: 64,
      ...this.location,
      yaw: 0,
      pitch: 0,
      headPitch: 0,
      velocityX: 0,
      velocityY: 0,
      velocityZ: 0,
      metadata: this.metadata,
    });
  }

  public despawn(skipSpawnedCheck = false) {
    if (!skipSpawnedCheck && !this.spawned) return;
    this.spawned = false;

    player.client?.write('entity_destroy', {
      entityIds: [this.ID],
    });

    if (this.realBossBar)
      player.client?.write('spawn_entity_living', this.realBossBar);
  }

  public setText(text: string) {
    if (typeof text !== 'string')
      throw new Error('BossBar Text must be a string');

    this.text = text;

    if (this.spawned) this.render();
  }

  public setHealth(health: number) {
    if (isNaN(health)) throw new Error('BossBar Health must be a number');
    health = Number(health);
    if (health < 0 || health > 300)
      throw new Error('BossBar Health must be between 0 and 300');

    this.health = health;

    if (this.spawned) this.render();
  }
}
