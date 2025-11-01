<div align="center">

## **GOOGLE CHROME BUILT-IN AI JUDGES: PLEASE READ FIRST**

### How to Install & Test (v1.0)

This extension is unfortunately **not yet** on the Chrome Web Store. Please use the following steps to install the app for review:

1.  **Download:** Go to the **[Latest Release Page](https://github.com/AughtDev/LingoLucid/releases/latest)** and
    download the `LingoLucid-v1.0.zip` file.
2.  **Unzip:** Unzip the downloaded file. You will have a folder named `dist`.
3.  **Open Chrome:** Navigate to `chrome://extensions` in your browser.
4.  **Enable Developer Mode:** Ensure the **"Developer mode"** toggle in the top-right corner is **ON**.
5.  **Load the Extension:** Click the **"Load unpacked"** button.
6.  **Select Folder:** In the file-picker, select the unzipped `dist` folder.

The LingoLucid icon will appear in your extension bar, and it is now active. Please visit a Substack article to begin testing.

To build the extension from source, please refer to the "Getting Started (For Developers)" at the bottom.

</div>

---

<div align="center">
<p align="center">
 <img src="public/icons/icon128.png"/>
 </p>

# 🌐LingoLucid

*Learn a language passively by browsing the web.*

</div>




LingoLucid is an open-source Chrome extension that transforms your regular browsing into a passive language-learning experience. It assumes you are an English speaker and supports learning French, German, Spanish, Italian, and Portuguese.

It works by translating the text on your favorite blogs and websites (optimized for **Substack** at the moment) into 
your target language and then simplifying it to your exact proficiency level (this is exclusive to Spanish for now due to API constraints). As you read, study, and improve, the extension automatically increases the difficulty, forcing you to learn more complex vocabulary and grammar to keep up.

![Screenshot 2025-10-30 150323.png](./media/screenshots/Screenshot%202025-10-30%20150323.png)

## ✨Key Features

- Adaptive Translation: Automatically translates text within ```<article>``` tags into your target language.

- AI-Powered Simplification (Spanish-Only): Uses the Chrome Rewriter API to simplify the translated text to your selected CEFR proficiency level (A1 to C2).

- In-Line Learning:

- Hover over any word for quick options.

| ![](./media/screenshots/Screenshot%202025-10-30%20150706.png) | ![](./media/screenshots/Screenshot%202025-10-30%20150755.png) |
|---------------------------------------------------------------|---------------------------------------------------------------|

- Simplify: Simplify the word further in the target language.

- Translate: Get an instant English translation in a pop-up.

- Select longer phrases to get the same translation pop-up.

![](./media/screenshots/Screenshot%202025-10-30%20150844.png)

- Flashcard System: Save any word or phrase translation as a "card" with a single click. Saved words are underlined on the page to track what you've learned.

| ![](./media/screenshots/Screenshot%202025-10-30%20150426.png) | ![](./media/screenshots/Screenshot%202025-10-30%20151810.png) |
| ------------------------------------------------------------- | ------------------------------------------------------------- |

- Spaced Repetition:

- Review your saved cards with an Anki-style spaced repetition algorithm.

- Rate cards as "Easy," "Medium," "Hard," or "Failed" to manage your learning queue.

- A badge on the "Review" button shows how many cards are due.

- Automatic Proficiency Tracking: This is the core feature. You don't need to manually update your level. The extension automatically adjusts your proficiency score based on your reading and translation habits.

## 🧠How It Works: The Passive Learning Engine

LingoLucid's goal is to make learning invisible. This is achieved through a continuous feedback loop.

1. Translate & Simplify: When you open an article, the text is first translated and then "rewritten" (simplified) to match your proficiency level.

2. Track Engagement: As you read, the extension tracks:
- Successful Reading: How long you spend engaged with text blocks without translating.

- Struggles: Every time you translate a word or phrase.
4. Calculate Difficulty: The difficulty of every word and text snippet is determined using language-specific word frequency maps.
- A1/A2 (Common Words): Not knowing these is penalized more heavily.

- C1/C2 (Rare Words): Reading these successfully gives a larger proficiency boost, while translating them is penalized less.
5. Update Proficiency: Every interaction generates a small "delta" (a positive or negative number). This delta, weighted by your chosen "pace," is applied to your proficiency score.

6. Adapt: As your proficiency score slowly climbs from level to level towards C2, the AI simplifies the text less and less, gently increasing the difficulty and forcing you to improve.

## 🖥️The Extension Popup

| ![](./media/screenshots/Screenshot%202025-10-30%20151311.png) | ![](./media/screenshots/Screenshot%202025-10-30%20151247.png) |
| ------------------------------------------------------------- | ------------------------------------------------------------- |

- Home: A central hub with flags for each language. It shows your progress on started languages or a "play" button to begin a new one.

- Language Dashboard: The main screen for an active language.

- Header: Shows your current estimated CEFR level (which updates automatically), a "Home" button, and a "Settings" button.

- Settings: Allows you to manually change your proficiency or pace if the algorithm feels too fast/slow. You can also wipe your data here.

- Main View: Starts with a "Begin" button to translate the page. After translation, it's replaced by your flashcard library.

- Card Library:

- Recent Tab: Shows all your recent translations, which you can save or delete.

- Saved Tab: Your main flashcard deck. You can shuffle, delete, or click the "Review" button to start a study session.

## 🛠️Getting Started (For Developers)

This is a standard Chrome extension built with TypeScript and Vite.

### Prerequisites

- Node.js (v18 or later)

- NPM or Yarn

### 1. Install Dependencies

npm install  

### 2. Build the Extension

This command builds the extension, watches for file changes, and puts the development build in the dist/ folder.

npm run build  

### 3. Load in Chrome

1. Open Chrome and navigate to chrome://extensions.

2. Enable "Developer mode" in the top-right corner.

3. Click "Load unpacked".

4. Select the dist folder generated by the build command.

5. The LingoLucid icon will appear in your extension bar.

## Future Roadmap

This is an open-source project, and contributions are welcome! The current version is a proof-of-concept, with plans to:

- [ ] Support Dynamic Sites: Add explicit support for sites with dynamic text (like Twitter/X, Reddit) which will require a rolling, mutation-based translation function.

- [ ] Add More Languages: Expand to non-Latin alphabets (e.g., Japanese, Chinese) and right-to-left languages.

- [ ] Support Other Base Languages: Allow users to learn from a base language other than English.

## Contributing

Feel free to open an issue to report a bug, suggest a feature, or make a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
