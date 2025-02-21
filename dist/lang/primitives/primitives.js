import { NetLogoType } from '../classes/structures';
import { Dataset } from './dataset';
/** Primitives: Managing all primitives.  */
export class Primitives {
    constructor() {
        /** Metadata: The dictionary for metadata. */
        this.Metadata = new Map();
        /** Extensions: The dictionary for extensions. */
        this.Extensions = new Map();
        /** ExtensionNames: The list for known extensions. */
        this.ExtensionNames = [];
    }
    /** Register: Register a primitive information. */
    Register(Extension, Source) {
        var FullName = Extension == '' ? Source.Name : `${Extension}:${Source.Name}`;
        if (!this.Metadata.has(FullName)) {
            if (this.ExtensionNames.indexOf(Extension) == -1) {
                this.ExtensionNames.push(Extension);
                this.Extensions.set(Extension, []);
            }
            this.Extensions.get(Extension).push(Source);
            this.Metadata.set(FullName, Source);
        }
    }
    /** BuildInstance: Build a primitive manager instance. */
    static BuildInstance() {
        var Result = new Primitives();
        Dataset.forEach((Primitive) => {
            Result.Register(Primitive.Extension, Primitive);
            // if((Primitive.DefaultOption??-1)>=0 && (Primitive.MinimumOption??-1)>=0){
            //   console.log(Primitive.Name,Primitive.DefaultOption,Primitive.MinimumOption,Primitive.ReturnType.Types[0] != NetLogoType.Unit)
            // }
        });
        return Result;
    }
    /** GetPrimitive: Get a primitive from an extension. */
    GetPrimitive(Extension, Name) {
        var FullName = Extension == '' ? Name : `${Extension}:${Name}`;
        return this.Metadata.get(FullName) ?? null;
    }
    /** HasNPrimitive: Is there a named primitive. */
    HasPrimitive(Extension, Name) {
        var FullName = Extension == '' ? Name : `${Extension}:${Name}`;
        return this.Metadata.has(FullName);
    }
    /** GetNamedPrimitive: Get a named primitive. */
    GetNamedPrimitive(FullName) {
        return this.Metadata.get(FullName) ?? null;
    }
    /** HasNamedPrimitive: Is there a named primitive. */
    HasNamedPrimitive(FullName) {
        return this.Metadata.has(FullName);
    }
    /** IsReporter: Is the primitive a reporter. */
    IsReporter(Source) {
        return Source.ReturnType.Types[0] != NetLogoType.Unit;
    }
    /** GetExtensions: Get the names of extensions. */
    GetExtensions() {
        return this.ExtensionNames;
    }
    /** GetCompletions: Get a proper completion list for primitives. */
    GetCompletions(Extensions) {
        var Results = [];
        for (var Primitive of this.Metadata.values()) {
            if (Primitive.Extension == '' || Extensions.indexOf(Primitive.Extension) != -1) {
                var Name = Primitive.Name;
                if (Primitive.Extension != '')
                    Name = `${Primitive.Extension}:${Name}`;
                Results.push({
                    label: Name,
                    type: this.IsReporter(Primitive) ? 'Reporter' : 'Command',
                });
            }
        }
        return Results;
    }
}
/** PrimitiveManager: The Singleton Instance. */
export const PrimitiveManager = Primitives.BuildInstance();
/** Export classes globally. */
try {
    window.PrimitiveManager = Primitives;
}
catch (error) { }
