// Types

// Vague
export type OptionalNBT = {
  type: 'compound';
  name: '';
  value: {
    display?: {
      type: 'compound';
      value: {
        Lore?: {
          type: 'list';
          value: {
            type: 'string';
            value: string[];
          };
        };
        Name?: {
          type: 'string';
          value: string;
        };
      };
    };
  };
};
export type UUID = string;

// Objects

export type Slot = {
  blockId: number;
  itemCount?: number;
  itemDamage?: number;
  nbtData?: OptionalNBT;
};

export type PositionAs<T extends string> = {
  [name in `${T}X` | `${T}Y` | `${T}Z`]: number;
};

export interface Position {
  x: number;
  y: number;
  z: number;
}
export interface Direction {
  pitch: number;
  yaw: number;
}
export type DirectionWithRoll = Direction & {
  roll?: number;
};

export type PositionAndDirection = Position & Direction;
export type PositionAndDirectionWithRoll = Position & DirectionWithRoll;

export type EntityMetadataItem = {
  key: number;
} & (
  | {
      type: 0 | 1 | 2 | 3;
      value: number;
    }
  | {
      type: 4;
      value: string;
    }
  | {
      type: 5;
      value: Slot;
    }
  | {
      type: 6;
      value: Position;
    }
  | {
      type: 7;
      value: Direction;
    }
);
export type EntityMetadata = EntityMetadataItem[];

export interface EntityPropertyItem {
  key: string;
  value: number;
  modifiers: { uuid: UUID; amount: number; operation: number }[];
}
export type EntityProperties = EntityPropertyItem[];

// Enums

export enum Dimensions {
  NETHER = -1,
  OVERWORLD = 0,
  THE_END = 1,
}

// Packets

// Handshake

export type PacketsHandshakeToClient = {};
export type PacketsHandshakeToServer = {
  set_protocol: {
    protocolVersion: number;
    serverHost: string;
    serverPort: number;
    nextState: number;
  };
  legacy_server_list_ping: {
    payload: number;
  };
};

// Status

export type PacketsStatusToClient = {
  server_info: {
    response: string;
  };
  ping: {
    time: number;
  };
};
export type PacketsStatusToServer = {
  ping_start: {};
  ping: {
    time: number;
  };
};

// Login

export type PacketsLoginToClient = {
  disconnect: {
    reason: string;
  };
  encryption_begin: {
    serverId: string;
    // Buffer<VarInt>
    publicKey: Buffer;
    // Buffer<VarInt>
    verifyToken: Buffer;
  };
  success: {
    uuid: string;
    username: string;
  };
  compress: {
    threshold: number;
  };
};
export type PacketsLoginToServer = {
  login_start: {
    username: string;
  };
  encryption_begin: {
    // Buffer<VarInt>
    sharedSecret: Buffer;
    // Buffer<VarInt>
    verifyToken: Buffer;
  };
};

// Play (Main State)

export type PacketsPlayToClient = {
  keep_alive: {
    keepAliveId: number;
  };
  login: {
    entityId: number;
    gameMode: number;
    dimension: Dimensions;
    difficulty: number;
    maxPlayers: number;
    levelType: string;
    reducedDebugInfo: boolean;
  };
  chat: {
    message: string;
    position?: number;
  };
  update_time: {
    age: number;
    time: number;
  };
  entity_equipment: {
    entityId: number;
    slot: number;
    item: Slot;
  };
  spawn_position: {
    location: Position;
  };
  update_health: {
    health: number;
    food: number;
    foodSaturation: number;
  };
  respawn: {
    dimension: Dimensions;
    difficulty: number;
    gamemode: number;
    levelType: string;
  };
  position: PositionAndDirection & {
    flags: number;
  };
  held_item_slot: {
    slot: number;
  };
  bed: {
    entityId: number;
    location: Position;
  };
  animation: {
    entityId: number;
    animation: number;
  };
  named_entity_spawn: PositionAndDirection & {
    entityId: number;
    playerUUID: UUID;
    currentItem: number;
    metadata: EntityMetadata;
  };
  collect: {
    collectedEntityId: number;
    collectorEntityId: number;
  };
  spawn_entity: PositionAndDirection & {
    entityId: number;
    type: number;
    objectData: Partial<PositionAs<'velocity'>> & {
      intField?: number;
    };
  };
  spawn_entity_living: PositionAndDirection &
    Partial<PositionAs<'velocity'>> & {
      entityId: number;
      type: number;
      headPitch: number;
      metadata: EntityMetadata;
    };
  spawn_entity_painting: {
    entityId: number;
    title: string;
    location: Position;
    direction: number;
  };
  spawn_entity_experience_orb: Position & {
    entityId: number;
    count: number;
  };
  entity_velocity: PositionAs<'velocity'> & {
    entityId: number;
  };
  entity_destroy: {
    entityIds: number[];
  };
  entity: {
    entityId: number;
  };
  rel_entity_move: PositionAs<'d'> & {
    entityId: number;
    onGround: boolean;
  };
  entity_look: Direction & {
    entityId: number;
    onGround: boolean;
  };
  entity_move_look: PacketsPlayToClient['rel_entity_move'] &
    PacketsPlayToClient['entity_look'];
  entity_teleport: PositionAndDirection & {
    entityId: number;
    onGround: boolean;
  };
  entity_head_rotation: {
    entityId: number;
    headYaw: number;
  };
  entity_status: {
    entityId: number;
    entityStatus: number;
  };
  attach_entity: {
    entityId: number;
    vehicleId: number;
    leash: boolean;
  };
  entity_metadata: {
    entityId: number;
    metadata: EntityMetadata;
  };
  entity_effect: {
    entityId: number;
    effectId: number;
    amplifier: number;
    duration: number;
    hideParticles: boolean;
  };
  remove_entity_effect: {
    entityId: number;
    effectId: number;
  };
  experience: {
    experienceBar: number;
    level: number;
    totalExperience: number;
  };
  update_attributes: {
    entityId: number;
    properties: EntityProperties;
  };
  map_chunk: Omit<Position, 'y'> & {
    groundUp: boolean;
    bitMap: number;
    // Buffer<VarInt>
    chunkData: Buffer;
  };
  multi_block_change: {
    chunkX: number;
    chunkZ: number;
    records: {
      horizontalPos: number;
      y: number;
      blockId: number;
    }[];
  };
  block_change: {
    location: Position;
    type: number;
  };
  block_action: {
    location: Position;
    byte1: number;
    byte2: number;
    blockId: number;
  };
  block_break_animation: {
    entityId: number;
    location: Position;
    destroyStage: number;
  };
  map_chunk_bulk: {
    skyLightSent: boolean;
    // Rest Buffer
    data: Buffer;
    meta: (Omit<Position, 'y'> & {
      bitMap: number;
    })[];
  };
  explosion: Position & {
    radius: number;
    affectedBlockOffsets: Position[];
    playerMotionX: number;
    playerMotionY: number;
    playerMotionZ: number;
  };
  world_event: {
    effectId: number;
    location: Position;
    data: number;
    global: boolean;
  };
  named_sound_effect: Position & {
    soundName: string;
    volume: number;
    pitch: number;
  };
  world_particles: Position &
    PositionAs<'offset'> &
    (
      | { particleId: number }
      | {
          particleId: 36 | 37 | 38;
          data: number[];
        }
    ) & {
      longDistance: boolean;
      particleData: number;
      particles: number;
    };
  game_state_change: {
    reason: number;
    gameMode: number;
  };
  spawn_entity_weather: Position & {
    entityId: number;
    type: number;
  };
  open_window: (
    | { inventoryType: string }
    | { inventoryType: 'EntityHorse'; entityId: number }
  ) & {
    windowId: number;
    windowTitle: string;
    slotCount: number;
  };
  close_window: {
    windowId: number;
  };
  set_slot: {
    windowId: number;
    slot: number;
    item: Slot;
  };
  window_items: {
    windowId: number;
    items: Slot[];
  };
  craft_progress_bar: {
    windowId: number;
    property: number;
    value: number;
  };
  transaction: {
    windowId: number;
    action: number;
    accepted: boolean;
  };
  update_sign: {
    location: Position;
    text1: string;
    text2: string;
    text3: string;
    text4: string;
  };
  map: (
    | { columns: 0 }
    | ({
        columns: number;
        rows: number;
        // Buffer<VarInt>
        data: Buffer;
      } & Position)
  ) & {
    itemDamage: number;
    scale: number;
    icons: (Omit<Position, 'y'> & {
      directionAndType: number;
    })[];
  };
  tile_entity_data: {
    location: Position;
    action: number;
    nbtData?: OptionalNBT;
  };
  open_sign_entity: {
    location: Position;
  };
  statistics: {
    entries: {
      name: string;
      value: number;
    }[];
  };
  player_info: {
    action: number;
    data: {
      UUID: UUID;
      name?: string;
      properties?: {
        name: string;
        value: string;
        signature?: string;
      }[];
      gamemode?: number;
      ping?: number;
      displayName?: string;
    }[];
  };
  abilities: {
    flags: number;
    flyingSpeed: number;
    walkingSpeed: number;
  };
  tab_complete: {
    matches: string[];
  };
  scoreboard_objective: {
    name: string;
  } & (
    | { action: number }
    | { action: 0 | 2; displayText: string; type: string }
  );
  scoreboard_score: {
    itemName: string;
    scoreName: string;
  } & ({ action: 1 } | { action: number; value: number });
  scoreboard_display_objective: {
    position: number;
    name: string;
  };
  scoreboard_team: {
    team: string;
  } & (
    | {
        mode: 1;
      }
    | {
        mode: 2;
        name: string;
        prefix: string;
        suffix: string;
        friendlyFire: number;
        nameTagVisibility: string;
        color: number;
      }
    | {
        mode: 0;
        name: string;
        prefix: string;
        suffix: string;
        friendlyFire: number;
        nameTagVisibility: string;
        color: number;
        players: string[];
      }
    | {
        mode: 3 | 4;
        players: string[];
      }
  );
  custom_payload: {
    channel: string;
    // Rest Buffer
    data: Buffer;
  };
  kick_disconnect: {
    reason: string;
  };
  difficulty: {
    difficulty: number;
  };
  combat_event:
    | {
        event: 1;
        duration: number;
        entityId: number;
      }
    | {
        event: 2;
        playerId: number;
        entityId: number;
        message: number;
      };
  camera: {
    cameraId: number;
  };
  world_border: Partial<Omit<Position, 'y'>> & {
    action: number;
    radius?: number;
    old_radius?: number;
    new_radius?: number;
    speed?: number;
    portalBoundary?: number;
    warning_time?: number;
    warning_blocks?: number;
  };
  title:
    | {
        action: 0 | 1;
        text: string;
      }
    | {
        action: 2;
        text: string;
        fadeIn: number;
        stay: number;
        fadeOut: number;
      };
  set_compression: {
    threshold: number;
  };
  playerlist_header: {
    header: string;
    footer: string;
  };
  resource_pack_send: {
    url: string;
    hash: string;
  };
  update_entity_nbt: {
    entityId: number;
    tag: OptionalNBT;
  };
};
export type PacketsPlayToServer = {
  keep_alive: {
    keepAliveId: number;
  };
  chat: {
    message: string;
  };
  use_entity: {
    target: number;
  } & ({ mouse: number } | ({ mouse: 2 } & Position));
  flying: {
    onGround: boolean;
  };
  position: Position & {
    onGround: boolean;
  };
  look: Direction & {
    onGround: boolean;
  };
  position_look: PacketsPlayToServer['position'] & PacketsPlayToServer['look'];
  block_dig: {
    status: number;
    location: Position;
    face: number;
  };
  block_place: PositionAs<'cursor'> & {
    location: Position;
    direction: number;
    heldItem: Slot;
  };
  held_item_slot: {
    slotId: number;
  };
  arm_animation: {};
  entity_action: {
    entityId: number;
    actionId: number;
    jumpBoost: number;
  };
  steer_vehicle: {
    sideways: number;
    forward: number;
    jump: number;
  };
  close_window: {
    windowId: number;
  };
  window_click: {
    windowId: number;
    slot: number;
    mouseButton: number;
    action: number;
    mode: number;
    item: Slot;
  };
  transaction: {
    windowId: number;
    action: number;
    accepted: boolean;
  };
  set_creative_slot: {
    slot: number;
    item: Slot;
  };
  enchant_item: {
    windowId: number;
    enchantment: number;
  };
  update_sign: {
    location: Position;
    text1: string;
    text2: string;
    text3: string;
    text4: string;
  };
  abilities: {
    flags: number;
    flyingSpeed: number;
    walkingSpeed: number;
  };
  tab_complete: {
    text: string;
    block?: Position;
  };
  settings: {
    locale: string;
    viewDistance: number;
    chatFlags: number;
    chatColors: boolean;
    skinParts: number;
  };
  client_command: {
    payload: number;
  };
  custom_payload: {
    channel: string;
    // Rest Buffer
    data: Buffer;
  };
  spectate: {
    target: UUID;
  };
  resource_pack_receive: {
    hash: string;
    result: number;
  };
};
