import React from 'react';
import {Slider} from "../../../components/Slider.tsx";
import {Language, LanguageSettings} from "../../../types/core.ts";
import {BACKGROUND_COLOR, PRIMARY_COLOR} from "../../../constants/styling.ts";
import {saveLanguageSettingsService} from "../../../utils/data/services.ts";
import {CloseIcon} from "../../../constants/icons.tsx";
import useAppContext from "../../context.tsx";
import {downloadTranslationModel} from "../../../ai/translation.ts";

interface LanguageSetupModalProps {
    language: Language
}

export default function LanguageSetupModal({language}: LanguageSetupModalProps) {
    const {modal: {closeModal}, nav: {goToPage}} = useAppContext()

    const [downloading_model_progress, setDownloadingModelProgress] = React.useState<number | null>(null)

    const [mastery, setMastery] = React.useState<number>(1)
    const [pace, setPace] = React.useState<LanguageSettings["learning_pace"]>("medium")


    const onProceed = React.useCallback(() => {
        saveLanguageSettingsService(language.code, {
            skill_level: mastery,
            learning_pace: pace,
        }).then(() => {
            downloadTranslationModel(language.code, (progress) => {
                setDownloadingModelProgress(progress);
            }).then(() => {
                setDownloadingModelProgress(null);
            }).then(() => {
                goToPage(`lang/${language.code}`);
                closeModal();
            })
        })
    }, [mastery, pace, language.code, closeModal, goToPage, setDownloadingModelProgress]);

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
            <h1 className={"font-semibold text-lg mb-4"}>Set up {language.label}</h1>
            {downloading_model_progress === null ? (
                <>
                    <div className={"flex-1 w-full flex flex-col items-center justify-center gap-4"}>
                        <div className={"w-65 mb-4 flex flex-col items-center justify-center"}>
                            <p className={"text-md"}>What is your level of mastery in {language.label}?</p>
                            <Slider val={mastery} setVal={setMastery} options={
                                Array.from({length: 10}, (_, i) => ({label: `${i + 1}`, value: i + 1}))
                            } visible_options={
                                Array.from({length: 10}, (_, i) => i).filter(idx => idx % 1 === 0)
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
                            style={{width: `${downloading_model_progress * 100}%`}}></div>
                    </div>
                    <p className={"text-sm mt-2"}>{Math.round(downloading_model_progress * 100)}%</p>
                </div>
            )}
        </div>
    )
}
