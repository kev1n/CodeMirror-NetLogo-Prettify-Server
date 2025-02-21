import { Localized } from '../editor';
/** DictionaryManager: Dictionary support. */
class DictionaryManager {
    constructor() {
        /** Data: Data of the dictionary. */
        this.Data = {};
    }
    // Initialize: Initialize the manager with given data.
    Initialize(Data) {
        this.Data = Data;
        // Built-in types
        this.RegisterBuiltin('~VariableName');
        this.RegisterBuiltin('~ProcedureName');
        this.RegisterBuiltin('~Arguments');
        this.RegisterBuiltin('~PatchVar');
        this.RegisterBuiltin('~TurtleVar');
        this.RegisterBuiltin('~LinkVar');
        this.RegisterBuiltin('~Reporter');
        this.RegisterBuiltin('~Command');
        this.RegisterBuiltin('~Constant');
        this.RegisterBuiltin('~Extension');
        this.RegisterBuiltin('~Numeric');
        this.RegisterBuiltin('~String');
        this.RegisterBuiltin('~LineComment');
        this.RegisterBuiltin('~Globals/Identifier');
        this.RegisterBuiltin('~BreedVars/Identifier');
        this.RegisterBuiltin('~BreedPlural');
        this.RegisterBuiltin('~BreedSingular');
        this.RegisterBuiltin('~BreedVariable');
        this.RegisterBuiltin('~BreedReporter');
        this.RegisterBuiltin('~BreedCommand');
        this.RegisterBuiltin('~WidgetGlobal');
        this.RegisterBuiltin('~CustomCommand');
        this.RegisterBuiltin('~CustomReporter');
        this.RegisterBuiltin('~LocalVariable');
    }
    // RegisterInternal: Register some built-in explanations.
    RegisterBuiltin(...Args) {
        Args.map((Arg) => (this.Data[Arg.toLowerCase()] = Localized.Get(Args[0], '{0}')));
    }
    // Get: Get an explanation from the dictionary.
    Get(Key, Value) {
        if (Dictionary.Check(Key))
            return Dictionary.Data[Key.trim().toLowerCase()].replace('{0}', Value);
        return Key;
    }
    // Check: Check if a key exists in the dictionary.
    Check(Key) {
        return this.Data && this.Data.hasOwnProperty(Key.trim().toLowerCase());
    }
}
/** Singleton */
const Dictionary = new DictionaryManager();
export { Dictionary };
/** Global singleton */
try {
    window.EditorDictionary = Dictionary;
}
catch (error) { }
