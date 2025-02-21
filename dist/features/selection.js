import { selectAll } from '@codemirror/commands';
import { Decoration, EditorView } from '@codemirror/view';
import { diffWords } from 'diff';
import { StateEffect, StateField } from '@codemirror/state';
import { SearchCursor } from '@codemirror/search';
import { TextWidget } from '../codemirror/widgets-changes';
/** SelectionFeatures: The selection and cursor features of the editor. */
export class SelectionFeatures {
    /** Constructor: Initialize the editing features. */
    constructor(Galapagos) {
        this.Galapagos = Galapagos;
        this.CodeMirror = Galapagos.CodeMirror;
    }
    // #region "Selection and Cursor"
    /** SelectAll: Select all text in the editor. */
    SelectAll() {
        selectAll(this.CodeMirror);
        this.CodeMirror.focus();
    }
    /** Select: Select and scroll to a given range in the editor. */
    Select(Start, End) {
        if (End > this.CodeMirror.state.doc.length || Start < 0 || Start > End) {
            return;
        }
        this.CodeMirror.dispatch({
            selection: { anchor: Start, head: End },
            scrollIntoView: true,
        });
        this.CodeMirror.focus();
    }
    /** GetSelection: Returns an object of the start and end of
     *  a selection in the editor. */
    GetSelection() {
        return {
            from: this.CodeMirror.state.selection.main.from,
            to: this.CodeMirror.state.selection.main.to,
        };
    }
    /** GetSelections: Get the selections of the editor. */
    GetSelections() {
        return this.CodeMirror.state.selection.ranges;
    }
    /** GetCursorPosition: Set the cursor position of the editor. */
    GetCursorPosition() {
        return this.CodeMirror.state.selection.ranges[0]?.from ?? 0;
    }
    /** SetCursorPosition: Set the cursor position of the editor. */
    SetCursorPosition(position) {
        this.CodeMirror.dispatch({
            selection: { anchor: position },
            scrollIntoView: true,
        });
    }
    /** RefreshCursor: Refresh the cursor position. */
    RefreshCursor() {
        this.SetCursorPosition(this.GetCursorPosition());
    }
    // #endregion
    // #region "Highlighting Changes"
    /** HighlightChanges: Highlight the changes in the editor. */
    HighlightChanges(PreviousVersion) {
        let clicked = false;
        // string of current state doc of editor at time of "HighlightChanges" call
        const CurrentVersion = this.CodeMirror.state.doc.toString();
        const currentState = this.CodeMirror.state;
        const editorView = this.CodeMirror;
        // create diff instance comparing previous version of string to current version
        const diff = diffWords(PreviousVersion, CurrentVersion);
        // separate words into added and removed
        const removed = diff.filter((part) => part.removed).map((part) => part.value.replace('\n', '↵\n'));
        const added = diff.filter((part) => part.added).map((part) => part.value);
        // defining stateffect for added words using mark decoration --> should be green
        const removedEffect = StateEffect.define({
            map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) }),
        });
        // stateEffect for removed words using widget decoration
        const addTextWidget = StateEffect.define({
            map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) }),
        });
        // define mark decoration for added words
        const addedMark = Decoration.mark({ attributes: { class: 'cm-added' } }); //mark decoration for removed words
        // index tracker for removed array (tells us which removed words have already been highlighted )
        let removedIndex = 0;
        // define statefield for words needing to be highlighted (field for both added and removed words)
        const changesField = StateField.define({
            create() {
                return Decoration.none;
            },
            update(value, tr) {
                value = value.map(tr.changes);
                for (let e of tr.effects) {
                    if (e.is(removedEffect)) {
                        //if it is a added word then add "added" mark decoration
                        value = value.update({
                            add: [addedMark.range(e.value.from, e.value.to)],
                        });
                    }
                    else if (e.is(addTextWidget)) {
                        let decorationWidget = Decoration.widget({
                            widget: new TextWidget(removed[removedIndex], 'cm-removed'),
                            side: 1,
                        });
                        removedIndex++; // increment removedIndex because we have already added this word
                        value = value.update({
                            add: [decorationWidget.range(e.value.to)],
                        });
                    }
                }
                return value;
            },
            provide: (f) => EditorView.decorations.from(f),
        });
        /* highlightAdded: searches for the added word in previous string and highlights it as "removed" */
        function highlightAdded(view, word) {
            let effects = [];
            // create a cursor to find the word
            let cursor = new SearchCursor(view.state.doc, word, 0);
            // find the word
            cursor.next();
            effects.push(removedEffect.of({
                from: cursor.value.from,
                to: cursor.value.to,
            }));
            if (!effects.length)
                return false;
            if (!view.state.field(changesField, false)) {
                effects.push(StateEffect.appendConfig.of([changesField]));
            }
            view.dispatch({ effects });
            return true;
        }
        /* makeWidget: creates a widget decoration of the added word (as 'text') and adds it to the EditorView at "end"*/
        function makeWidget(view, end, type = 'text') {
            let effects = [];
            if (type === 'text') {
                effects.push(addTextWidget.of({
                    from: 0,
                    to: end,
                }));
            }
            if (!effects.length)
                return false;
            effects.push(StateEffect.appendConfig.of([changesField]));
            view.dispatch({ effects });
            return true;
        }
        // iterate through added words and highlight them green
        added.forEach((word) => highlightAdded(this.CodeMirror, word));
        // iterate through added words and highlight them
        let currentPos = 0; // position tracker for added words so they are added in the correct position based on where diff put them in the consolidated string
        diff.forEach((part) => {
            //updated current position
            if (part.removed) {
                // add the widget to the editor
                makeWidget(this.CodeMirror, currentPos);
            }
            else {
                // if it is not an added word, then update the current position to be after the word that was not added
                currentPos += part.value.length;
            }
        });
        function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
        function revert(view, state) {
            view.setState(state);
            return;
        }
        //   //create another statefield to remove the highlight after 5 seconds
        const removeChangesField = StateField.define({
            create() {
                Decoration.none;
            },
            update(lines, tr) {
                // check if cursor changed
                if (tr.selection && !clicked) {
                    // if cursor changed, then remove the highlight
                    console.log('selection changed ');
                    sleep(50).then(() => {
                        revert(editorView, currentState);
                        clicked = false;
                    });
                }
                return;
            },
        });
        // add the statefield to the editor
        this.CodeMirror.dispatch({
            effects: StateEffect.appendConfig.of([removeChangesField]),
        });
    }
}
