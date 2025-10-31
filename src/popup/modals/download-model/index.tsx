import React from 'react';
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import Button from "../../../components/Button.tsx";
import {DownloadIcon} from "../../../constants/icons.tsx";
import ProgressLoader from "../../../components/ProgressLoader.tsx";

interface DownloadModelModalProps {
    title: string;
    details: string[];
    downloadFunc: (progressCallback: (progress: number) => void) => Promise<boolean>;
}

export default function DownloadModelModal({title,details,downloadFunc} : DownloadModelModalProps) {
    const [success, setSuccess] = React.useState<null | boolean>(null)

    const [progress, setProgress] = React.useState<number | null>(null)

    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }}
            className={"w-80 flex flex-col items-center p-2 gap-4"}>
            <p className={"text-center font-semibold text-lg"}>{title}</p>
            <div className={"w-full flex flex-col justify-center items-center gap-2"}>
                {details.map((detail, index) => (
                    <p key={index} className={"text-center text-sm mb-4"}>{detail}</p>
                ))}

            </div>
            {progress === null ? (
                <Button
                    onClick={async () => {
                        setProgress(0);
                        await downloadFunc((prog) => {
                            setProgress(prog);
                        }).then(res => {
                            setSuccess(res);
                        });
                        setProgress(1);
                    }}
                    label={"Download"}
                    icon={DownloadIcon}
                    variant={"solid"}
                    />
            ) : success === null ? (
                <div className={"w-full flex flex-col items-center mb-2 p-2 px-4"}>
                    <ProgressLoader progress={progress}/>
                    <p className={"text-sm"}>{progress < 1 ? `Downloading... ${Math.floor(progress * 100)}%` : "Download complete!"}</p>
                </div>
            ): (
                <p className={"text-center font-semibold text-lg " + (success ? "text-green-600" : "text-red-600")}>
                    {success ? "Download Successful!" : "Download Failed."}
                </p>
            )}
        </div>
    )
 }
