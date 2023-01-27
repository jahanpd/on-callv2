import Dexie, { Table } from 'dexie';


// better pattern than enum
const Status = {
    Pending: 'Pending',
    Seen: 'Seen',
    Completed:'Completed',
    Transfer: 'Transfer',
    Other: 'Other'
} as const;

type TypeStatus = typeof Status;
export type Status = Status[keyof TypeStatus];

// times are milliseconds since Jan 1 1970
export interface Card {
    id?: number;
    uid: string;
    cardId: string;
    name?: string;
    urn?: string;
    dob?: number;
    timestamp: number;
    content: string;
    summary?: string;
    status?: Status;
    notes?: Array<string>;
}

// this records the timestamp of the last sync between this device and supabase
// if last update is > last sync then it should sync data with supabase
export interface State {
    id?: number;
    uid: string,
    device?: string;
    lastSync?: number;
    seedPhrase?: string;
    lookback?: string;
    filter?: string;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  cards!: Table<Card>;
  state!: Table<State>;

  constructor() {
    super('database');
    this.version(2).stores({
      cards: '++id, uid, cardId, name, urn, dob, timestamp, content, summary, status', // Primary key and indexed props
      state: '++id, uid, device, lastSync, seedPhrase, lookback, filter' // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
