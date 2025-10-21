import React from 'react';
import {Card, CardReview} from "../../../types/core.ts";
import useAppContext from "../../context.tsx";
import {recordCardReviewService} from "../../../utils/data/services.ts";
import {CloseIcon} from "../../../constants/icons.tsx";
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";

interface CardReviewModalProps {
    lang_code: string
    cards: Card[]
    limit: number
}


function generateCardOrder(cards: Card[], limit: number): number[] {
    return cards.map((_card, idx) => idx).slice(0, limit);
}

export default function CardReviewModal({lang_code, cards: og_cards, limit}: CardReviewModalProps) {
    const {modal: {closeModal}} = useAppContext()

    const [cards, setCards] = React.useState<Card[]>(og_cards)
    const [active_card_idx, setActiveCardIdx] = React.useState<number>(0)
    const [card_flipped, setCardFlipped] = React.useState<boolean>(false)

    const card_order: number[] = React.useMemo(() => {
        return generateCardOrder(cards, limit)
    }, [cards, limit]);

    const onReviewCard = React.useCallback((review: CardReview["review"]) => {
        recordCardReviewService(
            lang_code, cards[card_order[active_card_idx]].text, review
        ).then(() => {
            setCardFlipped(false)
            setActiveCardIdx(prev => prev + 1)
        })
    }, [lang_code, setActiveCardIdx, setCardFlipped, cards, card_order, active_card_idx]);

    return (
        <div className={"w-4/5 h-48"}>
            {active_card_idx >= cards.length ? (
                <div className={"w-full h-full flex flex-col items-center justify-center"}>
                    <p className={"text-lg font-semibold"}>Review Complete!</p>
                    <div className={"w-80 flex flex-row justify-around items-center"}>
                        <button
                            className={"mt-4 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"}
                            onClick={() => {
                                setActiveCardIdx(0)
                                setCards(og_cards)
                            }}>Go Again
                        </button>
                        <button
                            className={"mt-4 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"}
                            onClick={closeModal}>Close
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setCardFlipped(true)}
                    style={{
                        backgroundColor: BACKGROUND_COLOR,
                        borderRadius: "12px",
                        cursor: "pointer"
                    }}
                    className={"relative w-full h-full flex flex-col items-center justify-center"}>
                    <div className={"absolute top-0 left-0 m-4"}>
                        <p className={"text-sm"}>{active_card_idx + 1} / {card_order.length}</p>
                    </div>
                    <div className={"absolute top-0 right-0 m-4"}>
                        <button
                            className={"text-sm text-gray-500 hover:text-gray-700"}
                            onClick={closeModal}>
                            <CloseIcon size={16}/>
                        </button>
                    </div>
                    {
                        !card_flipped ? (
                            <p className={"text-lg font-semibold"}>{cards[card_order[active_card_idx]].text}</p>
                        ) : (
                            <>
                                <p className={"text-lg font-semibold"}>{cards[card_order[active_card_idx]].translation}</p>
                                <hr/>
                                <div className={"w-80 flex flex-row justify-around items-center"}>
                                    <button
                                        className={"mt-4 px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"}
                                        onClick={() => onReviewCard("easy")}>Easy
                                    </button>
                                    <button
                                        className={"mt-4 px-2 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"}
                                        onClick={() => onReviewCard("medium")}>Medium
                                    </button>
                                    <button
                                        className={"mt-4 px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"}
                                        onClick={() => onReviewCard("hard")}>Hard
                                    </button>
                                </div>
                            </>
                        )
                    }
                </div>
            )}
        </div>
    )
}
