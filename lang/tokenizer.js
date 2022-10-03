import { ExternalTokenizer } from "@lezer/lr"
import { directives, commands, extensions, reporters, turtleVars, patchVars, linkVars, constants, unsupported } from "./keywords.js"
import { Directives, Commands, Extensions, Reporters, TurtleVars, PatchVars, LinkVars, Constants, Unsupported, Identifier } from "./lang.terms.js"

// Keyword tokenizer
export const keyword = new ExternalTokenizer(input => {
    let token = "";
    // Find until the token is complete
    while (isValidKeyword(input.next)) {
        token += String.fromCharCode(input.next).toLowerCase();
        input.advance();
    }
    if (token == "") return;
    // Find if the token belongs to any category
    if (directives.indexOf(token) != -1) {
        input.acceptToken(Directives);
    } else if (commands.indexOf(token) != -1) {
        input.acceptToken(Commands);
    } else if (extensions.indexOf(token) != -1) {
        input.acceptToken(Extensions);
    } else if (reporters.indexOf(token) != -1) {
        input.acceptToken(Reporters);
    } else if (turtleVars.indexOf(token) != -1) {
        input.acceptToken(TurtleVars)
    } else if (patchVars.indexOf(token) != -1) {
        input.acceptToken(PatchVars);
    } else if (linkVars.indexOf(token) != -1) {
        input.acceptToken(LinkVars);
    } else if (constants.indexOf(token) != -1) {
        input.acceptToken(Constants);
    } else if (unsupported.indexOf(token) != -1) {
        input.acceptToken(Unsupported);
    } else {
        input.acceptToken(Identifier);
    }
});

// Check if the character is valid for a keyword. 
function isValidKeyword(ch) {
    // 0-9
    return ch >= 48 && ch <= 58 
    // -
    || ch == 45 
    // _
    || ch == 95 
    // A-Z
    || ch >= 63 && ch <= 90 
    // a-z
    || ch >= 97 && ch <= 122 
    // non-English characters
    || ch>=128 && ch <=154 
    || ch>= 160 && ch<= 165 
    || ch>=181 && ch <=183 
    || ch>=210 && ch<=216 
    || ch>=224 && ch<=237
}