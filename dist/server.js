import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { JSDOM } from 'jsdom';
import { EditorLanguage, ParseMode } from './editor-config';
import { GalapagosEditor } from './editor';
import { Dictionary } from './i18n/dictionary';
// Create a virtual DOM environment
const dom = new JSDOM(`<!DOCTYPE html><div id="editor"></div>`);
global.document = dom.window.document;
global.window = dom.window;
const app = express();
const port = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());
// Initialize the dictionary (required for NetLogo support)
Dictionary.Initialize({});
// Create a GalapagosEditor instance for formatting
const editor = new GalapagosEditor(document.getElementById('editor'), {
    Language: EditorLanguage.NetLogo,
    ParseMode: ParseMode.Normal,
    ReadOnly: true,
});
// POST endpoint for prettifying NetLogo code
app.post('/prettify', (req, res) => {
    try {
        const { code } = req.body;
        if (!code || typeof code !== 'string') {
            res
                .status(400)
                .json({ error: 'Please provide NetLogo code as a string in the request body under the "code" key' });
            return;
        }
        // Set the code in the editor
        editor.SetCode(code);
        // Use the prettifyAll function
        editor.Semantics.PrettifyAll();
        // Get the formatted code
        const formattedCode = editor.GetCode();
        // Return the formatted code
        res.json({
            formatted: formattedCode,
        });
    }
    catch (err) {
        const error = err;
        console.error('Error formatting code:', error);
        res.status(500).json({
            error: 'An error occurred while formatting the code',
            details: error.message,
        });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
