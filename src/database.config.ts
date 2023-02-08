import Dexie, { type Table } from 'dexie';
import type { Status, Filter } from './types';

// times are milliseconds since Jan 1 1970
export interface Card {
    id?: number;
    uid: string;
    cardId: string;
    name?: string;
    urn?: string;
    dob?: number;
    timestamp: number;
    timestampEdit: number;
    content: string;
    summary?: string;
    status: Status;
    notes?: Array<string>;
}

// this records the timestamp of the last sync between this device and supabase
// if last update is > last sync then it should sync data with supabase
export interface State {
    id?: string;
    device?: string;
    lastSync?: number;
    seedPhrase?: string;
    lookback?: number;
    filterLocal?: Filter;
}

export interface Notes {
  id?: number
  uid: string
  noteId: string
  note: string
  timestamp: number
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  cards!: Table<Card>;
  state!: Table<State>;
  notes!: Table<Notes>;

  constructor() {
    super('database');
    this.version(2).stores({
      cards: '++id, uid, cardId, name, urn, dob, status', // Primary key and indexed props
      state: '++id, uid', // Primary key and indexed props
      notes: "++id, uid, noteId"
    });
  }
}

export const db = new MySubClassedDexie();
