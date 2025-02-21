import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { JSDOM } from 'jsdom';
import { GalapagosEditor } from './editor.js';
import { ParseMode, EditorLanguage } from './editor-config.js';

const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title>CM6 demo</title>
      <style>
        body {
          background-color: #300a24;
          color: white;
          font-family: monospace;
        }
        .cm-keyword,
        .cm-comment,
        .cm-bracket,
        .cm-attribute,
        .CodeMirror-matchingbracket {
          color: #34e2e2; /* neon blue */
        }
      </style>
    </head>
    <body>
      <div id="editor"></div>
      <script src="./build/demo_built.js"></script>
    </body>
  </html>
`;

const dom = new JSDOM(html);
const document = dom.window.document;
document.getSelection = () => ({} as Selection);
const globalAny: any = global;
globalAny.document = document;
// Use Object.defineProperty to properly set up navigator
Object.defineProperty(global, 'navigator', {
  value: {},
  writable: true,
  configurable: true,
});

// Set up window with all required methods
const windowObj = {
  addEventListener: (type: string, listener: EventListener) => {},
  removeEventListener: (type: string, listener: EventListener) => {},
  dispatchEvent: (event: Event) => true,
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(callback, 0),
  cancelAnimationFrame: (handle: number) => clearTimeout(handle),
  document: document,
  getComputedStyle: (elt: Element) => ({
    lineHeight: '1.2',
    fontSize: '12px',
  }),
  innerHeight: 768,
  innerWidth: 1024,
  scrollX: 0,
  scrollY: 0,
  devicePixelRatio: 1,
};

// Add window as its own defaultView (some DOM operations expect this)
Object.defineProperty(windowObj, 'window', {
  value: windowObj,
  writable: true,
  configurable: true,
});

globalAny.window = windowObj;

// Set up document with defaultView and additional required properties
const documentObj = dom.window.document;
documentObj.getSelection = () =>
  ({
    rangeCount: 0,
    addRange: () => {},
    removeAllRanges: () => {},
    getRangeAt: () => null,
    createRange: () => ({
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
      }),
      getClientRects: () => ({
        length: 1,
        item: () => ({
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
        }),
        [0]: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
        },
      }),
    }),
  } as unknown as Selection);

Object.defineProperty(documentObj, 'defaultView', {
  value: windowObj,
  writable: true,
  configurable: true,
});

// Ensure document has required properties
Object.defineProperty(documentObj, 'documentElement', {
  value: documentObj.querySelector('html'),
  writable: true,
  configurable: true,
});

globalAny.document = documentObj;

// Properly mock MutationObserver as a constructor
class MockMutationObserver {
  private callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
  }

  observe() {}

  disconnect() {}

  takeRecords() {
    return [];
  }
}

globalAny.MutationObserver = MockMutationObserver;

// Initialize required globals
globalAny.EditorDictionary = {
  Initialize: () => {},
};

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());

globalAny.requestAnimationFrame = () => {};

interface PrettifyRequest extends Request {
  body: {
    code: string;
  };
}

// POST endpoint for prettifying NetLogo code
app.post('/prettify', (req: PrettifyRequest, res: Response): void => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res
        .status(400)
        .json({ error: 'Please provide NetLogo code as a string in the request body under the "code" key' });
      return;
    }

    console.log('Creating editor element...');
    // Get the editor element
    const editorElement = document.createElement('div');
    editorElement.id = 'editor';
    if (!editorElement) {
      throw new Error('Editor element not found');
    }
    document.body.appendChild(editorElement);
    console.log('Editor element created and appended');

    console.log('Initializing GalapagosEditor...');
    // Create editor instance
    const editor = new GalapagosEditor(editorElement, {
      Language: EditorLanguage.NetLogo,
      ParseMode: ParseMode.Normal,
      OnUpdate: (Changed, Update) => {
        if (Changed) console.log('Editor Update:', Update);
      },
      OnExplain: (Message, Context) => {
        console.log('Editor Explain:', Message, Context);
      },
    });
    console.log('GalapagosEditor initialized');

    try {
      console.log('Setting code in editor...');
      editor.SetCode(code);
      console.log('Code set successfully');

      console.log('Forcing parse...');
      editor.ForceParse();
      console.log('Parse complete');

      console.log('Prettifying code...');
      editor.Semantics.PrettifyAll();
      console.log('Prettification complete');

      console.log('Getting formatted code...');
      const formattedCode = editor.GetCode();
      console.log('Formatted code retrieved');

      res.json({
        formatted: formattedCode,
      });
    } catch (innerErr) {
      console.error('Error during editor operations:', innerErr);
      throw innerErr;
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error formatting code:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'An error occurred while formatting the code',
      details: error.message,
      stack: error.stack,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
