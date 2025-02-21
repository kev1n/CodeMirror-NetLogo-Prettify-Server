import { stateExtension } from '../../codemirror/extension-state-netlogo';
// CompilerLinter: Present all linting results from the compiler.
export const CompilerLinter = (view) => {
    var state = view.state.field(stateExtension);
    return state.CompilerErrors.map(function (Error) {
        return {
            from: Error.start,
            to: Error.end,
            severity: 'error',
            message: Error.message,
        };
    });
};
// RuntimeLinter: Present all runtime errors.
export const RuntimeLinter = (view) => {
    var state = view.state.field(stateExtension);
    return state.RuntimeErrors.map(function (Error) {
        return {
            from: Error.start,
            to: Error.end,
            severity: 'error',
            message: Error.message,
        };
    });
};
