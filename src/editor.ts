import { EditorView, basicSetup } from "codemirror";
import { undo, redo, selectAll } from "@codemirror/commands";
import { LanguageSupport } from "@codemirror/language";
import {
  SearchQuery,
  findNext,
  gotoLine,
  replaceNext,
  setSearchQuery,
  openSearchPanel,
  closeSearchPanel,
} from "@codemirror/search";
import { Compartment, EditorState } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { NetLogo } from "./lang/netlogo.js";
import { EditorConfig, EditorLanguage } from "./editor-config";
import { highlight, highlightStyle } from "./codemirror/style-highlight";
import { indentExtension } from "./codemirror/extension-indent";
import { updateExtension } from "./codemirror/extension-update";
import { stateExtension } from "./codemirror/extension-state-netlogo";
import { lightTheme } from "./codemirror/theme-light";
import { highlightTree } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { UnrecognizedGlobalLinter,IdentifierLinter } from "./lang/linter.js";

/** GalapagosEditor: The editor component for NetLogo Web / Turtle Universe. */
export class GalapagosEditor {
  public readonly EditorState: EditorState;
  /** CodeMirror: The CodeMirror 6 component. */
  public readonly CodeMirror: EditorView;
  /** Options: Options of this editor. */
  public readonly Options: EditorConfig;
  /** Editable: Compartment of the EditorView. */
  private readonly Editable: Compartment;
  /** LanguageCompartment: Compartment of the EditorView. */
  private readonly LanguageCompartment: Compartment;
  /** Language: Language of the EditorView. */
  public readonly Language: LanguageSupport;
  /** Parent: Parent HTMLElement of the EditorView. */
  public readonly Parent: HTMLElement;

  /** Constructor: Create an editor instance. */
  constructor(Parent: HTMLElement, Options: EditorConfig) {
    this.Editable = new Compartment();
    this.LanguageCompartment = new Compartment();
    this.Parent = Parent;
    this.Options = Options;
    // Extensions
    var Extensions = [
      // Editor
      basicSetup,
      lightTheme,
      // Readonly
      this.Editable.of(
        EditorView.editable.of(this.Options.ReadOnly ? false : true)
      ),
      // Events
      updateExtension((Update) => this.onUpdate(Update)),
      highlight,
      indentExtension,
      UnrecognizedGlobalLinter,
      IdentifierLinter
    ];

    // Language-specific
    switch (Options.Language) {
      case EditorLanguage.Javascript:
        this.Language = javascript();
        break;
      case EditorLanguage.CSS:
        this.Language = css();
        break;
      case EditorLanguage.HTML:
        this.Language = html();
        break;
      default:
        this.Language = NetLogo();
        Extensions.push(stateExtension);
    }

    // Build the editor
    Extensions.push(this.Language);

    // One-line mode
    if (this.Options.OneLine) {
      Extensions.push(
        EditorState.transactionFilter.of((tr) =>
          tr.newDoc.lines > 1 ? [] : tr
        )
      );
    }

    // Build the editor
    this.CodeMirror = new EditorView({
      extensions: Extensions,
      parent: Parent,
    });
  }

  /** Highlight: Highlight a given snippet of code. */
  Highlight(Content: string): HTMLElement {
    const Container = document.createElement("span");
    this.highlightInternal(Content, (Text, Style, From, To) => {
      if (Style == "") {
        Container.appendChild(document.createTextNode(Text));
      } else {
        var Node = document.createElement("span");
        Node.innerText = Text;
        Node.className = Style;
        Container.appendChild(Node);
      }
    });
    return Container;
  }

  // The internal method for highlighting.
  private highlightInternal(
    Content: string,
    callback: (text: string, style: string, from: number, to: number) => void,
    options?: Record<string, any>
  ) {
    const tree = this.Language.language.parser.parse(Content);
    let pos = 0;
    highlightTree(tree, highlightStyle, (from, to, classes) => {
      from > pos && callback(Content.slice(pos, from), "", pos, from);
      callback(Content.slice(from, to), classes, from, to);
      pos = to;
    });
    pos != tree.length &&
      callback(Content.slice(pos, tree.length), "", pos, tree.length);
  }

  // #region "Editor API"
  /** SetCode: Set the code of the editor. */
  SetCode(code: string) {
    this.CodeMirror.dispatch({
      changes: { from: 0, to: this.CodeMirror.state.doc.length, insert: code },
    });
  }

  /** GetCode: Get the code from the editor. */
  GetCode(): string {
    return this.CodeMirror.state.doc.toString();
  }

  /** SetReadOnly: Set the readonly status for the editor. */
  SetReadOnly(status: boolean) {
    this.CodeMirror.dispatch({
      effects: this.Editable.reconfigure(EditorView.editable.of(!status)),
    });
  }
  // #endregion

  // #region "Editor Features"
  /** Undo: Make the editor undo. Returns false if no group was available.*/
  Undo() {
    undo(this.CodeMirror);
  }

  /** Redo: Make the editor Redo. Returns false if no group was available.*/
  Redo() {
    redo(this.CodeMirror);
  }

  /** Find: Find a keyword in the editor and optionally jump to it. */
  Find(Keyword: string, JumpTo: boolean) {
    openSearchPanel(this.CodeMirror);
    this.CodeMirror.dispatch({
      effects: setSearchQuery.of(
        new SearchQuery({
          search: Keyword,
        })
      ),
    });
    findNext(this.CodeMirror);
    // Clear all fields in panel
    this.CodeMirror.dispatch({
      effects: setSearchQuery.of(
        new SearchQuery({
          search: "",
        })
      ),
    });
    closeSearchPanel(this.CodeMirror);
  }

  /** Replace: Replace the code in the editor. */
  Replace(Source: string, Target: string) {
    openSearchPanel(this.CodeMirror);
    this.CodeMirror.dispatch({
      effects: setSearchQuery.of(
        new SearchQuery({
          search: Source,
          replace: Target,
        })
      ),
    });
    replaceNext(this.CodeMirror);
    // Clear all fields in panel
    this.CodeMirror.dispatch({
      effects: setSearchQuery.of(
        new SearchQuery({
          search: "",
          replace: "",
        })
      ),
    });
    closeSearchPanel(this.CodeMirror);
  }

  /** JumpTo: Jump to a certain line. */
  JumpTo(Line: number) {
    let { state } = this.CodeMirror;
    let docLine = state.doc.line(Math.max(1, Math.min(state.doc.lines, Line)));
    this.CodeMirror.focus();
    this.CodeMirror.dispatch({
      selection: { anchor: docLine.from },
      scrollIntoView: true,
    });
  }

  /** SelectAll: Select all text in the editor. */
  SelectAll() {
    selectAll(this.CodeMirror);
  }
  // #endregion

  // #region "Editor Interfaces"
  /** ShowFind: Show the finding interface. */
  ShowFind() {
    openSearchPanel(this.CodeMirror);
    // hide inputs related to replace for find interface
    var input = this.Parent.querySelector<HTMLElement>(
      '.cm-textfield[name="replace"]'
    );
    if (input) input.style.display = "none";
    var button1 = this.Parent.querySelector<HTMLElement>(
      '.cm-button[name="replace"]'
    );
    if (button1) button1.style.display = "none";
    var button2 = this.Parent.querySelector<HTMLElement>(
      '.cm-button[name="replaceAll"]'
    );
    if (button2) button2.style.display = "none";
    this.HideJumpToDialog();
  }

  /** ShowReplace: Show the replace interface. */
  ShowReplace() {
    openSearchPanel(this.CodeMirror);
    // show inputs related to replace
    var input = this.Parent.querySelector<HTMLElement>(
      '.cm-textfield[name="replace"]'
    );
    if (input) input.style.display = "inline-block";
    var button1 = this.Parent.querySelector<HTMLElement>(
      '.cm-button[name="replace"]'
    );
    if (button1) button1.style.display = "inline-block";
    var button2 = this.Parent.querySelector<HTMLElement>(
      '.cm-button[name="replaceAll"]'
    );
    if (button2) button2.style.display = "inline-block";
    this.HideJumpToDialog();
  }

  /** ShowJumpTo: Show the jump-to-line interface. */
  // TODO: clear other interfaces
  ShowJumpTo() {
    closeSearchPanel(this.CodeMirror);
    const jumpElm = this.Parent.querySelector<HTMLElement>(".cm-gotoLine");
    jumpElm ? (jumpElm.style.display = "flex") : gotoLine(this.CodeMirror);
  }

  // HideJumpToDialog: Hide line interface
  HideJumpToDialog() {
    const jumpElm = this.Parent.querySelector<HTMLElement>(".cm-gotoLine");
    if (jumpElm) jumpElm.style.display = "none";
  }

  // HideAllInterfaces: Hide all interfaces available.
  HideAllInterfaces() {
    closeSearchPanel(this.CodeMirror);
    this.HideJumpToDialog();
  }
  // #endregion

  // #region "Event Handling"
  /** onUpdate: Handle the Update event. */
  private onUpdate(update: ViewUpdate) {
    if (this.Options.OnUpdate != null)
      this.Options.OnUpdate(update.docChanged, update);
  }
  // #endregion
}

/** Export classes globally. */
try {
  (window as any).GalapagosEditor = GalapagosEditor;
} catch (error) { }
