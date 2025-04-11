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
globalAny.Range = class {
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    };
  }

  getClientRects() {
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
  }
};

// Mock Text object with getClientRects method
globalAny.Text = class extends dom.window.Text {
  getClientRects() {
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
  }
};

// Ensure all elements have getClientRects method
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
const createRectList = () => ({
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
});

// Explicitly handle the coordsAtPos error by monkey patching
// This is a focused approach to handle the specific error in the stack trace
globalAny.suppressPositioningErrors = () => {
  // Store original methods if we need to restore them
  const originals: Record<string, any> = {};

  // Helper to safely patch a property on an object
  const safePatch = (obj: any, propPath: string[], replacement: Function) => {
    if (!obj) return false;

    let target = obj;
    for (let i = 0; i < propPath.length - 1; i++) {
      if (!target[propPath[i]]) return false;
      target = target[propPath[i]];
    }

    const propName = propPath[propPath.length - 1];
    if (typeof target[propName] !== 'function') return false;

    originals[propPath.join('.')] = target[propName];
    target[propName] = replacement;
    return true;
  };

  // Patch EditorView.coordsAtPos to avoid the error
  safePatch(globalAny, ['EditorView', 'prototype', 'coordsAtPos'], function (this: any, pos: number) {
    try {
      // Try original function, but catch errors
      return originals['EditorView.prototype.coordsAtPos'].call(this, pos);
    } catch (e) {
      // If it fails, return a dummy position
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
  });
};

// Apply getClientRects to Object.prototype to ensure EVERY object has it
// This is extreme, but will guarantee that any object used by textRange has the method
Object.defineProperty(Object.prototype, 'getClientRects', {
  value: function () {
    return createRectList();
  },
  configurable: true,
  writable: true,
  enumerable: false, // Don't show in for...in loops
});

// More direct fix for the textRange function in CodeMirror
try {
  // Attempt to access the @codemirror/view module to directly patch problematic functions
  const codeMirrorViewPath = require.resolve('@codemirror/view/dist/index.js');
  if (codeMirrorViewPath) {
    console.log(`Found CodeMirror view module at: ${codeMirrorViewPath}`);
    // We'll just rely on our Object.prototype patch since this is a dynamic import
  }
} catch (err) {
  console.log('CodeMirror view module not found for direct patching, using global approach instead');
}

// Apply the patch to Node.prototype to ensure all DOM nodes have this method
if (dom.window.Node) {
  Object.defineProperty(dom.window.Node.prototype, 'getClientRects', {
    value: function () {
      return createRectList();
    },
    configurable: true,
    writable: true,
  });
}

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
    await fixCodeMirrorStateInstance();

    // Monkey patch any CodeMirror functions that might be troublesome in server environment
    try {
      // Get access to the CodeMirror modules
      const CM = globalAny.CM || {};

      // Add compatibility check for ESM modules in the editor
      const ensureESMCompatibility = () => {
        console.log('Ensuring ESM compatibility for CodeMirror...');

        // Fix for instanceof checks across module boundaries
        try {
          // For EditorState
          if (CM.state && CM.state.EditorState) {
            const originalEditorState = globalAny.EditorState || {};
            globalAny.EditorState = CM.state.EditorState;

            // Copy over any properties from the original
            for (const key in originalEditorState) {
              if (!(key in globalAny.EditorState) && Object.prototype.hasOwnProperty.call(originalEditorState, key)) {
                globalAny.EditorState[key] = originalEditorState[key];
              }
            }
          }

          // For EditorView
          if (CM.view && CM.view.EditorView) {
            const originalEditorView = globalAny.EditorView || {};
            globalAny.EditorView = CM.view.EditorView;

            // Copy over any properties from the original
            for (const key in originalEditorView) {
              if (!(key in globalAny.EditorView) && Object.prototype.hasOwnProperty.call(originalEditorView, key)) {
                globalAny.EditorView[key] = originalEditorView[key];
              }
            }
          }

          console.log('ESM compatibility fixes applied for CodeMirror');
        } catch (err) {
          console.warn('Could not apply all ESM compatibility fixes:', err);
        }
      };

      // Apply ESM compatibility fixes
      ensureESMCompatibility();

      // Monkey patch the GalapagosEditor initialization to use our cached modules
      if ('GalapagosEditor' in globalThis && globalAny.CM) {
        // For ES modules, we can't just replace the constructor as easily
        // Instead, we need to patch methods that actually create CodeMirror instances

        // Find the editor instance
        const editorInstance = new GalapagosEditor(editorElement, {
          Language: EditorLanguage.NetLogo,
          ParseMode: ParseMode.Normal,
          OnUpdate: (Changed, Update) => {
            if (Changed) console.log('Editor Update:', Update);
          },
          OnExplain: (Message, Context) => {
            console.log('Editor Explain:', Message, Context);
          },
        });

        // Now directly patch any methods that might cause issues
        if (editorInstance) {
          console.log('Editor instance created, patching potential problematic methods');

          // Override methods that might use EditorState or EditorView
          if (CM.state && CM.state.EditorState) {
            // Inject our cached EditorState into the global scope
            globalAny.EditorState = CM.state.EditorState;
            console.log('Injected cached EditorState into global scope');
          }

          if (CM.view && CM.view.EditorView) {
            // Inject our cached EditorView into the global scope
            globalAny.EditorView = CM.view.EditorView;
            console.log('Injected cached EditorView into global scope');
          }
        }
      }

      // Override the problematic functions to avoid the error
      globalAny.preventPositioningErrors = () => {
        // Override any functions that might cause errors due to lack of proper DOM support
        if (typeof globalAny.textRange === 'function') {
          const originalTextRange = globalAny.textRange;
          globalAny.textRange = function (...args: any[]) {
            const result = originalTextRange.apply(this, args);
            if (result && !result.getClientRects) {
              result.getClientRects = () => createRectList();
            }
            return result;
          };
        }
      };

      // Call the prevention function
      globalAny.preventPositioningErrors();

      // Also call our suppression function to catch any errors
      globalAny.suppressPositioningErrors();
    } catch (err) {
      console.log('Could not patch CodeMirror functions directly, relying on global prototype methods');
    }

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
// This needs to be called before creating any CodeMirror editors
const fixCodeMirrorStateInstance = async () => {
  // Store references to the CodeMirror modules to ensure we use the same instances
  if (!globalAny.CM) {
    globalAny.CM = {};
  }

  try {
    // Check and log module paths to detect potential duplicates
    console.log('Checking for multiple CodeMirror instances...');
    try {
      // Use import.meta.resolve if available, otherwise fallback
      let stateModulePath, viewModulePath;

      if (import.meta && typeof import.meta.resolve === 'function') {
        stateModulePath = await import.meta.resolve('@codemirror/state');
        viewModulePath = await import.meta.resolve('@codemirror/view');
      } else {
        // Fallback - just use the module name
        stateModulePath = '@codemirror/state';
        viewModulePath = '@codemirror/view';
        console.log('import.meta.resolve not available, using module names');
      }

      console.log('CodeMirror state module path:', stateModulePath);
      console.log('CodeMirror view module path:', viewModulePath);

      // Only try to get node_modules directory if we have a proper path
      if (typeof stateModulePath === 'string' && stateModulePath.includes('node_modules')) {
        const nodeModulesDir = stateModulePath.substring(
          0,
          stateModulePath.indexOf('node_modules') + 'node_modules'.length
        );
        console.log('node_modules directory:', nodeModulesDir);
      }
    } catch (err) {
      console.warn('Unable to check for duplicate CodeMirror instances:', err);
    }

    // Try to load the state module and cache it using dynamic import
    const stateModule = await import('@codemirror/state');
    globalAny.CM.state = stateModule;

    // Cache other CodeMirror modules to ensure we use same instances
    try {
      globalAny.CM.view = await import('@codemirror/view');
      globalAny.CM.language = await import('@codemirror/language');
      globalAny.CM.commands = await import('@codemirror/commands');
      console.log('Cached CodeMirror modules to prevent multiple instances');
    } catch (err) {
      console.warn('Could not cache all CodeMirror modules:', err);
    }

    // Store original instanceof to ensure proper type checking
    const originalInstanceOf = Object.getOwnPropertyDescriptor(Object, 'instanceof');

    // Override instanceof for Extension check
    if (stateModule && 'Extension' in stateModule) {
      const ExtensionClass = (stateModule as any).Extension;
      Object.defineProperty(global, 'Extension', { value: ExtensionClass });

      // Custom instanceof for Extension objects
      const extensionInstanceCheck = function (this: any, obj: any, constructor: any) {
        if (constructor === ExtensionClass || constructor.name === 'Extension') {
          return obj && (obj instanceof ExtensionClass || obj.constructor?.name === 'Extension');
        }
        return originalInstanceOf
          ? originalInstanceOf.value.call(this, obj, constructor)
          : Object.prototype.hasOwnProperty.call(obj, 'constructor') && obj.constructor === constructor;
      };

      // Apply the patched instanceof behavior
      Object.defineProperty(Object, 'instanceof', {
        value: extensionInstanceCheck,
        configurable: true,
        writable: true,
      });

      // Directly patch the Configuration.resolve method if possible
      try {
        const Configuration = (stateModule as any).Configuration;
        if (Configuration && Configuration.prototype && Configuration.prototype.resolve) {
          const originalResolve = Configuration.prototype.resolve;

          Configuration.prototype.resolve = function (extensions: any) {
            try {
              return originalResolve.call(this, extensions);
            } catch (e: unknown) {
              if (
                typeof e === 'object' &&
                e !== null &&
                'message' in e &&
                typeof e.message === 'string' &&
                e.message.includes('Unrecognized extension value')
              ) {
                console.warn('Fixing unrecognized extension error');
                // Handle the extension instance checking error
                if (Array.isArray(extensions)) {
                  // Filter out problematic extensions
                  extensions = extensions.filter((ext) => {
                    const isValidExt =
                      ext &&
                      (typeof ext === 'function' ||
                        (typeof ext === 'object' && (ext.extension !== undefined || typeof ext.value === 'function')));
                    if (!isValidExt) console.warn('Filtering out invalid extension:', ext);
                    return isValidExt;
                  });
                }
                return originalResolve.call(this, extensions);
              }
              throw e;
            }
          };
          console.log('Patched Configuration.resolve to handle extension errors');
        }
      } catch (err) {
        console.error('Failed to patch Configuration.resolve:', err);
      }
    }

    console.log('CodeMirror state module cached and Extension instance check patched');
  } catch (err) {
    console.error('Failed to fix CodeMirror state instance issue:', err);
  }
};

// Call the fix before any server routes handle CodeMirror operations
// Since this is now async, we'll use an IIFE to await it
(async () => {
  try {
    await fixCodeMirrorStateInstance();
  } catch (err) {
    console.error('Error during fixCodeMirrorStateInstance initialization:', err);
  }
})();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
