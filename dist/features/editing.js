import { replaceAll, selectMatches, SearchQuery, findNext, gotoLine, replaceNext, setSearchQuery, openSearchPanel, closeSearchPanel, } from '@codemirror/search';
import { undo, redo } from '@codemirror/commands';
/** EditingFeatures: The editing features of the editor. */
export class EditingFeatures {
    /** Constructor: Initialize the editing features. */
    constructor(Galapagos) {
        this.Galapagos = Galapagos;
        this.CodeMirror = Galapagos.CodeMirror;
        this.Parent = Galapagos.Parent;
    }
    // #region "Find and Replace"
    /** Undo: Make the editor undo. Returns false if no group was available. */
    Undo() {
        return undo(this.CodeMirror);
    }
    /** Redo: Make the editor Redo. Returns false if no group was available. */
    Redo() {
        return redo(this.CodeMirror);
    }
    /** Find: Find a keyword in the editor and loop over all matches. */
    Find(Keyword) {
        openSearchPanel(this.CodeMirror);
        let prevValue = this.Parent.querySelector('.cm-textfield[name="search"]')?.value ?? '';
        this.CodeMirror.dispatch({
            effects: setSearchQuery.of(new SearchQuery({ search: Keyword })),
        });
        findNext(this.CodeMirror);
        this.CodeMirror.dispatch({
            effects: setSearchQuery.of(new SearchQuery({ search: prevValue })),
        });
        closeSearchPanel(this.CodeMirror);
    }
    /** Replace: Loop through the matches and replace one at a time. */
    Replace(Source, Target) {
        openSearchPanel(this.CodeMirror);
        let prevFind = this.Parent.querySelector('.cm-textfield[name="search"]')?.value ?? '';
        let prevReplace = this.Parent.querySelector('.cm-textfield[name="replace"]')?.value ?? '';
        this.CodeMirror.dispatch({
            effects: setSearchQuery.of(new SearchQuery({
                search: Source,
                replace: Target,
            })),
        });
        replaceNext(this.CodeMirror);
        findNext(this.CodeMirror);
        this.CodeMirror.dispatch({
            effects: setSearchQuery.of(new SearchQuery({
                search: prevFind,
                replace: prevReplace,
            })),
        });
        closeSearchPanel(this.CodeMirror);
    }
    /** FindAll: Find all the matching words in the editor. */
    FindAll(Source) {
        openSearchPanel(this.CodeMirror);
        let prevValue = this.Parent.querySelector('.cm-textfield[name="search"]')?.value ?? '';
        this.CodeMirror.dispatch({
            effects: setSearchQuery.of(new SearchQuery({ search: Source })),
        });
        selectMatches(this.CodeMirror);
        this.CodeMirror.dispatch({
            effects: setSearchQuery.of(new SearchQuery({ search: prevValue })),
        });
        closeSearchPanel(this.CodeMirror);
    }
    /** ReplaceAll: Replace the all the matching words in the editor. */
    ReplaceAll(Source, Target) {
        openSearchPanel(this.CodeMirror);
        let prevFind = this.Parent.querySelector('.cm-textfield[name="search"]')?.value ?? '';
        let prevReplace = this.Parent.querySelector('.cm-textfield[name="replace"]')?.value ?? '';
        this.CodeMirror.dispatch({
            effects: setSearchQuery.of(new SearchQuery({
                search: Source,
                replace: Target,
            })),
        });
        replaceAll(this.CodeMirror);
        this.CodeMirror.dispatch({
            effects: setSearchQuery.of(new SearchQuery({
                search: prevFind,
                replace: prevReplace,
            })),
        });
        closeSearchPanel(this.CodeMirror);
    }
    /** JumpTo: Jump to a certain line. */
    JumpTo(Line) {
        const { state } = this.CodeMirror;
        const docLine = state.doc.line(Math.max(1, Math.min(state.doc.lines, Line)));
        this.CodeMirror.dispatch({
            selection: { anchor: docLine.from },
            scrollIntoView: true,
        });
    }
    // #endregion
    // #region "Editor Interfaces"
    /** ShowFind: Show the finding interface. */
    ShowFind() {
        this.HideAll();
        openSearchPanel(this.CodeMirror);
        // hide inputs related to replace for find interface
        const input = this.Parent.querySelector('.cm-textfield[name="replace"]');
        if (input)
            input.style.display = 'none';
        const button1 = this.Parent.querySelector('.cm-button[name="replace"]');
        if (button1)
            button1.style.display = 'none';
        const button2 = this.Parent.querySelector('.cm-button[name="replaceAll"]');
        if (button2)
            button2.style.display = 'none';
    }
    /** ShowReplace: Show the replace interface. */
    ShowReplace() {
        this.HideAll();
        openSearchPanel(this.CodeMirror);
        // show inputs related to replace
        const input = this.Parent.querySelector('.cm-textfield[name="replace"]');
        if (input)
            input.style.display = 'inline-block';
        const button1 = this.Parent.querySelector('.cm-button[name="replace"]');
        if (button1)
            button1.style.display = 'inline-block';
        const button2 = this.Parent.querySelector('.cm-button[name="replaceAll"]');
        if (button2)
            button2.style.display = 'inline-block';
    }
    /** ShowJumpTo: Show the jump-to-line interface. */
    ShowJumpTo() {
        this.HideAll();
        closeSearchPanel(this.CodeMirror);
        const jumpElm = this.Parent.querySelector('.cm-gotoLine');
        jumpElm ? (jumpElm.style.display = 'flex') : gotoLine(this.CodeMirror);
    }
    /** HideJumpTo: Hide line interface. */
    HideJumpTo() {
        const jumpElm = this.Parent.querySelector('.cm-gotoLine');
        if (jumpElm)
            jumpElm.style.display = 'none';
    }
    /** HideAllInterfaces: Hide all interfaces available. */
    HideAll() {
        closeSearchPanel(this.CodeMirror);
        this.HideJumpTo();
    }
    /** ShowProcedures: Show a list of procedures for the user to jump to. */
    ShowProcedures() {
        // Stub!
    }
}
