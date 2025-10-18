import React from 'react';
import {Card, LanguageCards} from "../../../types/types.ts";
import useAppContext from "../../context.tsx";
import CardReviewModal from "../../modals/card-review";

interface CardsViewProps {
    lang_slug: string
    cards: LanguageCards
}

interface TabSelectorProps {
    active_tab: "saved" | "recent"
    setTab: (tab: "saved" | "recent") => void
}

function TabSelector({active_tab, setTab}: TabSelectorProps) {
    const [recent_tw, saved_tw] = React.useMemo(() => {
        return [
            active_tab === "recent" ? "underline" : "none",
            active_tab === "saved" ? "underline" : "none"
        ]
    }, [active_tab]);

    return (
        <div className={"w-full h-12 flex flex-row items-center justify-center gap-16"}>
            <p
                className={recent_tw}
                onClick={() => setTab("recent")}> RECENT </p>
            <p
                className={saved_tw}
                onClick={() => setTab("saved")}> SAVED </p>
        </div>
    )
}

interface CardActionsProps {
    actions: { label: string, icon: React.ReactNode, onClick: () => void }[]
}

function CardActions({actions}: CardActionsProps) {
    return (
        <div className={"w-full h-8 flex flex-row items-center justify-center gap-4"}>
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={action.onClick}
                    className={"flex flex-row items-center justify-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-200"}>
                    {action.icon}
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    )
}

interface CardPaneProps {
    card: Card
}

function CardPane({card}: CardPaneProps) {
    return (
        <div className={"w-full h-32 border-b flex flex-col justify-center px-4"}>
            <p className={"text-lg font-semibold"}>{card.text}</p>
            <hr/>
            <p className={"text-md text-gray-600"}>{card.translation}</p>
        </div>
    )
}

export default function CardsView({lang_slug, cards}: CardsViewProps) {
    const {modal: {openModal}} = useAppContext()

    const [active_tab, setActiveTab] = React.useState<"saved" | "recent">("recent")

    const reviewCards = React.useCallback(() => {
        openModal(
            <CardReviewModal
                lang_slug={lang_slug}
                cards={active_tab === "recent" ? cards.recent : cards.saved}
                limit={10}/>
        )
    }, [openModal, lang_slug, active_tab, cards.recent, cards.saved]);

    return (
        <div className={"w-full h-full flex flex-col items-center"}>
            <TabSelector active_tab={active_tab} setTab={setActiveTab}/>
            <CardActions
                actions={[
                    {
                        label: "Add", icon: "+", onClick: () => {
                        }
                    },
                    {label: "Review", icon: "✓", onClick: reviewCards},
                    {
                        label: "Shuffle", icon: "r", onClick: () => {
                        }
                    },
                ]}/>
            <div
                style={{
                    height: "calc(590px - 96px)"
                }}
                className={"w-full overflow-y-auto"}>
                {(
                    active_tab === "recent" ? cards.recent : cards.saved
                ).map(card => <CardPane card={card}/>)}
            </div>
        </div>
    )
}
