
export function assert(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error('Bad Kicad file format');
  }
}

type KicadTree = {
  type: 'node';
  name: string;
  entries: KicadTree[];
} | {
  type: 'string';
  value: string;
} | {
  type: 'number';
  originalString: string;
  value: number;
} | {
  type: 'literal';
  name: string;
};

export function extractNode(
  node: KicadTree,
  knownName: string,
  entriesCount: number,
): KicadTree[] {
  assert(node.type === 'node' && node.name === knownName);
  assert(node.entries.length === entriesCount);
  return node.entries;
}

function extractNodeFieldsByName<const FieldNames extends readonly string[]>(
  node: KicadTree,
  knownName: string,
  fieldNames: FieldNames,
): KicadTree[] {
  assert(node.type === 'node' && node.name === knownName);
  const fields = new Map<string, KicadTree>();
  for (const entry of node.entries) {
    if (entry.type === 'node' && fieldNames.includes(entry.name)) {
      fields.set(entry.name, entry);
    }
  }
  const result: KicadTree[] = [];
  for (const fieldName of fieldNames) {
    const entry = fields.get(fieldName);
    if (entry) {
      result.push(entry);
    } else {
      throw new Error(`Missing field "${fieldName}" in node ${knownName}`);
    }
  }
  assert(result.length === fieldNames.length);
  return result;
}

export function extractNodeUnknownLength(
  node: KicadTree,
  knownName: string,
): KicadTree[] {
  assert(node.type === 'node' && node.name === knownName);
  return node.entries;
}

function extractString(
  node: KicadTree,
): string {
  assert(node.type === 'string');
  return node.value;
}

function extractNumber(
  node: KicadTree,
): number {
  assert(node.type === 'number');
  return node.value;
}

function extractLiteral<const Options extends readonly string[]>(
  node: KicadTree,
  options: Options,
): Options[number] {
  assert(node.type === 'literal');
  if (!options.includes(node.name)) {
    console.error(`Expected one of ${options.join(', ')}, got ${node.name}`);
  }
  assert(options.includes(node.name));
  return node.name as Options[number];
}

function extractXY(node: KicadTree, nodeName: string): [number, number] {
  const [xNode, yNode] = extractNode(node, nodeName, 2);
  return [extractNumber(xNode), -extractNumber(yNode)];
}

function extractXYNoFlip(node: KicadTree, nodeName: string): [number, number] {
  const [xNode, yNode] = extractNode(node, nodeName, 2);
  return [extractNumber(xNode), extractNumber(yNode)];
}

const whitespace = /\s/;

function tokenize(text: string): string[] {
  type ParseState = 'normal' | 'inString' | 'stringEscape';
  let state: ParseState = 'normal';
  const tokens: string[] = [];
  let currentToken = '';
  function flushToken() {
    if (currentToken) {
      tokens.push(currentToken);
    }
    currentToken = '';
  }

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    switch (state) {
      case 'normal': {
        if (c === '(' || c === ')') {
          flushToken();
          tokens.push(c);
          continue;
        }
        if (/\s/.test(c)) {
          flushToken();
          continue;
        }
        currentToken += c;
        if (c === '"') {
          state = 'inString';
        }
        break;
      }
      case 'inString': {
        currentToken += c;
        if (c === '"') {
          flushToken();
          state = 'normal';
        } else if (c === '\\') {
          state = 'stringEscape';
        }
        break;
      }
      case 'stringEscape': {
        currentToken += c;
        state = 'inString';
        break;
      }
    }
  }
  flushToken();

  return tokens;
}

export function parseToAst(text: string): KicadTree[] {
  const tokens = tokenize(text);
  let i = 0;
  function parseItem(): KicadTree {
    const token = tokens[i++];
    if (token === '(') {
      const name = tokens[i++];
      const tree: KicadTree = { type: 'node', name, entries: [] };
      while (tokens[i] !== ')') {
        tree.entries.push(parseItem());
      }
      i++;
      return tree;
    }
    if (token.startsWith('"')) {
      return { type: 'string', value: token };
    }
    if (!isNaN(Number(token))) {
      return { type: 'number', originalString: token, value: Number(token) };
    }
    return { type: 'literal', name: token };
  }
  const trees: KicadTree[] = [];
  while (i < tokens.length) {
    trees.push(parseItem());
  }
  return trees
}

type StrokeProperties = {
  strokeWidth: number;
  strokeType: 'default';
  fillType: 'none' | 'outline' | 'background';
};

export type KicadDraw = ({
  type: 'polyline';
  points: [number, number][];
} & StrokeProperties) | ({
  type: 'arc';
  start: [number, number];
  mid: [number, number];
  end: [number, number];
} & StrokeProperties) | ({
  type: 'circle';
  center: [number, number];
  radius: number;
} & StrokeProperties) | ({
  type: 'rectangle';
  start: [number, number];
  end: [number, number];
} & StrokeProperties) | {
  type: 'pin';
  at: [number, number];
  rotationDeg: number;
  length: number;
  name: string;
  number: string;
};

function parseStrokeProperties(props: KicadTree[]): StrokeProperties {
  let strokeWidth = 0.0;
  let strokeType: 'default' = 'default';
  let fillType: 'none' | 'outline' | 'background' = 'none';
  for (const prop of props) {
    assert(prop.type === 'node');
    if (prop.name === 'stroke') {
      const [ widthProp, typeProp ] = extractNode(prop, 'stroke', 2);
      const [ widthNumb ] = extractNode(widthProp, 'width', 1);
      strokeWidth = extractNumber(widthNumb);
      const [ typeLit ] = extractNode(typeProp, 'type', 1);
      strokeType = extractLiteral(typeLit, ['default']);

    } else if (prop.name === 'fill') {
      const [ fillProp ] = extractNode(prop, 'fill', 1);
      const [ fillTypeLit ] = extractNode(fillProp, 'type', 1);
      fillType = extractLiteral(fillTypeLit, ['none', 'outline', 'background']);
    }
  }
  return { strokeWidth, strokeType, fillType };
}

export interface KicadSymbol {
  ast: KicadTree;
  name: string;
  draw: KicadDraw[];
}

export interface PropertyInfo {
  name: string;
  value: string;
  at: [number, number];
  rotationDeg: number;
  hide: boolean;
  justify: 'left' | 'middle' | 'right';
}

export type KicadObject = {
  type: 'symbol';
  libId: string;
  at: [number, number];
  rotationDeg: number;
  mirrorX: boolean;
  mirrorY: boolean;
  dnp: boolean;
  properties: PropertyInfo[];
} | {
  type: 'wire';
  pts: [number, number][];
} | {
  type: 'junction';
  at: [number, number];
} | {
  type: 'no_connect';
  at: [number, number];
} | {
  type: 'text';
  text: string;
  at: [number, number];
  rotationDeg: number;
} | {
  type: 'label';
  text: string;
  at: [number, number];
  rotationDeg: number;
  justify: 'left bottom' | 'right bottom';
};

export interface ParsedContent {
  symbolsAst: KicadTree;
  symbols: Map<string, KicadSymbol>;
  objects: {
    ast: KicadTree;
    parsed: KicadObject;
  }[];
}

export function parseKicad(text: string): ParsedContent {
  // Empty text parses as empty.
  if (text.trim() === '') {
    return {
      symbolsAst: { type: 'string', value: '' },
      symbols: new Map(),
      objects: [],
    };
  }

  const ast = parseToAst(text);
  const symbols = new Map<string, KicadSymbol>();
  // The first entry should be a lib_symbols.
  for (const symbol of extractNodeUnknownLength(ast[0], 'lib_symbols')) {
    const symbolEntries = extractNodeUnknownLength(symbol, 'symbol');
    const symbolName = extractString(symbolEntries[0]);
    const draw: KicadDraw[] = [];
    for (const entry of symbolEntries) {
      if (entry.type !== 'node' || entry.name !== 'symbol') {
        continue;
      }
      // The first entry in the symbol's "symbol" entry's contents is a string.
      extractString(entry.entries[0]);
      // The rest are draw entries.
      for (const desc of entry.entries.slice(1)) {
        assert(desc.type === 'node');
        switch (desc.name) {
          case 'polyline': {
            const pointsDesc = extractNodeUnknownLength(desc.entries[0], 'pts');
            const points: [number, number][] = [];
            for (const point of pointsDesc) {
              points.push(extractXY(point, 'xy'));
            }
            draw.push({
              type: 'polyline',
              points,
              ...parseStrokeProperties(desc.entries),
            });
            break;
          }
          case 'arc': {
            const start = extractXY(desc.entries[0], 'start');
            const mid = extractXY(desc.entries[1], 'mid');
            const end = extractXY(desc.entries[2], 'end');
            draw.push({
              type: 'arc',
              start,
              mid,
              end,
              ...parseStrokeProperties(desc.entries),
            });
            break;
          }
          case 'circle': {
            const [ centerDesc, radiusNode ] = extractNodeFieldsByName(desc, 'circle', ['center', 'radius']);
            const center = extractXY(centerDesc, 'center');
            const [ radiusDesc ] = extractNode(radiusNode, 'radius', 1);
            const radius = extractNumber(radiusDesc);
            draw.push({
              type: 'circle',
              center,
              radius,
              ...parseStrokeProperties(desc.entries),
            });
            break;
          }
          case 'rectangle': {
            const start = extractXY(desc.entries[0], 'start');
            const end = extractXY(desc.entries[1], 'end');
            draw.push({
              type: 'rectangle',
              start,
              end,
              ...parseStrokeProperties(desc.entries),
            });
            break;
          }
          case 'pin': {
            const [ atNode, pinLengthNode, pinNameNode, pinNumberNode ] =
              extractNodeFieldsByName(desc, 'pin', ['at', 'length', 'name', 'number']);
            const [ atXDesc, atYDesc, rotationDegDesc ] = extractNode(atNode, 'at', 3);
            const at: [number, number] = [extractNumber(atXDesc), -extractNumber(atYDesc)];
            const rotationDeg = extractNumber(rotationDegDesc);
            const [ lengthDesc ] = extractNode(pinLengthNode, 'length', 1);
            const length = extractNumber(lengthDesc);
            const [ pinNameDesc, ..._ ] = extractNodeUnknownLength(pinNameNode, 'name');
            const pinName = extractString(pinNameDesc);
            const [ pinNumberDesc, ...__ ] = extractNodeUnknownLength(pinNumberNode, 'number');
            const pinNumber = extractString(pinNumberDesc);
            draw.push({
              type: 'pin',
              at,
              rotationDeg,
              length,
              name: pinName,
              number: pinNumber,
            });
            break;
          }
          case 'text': {
            // FIXME: Implement this properly!
            break;
          }
          default: {
            console.error(desc);
            throw new Error(`Unknown draw type: ${desc.name}`);
          }
        }
      }
    }
    symbols.set(symbolName, {
      ast: symbol,
      name: symbolName,
      draw,
    });
  }

  const objects: {
    ast: KicadTree;
    parsed: KicadObject;
  }[] = [];
  // The remaining entries should be objects.
  for (const entry of ast.slice(1)) {
    if (entry.type !== 'node') {
      alert(`Expected a node, got ${entry.type} in Kicad file.`);
      continue;
    }
    let parsed: KicadObject;
    switch (entry.name) {
      case 'symbol': {
        let [ libIdNode, atNode, dnpNode ] = extractNodeFieldsByName(entry, 'symbol', ['lib_id', 'at', 'dnp']);
        // Check if there is a "lib_name" node, that overrides "lib_id".
        const libNameNode = entry.entries.find(e => e.type === 'node' && e.name === 'lib_name');
        if (libNameNode) {
          libIdNode = libNameNode;
        }
        assert(libIdNode.type === 'node' && libIdNode.entries.length === 1);
        const [ libIdDesc ] = libIdNode.entries;
        const libId = extractString(libIdDesc);
        const [ atXDesc, atYDesc, rotationDegDesc ] = extractNode(atNode, 'at', 3);
        const rotationDeg = extractNumber(rotationDegDesc);
        const at: [number, number] = [extractNumber(atXDesc), extractNumber(atYDesc)];
        let mirrorX = false;
        let mirrorY = false;
        // Check if there is a "mirror" node, and if so assert that it's "(mirror y)".
        const mirrorNode = entry.entries.find(e => e.type === 'node' && e.name === 'mirror');
        if (mirrorNode) {
          const [ mirrorYDesc ] = extractNode(mirrorNode, 'mirror', 1);
          switch (extractLiteral(mirrorYDesc, ['x', 'y'])) {
            case 'x':
              mirrorX = true;
              break;
            case 'y':
              mirrorY = true;
              break;
          }
        }

        const [ dnpDesc ] = extractNode(dnpNode, 'dnp', 1);
        const dnp = extractLiteral(dnpDesc, ['yes', 'no']) === 'yes';
        const properties: PropertyInfo[] = [];
        for (const prop of entry.entries) {
          if (prop.type !== 'node' || prop.name !== 'property') {
            continue;
          }
          const [ atNode, effectsNode ] = extractNodeFieldsByName(
            prop, 'property', ['at', 'effects'],
          );
          const effects = extractNodeUnknownLength(effectsNode, 'effects');
          let hide = false;
          let justify: 'left' | 'middle' | 'right' = 'middle';
          // Check if any effect is to hide the property.
          for (const effect of effects) {
            if (effect.type === 'node' && effect.name === 'hide') {
              const [ hideDesc ] = extractNode(effect, 'hide', 1);
              hide = extractLiteral(hideDesc, ['yes', 'no']) === 'yes';
            }
            if (effect.type === 'node' && effect.name === 'justify') {
              const [ justifyDesc ] = extractNode(effect, 'justify', 1);
              justify = extractLiteral(justifyDesc, ['left', 'right']);
            }
          }
          const name = extractString(prop.entries[0]);
          const value = extractString(prop.entries[1]);
          const [ propAtXDesc, propAtYDesc, propRotationDegDesc ] = extractNode(atNode, 'at', 3);
          const propRotationDeg = extractNumber(propRotationDegDesc);
          const propAt: [number, number] = [extractNumber(propAtXDesc), extractNumber(propAtYDesc)];
          // const hide = extractLiteral(hideNode, ['yes', 'no']) === 'yes';
          properties.push({ name, value, at: propAt, rotationDeg: propRotationDeg, hide, justify });
        }
        parsed = {
          type: 'symbol',
          libId,
          at,
          rotationDeg,
          mirrorX,
          mirrorY,
          dnp,
          properties,
        };
        break;
      }
      case 'wire': {
        const [ ptsDesc ] = extractNodeFieldsByName(entry, 'wire', ['pts']);
        const pts: [number, number][] = [];
        for (const pt of extractNodeUnknownLength(ptsDesc, 'pts')) {
          pts.push(extractXYNoFlip(pt, 'xy'));
        }
        parsed = {
          type: 'wire',
          pts,
        };
        break;
      }
      case 'junction': {
        const [ atNode ] = extractNodeFieldsByName(entry, 'junction', ['at']);
        const [ xDesc, yDesc ] = extractNode(atNode, 'at', 2);
        const at: [number, number] = [extractNumber(xDesc), extractNumber(yDesc)];
        parsed = {
          type: 'junction',
          at,
        };
        break;
      }
      case 'no_connect': {
        const [ atNode ] = extractNodeFieldsByName(entry, 'no_connect', ['at']);
        const [ xDesc, yDesc ] = extractNode(atNode, 'at', 2);
        const at: [number, number] = [extractNumber(xDesc), extractNumber(yDesc)];
        parsed = {
          type: 'no_connect',
          at,
        };
        break;
      }
      case 'text': {
        const text = extractString(entry.entries[0]);
        const [ atNode ] = extractNodeFieldsByName(entry, 'text', ['at']);
        const [ xDesc, yDesc, rotationDegDesc ] = extractNode(atNode, 'at', 3);
        const rotationDeg = extractNumber(rotationDegDesc);
        const at: [number, number] = [extractNumber(xDesc), extractNumber(yDesc)];
        parsed = {
          type: 'text',
          text,
          at,
          rotationDeg,
        };
        break;
      }
      case 'label': {
        const text = extractString(entry.entries[0]);
        const [ atNode, effectsNode ] = extractNodeFieldsByName(entry, 'label', ['at', 'effects']);
        const [ xDesc, yDesc, rotationDegDesc ] = extractNode(atNode, 'at', 3);
        const rotationDeg = extractNumber(rotationDegDesc);
        const at: [number, number] = [extractNumber(xDesc), extractNumber(yDesc)];
        // Check if there is a "justify" node.
        assert(effectsNode.type === 'node');
        let justify: 'left bottom' | 'right bottom' = 'left bottom';
        const justifyNode = effectsNode.entries.find(e => e.type === 'node' && e.name === 'justify');
        if (justifyNode) {
          const [ justifyDesc, bottomDesc ] = extractNode(justifyNode, 'justify', 2);
          const justifyDir = extractLiteral(justifyDesc, ['left', 'right']);
          extractLiteral(bottomDesc, ['bottom']);
          justify = (justifyDir + ' bottom') as 'left bottom' | 'right bottom';
        }
        parsed = {
          type: 'label',
          text,
          at,
          rotationDeg,
          justify,
        };
        break;
      }
      default: {
        console.error(entry);
        throw new Error(`Unknown object type: ${entry.name}`);
      }
    }
    objects.push({
      ast: entry,
      parsed,
    });
  }

  return { symbolsAst: ast[0], symbols, objects };
}

export function formatKicadTree(ast: KicadTree[]): string {
  function formatItem(item: KicadTree): string {
    switch (item.type) {
      case 'node': {
        const entries = item.entries.map(formatItem).join(' ');
        return `(${item.name} ${entries})`;
      }
      case 'string':
        return item.value;
      case 'number':
        return item.originalString;
      case 'literal':
        return item.name;
    }
  }
  return ast.map(formatItem).join('\n');
}

export function formatKicadCode(parsedContent: ParsedContent): string {
  const ast = [
    parsedContent.symbolsAst,
    ...parsedContent.objects.map(objectEntry => objectEntry.ast),
  ];
  return formatKicadTree(ast);
}

// export type FeatureFlag = 'R1Second' | 'R2Second' | 'TransientResponseCap' | 'RCSnubber' | 'EnableClamp' | 'PgoodClamp';

export function editKicadCode(
  parsedContent: ParsedContent,
  flags: Map<string, boolean>,
): ParsedContent {
  let outputObjects: {
    ast: KicadTree;
    parsed: KicadObject;
  }[] = [];
  for (const object of parsedContent.objects) {
    if (object.parsed.type === 'symbol') {
      // Find if it has an OnlyIf property.
      const onlyIfProperty = object.parsed.properties.find((prop) => prop.name === '"OnlyIf"');
      // FIXME: Evaluate the condition!
      if (onlyIfProperty !== undefined) {
        const onlyIfName = JSON.parse(onlyIfProperty.value) as string;
        if (!flags.has(onlyIfName)) {
          console.error(`Unknown feature flag: ${onlyIfName}`);
        }
        if (!flags.get(onlyIfName)) {
          continue;
        }
      }
    }
    outputObjects.push(object);
  }
  let inUsePoints: string[] = [];
  while (true) {
    function formatPosKey(pos: [number, number]): string {
      const x = Math.round(1000 * pos[0]);
      const y = Math.round(1000 * pos[1]);
      return `${x},${y}`;
    }

    // Find every end of a pin, wire, junction, or label.
    inUsePoints = [];
    for (const object of outputObjects) {
      if (object.parsed.type === 'text') {
        // Text doesn't keep anything, even if they happen to line up perfectly.
        continue;
      } else if (object.parsed.type === 'symbol') {
        // Make sure to add all of the pin ends.
        const symbol = parsedContent.symbols.get(object.parsed.libId)!;
        const rotationRad = -object.parsed.rotationDeg * Math.PI / 180;
        const [ cosRot, sinRot ] = [Math.cos(rotationRad), Math.sin(rotationRad)];
        for (const draw of symbol.draw) {
          if (draw.type === 'pin') {
            inUsePoints.push(formatPosKey([
              object.parsed.at[0] + cosRot * draw.at[0] - sinRot * draw.at[1],
              object.parsed.at[1] + sinRot * draw.at[0] + cosRot * draw.at[1],
            ]));
          }
        }
      } else if (object.parsed.type === 'wire') {
        for (const pt of object.parsed.pts) {
          inUsePoints.push(formatPosKey(pt));
        }
      } else if (object.parsed.hasOwnProperty('at')) {
        const at = (object.parsed as { at: [number, number] }).at;
        inUsePoints.push(formatPosKey(at));
      } else {
        console.error('Unknown object with at:', object);
        throw new Error(`Bad object type: ${object.parsed.type}`);
      }
    }

    // Try to delete any wires that don't have both ends in use,
    // and junctions that don't join at least two things.
    let newOutputObjects: {
      ast: KicadTree;
      parsed: KicadObject;
    }[] = [];
    const getUseCount = (pt: [number, number]): number => {
      const key = formatPosKey(pt);
      return inUsePoints.filter(p => p === key).length;
    }
    for (const object of outputObjects) {
      // Check if it's a wire or junction, and if so only keep it if it's good enough.
      if (object.parsed.type === 'wire') {
        assert(object.parsed.pts.length >= 2);
        // Check if both ends are in use.
        const startUseCount = getUseCount(object.parsed.pts[0]);
        const endUseCount = getUseCount(object.parsed.pts[object.parsed.pts.length - 1]);
        if (startUseCount >= 2 && endUseCount >= 2) {
          // Keep the wire.
          newOutputObjects.push(object);
        }
      } else if (object.parsed.type === 'junction') {
        const useCount = getUseCount(object.parsed.at);
        if (useCount >= 4) {
          // Keep the junction.
          newOutputObjects.push(object);
        }
      } else if (object.parsed.type === 'label') {
        const useCount = getUseCount(object.parsed.at);
        if (useCount >= 2) {
          // Keep the label.
          newOutputObjects.push(object);
        }
      } else {
        newOutputObjects.push(object);
      }
    }
    if (newOutputObjects.length === outputObjects.length) {
      break;
    }
    outputObjects = newOutputObjects;
  }

  return {
    symbolsAst: parsedContent.symbolsAst,
    symbols: parsedContent.symbols,
    objects: outputObjects,
  };
}

export function reannotateSchematic(
  parsedContent: ParsedContent,
): ParsedContent {
  const designatorCounters = new Map<string, number>();
  // We specifically allocate R1, R2 to be for the main divider.
  designatorCounters.set('R', 2);
  const newObjects: {
    ast: KicadTree;
    parsed: KicadObject;
  }[] = [];
  for (const object of parsedContent.objects) {
    if (object.parsed.type === 'symbol') {
      // Update parsed.
      const newAst = JSON.parse(JSON.stringify(object.ast)) as KicadTree;
      const newObject = JSON.parse(JSON.stringify(object.parsed)) as KicadObject;
      assert(newAst.type === 'node' && newAst.name === 'symbol');
      assert(newObject.type === 'symbol');
      // Reannotate the symbol.
      const designator = object.parsed.properties.find(prop => prop.name === '"Reference"')!;
      if (designator.value.startsWith('"#')) {
        // These are like power symbols and stuff.
        newObjects.push(object);
        continue;
      }
      // Match everything from the start up to the first digit.
      const designatorPrefix = designator.value.match(/^"([A-Za-z]+)(\d*)"/)![1];
      let counter = designatorCounters.get(designatorPrefix) ?? 0;
      counter++;

      let doAssignBack = true;
      if (designatorPrefix === 'R') {
        // If the prefix is R, and we have the value "{{R1val}}" or "{{R2val}}", then use that magic designator.
        // This is to make sure that "R1" in a buck converter's voltage divider always becomes R1.
        const value = object.parsed.properties.find(prop => prop.name === '"Value"')?.value!;
        if (value === '"{{R1val}}"') {
          counter = 1;
          doAssignBack = false;
        } else if (value === '"{{R2val}}"') {
          counter = 2;
          doAssignBack = false;
        }
      }
      if (doAssignBack) {
        designatorCounters.set(designatorPrefix, counter);
      }
      const designatorProp = newObject.properties.find(prop => prop.name === '"Reference"')!;
      designatorProp.value = `"${designatorPrefix}${counter}"`;
      // Go in and update the ast.
      const propNode = newAst.entries.find((e) => {
        if (e.type !== 'node' || e.name !== 'property') {
          return false;
        }
        assert(e.entries[0].type === 'string');
        return e.entries[0].value === '"Reference"';
      })!;
      assert(propNode.type === 'node');
      assert(propNode.entries[1].type === 'string');
      propNode.entries[1].value = designatorProp.value;
      newObjects.push({ ast: newAst, parsed: newObject });
    } else {
      // Keep the object as is.
      newObjects.push(object);
    }
  }
  return {
    symbolsAst: parsedContent.symbolsAst,
    symbols: parsedContent.symbols,
    objects: newObjects,
  };
}

export function mergeInSymbols(
  modify: ParsedContent,
  newSymbols: Map<string, KicadSymbol>,
) {
  for (const [ name, symbol ] of newSymbols.entries()) {
    if (!modify.symbols.has(name)) {
      modify.symbols.set(name, symbol);
      const entries = extractNodeUnknownLength(modify.symbolsAst, 'lib_symbols');
      entries.push(symbol.ast);
    }
  }
}

export function addCopyOfSchematicAtOffset(
  modify: ParsedContent,
  offset: [number, number],
  schematic: ParsedContent,
) {
  mergeInSymbols(modify, schematic.symbols);
  for (const object of schematic.objects) {
    // Update parsed.
    const newAst = JSON.parse(JSON.stringify(object.ast)) as KicadTree;
    const newObject = JSON.parse(JSON.stringify(object.parsed)) as KicadObject;

    // If the object is a symbol, then all its properties need to move too.
    if (newObject.type === 'symbol') {
      assert(!newObject.mirrorY);
      assert(newObject.rotationDeg === 0);
      for (const prop of newObject.properties) {
        prop.at = [prop.at[0] + offset[0], prop.at[1] + offset[1]];
      }
      // Reach in, and find the at node in the ast, and update it.
      const entries = extractNodeUnknownLength(newAst, 'symbol');
      // Find all 'property' nodes in the symbol.
      for (const prop of entries) {
        if (!(prop.type === 'node' && prop.name === 'property')) {
          continue;
        }
        const [ atNode ] = extractNodeFieldsByName(prop, 'property', ['at']);
        const [ xDesc, yDesc, _ ] = extractNode(atNode, 'at', 3);
        assert(xDesc.type === 'number' && yDesc.type === 'number');
        xDesc.value += offset[0];
        yDesc.value += offset[1];
        xDesc.originalString = xDesc.value.toString();
        yDesc.originalString = yDesc.value.toString(); // FIXME: No y-flip needed here?
      }
    }

    if (newObject.hasOwnProperty('at')) {
      const hasAt = newObject as { at: [number, number] };
      hasAt.at = [hasAt.at[0] + offset[0], hasAt.at[1] + offset[1]];
      // Reach in, and find the at node in the ast, and update it.
      const atNode = extractNodeFieldsByName(newAst, newObject.type, ['at'])[0];
      const [ xDesc, yDesc, _ ] = extractNode(atNode, 'at', 3);
      assert(xDesc.type === 'number' && yDesc.type === 'number');
      xDesc.value += offset[0];
      yDesc.value += offset[1];
      xDesc.originalString = xDesc.value.toString();
      yDesc.originalString = yDesc.value.toString(); // FIXME: No y-flip needed here?
    } else if (newObject.type === 'wire') {
      for (const pt of newObject.pts) {
        pt[0] += offset[0];
        pt[1] += offset[1];
      }
      // Reach into the ast, and find the pts node, and update it.
      const ptsNode = extractNodeFieldsByName(newAst, newObject.type, ['pts'])[0];
      const ptsEntries = extractNodeUnknownLength(ptsNode, 'pts');
      for (let j = 0; j < ptsEntries.length; j++) {
        const ptEntry = ptsEntries[j];
        assert(ptEntry.type === 'node' && ptEntry.name === 'xy');
        const [ xDesc, yDesc ] = extractNode(ptEntry, 'xy', 2);
        assert(xDesc.type === 'number' && yDesc.type === 'number');
        xDesc.value += offset[0];
        yDesc.value += offset[1];
        xDesc.originalString = xDesc.value.toString();
        yDesc.originalString = yDesc.value.toString(); // FIXME: No y-flip needed here?
      }
    }
    modify.objects.push({
      ast: newAst,
      parsed: newObject,
    });
  }
}

export function kicadSchematicToContents(schematic: string): string {
  const [ rootNode ] = parseToAst(schematic);
  const entries = extractNodeUnknownLength(rootNode, 'kicad_sch');
  const acceptable = ['lib_symbols', 'symbol', 'wire', 'junction', 'no_connect', 'text', 'label'];
  const acceptedEntries = entries.filter((e) => e.type === 'node' && acceptable.includes(e.name));
  return formatKicadTree(acceptedEntries);
}
