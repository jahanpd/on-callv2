// better pattern than enum
const Status = {
    Pending: 'Pending',
    Seen: 'Seen',
    Completed:'Completed',
    Transfer: 'Transfer',
    Other: 'Other'
} as const;

export type Status = typeof Status[keyof typeof Status];


// TODO implement card type

export type Card = {
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
