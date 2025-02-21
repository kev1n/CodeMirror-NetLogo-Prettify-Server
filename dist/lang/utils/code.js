/* getNodeContext: Gets the context code snippet of the node. */
export const getNodeContext = function (State, Node) {
    let curr_node = Node;
    while (curr_node) {
        // We consider a procedure or a global statement as a proper context scope.
        if (curr_node.name == 'Procedure' ||
            curr_node.name == 'Extensions' ||
            curr_node.name == 'Globals' ||
            curr_node.name == 'Breed' ||
            curr_node.name == 'BreedsOwn')
            return State.sliceDoc(curr_node.from, curr_node.to);
        curr_node = curr_node.parent;
    }
    return State.sliceDoc(Node.from, Node.to);
};
/* getCodeName: Gets the lower-case, trimmed text (name) from a node. */
export const getCodeName = function (State, Node) {
    return State.sliceDoc(Node.from, Node.to).trim().toLowerCase();
};
/* getParentProcedure: Gets the name of the procedure the identifier is in. */
export const getParentProcedure = function (State, Node) {
    let curr_node = Node;
    while (curr_node.parent) {
        curr_node = curr_node.parent;
        if (curr_node.name == 'Procedure') {
            var children = curr_node.getChildren('ProcedureName');
            if (children.length > 0)
                return getCodeName(State, children[0]);
        }
    }
    return undefined;
};
