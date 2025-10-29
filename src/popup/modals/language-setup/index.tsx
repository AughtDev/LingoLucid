import React from 'react';
import {Slider} from "../../../components/Slider.tsx";
import {Language, LanguageSettings, ProficiencyLevel} from "../../../types/core.ts";
import {BACKGROUND_COLOR, PRIMARY_COLOR} from "../../../constants/styling.ts";
import {saveLanguageSettingsService} from "../../../utils/data/services.ts";
import useAppContext from "../../context.tsx";
import {downloadTranslationModel} from "../../../ai/translation.ts";

interface LanguageSetupModalProps {
    language: Language
}

export default function LanguageSetupModal({language}: LanguageSetupModalProps) {
    const {modal: {closeModal}, nav: {goToPage}} = useAppContext()

    const [downloading_to_model_progress, setDownloadingToModelProgress] = React.useState<number | null>(null)
    const [downloading_from_modal_progress, setDownloadingFromModalProgress] = React.useState<number | null>(null)

    const [proficiency, setProficiency] = React.useState<ProficiencyLevel>("a1")
    const [pace, setPace] = React.useState<LanguageSettings["learning_pace"]>("medium")


    const onProceed = React.useCallback(() => {
        saveLanguageSettingsService(language.code, {
            skill_level: proficiency,
            learning_pace: pace,
        }).then(() => {
            downloadTranslationModel(language.code, (to_progress) => {
                setDownloadingToModelProgress(to_progress);
            }, (from_progress) => {
                setDownloadingFromModalProgress(from_progress);
            }).then(() => {
                setDownloadingToModelProgress(null);
            }).then(() => {
                goToPage(`lang/${language.code}`);
                closeModal();
            })
        })
    }, [proficiency, pace, language.code, closeModal, goToPage, setDownloadingToModelProgress, setDownloadingFromModalProgress]);

    const proficiency_levels: { label: string, value: ProficiencyLevel }[] = React.useMemo(() => {
        return [
            {label: "A1", value: "a1"},
            {label: "A2", value: "a2"},
            {label: "B1", value: "b1"},
            {label: "B2", value: "b2"},
            {label: "C1", value: "c1"},
            {label: "C2", value: "c2"},
        ]
    }, []);

    const model_download_progress = React.useMemo(() => {
        if (downloading_from_modal_progress === null && downloading_to_model_progress === null) {
            return null;
        }
        const to_progress = downloading_to_model_progress ?? 0;
        const from_progress = downloading_from_modal_progress ?? 0;
        return (to_progress + from_progress) / 2;
    }, [downloading_from_modal_progress, downloading_to_model_progress]);

    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }}
            className={"w-80 flex flex-col items-center p-4"}>
            <h1 className={"font-semibold text-lg mb-4"}>Set up {language.label}</h1>
            {model_download_progress === null ? (
                <>
                    <div className={"flex-1 w-full flex flex-col items-center justify-center gap-4"}>
                        <div className={"w-65 mb-4 flex flex-col items-center justify-center"}>
                            <p className={"text-md"}>What is your level of mastery in {language.label}?</p>
                            <Slider val={proficiency} setVal={setProficiency} options={
                                proficiency_levels
                            } visible_options={
                                [0, 1, 2, 3, 4, 5]
                            }/>
                        </div>
                        <div className={"w-65 mb-4 flex flex-col items-center justify-center"}>
                            <p>At what pace would you like to learn {language.label}?</p>
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
                </>
            ) : (
                // a loader displaying progress in the center of the screen
                <div className={"flex flex-col items-center justify-center h-32"}>
                    <p className={"text-md"}>Downloading {language.label} Translation Model...</p>
                    <div className={"w-64 h-4 bg-gray-300 rounded-full mt-4"}>
                        <div
                            className={"h-4 bg-green-500 rounded-full"}
                            style={{width: `${model_download_progress * 100}%`}}></div>
                    </div>
                    <p className={"text-sm mt-2"}>{Math.round(model_download_progress * 100)}%</p>
                </div>
            )}
        </div>
    )
}
