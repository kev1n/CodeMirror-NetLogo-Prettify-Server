import { EditorView, KeyBinding, ViewUpdate } from '@codemirror/view';
import { Diagnostic } from '@codemirror/lint';
import { GalapagosEditor } from './editor.js';

/** Options: Options of an editor. */
export interface EditorConfig {
  /** Language: The programming language of this editor. */
  Language?: EditorLanguage;
  /** ReadOnly: Is the editor in read-only mode? */
  ReadOnly?: boolean;
  /** Placeholder: The placeholder of the editor. */
  Placeholder?: string | HTMLElement;
  /** OneLine: Is the editor in forced one-line mode? */
  // Basically, we will make the editor an one-line input without additional features & keyboard shortcuts.
  OneLine?: boolean;
  /** ParseMode: The parsing mode of the editor. */
  ParseMode?: ParseMode;
  /** Wrapping: Should we auto-wrap lines? */
  Wrapping?: boolean;
  /** OnUpdate: Handle the Update event. */
  OnUpdate?: (DocumentChanged: boolean, ViewUpdate: ViewUpdate) => void;
  /** OnKeyDown: Handle the KeyDown event. */
  OnKeyDown?: (Event: KeyboardEvent, Editor: GalapagosEditor) => boolean | void;
  /** OnKeyUp: Handle the KeyUp event. */
  OnKeyUp?: (Event: KeyboardEvent, Editor: GalapagosEditor) => boolean | void;
  /** OnClick: Handle the OnClick event. */
  OnClick?: (Event: MouseEvent, Editor: GalapagosEditor) => boolean | void;
  /** OnFocused: Handle the focused event. */
  OnFocused?: (View: EditorView) => void;
  /** OnBlurred: Handle the blurred event. */
  OnBlurred?: (View: EditorView) => void;
  /** OnExplain: Triggers when a linting tooltip needs explanation. */
  OnExplain?: (Diagnostic: Diagnostic, Context: string) => void;
  /** OnDictionaryClick: Triggers when a dictionary tooltip is clicked. */
  OnDictionaryClick?: (Key: string) => void;
  /** KeyBindings: Custom key mappings (with the highest priority). */
  KeyBindings?: KeyBinding[];
  /** OnColorPickerCreate: Handles the creation of the Color Picker Element.*/
  // Is also the option to create color widgets. If OnColorPickerCreate option is given, then color widget plugin is turned on
  OnColorPickerCreate?: (Container: HTMLElement) => void;
}

/** EditorLanguage: Language. */
export enum EditorLanguage {
  NetLogo = 0,
  Javascript = 1,
  HTML = 2,
  CSS = 3,
}

/** ParseMode: The parsing mode. */
export enum ParseMode {
  /** Normal: Normal mode (Regular editor tab), where the code is supposed to be an entire model. */
  Normal = 'Normal',
  /** Oneline: Oneline mode (Command center), where the code is supposed to be a single line of command or reporter statement. */
  Oneline = 'Oneline',
  /** Embedded: Embedded command mode (Button/Plot commands), where the code is supposed to be multiple lines of command statements. */
  Embedded = 'Embedded',
  /** Reporter: Embedded reporter mode (Widget input), where the code is supposed to be multiple lines of reporter statment. */
  Reporter = 'Reporter',
  /** Generative: Generative mode (ChatLogo), a special Normal mode that does not provide context to its parent but instead take it back. */
  Generative = 'Generative',
}

/** Export classes globally. */
try {
  (window as any).EditorLanguage = EditorLanguage;
} catch (error) {}
