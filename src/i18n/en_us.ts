const en_us: Record<string, Function> = {
  // Buttons
  Add: () => 'Add',

  // Linting messages
  'Unrecognized breed name _': (Name: string) =>
    `Cannot recognize the breed name "${Name}". Did you define it at the beginning?`,
  'Unrecognized identifier _': (Name: string) =>
    `Nothing called "${Name}" was found. Did you forget to define it?`,
  'Unrecognized global statement _': (Name: string) =>
    `Cannot recognize "${Name}" as a proper global statement here. Did you spell it correctly?`,
  'Unrecognized statement _': (Name: string) =>
    `Cannot recognize "${Name}" as a piece of NetLogo code. Did you put it in the correct place?`,
  'Unsupported statement _': (Name: string) =>
    `"${Name}" is not supported in this version of NetLogo, so linting may be incorrect.`,
  'Invalid for Normal mode _': (Value: string) =>
    `This editor mode expects a full NetLogo model.`,
  'Invalid for Embedded mode _': (Value: string) =>
    `This editor mode expects a few command statements.`,
  'Invalid for Oneline mode _': (Value: string) =>
    `This editor mode expects command statements or a single reporter statement.`,
  'Invalid for OnelineReporter mode _': (Value: string) =>
    `This editor mode expects a single reporter statement.`,
  'Problem identifying primitive _. Expected _, found _.': (
    Name: string,
    Expected: string,
    Actual: string
  ) =>
    `"${Name}" is not a valid primitive. Expected ${Expected} but found ${Actual}.`,
  'Left args for _. Expected _, found _.': (
    Name: string,
    Expected: string,
    Actual: string
  ) =>
    `"${Name}" expects ${Expected} left argument(s). ${Actual} argument(s) found.`,
  'Too few right args for _. Expected _, found _.': (
    Name: string,
    Expected: string,
    Actual: string
  ) =>
    `"${Name}" expects at least ${Expected} right argument(s). ${Actual} argument(s) found.`,
  'Too many right args for _. Expected _, found _.': (
    Name: string,
    Expected: string,
    Actual: string
  ) =>
    `"${Name}" expects at most ${Expected} right argument(s). ${Actual} argument(s) found.`,
  'Missing extension _.': (Name: string) =>
    `Seems that you need to put "${Name}" in the "extensions" section. Do you want to do that now?`,
  'Unsupported missing extension _.': (Name: string) =>
    `"${Name}" is missing in the "extensions" section; this extension might not yet be supported by this version of NetLogo.`,
  'Unsupported extension _.': (Name: string) =>
    `The extension "${Name}" is not supported in this editor.`,
  'Term _ already used.': (Name: string) =>
    `"${Name}" is already used. Try a different name.`,
  'Invalid breed procedure _': (Name: string) =>
    `It seems that you forgot to declare "${Name}" as a breed. Do you want to do that now?`,
  'Missing command before _': (Name: string) =>
    `The statement "${Name}" needs to start with a command. What do you want to do with it?`,
  'Improperly placed procedure _': (Name: string) =>
    `The procedure "${Name}" cannot be written prior to global statements. Do you want to move the procedure?`,
  'Unmatched item _': (Current: string, Expected: string) =>
    `This "${Current}" needs a matching ${Expected}.`,
  'Invalid context _.': (Prior: string, New: string, Primitive: string) =>
    `Based on preceding statements, the context of this codeblock is "${Prior}", but "${Primitive}" has a "${New}" context.`,
  'Duplicate global statement _': (Name: string) =>
    `The global "${Name}" statement is already defined. Do you want to combine into one?`,
  'Infinite loop _': (Name: string) =>
    `This "${Name}" loop will run forever and likely block the model. Do you want to re-write into a "go" loop?`,
  'Argument is reserved _': (Name: string) =>
    `The argument "${Name}" is a reserved NetLogo keyword. Do you want to replace it?`,
  'Argument is invalid _': (Name: string) =>
    `The argument "${Name}" is invalid. Do you want to replace it?`,

  // Agent types
  Observer: () => 'Observer',
  Turtle: () => 'Turtle',
  Turtles: () => 'Turtles',
  Patch: () => 'Patch',
  Patches: () => 'Patches',
  Link: () => 'Link',
  Links: () => 'Links',
  Utility: () => 'Utility',

  // Help messages
  '~VariableName': (Name: string) => `A (unknown) variable. `,
  '~ProcedureName': (Name: string) => `The name of a procedure. `,
  '~Arguments': (Name: string) => `The name of an argument. `,
  '~PatchVar': (Name: string) => `A built-in variable for every patch. `,
  '~TurtleVar': (Name: string) => `A built-in variable for every turtle. `,
  '~LinkVar': (Name: string) => `A built-in variable for every link. `,
  '~Reporter': (Name: string) => `A NetLogo reporter. `,
  '~Command': (Name: string) => `A NetLogo command. `,
  '~Constant': (Name: string) => `A NetLogo constant. `,
  '~Extension': (Name: string) => `A NetLogo extension. `,
  '~Numeric': (Name: string) => `A number. `,
  '~String': (Name: string) => `A string, which is a sequence of characters.`,
  '~LineComment': (Name: string) =>
    `Comments do nothing in the program, but could help others read the code. `,
  '~Globals/Identifier': (Name: string) => `A code-defined global variable. `,
  '~WidgetGlobal': (Name: string) => `A widget-defined global variable. `,
  '~BreedVars/Identifier': (Name: string) =>
    `A model-defined variable for a breed. `,
  '~BreedPlural': (Name: string) =>
    `The plural name of a model-defined breed. `,
  '~BreedSingular': (Name: string) =>
    `The singular name of a model-defined breed. `,
  '~BreedVariable': (Name: string) =>
    `A custom variable for the "${Name}" breed. `,
  '~LocalVariable': (Name: string) =>
    `A local variable within the "${
      Name.includes('{anonymous}') ? '{anonymous}' : Name
    }" procedure or reporter. `,
  '~BreedReporter': (Name: string) => `A reporter for the "${Name}" breed. `,
  '~CustomReporter': (Name: string) => `A user-defined reporter. `,
  '~BreedCommand': (Name: string) => `A command for the "${Name}" breed. `,
  '~CustomCommand': (Name: string) => `A user-defined command. `,

  // Chat and AI assistant
  Reconnect: () => `Reconnect`,
  RunCode: () => `Run Code`,
  'Trying to run the code': () => `Trying to run the code...`,
  FixCode: () => `Fix Code`,
  AskCode: () => `Ask a Question`,
  AddCode: () => `Add to Project`,
  'Trying to add the code': () => `Trying to add the code to the project...`,
  PreviousVersion: () => `Back`,
  NextVersion: () => `Next`,
  'Expand messages _': (Number: number) => `Expand ${Number} messages`,
  FullText: () => `Read more`,
  SeeAlso: () => `See also`,
  OK: () => `OK`,
  Cancel: () => `Cancel`,

  // Editor interfaces
  MoreFeatures: () => 'More features',
  SelectAll: () => 'Select all',
  Undo: () => 'Undo',
  Redo: () => 'Redo',
  JumpToLine: () => 'Jump to line',
  JumpToProcedure: () => 'Jump to procedure',
  'There is no procedure': () => 'There is no procedure in the code.',
  Prettify: () => 'Prettify',
  ResetCode: () => 'Reset code',
  'Do you want to reset the code': () =>
    'Do you want to reset the code to the last successful compilation?',

  // Chat and execution messages
  'Connection to server failed _': (Error: string) =>
    `Sorry, the connection to our server failed. Code ${Error}.`,
  'Summary of request': () => `Below is a summary of my request: `,
  'We need to fix the following errors _': (Number: number) =>
    `Sorry, but we need to fix the ${Number} errors in the code (marked with ___red squiggly lines___) before continuing.`,
  'Successfully executed': () => `Successfully executed the code.`,
  'Successfully compiled': () =>
    `Successfully compiled the code. We can run them now!`,
  'Runtime error _': (Error: string) =>
    `Sorry, the code failed to run: ${Error}`,
  'Compile error _': (Error: string) =>
    `Sorry, I cannot understand the code: ${Error}`,
  'Compile error in snippet _': (Number: number) =>
    `Sorry, there are still ${Number} errors in the code snippet.`,
  'Compile error unknown': (Number: number) =>
    `Sorry, there is an unknown error. Please report it as a bug.`,
  'Showing full text help of _': (Name: string) =>
    `Here is the help information of [${Name}](<observer=help ${Name} -full>).`,
  'Please download Turtle Universe': () =>
    `The feature is unavailable in Web Preview. Please download [Turtle Universe](https://www.turtlesim.com/products/turtle-universe/) to continue.`,

  // Default messages
  'Command center welcome (user)': () =>
    `What is here about? Where should I start with?`,
  'Command center welcome (command)': () =>
    `Here is the command center. You can type in NetLogo code and run it here, but there is always more to explore. Here are something you can try out.`,
  'Command center welcome (assistant)': () =>
    `Hello! I am your assistant. I can help you learn NetLogo or build your own project, but there is always more to explore. Here are something you can try out.`,
  'Run NetLogo code directly': () => `Run **NetLogo** code directly`,
  'Check out the code tab': () => `Check out the **code** tab of the project`,
  'Talk to the computer in natural languages': () =>
    `Talk to the computer in **natural languages**`,
  'Look for the documentation': () =>
    `Look for the **learning materials** of NetLogo`,
};

export { en_us };
