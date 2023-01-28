import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import type { Card } from '../types';
import type { SetStateAction, Dispatch } from "react";
import { useState } from 'react';


type Props = {
    card: Card
    cards: Array<Card>
    setCards: Dispatch<SetStateAction<Array<never>>>
}

const Card = ({ card, cards, setCards }: Props) => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const user = useUser();
    const [openCard, setOpenCard] = useState(false);

    const openCardJSX = (
        <div></div>
    )

    const closedCardJSX = (
        <div className="min-w-[370px] px-5">
            <div className="bg-slate-600 w-full p-1 text-white">
                {card.id} {card.cardId}
            </div>
        </div>
    )


    return (
        <div>
            {openCard ? <div>{openCardJSX}</div> : <div>{closedCardJSX}</div>}
        </div>
    )
}

export default Card;
