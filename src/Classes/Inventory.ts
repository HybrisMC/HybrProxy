import { Client } from 'minecraft-protocol';
import { EventEmitter } from 'node:events';
import TypedEmitter from 'typed-emitter';
import { player } from '..';
import { InventoryEvents, InventoryType } from '../Types';
import Item from './Item';

export default class Inventory extends (EventEmitter as new () => TypedEmitter<InventoryEvents>) {
  public items: { [key: string]: Item };
  public type: InventoryType;
  public title: string;
  public slotCount: number;
  public opened: boolean;
  public windowId: number;

  public incomingPacketHandler: (...args: any[]) => void;
  public outgoingPacketHandler: (...args: any[]) => void;

  public constructor(
    inventoryType: InventoryType,
    title = 'Inventory',
    slotCount = 27,
    windowId = 50
  ) {
    super();
    this.items = {};
    this.type = inventoryType;
    this.title = title;
    this.slotCount = slotCount;
    this.windowId = windowId;
    this.opened = false;
  }

  public setItem(item: Item, position?: number, dontSetSlot = false): void {
    const finalPosition = position || Object.keys(this.items).length;
    this.items[finalPosition.toString()] = item;
    if (this.opened && !dontSetSlot) this.setSlot(item, finalPosition);
  }

  public setItems(
    items: { item: Item; position?: number }[],
    bulk = false
  ): void {
    for (const item of items) {
      this.setItem(item.item, item.position, bulk);
    }

    if (this.opened && bulk)
      player.client.write('window_items', {
        windowId: this.windowId,
        items: this.getWindowItems(),
      });
  }

  public removeItem(position: number): void {
    delete this.items[position.toString()];
    if (this.opened)
      player.client.write('set_slot', {
        windowId: this.windowId,
        slot: position,
        item: Item.emptyItem,
      });
  }

  public clear(): void {
    this.items = {};
    if (this.opened)
      player.client.write('window_items', {
        windowId: this.windowId,
        items: [...Array(this.slotCount)].map((i) => Item.emptyItem),
      });
  }

  public display(): void {
    this.opened = true;

    player.client.write('open_window', {
      windowId: this.windowId,
      inventoryType: this.type,
      windowTitle: `{"translate":"${this.title}"}`,
      slotCount: this.slotCount,
    });

    player.client.write('window_items', {
      windowId: this.windowId,
      items: this.getWindowItems(),
    });

    this.setupPacketHandlers();
    player.proxyHandler.on('fromServer', this.incomingPacketHandler);
    player.proxyHandler.on('fromClient', this.outgoingPacketHandler);
  }

  public close(): void {
    if (!this.opened) return;

    this.markAsClosed();
    player.client.write('close_window', {
      windowId: this.windowId,
    });
  }

  public setSlot(item: Item, slot: number): void {
    player.client.write('set_slot', {
      windowId: this.windowId,
      slot,
      item: item.slotRepresentation,
    });
  }

  private getWindowItems() {
    const items = [];

    for (let i = 0; i < this.slotCount; i++) {
      const item = this.items[i.toString()];
      if (item) {
        items.push(item.slotRepresentation);
      } else {
        items.push(Item.emptyItem);
      }
    }

    return items;
  }

  private markAsClosed(): void {
    this.emit('close');
    this.opened = false;

    player.proxyHandler.removeListener(
      'fromServer',
      this.incomingPacketHandler
    );
    player.proxyHandler.removeListener(
      'fromClient',
      this.outgoingPacketHandler
    );
  }

  private setupPacketHandlers(): void {
    this.incomingPacketHandler = ({ name }) => {
      if (name === 'open_window') this.markAsClosed();
    };

    this.outgoingPacketHandler = (
      { data, name },
      toClient: Client,
      toServer: Client
    ) => {
      if (name === 'close_window')
        if (data.windowId === this.windowId && this.opened) {
          this.markAsClosed();
          return false;
        }

      if (name === 'window_click' && this.opened) {
        if (
          data.windowId === this.windowId &&
          data.slot < this.slotCount &&
          data.slot !== -999
        ) {
          this.emit('click', {
            button: data.mouseButton,
            mode: data.mode,
            slot: data.slot,
            toServer: toServer,
            raw: data,
            cancel: () => {
              player.client.write('set_slot', {
                windowId: this.windowId,
                slot: data.slot,
                item: data.item,
              });
              player.client.write('set_slot', {
                windowId: -1,
                slot: -1,
                item: Item.emptyItem,
              });
            },
          });
        } else if (data.slot !== -999) {
          // click is in the player inventory not in the GUI
          // We need to cancel the click because the user can't modify to their real inventories while in the GUI

          player.client.write('set_slot', {
            windowId: -1,
            slot: -1,
            item: Item.emptyItem,
          });
          player.client.write('set_slot', {
            windowId: this.windowId,
            slot: data.slot,
            item: data.item,
          });
        }

        return false;
      }
    };
  }
}
