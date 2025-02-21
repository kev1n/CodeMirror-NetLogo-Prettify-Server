import { linter } from '@codemirror/lint';
import { stateExtension } from '../../codemirror/extension-state-netlogo';
import { Localized } from '../../editor';
/** buildLinter: Builds a linter extension from a linter function. */
const buildLinter = function (Source, Editor) {
    var LastVersion = -1;
    var Cached = [];
    var BuiltSource = (view) => {
        if (Editor.UpdateContext() || Editor.GetVersion() > LastVersion) {
            var state = view.state.field(stateExtension);
            Cached = Source(view, Editor.PreprocessContext, Editor.LintContext, state);
            LastVersion = Editor.GetVersion();
        }
        return Cached;
        // return Cached.filter(
        //   (d) =>
        //     d.to < view.state.selection.main.from ||
        //     d.from > view.state.selection.main.to
        // );
    };
    // var Extension = linter(BuiltSource, {
    //   needsRefresh: (update) =>
    //     update.docChanged ||
    //     update.startState.selection.main != update.state.selection.main,
    // });
    var Extension = linter(BuiltSource);
    Extension.Source = BuiltSource;
    // Remove the default tooltip of linting. We will provide our own.
    if (Extension[2].length == 4) {
        lintState = Extension[2][0];
        Extension[2].splice(2, 1);
        console.log(Extension);
    }
    return Extension;
};
var lintState;
/** getLintState: Returns the internal CodeMirror lint state. */
export const getLintState = function (state) {
    return state.field(lintState);
};
/** getDiagnostic: Returns a diagnostic object from a node and message. */
export const getDiagnostic = function (view, node, message, severity = 'error', ...values) {
    var value = view.state.sliceDoc(node.from, node.to);
    var from = node.from + value.length - value.trimStart().length;
    var to = node.to - value.length + value.trimEnd().length;
    value = value.trim();
    // Cut short the value if it's too long
    if (value.length >= 20)
        value = value.replace('\n', ' ').substring(0, 17) + '...';
    // Use the snippet if no parameters are provided
    if (values.length == 0)
        values.push(value);
    // Build the diagnostic
    return {
        from: from,
        to: to,
        severity: severity,
        message: Localized.Get(message, ...values),
    };
};
/** getNodeTo: Returns the proper end of a node. */
export const getNodeTo = function (node, view) {
    let val = view.state.sliceDoc(node.from, node.to);
    val = val.trimEnd();
    return node.from + val.length;
};
export { buildLinter };
