import { combineContexts } from 'src/utils/context-utils';
import { AgentContexts, BreedType } from './structures';
/** PreprocessContext: master context from preprocessing */
export class PreprocessContext {
    constructor() {
        /** PluralBreeds: Breeds in the model. */
        this.PluralBreeds = new Map();
        /** SingularBreeds: Singular breeds in the model. */
        this.SingularBreeds = new Map();
        /** SingularToPlurals: Singular-to-plural mappings in the model. */
        this.SingularToPlurals = new Map();
        /** PluralToSingulars: Plural-to-singular mappings in the model. */
        this.PluralToSingulars = new Map();
        /** SpecialReporters: Reporter-to-plural mappings in the model. */
        this.SpecialReporters = new Map();
        /** BreedTypes: Breed types in the model. */
        this.BreedTypes = new Map();
        /** BreedVars: Breed variables in the model. */
        this.BreedVars = new Map();
        /** BreedVarToPlurals: Breed variable-plural mappings in the model. */
        this.BreedVarToPlurals = new Map();
        /** Commands: Commands in the model with number of arguments. */
        this.Commands = new Map();
        /** Reporters: Reporters in the model with number of arguments. */
        this.Reporters = new Map();
        /** CommandsOrigin: Commands in the model with editor ID. */
        this.CommandsOrigin = new Map();
        /** ReportersOrigin: Reporters in the model with editor ID. */
        this.ReportersOrigin = new Map();
    }
    /** Clear: Clear the context. */
    Clear() {
        this.PluralBreeds.clear();
        this.SingularBreeds.clear();
        this.BreedTypes.clear();
        this.BreedVars.clear();
        this.BreedVarToPlurals.clear();
        this.Commands.clear();
        this.Reporters.clear();
        this.CommandsOrigin.clear();
        this.ReportersOrigin.clear();
        this.SpecialReporters.clear();
        return this;
    }
    /** GetBreedContext: Get the context for a breed. */
    GetBreedContext(Name, IsVariable) {
        var Type = this.BreedTypes.get(Name);
        if (typeof Type === 'undefined')
            return new AgentContexts('O---'); // Default to observer
        if (Type == BreedType.DirectedLink || Type == BreedType.UndirectedLink) {
            return new AgentContexts('---L');
        }
        else if (Type == BreedType.Patch) {
            if (IsVariable) {
                return new AgentContexts('-TP-');
            }
            else {
                return new AgentContexts('--P-');
            }
        }
        else {
            return new AgentContexts('-T--');
        }
    }
    GetSuperType(Name) {
        var Type = this.BreedTypes.get(Name);
        if (Type == BreedType.Patch)
            return 'patches';
        else if (Type == BreedType.Turtle)
            return 'turtles';
        else if (Type == BreedType.DirectedLink || Type == BreedType.UndirectedLink)
            return 'links';
        return null;
    }
    /** GetBreedVariableContexts: Get the context for a breed variable. */
    GetBreedVariableContexts(Name) {
        if (this.BreedVarToPlurals.has(Name)) {
            let breeds = this.BreedVarToPlurals.get(Name);
            if (breeds && breeds.length > 0) {
                let context = new AgentContexts();
                for (let b of breeds) {
                    context = combineContexts(context, this.GetBreedContext(b, true));
                }
                return context;
            }
        } //return this.GetBreedContext(this.BreedVarToPlurals.get(Name)!, true);
    }
    /** GetReporterBreed: Get the breed for a reporter. */
    GetReporterBreed(Name) {
        // Build the cache
        if (this.SpecialReporters.size == 0) {
            for (let [Plural, Type] of this.BreedTypes) {
                switch (Type) {
                    case BreedType.Turtle:
                        this.SpecialReporters.set(Plural, Plural);
                        this.SpecialReporters.set(Plural + '-at', Plural);
                        this.SpecialReporters.set(Plural + '-here', Plural);
                        this.SpecialReporters.set(Plural + '-on', Plural);
                        break;
                    case BreedType.Patch:
                        this.SpecialReporters.set('patch-at', Plural);
                        this.SpecialReporters.set('patch-here', Plural);
                        this.SpecialReporters.set('patch-ahead', Plural);
                        this.SpecialReporters.set('patch-at-heading-and-distance', Plural);
                        this.SpecialReporters.set('patch-left-and-ahead', Plural);
                        this.SpecialReporters.set('patch-right-and-ahead', Plural);
                        this.SpecialReporters.set('neighbors', Plural);
                        this.SpecialReporters.set('neighbors4', Plural);
                        break;
                    case BreedType.UndirectedLink:
                    case BreedType.DirectedLink:
                        var Singular = this.PluralToSingulars.get(Plural);
                        this.SpecialReporters.set('link-at', Plural);
                        this.SpecialReporters.set('out-' + Singular + '-to', Plural);
                        this.SpecialReporters.set('in-' + Singular + '-from', Plural);
                        this.SpecialReporters.set('my-' + Plural, Plural);
                        this.SpecialReporters.set('my-in-' + Plural, Plural);
                        this.SpecialReporters.set('my-out-' + Plural, Plural);
                        this.SpecialReporters.set(Singular + '-with', Plural);
                        // Turtles
                        this.SpecialReporters.set('out-' + Singular + '-neighbors', 'turtles');
                        this.SpecialReporters.set('in-' + Singular + '-neighbors', 'turtles');
                        this.SpecialReporters.set(Singular + '-neighbors', 'turtles');
                        break;
                }
            }
            // Find the reporter
            return this.SpecialReporters.get(Name);
        }
    }
}
/** LintPreprocessContext: master context from statenetlogo */
export class LintContext {
    constructor() {
        /** Extensions: Extensions in the code. */
        this.Extensions = new Map();
        /** Globals: Globals in the code. */
        this.Globals = new Map();
        /** WidgetGlobals: Globals from the widgets. */
        this.WidgetGlobals = new Map();
        /** Breeds: Breeds in the code. */
        this.Breeds = new Map();
        /** Procedures: Procedures in the code. */
        this.Procedures = new Map();
    }
    /** Clear: Clear the context. */
    Clear() {
        this.Extensions.clear();
        this.Globals.clear();
        this.WidgetGlobals.clear();
        this.Breeds.clear();
        this.Procedures.clear();
        return this;
    }
    /** GetDefined: Get defined names. */
    GetDefined() {
        var defined = [];
        defined.push(...this.Globals.keys());
        defined.push(...this.WidgetGlobals.keys());
        defined.push(...this.Procedures.keys());
        defined.push(...this.GetBreedNames());
        defined.push(...this.GetBreedVariables());
        return defined;
    }
    /** GetBreedNames: Get names related to breeds. */
    GetBreedNames() {
        var breedNames = [];
        for (let breed of this.Breeds.values()) {
            breedNames.push(breed.Singular);
            breedNames.push(breed.Plural);
        }
        return breedNames;
    }
    /** GetPluralBreedNames: Get plural names related to breeds. */
    GetPluralBreedNames() {
        var breedNames = [];
        for (let breed of this.Breeds.values())
            breedNames.push(breed.Plural);
        return breedNames;
    }
    /** GetBreedVariables: Get variable names related to breeds. */
    GetBreedVariables() {
        var variables = [];
        for (let breed of this.Breeds.values())
            variables = variables.concat(breed.Variables);
        return variables;
    }
    /** GetBreeds: Get list of breeds. */
    GetBreeds() {
        var breedList = [];
        for (let breed of this.Breeds.values()) {
            breedList.push(breed);
        }
        return breedList;
    }
    /** GetBreedFromVariable: Find the breed which defines a certain variable. */
    GetBreedFromVariable(varName) {
        for (let breed of this.Breeds.values()) {
            if (breed.Variables.includes(varName))
                return breed.Plural;
        }
        return null;
    }
    checkCodeBlocks(varName, blocks, proc_name, from, to) {
        for (let b of blocks) {
            // console.log(b)
            if (b.PositionEnd < from || b.PositionStart > to)
                continue;
            for (let localVar of b.Variables) {
                // console.log(localVar.Name,varName,localVar.CreationPos,to)
                if (localVar.Name == varName && localVar.CreationPos <= to)
                    return proc_name;
            }
            // console.log("didn't find")
            let other = this.checkCodeBlocks(varName, b.CodeBlocks, proc_name, from, to);
            if (other != null) {
                return other;
            }
            let anon = this.checkAnonProc(varName, b.AnonymousProcedures, proc_name, from, to);
            if (anon != null) {
                return anon;
            }
        }
        return null;
    }
    checkAnonProc(varName, anon, proc_name, from, to) {
        for (let anonProc of anon) {
            if (anonProc.PositionEnd < from || anonProc.PositionStart > to)
                continue;
            if (anonProc.Arguments.includes(varName))
                return '{anonymous},' + proc_name;
            for (let localVar of anonProc.Variables) {
                if (localVar.Name == varName && localVar.CreationPos <= to)
                    return '{anonymous},' + proc_name;
            }
        }
        return null;
    }
    /** GetProcedureFromVariable: Find the procedure that defines a certain variable. */
    GetProcedureFromVariable(varName, from, to) {
        // console.log(from,to,"'"+varName+"'")
        for (let proc of this.Procedures.values()) {
            // console.log(proc)
            if (proc.PositionEnd < from || proc.PositionStart > to)
                continue;
            // Check the argument list in a procedure
            if (proc.Arguments.includes(varName))
                return proc.Name;
            // Check the local variable list in a procedure
            for (let localVar of proc.Variables) {
                if (localVar.Name == varName && localVar.CreationPos <= to)
                    return proc.Name;
            }
            // Check the anonymous arguments in a procedure
            let anon = this.checkAnonProc(varName, proc.AnonymousProcedures, proc.Name, from, to);
            // console.log(anon)
            if (anon != null) {
                return anon;
            }
            let other = this.checkCodeBlocks(varName, proc.CodeBlocks, proc.Name, from, to);
            // console.log(other)
            if (other != null) {
                return other;
            }
        }
        return null;
    }
}
