import { WidgetType, EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { Range } from '@codemirror/rangeset';
import ColorPicker from '@netlogo/netlogo-color-picker';
import * as colors from '@netlogo/netlogo-color-picker/dist/helpers/colors';

var savedColors: number[][] = [];

/**  extractRGBValues: takes an rgb string andr returns an rgba array*/
function extractRGBValues(rgbString: string) {
  const regex = /rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d{1,3}|\d\.\d+))?\)/;
  const match = rgbString.match(regex);
  if (match) {
    let values = match.slice(1, 4).map(Number);
    // Check if the alpha value exists; if not, default to 255
    const alpha = match[4] === undefined ? 255 : Number(match[4]);
    values.push(alpha);
    return values;
  }
  return [];
}

/** ColorPickerWidget: Defines a ColorPicker widget of WidgetType */
class ColorPickerWidget extends WidgetType {
  private color: string; // color of the section associated with the widget
  private length: number; // length of the color section associated with the widget
  /** colorType: the representation of the color:
   * 'compound' --> netlogo compound color ( red + 5 )
   * 'numeric' --> netlogo color numeric value: ( 45 )
   * 'array' --> rgba or rgb values : [25 13 12], [25 89 97 24]
   */
  private colorType: string;

  constructor(color: string, length: number, type: string) {
    super();
    this.color = color;
    this.length = length;
    this.colorType = type;
  }

  getColor(): string {
    return this.color;
  }

  getLength(): number {
    return this.length;
  }

  getColorType(): string {
    return this.colorType;
  }

  /** toDOM: defines the DOM appearance of the widget. Not connected to the widget as per CodeMirror documentation */
  toDOM() {
    let wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = 'cp-widget-wrap';
    wrap.style.position = 'relative';
    wrap.style.display = 'inline-block';

    let box = wrap.appendChild(document.createElement('div'));
    box.style.width = '0.5rem';
    box.style.height = '0.5rem';
    box.style.border = '1px solid gray';
    box.style.borderRadius = '20%';
    box.style.backgroundColor = this.color;
    box.style.display = 'inline-block';
    box.style.marginLeft = '0.3rem';
    box.style.marginRight = '0.3rem';
    box.style.verticalAlign = 'middle';
    box.classList.add('cp-widget-box');

    // overlay an invisible div to increase clickable area
    let clickable = wrap.appendChild(document.createElement('div'));
    clickable.style.position = 'absolute';
    clickable.style.top = '0';
    clickable.style.left = '0.125rem';
    clickable.style.border = '1rem solid transparent'; // we can adjust this to make it more or less sensitive
    clickable.style.top = '50%';
    clickable.style.left = '50%';
    clickable.style.transform = 'translate(-50%, -50%)';
    clickable.style.cursor = 'pointer';
    // * default color picker widget should be uninteractable  */
    wrap.style.pointerEvents = 'none';
    return wrap;
  }

  ignoreEvent(event: Event): boolean {
    return false;
  }
}

/** testValidColor: returns the color of a SyntaxNode's text as rgba string. If the text is not a valid color, returns an empty string  */
function testValidColor(content: string): string[] {
  content = content.trim();
  if (!content) return [''];

  // Check if it's a netlogo numeric color
  let number = Number(content);
  if (!isNaN(number) && number >= 0 && number < 140) return [colors.netlogoToRGB(number), 'numeric'];

  // Check if it's one of the constants base color
  if (colors.baseColorsToRGB[content]) return [colors.baseColorsToRGB[content], 'compound'];

  // Check if it is of the form `rgb <num> <num> <num>`
  const rgbRegex = /^rgb\s+(\d+)\s+(\d+)\s+(\d+)$/i;
  const rgbMatch = content.match(rgbRegex);
  if (rgbMatch) {
    const [_, r, g, b] = rgbMatch;
    const rgbValues = [Number(r), Number(g), Number(b)];
    if (rgbValues.every((v) => v >= 0 && v <= 255)) {
      return [`rgb(${rgbValues.join(',')})`, 'rgbFn'];
    }
  }

  // Check if it's of form array
  let arrAsRGB = colors.netlogoArrToRGB(content);
  if (arrAsRGB) {
    const colorType = arrAsRGB.startsWith('rgba') ? 'rgbaArr' : 'rgbArr';
    return [arrAsRGB, colorType];
  }

  // catch all that should never happen
  return [colors.compoundToRGB(content), 'compound'];
}

/** colorWidgets: Parses the visibleRange of the editor looking for colorWidget positions  */
function colorWidgets(view: EditorView, posToWidget: Map<number, ColorPickerWidget>) {
  let widgets: Range<Decoration>[] = [];
  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name == 'VariableName') {
          let nodeStr = view.state.doc.sliceString(node.from, node.to);
          if (nodeStr.includes('color')) {
            let sibling = node.node.nextSibling;
            // check if node color is valid
            if (sibling) {
              console.log('this color ' + view.state.doc.sliceString(sibling.from, sibling.to));
              let color: string[] = testValidColor(view.state.doc.sliceString(sibling.from, sibling.to)); // [<color as rgb>, <color type>]
              if (color[0] == '') {
                return;
              }
              // if the color is a compound color, make sure to split by whitespace if it exists
              let color_end = sibling.to;
              let color_start = sibling.from;
              if (color[1] == 'compound') {
                let colorStr = view.state.doc.sliceString(sibling.from, sibling.to);
                let colorStrArr = colorStr.split(' ');
                // get the first number before the space
                if (colorStrArr.length > 3) {
                  let spaceIndex = colorStr.indexOf(colorStrArr[2]);
                  // there is a space, so we should ignore it, account for the length of the number as well
                  color_end = sibling.from + spaceIndex + colorStrArr[2].length;
                }
              }
              let cpWidget = new ColorPickerWidget(color[0], color_end - color_start, color[1]);
              let deco = Decoration.widget({
                widget: cpWidget,
                side: 1,
              });
              widgets.push(deco.range(color_end));
              // add widget to the hashmap
              posToWidget.set(sibling.to, cpWidget);
            }
          }
        }
      },
    });
  }
  return Decoration.set(widgets);
}

/** intializeCP: creates an instance of a ColorPicker */
function initializeCP(
  view: EditorView,
  pos: number,
  widget: ColorPickerWidget,
  OnColorPickerCreate?: (cpDiv: HTMLElement) => void
): number {
  // check for color picker existence
  const cpExist = document.querySelector('#colorPickerDiv');
  if (cpExist) {
    return -1;
  }
  // create a div to hold the color picker
  let cpDiv = document.createElement('div');
  document.body.appendChild(cpDiv);

  /** findCPPos: finds the pos where the cpDiv should be. The cp div should be in the top left corner of the window viewport, so a flexbox can center the color picker right in the center of the viewport **/
  const findAndSetCP = function () {
    cpDiv.id = 'colorPickerDiv';
    cpDiv.style.position = 'absolute';
    cpDiv.style.display = 'flex';
    cpDiv.style.justifyContent = 'center';
    cpDiv.style.alignItems = 'center';
    // first find the coordinate of the top left point in your viewport
    const x = window.scrollX || document.documentElement.scrollLeft;
    const y = window.scrollY || document.documentElement.scrollTop;
    const viewportW = window.innerWidth;
    const viewportY = window.innerHeight;
    // min to fit cp is 24rem by 27.8rem (384px by 444.8px ) so if it is less than the minimum, just use the minimum (this is kind of a hack solution, but I can't think of a better one)
    cpDiv.style.width = Math.max(384, viewportW) + 'px';
    cpDiv.style.height = Math.max(444.8, viewportY) + 'px';
    // Set the position of cpDiv
    cpDiv.style.left = `${x}px`;
    cpDiv.style.top = `${y}px`;
    document.body.appendChild(cpDiv);
  };

  findAndSetCP();

  const colorPickerConfig = {
    parent: cpDiv,
    initColor: extractRGBValues(widget.getColor()),
    onColorSelect: (cpReturn: [any, number[][]]) => {
      let newValue: string = '';
      // cpReturn is an array of the selected color as well as the saved colors array
      const selectedColor: number[] = cpReturn[0].rgba;
      savedColors = cpReturn[1];

      // format correctly based on cpDiv
      switch (widget.getColorType()) {
        case 'compound':
          newValue = colors.netlogoToCompound(colors.rgbToNetlogo(selectedColor));
          break;
        case 'numeric':
          newValue = colors.rgbToNetlogo(selectedColor).toString();
          break;
        case 'rgbArr':
          // return the number as [ r g b ], unless the alpha value is not 255 ( suggesting it was changed )
          if (selectedColor[3] == 255) {
            newValue = `[${selectedColor[0]} ${selectedColor[1]} ${selectedColor[2]}]`;
          } else {
            newValue = `[${selectedColor[0]} ${selectedColor[1]} ${selectedColor[2]} ${selectedColor[3]}]`;
          }
          break;
        case 'rgbaArr':
          newValue = `[${selectedColor[0]} ${selectedColor[1]} ${selectedColor[2]} ${selectedColor[3]}]`;
          break;
        case 'rgbFn':
          newValue = `rgb ${selectedColor[0]} ${selectedColor[1]} ${selectedColor[2]}`;
          break;
      }

      let change = {
        from: pos - widget.getLength(),
        to: pos,
        insert: newValue,
      };
      view.dispatch({ changes: change });
      // call destroyColorPicker after processing the selected color
      destroyColorPicker();
    },
    savedColors: savedColors,
  };

  const colorPicker = new ColorPicker(colorPickerConfig);
  cpDiv.addEventListener('click', handleOutsideClick);
  if (OnColorPickerCreate) {
    OnColorPickerCreate(cpDiv);
  }
  return 0;
}

/** destroyColorPicker: handler function to destroy the colorPickerDiv */
function destroyColorPicker() {
  const cpDiv = document.querySelector('#colorPickerDiv');
  if (cpDiv) {
    // Remove the event listener before removing the div
    cpDiv.removeEventListener('click', handleOutsideClick);
    cpDiv.remove();
  }
}

//separate click handler so we can both add and remove it
function handleOutsideClick(event: Event) {
  const cpDiv = event.currentTarget as HTMLElement;
  if (event.target === cpDiv) {
    destroyColorPicker();
  }
}

/** ColorPickerPlugin: Main driver of the plugin. Creates a ColorPicker instance when a widget is pressed. Maintains a mapping of widgets to their position */
function createColorPickerPlugin(OnColorPickerCreate?: (cpDiv: HTMLElement) => void) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      posToWidget: Map<number, ColorPickerWidget>;

      constructor(view: EditorView) {
        this.posToWidget = new Map();
        this.decorations = colorWidgets(view, this.posToWidget);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
          this.posToWidget.clear();
          this.decorations = colorWidgets(update.view, this.posToWidget);
        }
      }

      /** setWidgetsZindex: Helper function to change the ZIndex briefly to make widget interactable */
      setWidgetsInteractability(view: EditorView, pointerValue: string) {
        view.dom.querySelectorAll('.cp-widget-wrap').forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.pointerEvents = pointerValue;
          }
        });
      }
    },

    {
      decorations: (v) => v.decorations,
      eventHandlers: {
        mousedown: function (e: MouseEvent, view: EditorView) {
          this.setWidgetsInteractability(view, 'auto');
          // kill the colorPickerDiv if it exists
          destroyColorPicker();
        },

        touchstart: function (e: TouchEvent, view: EditorView) {
          let touch = e.touches[0];
          this.setWidgetsInteractability(view, 'auto');
          destroyColorPicker();
          // don't bring the keyboard if we pressed on the picker
          let target = touch.target as HTMLElement;
          if (target.nodeName == 'DIV' && target.parentElement!.classList.contains('cp-widget-wrap')) {
            e.preventDefault();
          }
        },

        mouseup: function (e: MouseEvent, view: EditorView) {
          let target = e.target as HTMLElement;
          if (target.nodeName == 'DIV' && target.parentElement!.classList.contains('cp-widget-wrap')) {
            e.preventDefault();
            let success = initializeCP(
              view,
              view.posAtDOM(target),
              this.posToWidget.get(view.posAtDOM(target))!,
              OnColorPickerCreate
            );
          }
          // set the zindex of the picker back to -1 for consistency
          this.setWidgetsInteractability(view, 'none');
        },

        touchend: function (e: TouchEvent, view: EditorView) {
          let touch = e.touches[0];
          let target = touch.target as HTMLElement;
          if (target.nodeName == 'DIV' && target.parentElement!.classList.contains('cp-widget-wrap')) {
            e.preventDefault();
            let success = initializeCP(
              view,
              view.posAtDOM(target),
              this.posToWidget.get(view.posAtDOM(target))!,
              OnColorPickerCreate
            );
          }
          // set the zindex of the picker back to -1 for consistency
          this.setWidgetsInteractability(view, 'none');
        },
      },
    }
  );
}

export { createColorPickerPlugin };
