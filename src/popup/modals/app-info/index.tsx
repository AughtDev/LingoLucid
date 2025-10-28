import React from 'react';


function Snippet({text}: { text: string }) {
    return <p className={"text-md text-gray-800 text-center"}> {text} </p>
}

export default function AppInfoModal() {
    return (
        <div className={"w-full h-full flex flex-col items-center justify-center p-4 gap-2"}>
            <Snippet text={"LingoLucid is a browser extension designed to help users learn new languages while browsing the web. It provides vocabulary practice and language learning tools integrated directly into your browsing experience."}/>
        </div>
    )
}
