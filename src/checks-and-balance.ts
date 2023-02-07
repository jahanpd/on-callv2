import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './utils/supabaseTypes';
import type { db as DbDexie, Card } from "./database.config";
import type { ContextType } from 'react';
import type AppContext from "./AppContext";
import { SeedError, SyncError } from "./types";
import { getSupabaseUserState, getCardsFromIds,
         getCardInfoAfterTimestamp, setCards, setSupabaseUserState } from "./supabase-helper";
import AES from 'crypto-js/aes';
import { SHA1, SHA3, enc } from 'crypto-js'

export const checkSeedHash = async (
    db: typeof DbDexie,
    supabase: SupabaseClient<Database>,
    user: User,
    value: ContextType<typeof AppContext>
) => {
    console.log("checkSeedHash: starting check")
    let localHash: string
    let supabaseHash: string
    // tet app state
    localHash = value?.state.seedHash.localHash ? value?.state.seedHash.localHash : ""
    supabaseHash = value?.state.seedHash.supabaseHash ? value?.state.seedHash.supabaseHash : ""
    // get localHash first
    if (!localHash) void await (async () => {
        const state = await db.state.where("id").equals(user.id).first();
        if (!state) {
            console.log("checkSeedHash: try add user if no local state", state)
            try {
                await db.state.add({id: user.id });
            } catch {
                console.log("checkSeedHash: unable to add user")
            }
        }
        localHash = state?.seedPhrase ? SHA3(state.seedPhrase).toString() : "";
    } )();
    if (!localHash) return SeedError.localEmpty

    let noPreviousUserState = false;
    if (!supabaseHash) void await (async () => {
        const state = await getSupabaseUserState(supabase, user);
        console.log("checkSeedHash: check sb state", state)
        noPreviousUserState = state ? false : true
        supabaseHash = state?.seedhash ? state.seedhash : "";
    } )();
    if (noPreviousUserState) {
        return SeedError.SupabaseRetrievalError
    }
    if ((!supabaseHash && localHash) || noPreviousUserState) {
        console.log("checkSeedHash: setting seed phrase");
        const setStateOutput = setSupabaseUserState(
            supabase,
            {
                created_at: new Date().toISOString(),
                eua: null,
                lastSync: null,
                paid: null,
                paidtime: null,
                seedhash: localHash,
                uid: user.id
            }
        )
        return SeedError.NoSupabase
    }
    if (localHash !== supabaseHash) return SeedError.Different

    return SeedError.Passed
}

// recursions are beautiful
export const checkDataSync = async (
    user: User,
    supabase: SupabaseClient<Database>,
    db: typeof DbDexie,
    lookbackDefault: number | null = null
) => {
    console.log("checkDataSync: start data sync")

    const state = await db.state.where("id").equals(user.id).first();
    if (!state?.seedPhrase) return SyncError.noSeed
    const seedPhrase = state?.seedPhrase
    const supaState = await getSupabaseUserState(supabase, user);
    if (!supaState) return SyncError.noSupaState
    const localCards = await db.cards.where("uid").equals(user.id).toArray();
    if (!localCards) return SyncError.getError
    const lastSync: Date | null = state?.lastSync ? new Date(state.lastSync) : null // timestamp of last sync
    const supaLastSync: Date | null = supaState?.lastSync ? new Date(supaState?.lastSync) : null
    const lookback: number = lookbackDefault ? lookbackDefault : state?.lookback ? state?.lookback : 0
    // const lookback = 7
    const modifier = lookback == 0 ? 0 : 1

    // basic full check between local and supabase to lookback of 7 days
    const supaCards = await getCardInfoAfterTimestamp(
        supabase,
        user,
        new Date( modifier *(Date.now() - lookback*24*60*60*1000) ).getTime()
    )
    console.log("checkDataSync: supcards pulled", supaCards)
    if (!supaCards) return SyncError.getError
    const supaCardsId = supaCards.map(c => c.cardId)
    const localCardsData = localCards.map(c => {return {
        hash: SHA1(JSON.stringify(c)).toString(), cardId: c.cardId, date: new Date(c.timestampEdit) } } )
    const localCardsId = localCardsData.map(c => c.cardId)

    const download = supaCards
        .map((c) => {
            // find local cards with a different hash but same cardId
            const localCard: Array<{ hash:string, cardId:string, date: Date}> = localCardsData.filter(lc => lc.hash != c.hash && lc.cardId == c.cardId );
            // check that cardId doesn't exist locally
            const altCond = !localCardsId.includes(c.cardId)
            if (altCond) return {ret: true, c: c}
            if (localCard.length == 0) return {ret: false, c: c};
            if (localCard.length > 0) {
                if (localCard[0]){
                    // only download if edited after localcard
                    if (localCard[0].date < new Date(c.created_at ? c.created_at : 0)) {
                        return {ret: true, c: c}
                    }
                }
            }
            return {ret: false, c: c};
        }) // cards on server not local
        .filter(c => c.ret)
        .map(c => c.c)

    console.log("checkDataSync: downloads", download)

    const upload = localCardsData
        .map((c) => {
            // find local cards with a different hash but same cardId
            const supaCard: Array<{ hash:string | null, cardId:string, created_at: string | null}> = supaCards.filter(lc => lc.hash != c.hash && lc.cardId == c.cardId );
            // check that cardId doesn't exist locally
            const altCond = !supaCardsId.includes(c.cardId)
            if (altCond) return {ret: true, c: c}
            if (supaCard.length == 0) return {ret: false, c: c};
            if (supaCard.length > 0) {
                if (supaCard[0]){
                    // only upload if edited after supacard
                   console.log(new Date(supaCard[0].created_at ? supaCard[0].created_at : 0), c.date)
                    if (new Date(supaCard[0].created_at ? supaCard[0].created_at : 0) < c.date) {
                        return {ret: true, c: c}
                    }
                }
            }
            return {ret: false, c: c};
        }) // cards on server not local
        .filter(c => c.ret)
        .map(c => c.c)

    if (download.length > 0) {
        const newSupaCards = await getCardsFromIds(
            supabase,
            user,
            download.map((c: { cardId:string }) => c.cardId)
        )
        if (!newSupaCards) return SyncError.getError
        newSupaCards.map(async (c: {cardId: string, created_at: string | null, hash: string | null, encryption: string | null}) => {
            if (c.encryption) {
                const newCard = JSON.parse(
                    AES.decrypt(
                        c.encryption, seedPhrase
                    ).toString(enc.Utf8)
                ) as Card;
            console.log("checkDataSync: newCard cardId check", newCard.cardId);
            await db.cards.put(newCard)
            }
        })
    }
    console.log("checkDataSync: upload", upload)
    if (upload.length > 0) {
        const newLocalCards = localCards.filter(c => upload.map(ca => ca.cardId).includes(c.cardId))
        const setError = await setCards(
            supabase,
            newLocalCards.map((c) => {return {
                cardId: c.cardId,
                created_at: new Date(c.timestampEdit).toISOString(),
                encryption: AES.encrypt(
                    JSON.stringify(c),
                    seedPhrase
                ).toString(),
                uid: user.id,
                hash: SHA1(JSON.stringify(c)).toString()
            }})
        );
        if (setError) return SyncError.setError

    // TODO fix the edge case where cards have been deleted on one device, but still exist on another
    }
    return SyncError.Passed
}


export const clientRoutine = async (
    user: User,
    supabase: SupabaseClient<Database>,
    db: typeof DbDexie,
    value: ContextType<typeof AppContext>,
    subroutine: "seedCheck" | "dataSync" | "both" = "both"
    ) => {
    if (user) {
        // routine to test seed hash and set interval to sync data
        if (subroutine == "seedCheck" || subroutine == "both") {
            const seedResult: SeedError =  await checkSeedHash(db, supabase, user, value);
            console.log("clientRoutine: seed result:", seedResult);
            if (seedResult == SeedError.Passed && subroutine == "both") {
                const syncStatus = await checkDataSync(user, supabase, db);
                console.log("clientRoutine: data sync result:", syncStatus)
            }
            return seedResult
        }
        if (subroutine == "dataSync") {
            const syncStatus = await checkDataSync(user, supabase, db);
            console.log("clientRoutine: data sync result:", syncStatus)
        }
    }
}

export const serverRoutine = (
    user: User,
    supabase: SupabaseClient<Database>,
) => {
    // TODO used to check if paid/signed eua
}
