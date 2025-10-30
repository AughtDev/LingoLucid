import React from 'react';
import {Language, LanguageSettings, PROFICIENCY_LEVELS, ProficiencyLevel} from "../../../types/core.ts";
import {Slider} from "../../../components/Slider.tsx";
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import {clearLanguageDataService, saveLanguageSettingsService} from "../../../utils/data/services.ts";
import {SaveIcon} from "../../../constants/icons.tsx";
import useAppContext from "../../context.tsx";
import Button from "../../../components/Button.tsx";

interface LanguageSettingsModalProps {
    language: Language
}

export default function LanguageSettingsModal({language}: LanguageSettingsModalProps) {
    const {modal: {closeModal}} = useAppContext()

    const og_proficiency_level = PROFICIENCY_LEVELS[Math.floor(language.progress.mastery)];
    const [proficiency, setProficiency] = React.useState<ProficiencyLevel>(og_proficiency_level)

    const [pace, setPace] = React.useState<LanguageSettings["learning_pace"]>(language.settings.learning_pace)

    const saveSettings = React.useCallback(() => {
        saveLanguageSettingsService(language.code, {
            // do not change the mastery if the proficiency level is unchanged
            skill_level:  proficiency === og_proficiency_level ? undefined : proficiency,
            learning_pace: pace,
        }).finally(closeModal)
    }, [language.code, proficiency, pace, closeModal]);

    const wipeLanguageData = React.useCallback(async () => {
        await clearLanguageDataService(language.code)
    }, [language.code]);


    const mastery_options: { label: string, value: ProficiencyLevel }[] = React.useMemo(() => {
        return [
            {label: "A1", value: "a1"},
            {label: "A2", value: "a2"},
            {label: "B1", value: "b1"},
            {label: "B2", value: "b2"},
            {label: "C1", value: "c1"},
            {label: "C2", value: "c2"},
        ]
    }, []);

    const pace_options: { label: string, value: LanguageSettings["learning_pace"] }[] = React.useMemo(() => {
        return [
            {label: "Slow", value: "slow"},
            {label: "Moderate", value: "medium"},
            {label: "Fast", value: "fast"},
        ];
    }, []);

    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }}
            className={"w-80 flex flex-col items-center p-2"}>
            <div className={"w-full flex flex-row justify-between items-start mb-4"}>
                <h1 className={"font-semibold text-lg ml-2"}>{language.label} Language Settings</h1>
                <Button icon={SaveIcon} size={24} variant={"icon"} onClick={saveSettings}/>
            </div>
            <div className={"flex-1 w-full flex flex-col items-center justify-center gap-4 px-2 pt-1"}>
                <div className={"w-65 mb-4 flex flex-col items-start justify-center"}>
                    <p className={"text-md"}>Proficiency Level</p>
                    <Slider val={proficiency}
                            setVal={setProficiency} options={mastery_options}
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
            <div className={"w-full pb-2 pt-1 flex flex-row justify-center items-center"}>
                <Button
                    variant={"solid"}
                    onClick={wipeLanguageData}
                    size={16}
                    confirmation_prompt={
                        "Are you sure you want to wipe all data for " + language.label + "? All your progress will be lost forever."
                    }
                    label={`Wipe ${language.label} Data`}
                    class_name={"mt-4 px-2 py-1 text-white rounded-lg bg-red-900 hover:bg-red-600"}>
                </Button>
            </div>
        </div>
    )
}
