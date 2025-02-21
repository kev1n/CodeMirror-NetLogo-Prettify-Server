import { directives, turtleVars, patchVars, linkVars, constants } from '../keywords';
import { syntaxTree } from '@codemirror/language';
import { PrimitiveManager } from '../primitives/primitives';
import { getLocalVariables } from '../utils/check-identifier';
import { BreedType } from '../classes/structures';
import { ParseMode } from '../../editor-config';
import { Log } from '../../utils/debug-utils';
import { BreedStatementRules } from '../parsers/breed';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Own } from './../lang.terms.js';
/** AutoCompletion: Auto completion service for a NetLogo model. */
/* Possible Types of Autocompletion Tokens:
Directive; Constant; Extension;
Variable-Builtin; Variable-Global; Variable-Breed;
Breed;
Command; Command-Custom; Reporter; Reporter-Custom.
*/
export class AutoCompletion {
    /** Constructor: Create a new auto completion service. */
    constructor(Editor) {
        /** BuiltinVariables: The completion list of built-in variables. */
        this.BuiltinVariables = this.KeywordsToCompletions([...turtleVars, ...patchVars, ...linkVars], 'Variable-Builtin');
        /** SharedIdentifiers: Shared built-in completions. */
        this.SharedIdentifiers = [
            { label: 'end', type: 'Directive' },
            ...this.BuiltinVariables,
            ...this.KeywordsToCompletions(constants, 'Constant'),
        ];
        /** LastExtensions: Cached extension list. */
        this.LastExtensions = '$NIL$';
        /** LastPrimitives: Cached primitive list. */
        this.LastPrimitives = [];
        /** ParentMaps: Maps of keywords to parents.  */
        this.ParentMaps = {
            Extensions: this.KeywordsToCompletions(PrimitiveManager.GetExtensions(), 'Extension'),
            Program: this.KeywordsToCompletions(directives, 'Directive'),
            Globals: [],
            BreedsOwn: [],
            Breed: [],
            ProcedureName: [],
            Arguments: [], // Arguments of procedures
            /* VariableName: this.KeywordsToCompletions(
              [...turtleVars, ...patchVars, ...linkVars],
              'Variable-Builtin'
            ), // Built-in variable names*/
            // Temporary fix
        };
        /** ParentTypes: Types of keywords.  */
        this.ParentTypes = Object.keys(this.ParentMaps);
        this.Editor = Editor;
    }
    /** KeywordsToCompletions: Transform keywords to completions. */
    KeywordsToCompletions(Keywords, Type) {
        return Keywords.map(function (x) {
            return { label: x, type: Type };
        });
    }
    /** GetParentKeywords: Get keywords of a certain type. */
    GetParentKeywords(Type, State) {
        // console.log(Type);
        let results = this.ParentMaps[Type];
        switch (Type) {
            case 'Extensions':
                results = results.filter((ext) => !State.Extensions.has(ext.label));
                break;
            case 'VariableName':
                results = results.concat(this.KeywordsToCompletions([...State.Globals.keys(), ...State.WidgetGlobals.keys()], 'Variable'));
                break;
            case 'Program':
                results = results.concat(this.KeywordsToCompletions([...State.Breeds.values()].map((breed) => breed.Plural + '-own'), 'Directive'));
                break;
        }
        return results;
    }
    /** getBreedCommands: Get breed commands. */
    getBreedCommands(state) {
        let commands = [];
        for (let b of state.Breeds.values()) {
            // Patch has no commands
            if (b.BreedType == BreedType.Patch)
                continue;
            else {
                commands = commands.concat(this.addBreedCompletions(b, true));
            }
            // if (b.BreedType == BreedType.Turtle) {
            //   commands.push('hatch-' + b.Plural);
            //   commands.push('sprout-' + b.Plural);
            //   commands.push('create-' + b.Plural);
            //   commands.push('create-ordered-' + b.Plural);
            // } else {
            //   commands.push('create-' + b.Plural + '-to');
            //   commands.push('create-' + b.Singular + '-to');
            //   commands.push('create-' + b.Plural + '-from');
            //   commands.push('create-' + b.Singular + '-from');
            //   commands.push('create-' + b.Plural + '-with');
            //   commands.push('create-' + b.Singular + '-with');
            // }
        }
        return commands;
    }
    /** getBreedReporters: Get breed reporters. */
    getBreedReporters(state) {
        let reporters = [];
        for (let b of state.Breeds.values()) {
            reporters = reporters.concat(this.addBreedCompletions(b, false));
            // if (b.BreedType == BreedType.Turtle || b.BreedType == BreedType.Patch) {
            //   reporters.push(b.Plural + '-at');
            //   reporters.push(b.Plural + '-here');
            //   reporters.push(b.Plural + '-on');
            //   reporters.push('is-' + b.Singular + '?');
            // } else {
            //   reporters.push('out-' + b.Singular + '-to');
            //   reporters.push('out-' + b.Singular + '-neighbors');
            //   reporters.push('out-' + b.Singular + '-neighbor?');
            //   reporters.push('in-' + b.Singular + '-from');
            //   reporters.push('in-' + b.Singular + '-neighbors');
            //   reporters.push('in-' + b.Singular + '-neighbor?');
            //   reporters.push('my-' + b.Plural);
            //   reporters.push('my-in-' + b.Plural);
            //   reporters.push('my-out-' + b.Plural);
            //   reporters.push(b.Singular + '-neighbor?');
            //   reporters.push(b.Singular + '-neighbors');
            //   reporters.push(b.Singular + '-with');
            //   reporters.push('is-' + b.Singular + '?');
            // }
        }
        return reporters;
    }
    addBreedCompletions(breed, commands) {
        let completions = [];
        for (var rule of BreedStatementRules) {
            if ((rule.Type == breed.BreedType || rule.Type == undefined) && rule.isCommand == commands && rule.Tag != Own) {
                if (rule.Singular == true || rule.Singular == undefined) {
                    for (var s of rule.String) {
                        completions.push(s.replace(/<breed>/g, breed.Singular));
                    }
                }
                if (rule.Singular == false || rule.Singular == undefined) {
                    for (var s of rule.String) {
                        completions.push(s.replace(/<breed>/g, breed.Plural));
                    }
                }
            }
        }
        return completions;
    }
    /** GetCompletion: Get the completion hint at a given context. */
    GetCompletion(Context) {
        // Preparation
        const node = syntaxTree(Context.state).resolveInner(Context.pos, -1);
        const from = /\./.test(node.name) ? node.to : node.from;
        const nodeName = node.type.name;
        let parentName = node.parent?.type.name ?? '';
        const grandparentName = node.parent?.parent?.type.name ?? '';
        const context = this.Editor.LintContext;
        //console.log(nodeName,parentName,grandparentName)
        // Debug output
        let curr = node;
        let parents = [];
        while (curr.parent) {
            parents.push(curr.parent.name);
            curr = curr.parent;
        }
        Log(node.name + '/' + parents.join('/'));
        if ((parents.includes('Reporter') && this.Editor.Options.ParseMode == ParseMode.Normal) ||
            (grandparentName == 'Normal' && parentName == '⚠')) {
            parentName = 'Program';
        }
        // If the parent/grand parent node is of a type specified in this.maps
        if (this.ParentTypes.indexOf(parentName) > -1)
            return { from, options: this.GetParentKeywords(parentName, context) };
        if (this.ParentTypes.indexOf(grandparentName) > -1 && (parentName != 'Procedure' || nodeName == 'To'))
            return {
                from,
                options: this.GetParentKeywords(grandparentName, context),
            };
        // Otherwise, try to build a full list
        if ((nodeName == 'Identifier' ||
            nodeName == 'Extension' ||
            nodeName.includes('Reporter') ||
            nodeName.includes('Command') ||
            nodeName == 'Set' ||
            nodeName == 'Let') &&
            parentName != 'Unrecognized') {
            let results = this.SharedIdentifiers;
            // Extensions
            const extensions = [...context.Extensions.keys()];
            const extensionNames = extensions.join(',');
            if (this.LastExtensions != extensionNames) {
                this.LastPrimitives = PrimitiveManager.GetCompletions(extensions);
                this.LastExtensions = extensionNames;
            }
            results = results.concat(this.LastPrimitives);
            // Breeds
            if (context.Breeds.size > 0) {
                let breeds = context.GetBreedNames();
                breeds = breeds.filter((breed) => !['turtle', 'turtles', 'patch', 'patches', 'link', 'links'].includes(breed));
                results.push(...this.KeywordsToCompletions(breeds, 'Breed'));
                results.push(...this.KeywordsToCompletions(this.getBreedCommands(context), 'Command'));
                results.push(...this.KeywordsToCompletions(this.getBreedReporters(context), 'Reporter'));
                results.push(...this.KeywordsToCompletions(context.GetBreedVariables(), 'Variable-Breed'));
            }
            // Global Variables
            results.push(...this.KeywordsToCompletions([...context.Globals.keys(), ...context.WidgetGlobals.keys()], 'Variable-Global'));
            // Custom Procedures
            for (var Procedure of context.Procedures.values()) {
                results.push({
                    label: Procedure.Name,
                    type: Procedure.IsCommand ? 'Command-Custom' : 'Reporter-Custom',
                });
            }
            // Valid local variables
            results.push(...this.KeywordsToCompletions(getLocalVariables(node, Context.state, context), 'Variable-Local'));
            return { from, options: results };
        }
        // Failed
        return null;
    }
    /** GetCompletionSource: Get the completion source for a NetLogo model. */
    GetCompletionSource() {
        return (Context) => this.GetCompletion(Context);
    }
}
