import { BreedType, AgentContexts } from '../classes/structures';
import { Own, Identifier, SpecialReporter1Args, SpecialReporter2Args, SpecialReporter1ArgsBoth, SpecialReporter0ArgsLink, SpecialReporter1ArgsLink, SpecialReporter2ArgsTurtle, SpecialReporter0ArgsTurtle, SpecialReporter1ArgsTurtle, SpecialReporter0ArgsLinkP, SpecialCommandCreateTurtle, SpecialCommandCreateLink, SpecialCommandCreateTurtlePossible,
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
 } from './../lang.terms.js';
/** BreedStatementRules: Rules for matching breed statements. */
export const BreedStatementRules = [
    {
        Match: /^(.*?)-own$/,
        Singular: false,
        Tag: Own,
        Type: undefined,
        Position: 0,
        String: ['<breed>-own'],
        Context: new AgentContexts('O---'),
        isCommand: false,
    },
    {
        Match: /^(.*?)-(at)$/,
        Singular: false,
        Tag: SpecialReporter2ArgsTurtle,
        Type: BreedType.Turtle,
        Position: 0,
        String: ['<breed>-at'],
        Context: new AgentContexts('-TPL'),
        isCommand: false,
    },
    {
        Match: /^(.*?)-(here)$/,
        Singular: false,
        Tag: SpecialReporter0ArgsTurtle,
        Type: BreedType.Turtle,
        Position: 0,
        String: ['<breed>-here'],
        Context: new AgentContexts('-TP-'),
        isCommand: false,
    },
    {
        Match: /^(.*?)-(on)$/,
        Singular: false,
        Tag: SpecialReporter1ArgsTurtle,
        Type: BreedType.Turtle,
        Position: 0,
        String: ['<breed>-on'],
        Context: new AgentContexts('OTPL'),
        isCommand: false,
    },
    {
        Match: /^(in)-(.*?)-(from)$/,
        Singular: true,
        Tag: SpecialReporter1ArgsLink,
        Type: BreedType.UndirectedLink,
        Position: 1,
        String: ['in-<breed>-from'],
        Context: new AgentContexts('-T--'),
        isCommand: false,
    },
    {
        Match: /^(out)-(.*?)-(to)$/,
        Singular: true,
        Tag: SpecialReporter1ArgsLink,
        Type: BreedType.UndirectedLink,
        Position: 1,
        String: ['out-<breed>-to'],
        Context: new AgentContexts('-T--'),
        isCommand: false,
    },
    {
        Match: /^(out|in)-(.*?)-(neighbor\?)$/,
        Singular: true,
        Tag: SpecialReporter1ArgsLink,
        Type: BreedType.UndirectedLink,
        Position: 1,
        String: ['out-<breed>-neighbor?', 'in-<breed>-neighbor?'],
        Context: new AgentContexts('-T--'),
        isCommand: false,
    },
    {
        Match: /^(out|in)-(.*?)-(neighbors)$/,
        Singular: true,
        Tag: SpecialReporter0ArgsLink,
        Type: BreedType.UndirectedLink,
        Position: 1,
        String: ['out-<breed>-neighbors', 'in-<breed>-neighbors'],
        Context: new AgentContexts('-T--'),
        isCommand: false,
    },
    {
        Match: /^(my-in|my-out|my)-(.*?)$/,
        Singular: false,
        Tag: SpecialReporter0ArgsLinkP,
        Type: BreedType.UndirectedLink,
        Position: 1,
        String: ['my-out-<breed>', 'my-in-<breed>', 'my-<breed>'],
        Context: new AgentContexts('-T--'),
        isCommand: false,
    },
    {
        Match: /^(is)-(.*?)\?$/,
        Singular: true,
        Tag: SpecialReporter1ArgsBoth,
        Type: undefined,
        Position: 1,
        String: ['is-<breed>?'],
        Context: new AgentContexts('OTPL'),
        isCommand: false,
    },
    {
        Match: /^(create)-(.*?)-(to|from|with)$/,
        Singular: undefined,
        Tag: SpecialCommandCreateLink,
        Type: BreedType.UndirectedLink,
        Position: 1,
        String: ['create-<breed>-to', 'create-<breed>-with', 'create-<breed>-from'],
        Context: new AgentContexts('-T--'),
        isCommand: true,
    },
    {
        Match: /^(.*?)-(with|neighbor\?)$/,
        Singular: true,
        Tag: SpecialReporter1ArgsLink,
        Type: BreedType.UndirectedLink,
        Position: 0,
        String: ['<breed>-with', '<breed>-neighbor?'],
        Context: new AgentContexts('-T--'),
        isCommand: false,
    },
    {
        Match: /^(.*?)-(neighbors)$/,
        Singular: true,
        Tag: SpecialReporter0ArgsLink,
        Type: BreedType.UndirectedLink,
        Position: 0,
        String: ['<breed>-neighbors'],
        Context: new AgentContexts('-T--'),
        isCommand: false,
    },
    {
        Match: /^(create-ordered|create)-(.*?)$/,
        Singular: false,
        Tag: SpecialCommandCreateTurtle,
        Type: BreedType.Turtle,
        Position: 1,
        String: ['create-ordered-<breed>', 'create-<breed>'],
        Context: new AgentContexts('O---'),
        isCommand: true,
    },
    {
        Match: /^(hatch)-(.*?)$/,
        Singular: false,
        Tag: SpecialCommandCreateTurtle,
        Type: BreedType.Turtle,
        Position: 1,
        String: ['hatch-<breed>'],
        Context: new AgentContexts('-T--'),
        isCommand: true,
    },
    {
        Match: /^(sprout)-(.*?)$/,
        Singular: false,
        Tag: SpecialCommandCreateTurtle,
        Type: BreedType.Turtle,
        Position: 1,
        String: ['sprout-<breed>'],
        Context: new AgentContexts('--P-'),
        isCommand: true,
    },
];
/** MatchBreed: Check if the token is a breed reporter/command/variable. */
export function MatchBreed(token, context, guessing = false) {
    token = token.toLowerCase();
    // Check breed variables
    if (!guessing) {
        let breedVars = context.BreedVars;
        if (breedVars.has(token))
            return { Tag: Identifier, Valid: false };
        if (context.SingularBreeds.has(token)) {
            let plural = context.SingularToPlurals.get(token);
            var type = context.BreedTypes.get(plural);
            if (type == BreedType.Turtle)
                return { Tag: SpecialReporter1Args, Singular: token, Plural: plural, Valid: true };
            else
                return { Tag: SpecialReporter2Args, Singular: token, Plural: plural, Valid: true };
        }
    }
    // Check breed statements
    var valid = true;
    for (let rule of BreedStatementRules) {
        let match = token.match(rule.Match);
        if (match) {
            var name = match[rule.Position + 1];
            // Find the breed
            var isSingular = rule.Singular !== undefined ? rule.Singular : context.SingularBreeds.has(name);
            var singular, plural;
            if (isSingular) {
                singular = name;
                if (!context.SingularBreeds.has(name)) {
                    if (!guessing)
                        return { Tag: 0, Valid: false };
                    plural = getPluralName(name);
                    valid = false;
                }
                else {
                    plural = context.SingularToPlurals.get(name);
                }
            }
            else {
                plural = name;
                if (!context.PluralBreeds.has(name)) {
                    if (!guessing)
                        return { Tag: 0, Valid: false };
                    singular = getSingularName(name);
                    valid = false;
                }
                else {
                    singular = context.PluralToSingulars.get(name);
                }
            }
            // Check the type
            type = context.BreedTypes.get(plural);
            if (typeof type === 'undefined' && guessing)
                type = rule.Type; // Guess if needed
            if (type == BreedType.DirectedLink)
                type = BreedType.UndirectedLink;
            if (typeof rule.Type !== 'undefined' && type !== rule.Type)
                return { Tag: SpecialCommandCreateTurtlePossible, Valid: false };
            // Produce the prototype
            switch (type) {
                case BreedType.Turtle:
                    match[rule.Position + 1] = isSingular ? 'turtle' : 'turtles';
                    break;
                case BreedType.Patch:
                    match[rule.Position + 1] = isSingular ? 'patch' : 'patches';
                    break;
                case BreedType.UndirectedLink:
                    match[rule.Position + 1] = isSingular ? 'link' : 'links';
                    break;
            }
            // Return the result
            return {
                Rule: rule,
                Tag: rule.Tag,
                Plural: plural,
                Singular: singular,
                Context: rule.Context,
                Type: type,
                Valid: valid,
                Prototype: match.slice(1).join('-'),
            };
        }
    }
    return { Tag: 0, Valid: false };
}
/** GetAllBreedPrimitives: Get all breed primitives. */
export function GetAllBreedPrimitives(lintContext) {
    let all = [];
    for (let b of lintContext.Breeds.values()) {
        all.push(...GetBreedPrimitives(b));
    }
    return all;
}
/** GetBreedPrimitives: Get primitives for a specific breed. */
export function GetBreedPrimitives(b) {
    let all = [];
    if (b.BreedType == BreedType.Turtle || b.BreedType == BreedType.Patch) {
        if (b.BreedType == BreedType.Turtle) {
            all.push('hatch-' + b.Plural);
            all.push('sprout-' + b.Plural);
            all.push('create-' + b.Plural);
            all.push('create-ordered-' + b.Plural);
        }
        all.push(b.Plural + '-at');
        all.push(b.Plural + '-here');
        all.push(b.Plural + '-on');
        all.push('is-' + b.Singular + '?');
    }
    else {
        all.push('create-' + b.Plural + '-to');
        all.push('create-' + b.Singular + '-to');
        all.push('create-' + b.Plural + '-from');
        all.push('create-' + b.Singular + '-from');
        all.push('create-' + b.Plural + '-with');
        all.push('create-' + b.Singular + '-with');
        all.push('out-' + b.Singular + '-to');
        all.push('out-' + b.Singular + '-neighbors');
        all.push('out-' + b.Singular + '-neighbor?');
        all.push('in-' + b.Singular + '-from');
        all.push('in-' + b.Singular + '-neighbors');
        all.push('in-' + b.Singular + '-neighbor?');
        all.push('my-' + b.Plural);
        all.push('my-in-' + b.Plural);
        all.push('my-out-' + b.Plural);
        all.push(b.Singular + '-neighbor?');
        all.push(b.Singular + '-neighbors');
        all.push(b.Singular + '-with');
        all.push('is-' + b.Singular + '?');
    }
    return all;
}
/** getPluralName: Get the plural name of a breed. */
export const getPluralName = function (singular) {
    if (singular[singular.length - 1] == 's') {
        return singular + 'es';
    }
    else {
        return singular + 's';
    }
};
/** getSingularName: Get the singular name of a breed. */
export const getSingularName = function (plural) {
    if (plural[plural.length - 1] != 's') {
        return 'a-' + plural;
    }
    else {
        return plural.substring(0, plural.length - 1);
    }
};
