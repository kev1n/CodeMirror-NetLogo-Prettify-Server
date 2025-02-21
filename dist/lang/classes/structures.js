/** NetLogoType: Types that are available in NetLogo. */
// Maybe we need to add command blocks & anonymous procedures
export var NetLogoType;
(function (NetLogoType) {
    NetLogoType[NetLogoType["Unit"] = 0] = "Unit";
    NetLogoType[NetLogoType["Wildcard"] = 1] = "Wildcard";
    NetLogoType[NetLogoType["String"] = 2] = "String";
    NetLogoType[NetLogoType["Number"] = 3] = "Number";
    NetLogoType[NetLogoType["List"] = 4] = "List";
    NetLogoType[NetLogoType["Boolean"] = 5] = "Boolean";
    NetLogoType[NetLogoType["Agent"] = 6] = "Agent";
    NetLogoType[NetLogoType["AgentSet"] = 7] = "AgentSet";
    NetLogoType[NetLogoType["Nobody"] = 8] = "Nobody";
    NetLogoType[NetLogoType["Turtle"] = 9] = "Turtle";
    NetLogoType[NetLogoType["Patch"] = 10] = "Patch";
    NetLogoType[NetLogoType["Link"] = 11] = "Link";
    NetLogoType[NetLogoType["CommandBlock"] = 12] = "CommandBlock";
    NetLogoType[NetLogoType["CodeBlock"] = 13] = "CodeBlock";
    NetLogoType[NetLogoType["NumberBlock"] = 14] = "NumberBlock";
    NetLogoType[NetLogoType["Reporter"] = 15] = "Reporter";
    NetLogoType[NetLogoType["Symbol"] = 16] = "Symbol";
    NetLogoType[NetLogoType["LinkSet"] = 17] = "LinkSet";
    NetLogoType[NetLogoType["ReporterBlock"] = 18] = "ReporterBlock";
    NetLogoType[NetLogoType["BooleanBlock"] = 19] = "BooleanBlock";
    NetLogoType[NetLogoType["Command"] = 20] = "Command";
    NetLogoType[NetLogoType["Other"] = 21] = "Other";
})(NetLogoType = NetLogoType || (NetLogoType = {}));
/** AgentContexts: Agent contexts of a primitive. */
export class AgentContexts {
    /** Parse an agent-context string. */
    constructor(Input) {
        this.Observer = true;
        this.Turtle = true;
        this.Patch = true;
        this.Link = true;
        if (!Input)
            return;
        if (Input == '?') {
            this.Observer = false;
            return;
        }
        if (Input[0] != 'O')
            this.Observer = false;
        if (Input[1] != 'T')
            this.Turtle = false;
        if (Input[2] != 'P')
            this.Patch = false;
        if (Input[3] != 'L')
            this.Link = false;
    }
}
/** Breed: Dynamic metadata of a single breed. */
export class Breed {
    /** Build a breed. */
    constructor(Singular, Plural, Variables, BreedType) {
        this.Singular = Singular;
        this.Plural = Plural;
        this.Variables = Variables;
        this.BreedType = BreedType;
    }
}
/** BreedType: Type of the breed. */
export var BreedType;
(function (BreedType) {
    BreedType[BreedType["Turtle"] = 0] = "Turtle";
    BreedType[BreedType["Patch"] = 1] = "Patch";
    BreedType[BreedType["UndirectedLink"] = 2] = "UndirectedLink";
    BreedType[BreedType["DirectedLink"] = 3] = "DirectedLink";
})(BreedType = BreedType || (BreedType = {}));
/** Procedure: Dynamic metadata of a procedure. */
export class Procedure {
    constructor() {
        /** Name: The name of the procedure. */
        this.Name = '';
        /** Arguments: The arguments of the procedure. */
        this.Arguments = [];
        /** Variables: Local variables defined within the procedure. */
        this.Variables = [];
        /** AnonymousProcedures: Anonymous procedures defined for the procedure. */
        this.AnonymousProcedures = [];
        /** PositionStart: The starting position of the procedure in the document. */
        this.PositionStart = 0;
        /** PositionEnd: The end position of the procedure in the document. */
        this.PositionEnd = 0;
        /** IsCommand: Is the procedure a command (to) instead of a reporter (to-report)? */
        this.IsCommand = false;
        /** IsCommand: Is the procedure anonymous? */
        this.IsAnonymous = false;
        /** Context: The possible contexts for the procedure. */
        this.Context = new AgentContexts();
        /** CodeBlocks: Code blocks within the procedure. */
        this.CodeBlocks = [];
    }
}
/** CodeBlock: Dynamic metadata of a code block. */
export class CodeBlock {
    constructor() {
        /** PositionStart: The position at the start of the code block. */
        this.PositionStart = 0;
        /** PositionEnd: The position at the end of the code block. */
        this.PositionEnd = 0;
        /** Context: The possible contexts for the code block */
        this.Context = new AgentContexts();
        /** CodeBlocks: Code blocks within the code block. */
        this.CodeBlocks = [];
        /** Variables: Local variables defined within the code block. */
        this.Variables = [];
        /** Arguments: The arguments accessible within the code block. */
        this.Arguments = [];
        /** AnonymousProcedures: Anonymous procedures defined within the code block. */
        this.AnonymousProcedures = [];
        /** Primitive: the primitive that created the codeblock. */
        this.Primitive = '';
        /** Breed: the breed in the primitive that created the codeblock (if present). */
        this.Breed = null;
        /** InheritParentContext: whether context needs to match parent context. */
        this.InheritParentContext = false;
    }
}
/** Procedure: Dynamic metadata of an anonymous procedure. */
export class AnonymousProcedure {
    constructor() {
        /** PositionStart: The position at the start of the procedure. */
        this.PositionStart = 0;
        /** PositionEnd: The position at the end of the procedure. */
        this.PositionEnd = 0;
        /** Arguments: The arguments of the procedure. */
        this.Arguments = [];
        /** Variables: Local variables defined within the procedure. */
        this.Variables = [];
    }
}
/** LocalVariable: metadata for local variables */
export class LocalVariable {
    /** Build a local variable. */
    constructor(Name, Type, CreationPos) {
        this.Name = Name;
        this.Type = Type;
        this.CreationPos = CreationPos;
    }
}
/** ContextError: Error caused by context conflict. */
export class ContextError {
    /** Constructor: Build a context error. */
    constructor(From, To, PriorContext, ConflictingContext, Primitive) {
        this.From = From;
        this.To = To;
        this.PriorContext = PriorContext;
        this.ConflictingContext = ConflictingContext;
        this.Primitive = Primitive;
    }
}
