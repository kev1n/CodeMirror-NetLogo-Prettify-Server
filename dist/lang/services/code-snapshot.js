/** GetProcedureCode: Get the code of a procedure. */
export function GetProcedureCode(Snapshot, Procedure) {
    return Snapshot.Code.substring(Procedure.PositionStart, Procedure.PositionEnd);
}
/** BuildSnapshot: Build a snapshot of the code. */
export function BuildSnapshot(Galapagos) {
    Galapagos.UpdateContext();
    // Here, we only care about the current snippet, not the entire shared context
    var State = Galapagos.GetState();
    // Get the components
    var Code = Galapagos.GetCode();
    var Extensions = State.Extensions;
    var Globals = State.Globals;
    // Get the breeds
    var Breeds = new Map();
    for (var [Singular, Breed] of State.Breeds) {
        Breeds.set(Singular, JSON.parse(JSON.stringify(Breed)));
    }
    // Get the procedures
    var Procedures = new Map();
    for (var [Name, Procedure] of State.Procedures) {
        Procedures.set(Name, JSON.parse(JSON.stringify(Procedure)));
    }
    // Return the snapshot
    return { Code, Extensions, Globals, Breeds, Procedures };
}
/** IntegrateSnapshot: Integrate a snapshot into the code. */
export function IntegrateSnapshot(Galapagos, Snapshot) {
    // Haven't decided about procedures yet
    // Integrate the breeds
    for (var [Singular, Breed] of Snapshot.Breeds) {
        Galapagos.Operations.AppendBreed(Breed.BreedType, Breed.Plural, Breed.Singular);
    }
    for (var [Singular, Breed] of Snapshot.Breeds) {
        Galapagos.Operations.AppendBreedVariables(Breed.Plural, Breed.Variables);
    }
    // Integrate the extensions
    Galapagos.Operations.AppendGlobals('Extensions', Snapshot.Extensions);
    // Integrate the globals
    Galapagos.Operations.AppendGlobals('Globals', Snapshot.Globals);
}
