import { syntaxTree } from '@codemirror/language';
/** GetCursorUntilMode: Get the cursor until the "mode" node. */
export function GetCursorUntilMode(State) {
    const Cursor = syntaxTree(State).cursor();
    if (!Cursor.firstChild())
        return null;
    while (Cursor.node.name == 'LineComment')
        Cursor.nextSibling();
    return Cursor;
}
/** GetCursorInsideMode: Get the cursor until inside the "node" part. */
export function GetCursorInsideMode(State) {
    const Cursor = GetCursorUntilMode(State);
    if (!Cursor?.firstChild())
        return null;
    return Cursor;
}
