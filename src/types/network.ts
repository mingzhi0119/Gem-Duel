import { GameState, GameAction } from '../types';

/**
 * Network Protocol Definition
 *
 * Defines the strict schema for messages exchanged between Host and Guest.
 */

export type NetworkMessage =
    | {
          type: 'SYNC_STATE';
          state: GameState;
          reason?: 'RECOVERY' | 'INITIAL';
      }
    | {
          type: 'GAME_ACTION';
          action: GameAction;
          checksum?: string;
      }
    | {
          type: 'GUEST_REQUEST';
          action: GameAction;
      }
    // System Messages
    | { type: 'REQUEST_FULL_SYNC' }
    | { type: 'HEARTBEAT_PING'; timestamp: number }
    | { type: 'HEARTBEAT_PONG'; timestamp: number };
