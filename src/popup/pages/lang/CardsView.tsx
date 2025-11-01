import React from 'react';
import {Card, LanguageCards} from "../../../types/core.ts";
import CardReviewButton from "../../modals/card-review";
import {PRIMARY_COLOR} from "../../../constants/styling.ts";
import {DeleteIcon, SaveIcon, ShuffleIcon} from "../../../constants/icons.tsx";
import {deleteLanguageCardService, saveLanguageCardService} from "../../../utils/data/services.ts";
import Button from "../../../components/Button.tsx";
import {highlightPageService} from "./index.tsx";
import ProficiencyBadge from "../../../components/ProficiencyBadge.tsx";
import AlertModal from "../../modals/alert";
import useAppContext from "../../context.tsx";

interface CardsViewProps {
    lang_code: string
    cards: LanguageCards
}

interface TabSelectorProps {
    active_tab: "saved" | "recent"
    setTab: (tab: "saved" | "recent") => void
}

function TabSelector({active_tab, setTab}: TabSelectorProps) {
    const [active_styling, inactive_styling] = React.useMemo(() => {
        return [{
            fontSize: "1.2rem",
            fontWeight: "600",
            color: PRIMARY_COLOR,
            textDecoration: "underline",
            textDecorationThickness: "2px",
            textUnderlineOffset: "4px",
        }, {
            fontSize: "1rem",
            fontWeight: "400",
            color: "gray",
        }]
    }, []);

    return (
        <div className={"relative w-full h-8 flex flex-row items-center justify-center gap-4"}>
            <p
                style={{
                    ...(active_tab === "saved" ? active_styling : inactive_styling),
                    cursor: "pointer"
                }}
                onClick={() => setTab("saved")}> SAVED </p>
            <p
                style={{
                    ...(active_tab === "recent" ? active_styling : inactive_styling),
                    cursor: "pointer"
                }}
                onClick={() => setTab("recent")}> RECENT </p>
        </div>
    )
}

interface CardActionsProps {
    code: string
    cards: Card[]
    shuffleCards: () => void
}

function CardActions({code, cards, shuffleCards}: CardActionsProps) {
    return (
        <div className={"w-full h-6 flex flex-row items-center justify-center gap-4"}>
            <CardReviewButton
                size={20} lang_code={code}
                cards={cards}/>
            <Button
                size={20}
                icon={ShuffleIcon}
                variant={"icon"} onClick={shuffleCards}/>
        </div>
    )
}

interface CardPaneProps {
    code: string
    card: Card
    type: keyof LanguageCards
    openModal: (content: React.ReactElement) => void
}

function CardPane({code, card, type,openModal}: CardPaneProps) {
    const [is_hovered, setIsHovered] = React.useState<boolean>(false)
    const card_ref = React.useRef<HTMLDivElement | null>(null);

    const saveCard = React.useCallback(() => {
        saveLanguageCardService(
            code, {
                text: card.text,
                translation: card.translation,
                difficulty: card.difficulty,
                reviews: [],
                created_at_t: Date.now()
            }, "saved"
        ).then(() => {
            openModal(
                <AlertModal title={"Success"} details={"Added card to saved cards."}/>
            )
        }).catch((error) => {
            console.error("Error saving card:", error);
        })
    }, [code, card.text, card.translation, card.difficulty]);

    React.useEffect(() => {
        const card_elem = card_ref.current;
        if (!card_elem) return;

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        card_elem.addEventListener("mouseenter", handleMouseEnter);
        card_elem.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            card_elem.removeEventListener("mouseenter", handleMouseEnter);
            card_elem.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={card_ref}
            style={{
                backgroundColor: "white",
                width: '300px'
            }}
            className={"relative flex flex-col justify-center p-4 mb-2 mt-2 rounded-2xl"}>
            {/* cefr level badge */}

            <div className={"absolute top-0 left-0 flex flex-row gap-2 justify-center items-center m-2"}>
                <ProficiencyBadge proficiency={card.difficulty} size={16}/>
            </div>
            {/* delete button */}
            <div className={"absolute top-0 right-0 flex flex-row gap-2 justify-center items-center m-2"}>
                {is_hovered && (
                    <Button
                        variant={"icon"}
                        confirmation_prompt={"Are you sure you want to delete this card? This action is permanent."}
                        onClick={async () => {
                            await deleteLanguageCardService(code, card.text, type).then(() => {
                                highlightPageService()
                            }).catch((error) => {
                                console.error("Error deleting card:", error);
                            });
                        }} icon={DeleteIcon}/>
                )}

                {is_hovered && type === "recent" && (
                    <Button
                        variant={"icon"}
                        onClick={saveCard} icon={SaveIcon}/>
                )}
            </div>
            <p className={"px-4 text-md font-semibold p-1 text-center"}>{card.text}</p>
            <hr style={{width: "70%", opacity: 0.1}}/>
            <p className={"px-4 text-md text-gray-600 p-1 text-center"}>{card.translation}</p>
        </div>
    )
}

export default function CardsView({lang_code, cards}: CardsViewProps) {
    const {modal: {openModal}} = useAppContext()
    const [shuffle_count, setShuffleCount] = React.useState<number>(0)
    const [active_tab, setActiveTab] = React.useState<"saved" | "recent">("saved")

    const active_cards = React.useMemo(() => {
        if (shuffle_count === 0) {
            return (active_tab === "recent" ? cards.recent : cards.saved)
                // sort by created date, latest to earliest
                .sort((a, b) => b.created_at_t - a.created_at_t)
        } else {
            return (active_tab === "recent" ? cards.recent : cards.saved)
                .sort(() => Math.random() - 0.5)
        }
    }, [active_tab, cards.recent, cards.saved, shuffle_count]);

    return (
        <div className={"w-full h-full flex flex-col items-center"}>
            <TabSelector active_tab={active_tab} setTab={setActiveTab}/>
            {active_cards.length > 0 && active_tab === "saved" ? (
                <CardActions
                    code={lang_code}
                    cards={active_cards}
                    shuffleCards={() => setShuffleCount(shuffle_count + 1)}
                />
            ) : null}
            <div
                style={{
                    height: `calc(590px - ${active_tab == "saved" ? "108px" : "84px"})`
                }}
                className={"w-full flex flex-col items-center overflow-y-auto"}>
                {active_cards.length > 0 ? active_cards.map(card => (
                    <CardPane
                        key={card.text} card={card} code={lang_code}
                        type={active_tab === "recent" ? "recent" : "saved"}
                        openModal={openModal}
                    />
                )) : (
                    <div className={"w-full h-full flex flex-col items-center justify-center gap-2"}>
                        <p className={"text-gray-500 text-lg text-center"}>
                            {active_tab === "recent" ? "No recent cards collected yet." : "No saved cards yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
