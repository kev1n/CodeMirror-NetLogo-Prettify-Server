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

// Mock for all DOM elements to include getClientRects method
const originalCreateElement = document.createElement;
document.createElement = function (tagName: string) {
  const element = originalCreateElement.call(this, tagName);
  if (!element.getClientRects) {
    (element as any).getClientRects = function () {
      return {
        length: 1,
        item: (i: number) => ({
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
        }),
        [0]: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 },
        [Symbol.iterator]: function* () {
          yield this[0];
        },
      };
    };
  }
  return element;
};

// Mock Range and TextRange functionality
// These might still be needed if CodeMirror relies on specific DOM APIs not present in JSDOM
// We can potentially remove these later if the bundling fixes the issue

// globalAny.Range = class {
//   getBoundingClientRect() {
//     return {
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       width: 0,
//       height: 0,
//     };
//   }

//   getClientRects() {
//     return createRectList(); // Use the helper function
//   }
// };

// globalAny.Text = class extends dom.window.Text {
//   getClientRects() {
//     return createRectList();
//   }
// };

// Ensure all elements have getClientRects method
// Keep this for now, as it might be needed for JSDOM
const originalGetElementById = document.getElementById;
document.getElementById = function (id) {
  const element = originalGetElementById.call(this, id);
  if (element) {
    (element as any).getClientRects = function () {
      return {
        length: 1,
        item: (i: number) => ({
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
        [Symbol.iterator]: function* () {
          yield this[0];
        },
      };
    };
  }
  return element;
};

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

// Define a standard getClientRects function
// Keep this helper function
// const createRectList = () => ({
//   length: 1,
//   item: (i: number) => ({
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     width: 0,
//     height: 0,
//   }),
//   [0]: {
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     width: 0,
//     height: 0,
//   },
//   [Symbol.iterator]: function* () {
//     yield this[0];
//   },
// });

// Explicitly handle the coordsAtPos error by monkey patching
// This is a focused approach to handle the specific error in the stack trace
// Remove this section
// globalAny.suppressPositioningErrors = () => {
// ... removed suppressPositioningErrors function body ...
// };

// Apply getClientRects to Object.prototype to ensure EVERY object has it
// Remove this extreme patch
// Object.defineProperty(Object.prototype, 'getClientRects', {
//   value: function () {
//     return createRectList();
//   },
//   configurable: true,
//   writable: true,
//   enumerable: false, // Don't show in for...in loops
// });

// More direct fix for the textRange function in CodeMirror
// Remove this section
// try {
// ... removed try-catch block ...
// } catch (err) {
//   console.log('CodeMirror view module not found for direct patching, using global approach instead');
// }

// Apply the patch to Node.prototype to ensure all DOM nodes have this method
// Keep this for now, might be needed for JSDOM compatibility
// if (dom.window.Node) {
//   Object.defineProperty(dom.window.Node.prototype, 'getClientRects', {
//     value: function () {
//       return createRectList();
//     },
//     configurable: true,
//     writable: true,
//   });
// }

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
app.post('/prettify', async (req: PrettifyRequest, res: Response): Promise<void> => {
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

    // Ensure we're using the same CodeMirror state instance before initializing editor
    // REMOVE: await fixCodeMirrorStateInstance();

    // Monkey patch any CodeMirror functions that might be troublesome in server environment
    // REMOVE: Entire try...catch block for patching CM functions
    // try {
    // ... removed try...catch block ...
    // } catch (err) {
    //   console.log('Could not patch CodeMirror functions directly, relying on global prototype methods');
    // }

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

      // Try to catch any errors during prettification
      try {
        editor.Semantics.PrettifyAll();
        console.log('Prettification complete');
      } catch (prettifyErr) {
        console.error('Error during prettification:', prettifyErr);
        // Continue anyway - we can still try to get the code
      }

      console.log('Getting formatted code...');
      // Add error handling for getCode
      let formattedCode;
      try {
        formattedCode = editor.GetCode();
        console.log('Formatted code retrieved');
      } catch (getCodeErr) {
        console.error('Error getting code:', getCodeErr);
        // If we can't get the formatted code, return the original
        formattedCode = code;
      }

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

app.get('/', (req: Request, res: Response): void => {
  res.send('Hello World');
});

// Fix for CodeMirror extension issue - ensure single state instance
// REMOVE: Entire fixCodeMirrorStateInstance function definition
// const fixCodeMirrorStateInstance = async () => {
// ... removed function body ...
// };

// Call the fix before any server routes handle CodeMirror operations
// REMOVE: IIFE calling fixCodeMirrorStateInstance
// (async () => {
//   try {
//     await fixCodeMirrorStateInstance();
//   } catch (err) {
//     console.error('Error during fixCodeMirrorStateInstance initialization:', err);
//   }
// })();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
