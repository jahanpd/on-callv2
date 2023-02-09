// npx supabase gen types typescript --project-id  oxxdfnagnugjltotyhav --schema public > supabaseTypes.ts
import type { Database } from './utils/supabaseTypes';
import type { SupabaseClient, User } from '@supabase/supabase-js';


export type supabaseUserState = ReturnType<() => Database["public"]["Tables"]["user_data"]["Row"]>
export type supabaseCard = ReturnType<() => Database["public"]["Tables"]["cards"]["Row"]>


export const deleteCard = async(
    supabase: SupabaseClient<Database>,
    user: User,
    cardId: string
) => {
    try {
        const { count, error, status } = await supabase
        .from('cards')
        .delete({ count: "estimated"})
        .eq('uid', user.id)
        .eq('cardId', cardId)

        if (error) {
        throw error
        }

        return count ? count + 1 : 1

    } catch (error) {
        console.log('Error deleting card')
        console.log(error)
    }
}

export const getDeleted = async (
    supabase: SupabaseClient<Database>,
    user: User,
) => {
    try {
        const { data, error, status } = await supabase
        .from('delete_cache')
        .select("cardId, timestamp")
        .eq('uid', user.id)

        if (error && status !== 406) {
        throw error
        }

        if (data) {
            const output: Array<{ cardId: string, timestamp: number }> = data
            return output
        }

    } catch (error) {
        console.log('Error retrieving deleted cards')
        console.log(error)
    }
}

export const setDeleted = async (
    supabase: SupabaseClient<Database>,
    update: {uid: string, cardId: string, timestamp: number}
) => {
    try {

        const { error } = await supabase.from('delete_cache').upsert(update)

        if (error) throw error

        console.log('Delete cache updated!')

    } catch (error) {
        console.log('Error updating delete cache!')
        console.log(error)
      return error
    }
}

export const deleteDeleted = async(
    supabase: SupabaseClient<Database>,
    user: User,
    cardId: string
) => {
    try {
        const { count, error, status } = await supabase
        .from('delete_cache')
        .delete({ count: "estimated"})
        .eq('uid', user.id)
        .eq('cardId', cardId)

        if (error) {
        throw error
        }

        return count ? count + 1 : 1

    } catch (error) {
        console.log('Error deleting card')
        console.log(error)
    }
}



export const getCardsFromIds = async (
    supabase: SupabaseClient<Database>,
    user: User,
    cardIds: Array<string>
) => {
    try {
        const { data, error, status } = await supabase
        .from('cards')
        .select()
        .eq('uid', user.id)
        .in('cardId', cardIds)
        .limit(10000)

        if (error && status !== 406) {
        throw error
        }

        if (data) {
            const output: Array<supabaseCard> = data
            return output
        }
    } catch (error) {
      console.log('Error loading card data!')
      console.log(error)
    }

}

export const getSupabaseUserState = async (
    supabase: SupabaseClient<Database>,
    user: User
) => {
    try {
        const { data, error, status } = await supabase
        .from('user_data')
        .select()
        .eq('uid', user.id)
        .single()

        if (error && status !== 406) {
        throw error
        }

        if (data) {
            const output: supabaseUserState = data
            return output
        }
    } catch (error) {
      console.log('Error loading user data!')
      console.log(error)
    }
}

export const getCardsAfterTimestamp = async (
    supabase: SupabaseClient<Database>,
    user: User,
    timestamp: number
) => {
    try {
        const { data, error, status } = await supabase
            .from('cards')
            .select("cardId,created_at,hash,encryption")
            .order("created_at")
            .eq('uid', user.id)
            .gt("created_at", new Date(timestamp).toISOString())
            .limit(10000)

        if (error && status !== 406) {
        throw error
        }

        if (data) {
            const output: Array<{cardId: string, created_at: string | null, hash: string | null, encryption: string | null}> = data
            return output
        }
    } catch (error) {
      console.log('Error getting cards after timestamp!')
      console.log(error)
    }
}

export const getCardInfoAfterTimestamp = async (
    supabase: SupabaseClient<Database>,
    user: User,
    timestamp: number
) => {
    try {
        const { data, error, status } = await supabase
            .from('cards')
            .select("cardId,created_at,hash")
            .order("created_at")
            .eq('uid', user.id)
            .gt("created_at", new Date(timestamp).toISOString())
            .limit(10000)

        if (error && status !== 406) {
        throw error
        }

        if (data) {
            const output: Array<{cardId: string, created_at: string | null, hash: string | null}> = data
            return output
        }
    } catch (error) {
      console.log('Error getting cards after timestamp!')
      console.log(error)
    }
}

export const getLastCardTimestamp = async (
    supabase: SupabaseClient<Database>,
    user: User,
) => {
    try {
        const { data, error, status } = await supabase
            .from('cards')
            .select("created_at")
            .order("created_at")
            .eq('uid', user.id)
            .limit(1)

        if (error && status !== 406) {
        throw error
        }

        if (data) {
            const output: Array<{created_at: string | null}> = data
            return output
        }
    } catch (error) {
      console.log('Error getting cards after timestamp!')
      console.log(error)
      return error
    }
}

export const setSupabaseUserState = async (
    supabase: SupabaseClient<Database>,
    update: supabaseUserState
) => {
    try {

      const { error } = await supabase.from('user_data').upsert(update)

      if (error) throw error

      console.log('User state updated!')

    } catch (error) {
      console.log(error)
      return error
    }
}

export const setCard = async (
    supabase: SupabaseClient<Database>,
    update: supabaseCard
) => {
    try {

        const { error } = await supabase.from('cards').upsert(update)

        if (error) throw error

        console.log('Card state updated!')

    } catch (error) {
        console.log('Error updating card!')
        console.log(error)
      return error
    }
}

export const setCards = async (
    supabase: SupabaseClient<Database>,
    updates: Array<supabaseCard>
) => {
    try {

        const { error } = await supabase.from('cards').upsert(updates)

        if (error) throw error

        console.log('Cards state updated!')

    } catch (error) {
        console.log('Error updating card!')
        console.log(error)
      return error
    }
}

