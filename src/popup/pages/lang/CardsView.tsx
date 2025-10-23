import React from 'react';
import {Card, LanguageCards} from "../../../types/core.ts";
import useAppContext from "../../context.tsx";
import CardReviewModal from "../../modals/card-review";
import {PRIMARY_COLOR} from "../../../constants/styling.ts";
import {BookIcon, DeleteIcon, SaveIcon} from "../../../constants/icons.tsx";
import {deleteLanguageCardService, saveLanguageCardService} from "../../../utils/data/services.ts";
import ConfirmationModal from "../../modals/confirmation";

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
        <div className={"w-full h-8 flex flex-row items-center justify-center gap-4"}>
            <p
                style={{
                    ...(active_tab === "recent" ? active_styling : inactive_styling),
                    cursor: "pointer"
                }}
                onClick={() => setTab("recent")}> RECENT </p>
            <p
                style={{
                    ...(active_tab === "saved" ? active_styling : inactive_styling),
                    cursor: "pointer"
                }}
                onClick={() => setTab("saved")}> SAVED </p>
        </div>
    )
}

interface CardActionsProps {
    actions: { label: string, icon: React.ReactNode, onClick: () => void }[]
}

function CardActions({actions}: CardActionsProps) {
    return (
        <div className={"w-full h-6 flex flex-row items-center justify-center gap-4"}>
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    style={{cursor: "pointer"}}
                    title={action.label}
                    onClick={action.onClick}>
                    {action.icon}
                </button>
            ))}
        </div>
    )
}

interface CardPaneProps {
    code: string
    card: Card
    type: keyof LanguageCards
}

function CardPane({code, card, type}: CardPaneProps) {
    const [is_hovered, setIsHovered] = React.useState<boolean>(false)
    const card_ref = React.useRef<HTMLDivElement | null>(null);

    const {modal: {openModal}} = useAppContext()

    const deleteCard = React.useCallback(async () => {
        openModal(
            <ConfirmationModal
                prompt={"Are you sure you want to delete this card? This action is permanent"}
                onAccept={async () => {
                    await deleteLanguageCardService(code, card.text, type).then(() => {
                        console.log("Card deleted successfully");
                    }).catch((error) => {
                        console.error("Error deleting card:", error);
                    });
                }}
                onReject={() => {
                    console.log("Card deletion cancelled");
                }}/>
        )

        // return await deleteLanguageCardService(code, card.text,type)
    }, [code, card.text, type, openModal]);

    const saveCard = React.useCallback(() => {
        saveLanguageCardService(
            code, {
                text: card.text,
                translation: card.translation,
                reviews: []
            }, "saved"
        ).then(() => {
            console.log("Card saved successfully");
        }).catch((error) => {
            console.error("Error saving card:", error);
        })
    }, [code, card.text, card.translation]);

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
            {/* delete button */}
            <div className={"absolute top-0 right-0 flex flex-row gap-2 justify-center items-center m-2"}>
                {is_hovered && (
                    <button
                        onClick={deleteCard}>
                        <div className={"flex flex-row gap-2"}>
                            <DeleteIcon size={24}/>
                        </div>
                    </button>
                )}

                {is_hovered && type === "recent" && (
                    <button
                        onClick={saveCard}>
                        <div className={"flex flex-row gap-2"}>
                            <SaveIcon size={24}/>
                        </div>
                    </button>
                )}
            </div>
            <p className={"text-md font-semibold p-1 text-center"}>{card.text}</p>
            <hr style={{width: "70%", opacity: 0.1}}/>
            <p className={"text-md text-gray-600 p-1 text-center"}>{card.translation}</p>
        </div>
    )
}

export default function CardsView({lang_code, cards}: CardsViewProps) {
    const {modal: {openModal}} = useAppContext()

    const [active_tab, setActiveTab] = React.useState<"saved" | "recent">("recent")

    const reviewCards = React.useCallback(() => {
        openModal(
            <CardReviewModal
                lang_code={lang_code}
                cards={active_tab === "recent" ? cards.recent : cards.saved}
                limit={10}/>
        )
    }, [openModal, lang_code, active_tab, cards.recent, cards.saved]);

    const active_cards = React.useMemo(() => {
        return active_tab === "recent" ? cards.recent : cards.saved
    }, [active_tab, cards.recent, cards.saved]);

    return (
        <div className={"w-full h-full flex flex-col items-center"}>
            <TabSelector active_tab={active_tab} setTab={setActiveTab}/>
            {active_cards.length > 0 ? (
                <CardActions
                    actions={[
                        {
                            label: "Review",
                            icon: <BookIcon size={20}/>,
                            onClick: reviewCards
                        },
                        // {
                        //     label: "Shuffle", icon: "r", onClick: () => {
                        //     }
                        // },
                    ]}/>
            ) : null}
            <div
                style={{
                    height: "calc(590px - 108px)"
                }}
                className={"w-full flex flex-col items-center overflow-y-auto"}>
                {active_cards.length > 0 ? active_cards.map(card => (
                    <CardPane
                        key={card.text}
                        card={card}
                        code={lang_code}
                        type={active_tab === "recent" ? "recent" : "saved"}
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
