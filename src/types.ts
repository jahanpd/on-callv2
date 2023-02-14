// better pattern than enum
export const Status = {
    Pending: 'Pending',
    Seen: 'Seen',
    Admitted: 'Admitted',
    Discharged: 'Discharged',
    Completed:'Completed',
    Transfer: 'Transfer',
    Other: 'Other'
} as const;

export type Status = typeof Status[keyof typeof Status];


const options = []
    let k: keyof typeof Status;
    for (k in Status) {
        options.push({
            value: Status[k],
            label: Status[k]
        })
    }

export type Filter = {
     status: typeof options;
     from: Date;
     to: Date;
     urn: string;
     lastUse: number;
 }

export const Alerts = {
    sync: "Data sync has failed, check internet connection",
    supabaseOperation: "Unable to perform operation with server. Possibly no internet connection. Please sync data when internet available",
    SaveOperation: "Card save succeeded locally but failed to sync. Possibly no internet connection. Please sync data when internet available",
    supabaseDeleteFail: "Unable to delete card on server. Possibly no internet connection. Please try again when internet available",
    supabaseDeleteSuccess: "Card successfully removed from server and locally. If this is unintentional consider using filter/status to remove from view instead.",
    noSeed: "No seed hash recorded. Please input one to sync data",
    pushedSeed: "Pushed current phrase to server. DO NOT LOSE THIS PHRASE to sync across other devices",
    seedDiffers: "Input seed phrase on this device is different from others. Please check phrase",
} as const;

export type Alerts = typeof Alerts[keyof typeof Alerts]

export const SeedError = {
    localEmpty: "No local seed input",
    Different: "Local input seed different to other device(s)",
    NoSupabase: "Local input seed but no hash recorded. Push to server",
    Passed: "Seed hash passed check",
    SupabaseRetrievalError: "Check internet connection"
} as const;

export type SeedError = typeof SeedError[keyof typeof SeedError]

export const SyncError = {
    noSeed: "No local seed to encrypt with",
    noSupaState: "Userstate failed to be retrieved from supabase",
    setError: "Error setting datat",
    setStateError: "Error setting user state",
    Passed: "Data sync appears successful",
    getError: "Unable to retrieve cards from supabase"
} as const;

export type SyncError = typeof SyncError[keyof typeof SyncError]
