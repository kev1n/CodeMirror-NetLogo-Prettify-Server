import { syntaxTree } from '@codemirror/language';
import { Localized } from '../../editor';
// UnrecognizedGlobalLinter: Checks if something at the top layer isn't a procedure, global, etc.
export const UnrecognizedGlobalLinter = (view, preprocessContext, lintContext) => {
    const diagnostics = [];
    let cursor = syntaxTree(view.state).cursor();
    let lastGlobalPos = 0;
    if (cursor.firstChild() && cursor.node.name == 'Normal') {
        for (var key of ['Extensions', 'Globals', 'BreedsOwn', 'Breed']) {
            cursor.node.getChildren(key).map((child) => {
                if (child.from > lastGlobalPos) {
                    lastGlobalPos = child.from;
                }
            });
        }
        cursor.node.getChildren('Procedure').map((child) => {
            if (child.from < lastGlobalPos) {
                let value;
                let nameNode = child.node.getChild('Procedure')?.getChild('ProcedureName');
                if (nameNode) {
                    value = view.state.sliceDoc(nameNode.from, nameNode.to);
                }
                else {
                    value = view.state.sliceDoc(child.from, child.to).split('\n')[0];
                }
                diagnostics.push({
                    from: child.from,
                    to: child.to,
                    severity: 'error',
                    message: Localized.Get('Improperly placed procedure _', value),
                });
            }
        });
        for (var key of ['Extensions', 'Globals']) {
            if (cursor.node.getChildren(key).length > 1) {
                let first = true;
                cursor.node.getChildren(key).map((child) => {
                    if (first) {
                        first = false;
                    }
                    else {
                        diagnostics.push({
                            from: child.from,
                            to: child.to,
                            severity: 'error',
                            message: Localized.Get('Duplicate global statement _', key),
                        });
                    }
                });
            }
        }
        cursor.node.getChildren('Breed').map((child) => {
            let sing = child.getChild('BreedSingular');
            let plural = child.getChild('BreedPlural');
            if (sing && plural && sing.to - sing.from > 0 && plural.to - plural.from > 0) {
            }
            else {
                diagnostics.push({
                    from: child.from,
                    to: child.to,
                    severity: 'error',
                    message: Localized.Get('Missing breed names _', 'breed'),
                });
            }
        });
    }
    return diagnostics;
};
