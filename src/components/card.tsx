import { type NextPage } from "next";
import Link from "next/link";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';


const Card: NextPage = ({ card, cards, setCards, filter, setFilter }) => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const user = useUser();

    return (
        <div className="min-w-[370px] px-5">
            <div className="bg-slate-600 w-full p-1 text-white">
                {card.id} {card.cardId}
            </div>
        </div>
    )
}

export default Card;
