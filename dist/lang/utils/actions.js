import { Localized } from '../../editor';
import { CodeEditing } from '../services/code-editing';
import { getNodeContext } from './code';
import { syntaxTree } from '@codemirror/language';
/** addBreedAction: Add an adding a breed action. */
export const addBreedAction = function (diagnostic, type, plural, singular) {
    diagnostic.actions = [
        ...(diagnostic.actions ?? []),
        {
            name: Localized.Get('Add'),
            apply(view, from, to) {
                new CodeEditing(view).AppendBreed(type, plural, singular);
            },
        },
    ];
    return diagnostic;
};
/** addGlobalsAction: Add an adding global variables action. */
export const addGlobalsAction = function (diagnostic, type, items) {
    diagnostic.actions = [
        ...(diagnostic.actions ?? []),
        {
            name: Localized.Get('Add'),
            apply(view, from, to) {
                new CodeEditing(view).AppendGlobals(type, items);
            },
        },
    ];
    return diagnostic;
};
/** removeAction: Add an removing the snippet action. */
export const removeAction = function (diagnostic) {
    diagnostic.actions = [
        ...(diagnostic.actions ?? []),
        {
            name: Localized.Get('Remove'),
            apply(view, from, to) {
                view.dispatch({ changes: { from, to, insert: '' } });
            },
        },
    ];
    return diagnostic;
};
/** removeAction: Add an removing the snippet action. */
export const AddReplaceAction = function (diagnostic, replacement) {
    diagnostic.actions = [
        ...(diagnostic.actions ?? []),
        {
            name: Localized.Get('Replace'),
            apply(view, from, to) {
                view.dispatch({ changes: { from, to, insert: replacement } });
            },
        },
    ];
    return diagnostic;
};
/** explainAction: Add an explain the linting message action. */
export const explainAction = function (diagnostic, callback) {
    diagnostic.actions = [
        ...(diagnostic.actions ?? []),
        {
            name: Localized.Get('Explain'),
            apply(view, from, to) {
                var node = syntaxTree(view.state).resolve(from, -1);
                callback(diagnostic, getNodeContext(view.state, node));
            },
        },
    ];
    return diagnostic;
};
