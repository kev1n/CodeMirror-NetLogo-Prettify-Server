import { syntaxTree } from '@codemirror/language';
import { Diagnostic } from '@codemirror/lint';
import { Localized } from '../../editor';
import { Linter } from './linter-builder';
import {
  checkBreedLike,
  getBreedName,
  getPluralName,
  getSingularName,
} from '../../codemirror/utils/breed-utils';
import {
  checkValidIdentifier,
  getCheckContext,
} from './utils/check-identifier';
import { Log } from '../../codemirror/utils/debug-utils';
import { AddBreedAction } from './utils/actions';
import { BreedType } from '../classes/structures';

// IdentifierLinter: Checks anything labelled 'Identifier'
export const IdentifierLinter: Linter = (
  view,
  preprocessContext,
  lintContext
) => {
  const diagnostics: Diagnostic[] = [];
  const context = getCheckContext(view, lintContext, preprocessContext);
  syntaxTree(view.state)
    .cursor()
    .iterate((noderef) => {
      if (noderef.name == 'Identifier') {
        const Node = noderef.node;
        const value = view.state.sliceDoc(noderef.from, noderef.to);

        //check if it meets some initial criteria for validity
        if (!checkValidIdentifier(Node, value, context)) {
          //check if the identifier looks like a breed procedure (e.g. "create-___")
          let result = checkBreedLike(value);
          if (!result.found) {
            //console.log(value, noderef.name, noderef.node.parent?.name);
            diagnostics.push({
              from: noderef.from,
              to: noderef.to,
              severity: 'error',
              message: Localized.Get('Unrecognized identifier _', value),
            });
          } else {
            //pull out name of possible intended breed
            let breedinfo = getBreedName(value);
            Log(breedinfo);
            if (!context.breedNames.includes(breedinfo.breed)) {
              let actions: any[] = [];
              let plural = '';
              let singular = '';
              if (breedinfo.isPlural) {
                plural = breedinfo.breed;
                singular = getSingularName(breedinfo.breed);
              } else {
                singular = breedinfo.breed;
                plural = getPluralName(breedinfo.breed);
              }
              actions.push(
                AddBreedAction(
                  breedinfo.isLink
                    ? BreedType.UndirectedLink
                    : BreedType.Turtle,
                  plural,
                  singular
                )
              );
              diagnostics.push({
                from: noderef.from,
                to: noderef.to,
                severity: 'error',
                message: Localized.Get(
                  'Unrecognized breed name _',
                  breedinfo.breed
                ),
                actions: actions,
              });
            }
          }
        }
      }
      // else if (
      //   noderef.name == 'Arg' &&
      //   noderef.node.prevSibling &&
      //   view.state
      //     .sliceDoc(noderef.node.prevSibling.from, noderef.node.prevSibling.to)
      //     .toLowerCase() == 'ask'
      // ) {
      //   let value = view.state.sliceDoc(noderef.from, noderef.to).toLowerCase();
      //   if (!lintContext.GetPluralBreedNames().includes(value)) {
      //     let plural = value;
      //     let singular = otherBreedName(value, true);
      //     let breed_type = 'breed';
      //     diagnostics.push({
      //       from: noderef.from,
      //       to: noderef.to,
      //       severity: 'error',
      //       message: Localized.Get('Unrecognized breed name _', value),
      //       actions: [
      //         getAction(noderef.node, value, breed_type, plural, singular),
      //       ],
      //     });
      //   }
      //   return false;
      // }
    });
  return diagnostics;
};
