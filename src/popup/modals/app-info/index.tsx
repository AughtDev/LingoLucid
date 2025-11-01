import React from 'react';
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";


function Snippet({text, title}: { text: string, title?: string }) {
    return (
        <div className={"flex flex-col gap-1 justify-center items-center"}>
            {title ? <h2 className={"text-lg font-semibold text-gray-900 text-center"}>{title}</h2> : null}
            <p className={"text-md text-gray-800 text-center"}> {text} </p>
        </div>
    )
}

export default function AppInfoModal() {
    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }} className={"w-11/12 overflow-auto h-9/12 px-4 py-6"}>
            <div className={"flex flex-col items-center justify-center gap-4"}>
                <Snippet
                    text={`
                LingoLucid turns your everyday web browsing into a seamless, adaptive language-learning experience. Instead of spending time in dedicated apps, we let you learn passively while you read. We use on-device AI from Chrome to intelligently manipulate web content, adjusting the text difficulty to match your current proficiency level. The goal is simple: ensure everything you read is challenging, but never overwhelming.
                `}/>
                <Snippet
                    text={`
                When you click "Begin," LingoLucid uses the Chrome Translator API to convert the entire article into your target language. For our most advanced feature, the Rewriter API, we currently offer full text simplification only for Spanish. The Rewriter analyzes the translated text and rewrites it to match your specific CEFR level (e.g., B1). This is the core of the adaptive process, forcing you to engage with material that is perfectly tailored to accelerate your growth.
                `}/>
                <Snippet
                    text={`
                While the simplification feature is Spanish-only for now (due to current API constraints), LingoLucid's core learning engine and translation tools work for all five languages. The extension always tracks every word you look up and translate, saving them as flashcards for later review. Most importantly, your proficiency score is continuously updated based on your reading behavior. As you improve, LingoLucid automatically recognizes your progress and prepares you for higher-level native content.
                `}/>
                <Snippet
                    text={`
                Currently, LingoLucid supports Spanish, French, German, Italian, and Portuguese. The best websites for learning are those rich in text with <article> tags, such as news sites, blogs, and educational resources. Avoid pages that are primarily video-based or heavily reliant on dynamic content, as these may not provide the optimal reading experience for language learning.
                `}/>
                <Snippet
                    text={`
                Created by AughtDev. 2025.
                `}/>
            </div>
        </div>
    )
}
