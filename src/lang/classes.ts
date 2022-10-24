/** Primitive: Static metadata of a single NetLogo primitive. */
// Seems that there are some exceptions such as 
export class Primitive {
    /** Extension: Where the primitive belongs to. */
    public Extension: string;
    /** Name: Name of the primitive. */
    public Name: string;
    /** ArgumentTypes: Argument types of the primitive. */
    public ArgumentTypes: NetLogoType[];
    /** ReturnType: Return type of the primitive. */
    public ReturnType: NetLogoType;
}

/** NetLogoType: Types that are available in NetLogo. */
// Maybe we need to add command blocks & anonymous procedures
export enum NetLogoType {
    Unit = 0, // = Void
    Wildcard = 1, // = Any
    String = 2,
    Number = 3,
    List = 4,
    Boolean = 5
}

/** Breed: Dynamic metadata of a single breed. */
export class Breed {
    /** Singular: The singular name of the breed. */
    public Singular: string;
    /** Plural: The plural name of the breed. */
    public Plural: string;
    /** Variables: Variables defined for the breed. */
    public Variables: string[];
}