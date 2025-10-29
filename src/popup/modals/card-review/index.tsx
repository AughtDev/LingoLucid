import React from 'react';
import {Card, CardReview} from "../../../types/core.ts";
import useAppContext from "../../context.tsx";
import {recordCardReviewService} from "../../../utils/data/services.ts";
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import Button from "../../../components/Button.tsx";
import NumberedIcon from "../../../components/NumberedIcon.tsx";
import {BookIcon} from "../../../constants/icons.tsx";
import {getReviewCards} from "./space_repetition.ts";

interface CardReviewModalProps {
    lang_code: string
    cards: Card[]
}


interface CardReviewButtonProps extends CardReviewModalProps {
    size: number
}

export default function CardReviewButton({size, cards, ...props}: CardReviewButtonProps) {
    const {modal: {openModal}, data: {languages}} = useAppContext()

    const review_cards = React.useMemo(() => {
        return getReviewCards(cards)
    }, [cards, languages]);

    return (
        <button
            onClick={() => {
                openModal(<CardReviewModal cards={review_cards} {...props}/>)
            }}>
            <NumberedIcon num={review_cards.length} icon={BookIcon} size={size}/>
        </button>
    )
}

function CardReviewModal({lang_code, cards}: CardReviewModalProps) {
    const {modal: {closeModal}} = useAppContext()

    const [active_card_idx, setActiveCardIdx] = React.useState<number>(0)
    const [card_flipped, setCardFlipped] = React.useState<boolean>(false)

    const [counts, setCounts] = React.useState<Map<CardReview["review"], number>>(new Map(
        [["easy", 0], ["medium", 0], ["hard", 0], ["fail", 0]]
    ))


    const onReviewCard = React.useCallback((review: CardReview["review"]) => {
        // update counts first
        setCounts(prev => {
            const new_counts = new Map(prev)
            new_counts.set(review, (new_counts.get(review) || 0) + 1)
            return new_counts
        })
        recordCardReviewService(
            lang_code, cards[active_card_idx].text, review
        ).then(() => {
            setCardFlipped(false)
            setActiveCardIdx(prev => prev + 1)
        })
    }, [lang_code, setActiveCardIdx, setCardFlipped, cards, active_card_idx, setCounts]);

    return (
        <div className={"w-4/5"}>
            <div className={"w-full h-48"}>
                {active_card_idx >= cards.length ? (
                    <div
                        style={{
                            backgroundColor: BACKGROUND_COLOR,
                            borderRadius: "12px",
                            cursor: "pointer"
                        }}
                        className={"w-full h-full flex flex-col items-center justify-around p-4"}>
                        <p className={"text-lg font-semibold"}>Review Complete!</p>
                        <div className={"grow flex justify-center items-center"}>
                            <p className={"text-md font-normal text-gray-800"}>
                                {counts.get("easy")} Easy. {counts.get("medium")} Medium. {counts.get("hard")} Hard. {counts.get("fail")} Failed.
                            </p>
                        </div>
                        <div className={"w-80 flex flex-row justify-around items-center"}>
                            <Button
                                variant={"outline"}
                                label={"Go Again"}
                                onClick={() => {
                                    setActiveCardIdx(0)
                                }}/>

                            <Button
                                variant={"solid"}
                                label={"Close"}
                                onClick={closeModal}/>

                            {/*<button*/}
                            {/*    className={"mt-4 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"}*/}
                            {/*    onClick={() => {*/}
                            {/*        setActiveCardIdx(0)*/}
                            {/*        setCards(og_cards)*/}
                            {/*    }}>Go Again*/}
                            {/*</button>*/}
                            {/*<button*/}
                            {/*    className={"mt-4 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"}*/}
                            {/*    onClick={closeModal}>Close*/}
                            {/*</button>*/}
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
                            <p className={"text-sm"}>{active_card_idx + 1} / {cards.length}</p>
                        </div>
                        {
                            !card_flipped ? (
                                <p className={"text-lg font-semibold"}>{cards[active_card_idx].text}</p>
                            ) : (
                                <p className={"text-lg font-semibold"}>{cards[active_card_idx].translation}</p>
                            )
                        }
                    </div>
                )}
            </div>
            {card_flipped && (
                <div
                    style={{
                        backgroundColor: BACKGROUND_COLOR,
                        borderRadius: "12px",
                        cursor: "pointer",
                        bottom: "10%"
                    }}
                    className={"w-4/5 absolute flex p-4 flex-col justify-center items-center"}>
                    <div
                        className={"w-full flex flex-row justify-between items-center"} >
                    <button
                        className={"px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"}
                        onClick={() => onReviewCard("easy")}>Easy
                    </button>
                    <button
                        className={"px-2 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"}
                        onClick={() => onReviewCard("medium")}>Medium
                    </button>
                    <button
                        className={"px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"}
                        onClick={() => onReviewCard("hard")}>Hard
                    </button>
                    </div>
                    <button
                        className={"px-8 py-1 mt-2 bg-gray-900 text-white rounded-lg hover:bg-black"}
                        onClick={() => onReviewCard("fail")}>Fail
                    </button>
                </div>
            )}
        </div>
    )
}
