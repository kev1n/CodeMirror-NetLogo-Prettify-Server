import { syntaxTree } from '@codemirror/language';
import { linter, Diagnostic } from '@codemirror/lint';

// checks if something at the top layer isn't a procedure, global, etc.
export const UnrecognizedLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  syntaxTree(view.state)
    .cursor()
    .iterate((node) => {
      if (node.name == '⚠' && node.to != node.from) {
        diagnostics.push({
          from: node.from,
          to: node.to,
          severity: 'error',
          message: 'Unrecognized',
          actions: [
            {
              name: 'Remove',
              apply(view, from, to) {
                view.dispatch({ changes: { from, to } });
              },
            },
          ],
        });
      }
    });
  return diagnostics;
});
