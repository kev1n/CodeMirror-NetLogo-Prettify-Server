/** EditorLanguage: Language. */
export var EditorLanguage;
(function (EditorLanguage) {
    EditorLanguage[EditorLanguage["NetLogo"] = 0] = "NetLogo";
    EditorLanguage[EditorLanguage["Javascript"] = 1] = "Javascript";
    EditorLanguage[EditorLanguage["HTML"] = 2] = "HTML";
    EditorLanguage[EditorLanguage["CSS"] = 3] = "CSS";
})(EditorLanguage || (EditorLanguage = {}));
/** ParseMode: The parsing mode. */
export var ParseMode;
(function (ParseMode) {
    /** Normal: Normal mode (Regular editor tab), where the code is supposed to be an entire model. */
    ParseMode["Normal"] = "Normal";
    /** Oneline: Oneline mode (Command center), where the code is supposed to be a single line of command or reporter statement. */
    ParseMode["Oneline"] = "Oneline";
    /** Embedded: Embedded command mode (Button/Plot commands), where the code is supposed to be multiple lines of command statements. */
    ParseMode["Embedded"] = "Embedded";
    /** Reporter: Embedded reporter mode (Widget input), where the code is supposed to be multiple lines of reporter statment. */
    ParseMode["Reporter"] = "Reporter";
    /** Generative: Generative mode (ChatLogo), a special Normal mode that does not provide context to its parent but instead take it back. */
    ParseMode["Generative"] = "Generative";
})(ParseMode || (ParseMode = {}));
/** Export classes globally. */
try {
    window.EditorLanguage = EditorLanguage;
}
catch (error) { }
