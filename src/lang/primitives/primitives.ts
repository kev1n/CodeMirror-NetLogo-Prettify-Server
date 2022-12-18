import { Primitive, NetLogoType, AgentContexts, Argument } from '../classes';
import { Commands } from './commands';
import { NLArgument, NLPrimitive, NLWPrimitive } from './nlstructures';
import { Reporters } from './reporters';
import { Completion } from '@codemirror/autocomplete';

/** Primitives: Managing all primitives.  */
export class Primitives {
  /** Metadata: The dictionary for metadata. */
  private Metadata: Map<string, Primitive> = new Map<string, Primitive>();
  /** SimpleArguments: The cache for simple arguments. */
  private SimpleArguments: Map<string, Argument> = new Map<string, Argument>();
  /** Extensions: The dictionary for extensions. */
  private Extensions: Map<string, Primitive[]> = new Map<string, Primitive[]>();
  /** ExtensionNames: The list for known extensions. */
  private ExtensionNames: string[] = [];

  /** ImportNLW: Import primitive metadatas from NLW. */
  public ImportNLW(Extension: string, Source: NLWPrimitive) {
    const Name = Source.name.toLowerCase();
    const Primitive = {
      Extension: Extension,
      Name: Name,
      LeftArgumentType: this.ConvertToArgument('unit'),
      RightArgumentTypes: this.ConvertToArguments(Source.argTypes),
      ReturnType: this.ConvertToArgument(Source.returnType),
      AgentContext: new AgentContexts(Source.agentClassString),
      Precedence: 0, // Needs to check with the actual code
    };
    this.Register(Extension, Primitive);
  }

  /** ImportNL: Import primitive metadatas from NetLogo. */
  public ImportNL(Extension: string, Source: NLPrimitive) {
    const Name = Source.name.toLowerCase();
    const Primitive = {
      Extension: Extension,
      Name: Name,
      LeftArgumentType: this.ConvertToArgument(Source.syntax.left),
      RightArgumentTypes: this.ConvertToArguments(Source.syntax.right),
      ReturnType: this.ConvertToArgument(Source.syntax.ret),
      Precedence: Source.syntax.precedence,
      AgentContext: new AgentContexts(Source.syntax.agentClassString),
      BlockContext: new AgentContexts(Source.syntax.blockAgentClassString),
      DefaultOption: Source.syntax.defaultOption,
      MinimumOption: Source.syntax.minimumOption,
      IsRightAssociative: Source.syntax.isRightAssociative,
      IntroducesContext: Source.syntax.introducesContext == 'true',
      CanBeConcise: Source.syntax.canBeConcise,
    };
    this.Register(Extension, Primitive);
  }
  /** Register: Register a primitive information. */
  public Register(Extension: string, Source: Primitive) {
    if (!this.Metadata.has(`${Extension}:${Source.Name}`)) {
      this.RegisterPrimitive(Extension, Source);
      this.Metadata.set(`${Extension}:${Source.Name}`, Source);
    }
  }
  /** RegisterPrimitive: Register a primitive for an extension. */
  private RegisterPrimitive(Extension: string, Primitive: Primitive) {
    if (this.ExtensionNames.indexOf(Extension) == -1)
      this.Extensions.set(Extension, []);
    this.Extensions.get(Extension)!.push(Primitive);
  }

  /** BuildInstance: Build a primitive manager instance. */
  public static BuildInstance(): Primitives {
    var Result = new Primitives();
    for (var Primitive of Reporters) Result.ImportNL('', Primitive);
    for (var Primitive of Commands) Result.ImportNL('', Primitive);
    return Result;
  }

  /** GetPrimitive: Get a primitive from an extension. */
  public GetPrimitive(Extension: string, Name: string): Primitive | null {
    return this.Metadata.get(`${Extension}:${Name}`) ?? null;
  }
  /** HasNPrimitive: Is there a named primitive. */
  public HasPrimitive(Extension: string, Name: string): boolean {
    return this.Metadata.has(`${Extension}:${Name}`);
  }
  /** GetNamedPrimitive: Get a named primitive. */
  public GetNamedPrimitive(FullName: string): Primitive | null {
    return this.Metadata.get(FullName) ?? null;
  }
  /** HasNamedPrimitive: Is there a named primitive. */
  public HasNamedPrimitive(FullName: string): boolean {
    return this.Metadata.has(FullName);
  }
  /** IsReporter: Is the primitive a reporter. */
  public IsReporter(Source: Primitive): boolean {
    return Source.ReturnType == this.SimpleArguments.get('unit');
  }
  /** GetExtensions: Get the names of extensions. */
  public GetExtensions(): string[] {
    return this.ExtensionNames;
  }
  /** GetCompletions: Get a proper completion list for primitives. */
  public GetCompletions(Extensions: string[]): Completion[] {
    var Results: Completion[] = [];
    for (var Primitive of this.Metadata.values()) {
      if (
        Primitive.Extension == '' ||
        Extensions.indexOf(Primitive.Extension) != -1
      )
        Results.push({
          label: Primitive.Name,
          type: this.IsReporter(Primitive) ? 'Reporter' : 'Command',
        });
    }
    return Results;
  }

  /** ConvertToArguments: Convert NetLogo arguments to our format. */
  private ConvertToArguments(Items: (string | NLArgument)[]): Argument[] {
    return Items.map((Item) => this.ConvertToArgument(Item));
  }
  /** ConvertToArgument: Convert a NetLogo argument to our format. */
  private ConvertToArgument(Item: string | NLArgument): Argument {
    if (typeof Item == 'string') {
      // Optimization to reduce memory allocation
      if (!this.SimpleArguments.has(Item)) {
        this.SimpleArguments.set(Item, {
          Types: [this.ConvertToType(Item)],
          CanRepeat: false,
          Optional: false,
        });
      }
      return this.SimpleArguments.get(Item)!;
    } else if (Item.type) {
      return {
        Types: [this.ConvertToType(Item.type)],
        CanRepeat: Item.isRepeatable,
        Optional: Item.isOptional ?? false,
      };
    } else {
      return {
        Types: Item.types?.map((i) => this.ConvertToType(i)) ?? [],
        CanRepeat: Item.isRepeatable,
        Optional: Item.isOptional ?? false,
      };
    }
  }
  /** ConvertType: Convert a NetLogo Type string to our format. */
  private ConvertToType(Type: string): NetLogoType {
    if (Type == 'unit') {
      return NetLogoType.Unit;
    } else if (Type == 'wildcard') {
      return NetLogoType.Wildcard;
    } else if (Type == 'string') {
      return NetLogoType.String;
    } else if (Type == 'number') {
      return NetLogoType.Number;
    } else if (Type == 'list') {
      return NetLogoType.List;
    } else if (Type == 'boolean') {
      return NetLogoType.Boolean;
    } else if (Type == 'agent') {
      return NetLogoType.Agent;
    } else if (Type == 'agentset' || Type.indexOf('agentset') > -1) {
      return NetLogoType.AgentSet;
    } else if (Type == 'commandblock') {
      return NetLogoType.CommandBlock;
    } else if (Type == 'nobody') {
      return NetLogoType.Nobody;
    } else if (Type == 'codeblock') {
      return NetLogoType.CodeBlock;
    } else if (Type == 'numberblock') {
      return NetLogoType.NumberBlock;
    } else if (Type == 'reporter') {
      return NetLogoType.Reporter;
    } else if (Type == 'turtle') {
      return NetLogoType.Turtle;
    } else if (Type == 'patch') {
      return NetLogoType.Patch;
    } else if (Type == 'link') {
      return NetLogoType.Link;
    } else if (Type == 'symbol') {
      return NetLogoType.Symbol;
    } else if (Type == 'linkset') {
      return NetLogoType.LinkSet;
    } else if (Type == 'reporterblock') {
      return NetLogoType.ReporterBlock;
    } else if (Type == 'booleanblock') {
      return NetLogoType.BooleanBlock;
    } else if (Type == 'command') {
      return NetLogoType.Command;
    } else {
      console.log('Unrecognized type: ' + Type);
      return NetLogoType.Other;
    }
  }
}

/** PrimitiveManager: The Singleton Instance. */
export const PrimitiveManager = Primitives.BuildInstance();

/** Export classes globally. */
try {
  (window as any).PrimitiveManager = Primitives;
} catch (error) {}
