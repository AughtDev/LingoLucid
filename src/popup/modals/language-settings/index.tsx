import React from 'react';
import {Language, LanguageSettings} from "../../../types/types.ts";
import {Slider} from "../../../components/Slider.tsx";
import {BACKGROUND_COLOR, PRIMARY_COLOR} from "../../../constants/styling.ts";
import {saveLanguageSettingsService} from "../../../utils/data/services.ts";
import {CloseIcon} from "../../../constants/icons.tsx";
import useAppContext from "../../context.tsx";

interface LanguageSettingsModalProps {
    language: Language
}

export default function LanguageSettingsModal({language}: LanguageSettingsModalProps) {
    const {modal: {closeModal}} = useAppContext()

    const [mastery, setMastery] = React.useState<number>(language.settings.skill_level)
    const [pace, setPace] = React.useState<LanguageSettings["learning_pace"]>(language.settings.learning_pace)

    const saveSettings = React.useCallback(() => {
        saveLanguageSettingsService(language.slug, {
            skill_level: mastery,
            learning_pace: pace,
        }).finally( closeModal )
    }, [language.slug, mastery, pace, closeModal]);


    const mastery_options = React.useMemo(() => {
        return Array.from({length: 10}, (_, i) => ({label: `${i + 1}`, value: i + 1}));
    }, []);

    const pace_options: { label: string, value: LanguageSettings["learning_pace"] }[] = React.useMemo(() => {
        return [
            {label: "Slow", value: "slow"},
            {label: "Medium", value: "medium"},
            {label: "Fast", value: "fast"},
        ];
    }, []);

    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }}
            className={"w-80 flex flex-col items-center p-4"}>
            <div className={"absolute top-0 right-0 m-4"}>
                <button
                    className={"text-sm text-gray-500 hover:text-gray-700"}
                    onClick={closeModal}>
                    <CloseIcon size={16}/>
                </button>
            </div>
            <h1 className={"font-semibold text-lg mb-4"}>{language.label} Language Settings</h1>
            <div className={"flex-1 w-full flex flex-col items-center justify-center gap-4"}>
                <div className={"w-65 mb-4 flex flex-col items-start justify-center"}>
                    <p className={"text-md"}>Baseline Mastery</p>
                    <Slider val={mastery}
                            setVal={setMastery} options={mastery_options}
                            visible_options={mastery_options.map((_, i) => i)}/>
                </div>
                <div className={"w-65 mb-4 flex flex-col items-start justify-center"}>
                    <p className={"text-md"}>Learning Pace</p>
                    <Slider val={pace}
                            setVal={setPace}
                            options={pace_options}
                            visible_options={[
                                0, 1, 2
                            ]}/>
                </div>
            </div>
            <div className={"w-full flex flex-row justify-end items-center"}>
                <button
                    style={{
                        backgroundColor: PRIMARY_COLOR
                    }}
                    onClick={saveSettings}
                    className={"mt-4 px-2 py-1 text-white rounded-lg hover:brightness-50"}>
                    <div className={"flex flex-row justify-center items-center"}>
                        Save
                        {/*<SaveIcon size={20} color={"white"}/>*/}
                    </div>
                </button>
            </div>
        </div>
    )
}
