import React from 'react';
import {downloadTranslationModel, translatorIsAvailable} from "../../../ai/translation.ts";
import DownloadModelModal from "../../modals/download-model";
import useAppContext from "../../context.tsx";
import {Language} from "../../../types/core.ts";
import {LangPageStatus} from "./index.tsx";

export default function useTranslationModelsDownloader(lang: Language | undefined, setPageStatus: (status: LangPageStatus) => void): [boolean, boolean] {
    const {modal: {openModal, closeModal}} = useAppContext()

    const [translator_availability, setTranslatorAvailability] = React.useState<[boolean, boolean]>([false, false]);
    React.useEffect(() => {
        if (!lang) return;
        const code = lang.code;
        if (!translator_availability[0]) {
            // check if the models are downloaded. if not, download both
            translatorIsAvailable("en", code).then(async (is_available) => {
                if (!is_available) {
                    openModal(
                        <DownloadModelModal
                            title={`Download English To ${lang?.label ?? code} Model`}
                            details={[
                                `To translate pages to ${lang?.label ?? code}, the translation model needs to be downloaded first.`,
                                `The model will be stored locally on your device and will be used to translate pages offline.`,
                                `This may take a few minutes depending on your internet connection.`
                            ]}
                            downloadFunc={async (setProgress) => {
                                return await downloadTranslationModel("en", code, setProgress).then(res => {
                                    if (res) {
                                        closeModal()
                                        setTranslatorAvailability((prev) => [true, prev[1]]);
                                    } else {
                                        console.error("Failed to download translation model for", code);
                                        setPageStatus(LangPageStatus.DownloadError);
                                    }
                                    return res
                                });
                            }}/>
                    )
                } else {
                    console.log("Translation model already available for", code);
                    setTranslatorAvailability((prev) => [true, prev[1]]);
                }
            })
        } else if (!translator_availability[1]) {
            translatorIsAvailable(code, "en").then(async (is_available) => {
                console.log("Reverse translation model availability for", code, "is", is_available);
                if (!is_available) {
                    openModal(
                        <DownloadModelModal
                            title={`Download ${lang?.label ?? code} To English Model`}
                            details={[
                                `To simplify translated text back to English, the translation model needs to be downloaded first.`,
                                `The model will be stored locally on your device and will be used to translate pages offline.`,
                                `This may take a few minutes depending on your internet connection.`
                            ]}
                            downloadFunc={async (setProgress) => {
                                return await downloadTranslationModel(code, "en", setProgress).then(res => {
                                    if (res) {
                                        closeModal()
                                        setTranslatorAvailability((prev) => [prev[0], true]);
                                    } else {
                                        console.error("Failed to download reverse translation model for", code);
                                        setPageStatus(LangPageStatus.DownloadError);
                                    }
                                    return res
                                });
                            }}/>
                    )
                } else {
                    console.log("Translation model already available for", code);
                    setTranslatorAvailability((prev) => [prev[0], true]);
                }
            })
        }
    }, [translator_availability,lang]);

    return translator_availability
}
