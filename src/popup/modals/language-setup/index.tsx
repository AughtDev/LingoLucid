import React from 'react';
import {Slider} from "../../../components/Slider.tsx";
import {LanguageSettings} from "../../../types/types.ts";
import {BACKGROUND_COLOR, PRIMARY_COLOR} from "../../../constants/styling.ts";
import {saveLanguageSettingsService} from "../../../utils/data/services.ts";
import {CloseIcon} from "../../../constants/icons.tsx";
import useAppContext from "../../context.tsx";

interface LanguageSetupModalProps {
    slug: string
    proceed: () => void
}

export default function LanguageSetupModal({slug, proceed}: LanguageSetupModalProps) {
    const {modal: {closeModal}} = useAppContext()

    const [mastery, setMastery] = React.useState<number>(1)
    const [pace, setPace] = React.useState<LanguageSettings["learning_pace"]>("medium")

    const lang_label = React.useMemo(() => {
        return slug.charAt(0).toUpperCase() + slug.slice(1);
    }, [slug]);

    const onProceed = React.useCallback(() => {
        saveLanguageSettingsService(slug, {
            skill_level: mastery,
            learning_pace: pace,
        }).then(() => {
            proceed()
        })
    }, [slug, mastery, pace, proceed]);

    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }}
            className={"w-80 h-72 flex flex-col items-center p-4"}>
            <div className={"absolute top-0 right-0 m-4"}>
                <button
                    className={"text-sm text-gray-500 hover:text-gray-700"}
                    onClick={closeModal}>
                    <CloseIcon size={16}/>
                </button>
            </div>
            <h1>Set up Language</h1>
            <div className={"flex-1 w-full flex flex-col items-center justify-center gap-4"}>
                <div className={"w-70 mb-4 flex flex-col items-center justify-center"}>
                    <p>What is your level of mastery in {lang_label}?</p>
                    <Slider val={mastery} setVal={setMastery} options={
                        Array.from({length: 10}, (_, i) => ({label: `${i + 1}`, value: i + 1}))
                    } visible_options={
                        Array.from({length: 10}, (_, i) => i).filter(idx => idx % 1 === 0)
                    }/>
                </div>
                <div className={"w-70 mb-4 flex flex-col items-center justify-center"}>
                    <p>At what pace would you like to learn {lang_label}?</p>
                    <Slider val={pace} setVal={setPace} options={[
                        {label: "Slow", value: "slow"},
                        {label: "Medium", value: "medium"},
                        {label: "Fast", value: "fast"},
                    ]} visible_options={[
                        0, 1, 2
                    ]}/>
                </div>
            </div>
            <div className={"w-full flex flex-row justify-end items-center"}>
                <button
                    style={{
                        backgroundColor: PRIMARY_COLOR
                    }}
                    onClick={onProceed}
                    className={"mt-4 px-2 py-1 text-white rounded-lg hover:brightness-50"}>
                    Proceed
                </button>
            </div>
        </div>
    )
}
