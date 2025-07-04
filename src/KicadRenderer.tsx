import { KicadSymbol, ParsedContent, assert } from "./KicadParser";

// function arcToSvgPath(start: [number, number], mid: [number, number], end: [number, number]): string {
//   const [x1, y1] = start;
//   const [xm, ym] = mid;
//   const [x2, y2] = end;

//   // Calculate radius using perpendicular bisector method
//   const dx1 = xm - x1;
//   const dy1 = ym - y1;
//   const dx2 = x2 - xm;
//   const dy2 = y2 - ym;

//   const det = dx1 * dy2 - dy1 * dx2;
//   if (Math.abs(det) < 1e-6) {
//     // Points are nearly colinear — fallback to straight line
//     return `M ${x1} ${y1} L ${x2} ${y2}`;
//   }

//   // Use the SVG arc command with estimated radius
//   const r = Math.hypot(xm - x1, ym - y1); // crude radius
//   return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
// }

function arcToSvgPath(
  start: [number, number],
  mid:   [number, number],
  end:   [number, number],
): string {

  const [x1, y1] = start;
  const [x2, y2] = mid;
  const [x3, y3] = end;

  const d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
  if (Math.abs(d) < 1e-9)
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`;

  const ux = (
    (x1 * x1 + y1 * y1) * (y2 - y3) +
    (x2 * x2 + y2 * y2) * (y3 - y1) +
    (x3 * x3 + y3 * y3) * (y1 - y2)
  ) / d;

  const uy = (
    (x1 * x1 + y1 * y1) * (x3 - x2) +
    (x2 * x2 + y2 * y2) * (x1 - x3) +
    (x3 * x3 + y3 * y3) * (x2 - x1)
  ) / d;

  const r = Math.hypot(x1 - ux, y1 - uy);

  // ── angle helper: note the flipped y-term (uy - y)
  const angle = (x: number, y: number) => Math.atan2(uy - y, x - ux);

  const aStart = angle(x1, y1);
  const aMid   = angle(x2, y2);
  const aEnd   = angle(x3, y3);

  const norm = (θ: number) => (θ + 2 * Math.PI) % (2 * Math.PI);
  const Δcw   = norm(aStart - aEnd);
  const midOnCw = norm(aStart - aMid) <= Δcw + 1e-12;

  const sweepFlag    = midOnCw ? 1 : 0;              // now correct in SVG space
  const chosenΔ      = midOnCw ? Δcw : norm(aEnd - aStart);
  const largeArcFlag = chosenΔ > Math.PI ? 1 : 0;

  const f = (v: number) => Number(v.toFixed(5));
  return `M ${f(x1)} ${f(y1)} A ${f(r)} ${f(r)} 0 ${largeArcFlag} ${sweepFlag} ${f(x3)} ${f(y3)}`;
}

interface Transform {
  at: [number, number];
  rotationDeg: number;
  mirrorY: boolean;
}

function transformToSvgTransform(
  transform: Transform,
): string {
  const { at, rotationDeg } = transform;
  let start = `translate(${at[0]}, ${at[1]}) rotate(-${rotationDeg})`;
  // if (transform.mirrorY) {
  //   start += ' scale(-1, 1)';
  // }
  return start;
}

function renderSymbol(
  symbol: KicadSymbol,
): JSX.Element[] {
  return symbol.draw.map((draw, index) => {
    if (draw.type === 'polyline') {
      return (
        <polyline key={index}
          points={draw.points.map(p => p.join(',')).join(' ')}
          strokeWidth={Math.max(0.3, draw.strokeWidth)}
          stroke={draw.strokeType === 'default' ? 'black' : 'red'}
          fill={draw.fillType === 'background' ? 'lightgray' : 'none'}
        />
      );
    } else if (draw.type === 'arc') {
      return (
        <path key={index}
          d={arcToSvgPath(draw.start, draw.mid, draw.end)}
          strokeWidth={Math.max(0.3, draw.strokeWidth)}
          stroke={draw.strokeType === 'default' ? 'black' : 'red'}
          fill="none"
        />
      );
    } else if (draw.type === 'circle') {
      return (
        <circle key={index}
          cx={draw.center[0]} cy={draw.center[1]}
          r={draw.radius}
          strokeWidth={Math.max(0.3, draw.strokeWidth)}
          stroke={draw.strokeType === 'default' ? 'black' : 'red'}
          fill={draw.fillType === 'background' ? 'lightgray' : 'none'}
        />
      );
    } else if (draw.type === 'rectangle') {
      return (
        <rect key={index}
          x={Math.min(draw.start[0], draw.end[0])}
          y={Math.min(draw.start[1], draw.end[1])}
          width={Math.abs(draw.end[0] - draw.start[0])}
          height={Math.abs(draw.end[1] - draw.start[1])}
          strokeWidth={Math.max(0.3, draw.strokeWidth)}
          stroke={draw.strokeType === 'default' ? 'black' : 'red'}
          fill={draw.fillType === 'background' ? 'lightgray' : 'none'}
        />
      );
    } else if (draw.type === 'pin') {
      const radians = (-draw.rotationDeg * Math.PI) / 180;
      const end = [
        draw.at[0] + draw.length * Math.cos(radians),
        draw.at[1] + draw.length * Math.sin(radians)
      ];
      const pinName = JSON.parse(draw.name);
      const pinNumber = JSON.parse(draw.number);
      let showPinLabel = true;
      if (pinName === '~' || !isNaN(Number(pinName))) {
        showPinLabel = false;
      }
      return <>
        <line key={index}
          x1={draw.at[0]} y1={draw.at[1]}
          x2={end[0]} y2={end[1]}
          stroke="black"
          strokeWidth="0.2"
        />
        {showPinLabel && <text x={end[0]} y={end[1]}
          fontSize="2"
          textAnchor={
            draw.rotationDeg === 0 ? 'start' :
            draw.rotationDeg === 180 ? 'end' :
            'middle'
          }
          dominantBaseline={
            draw.rotationDeg === 90 ? 'baseline' :
            draw.rotationDeg === 270 ? 'hanging' :
            'central'
          }
        >
          {pinName}
        </text>}
        {showPinLabel && <text x={(draw.at[0] + end[0]) / 2} y={(draw.at[1] + end[1]) / 2}
          fontSize="2"
          fill="red"
          textAnchor={draw.rotationDeg === 90 || draw.rotationDeg === 270 ? 'start' : 'middle'}
          dominantBaseline={draw.rotationDeg === 90 || draw.rotationDeg === 270 ? 'central' : 'baseline'}
        >
          {pinNumber}
        </text>}
      </>;
    }
    // Unreachable.
    console.error('Bad draw command:', draw);
    throw new Error('Unreachable');
  });
}

// export function KicadRender(props: {
//   symbol: KicadSymbol;
// }) {
//   return <>
//     <h2>{props.symbol.name}</h2>
//     {/* Show a textual description of the draw elements. */}
//     <ul>
//       {props.symbol.draw.map((draw, index) => (
//         <li key={index}>
//           {draw.type} - {JSON.stringify(draw)}
//         </li>
//       ))}
//     </ul>

//     {/* Render the SVG representation of the symbol. */}
//     <svg width="300px" height="300px"
//       viewBox="-30 -30 60 60"
//       xmlns="http://www.w3.org/2000/svg"
//       style={{ border: '1px solid black', marginBottom: 20 }}
//     >
//       {renderSymbol(props.symbol)}
//     </svg>
//   </>;
// }

export function computeBoundingBox(schematic: ParsedContent): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  // First, let's compute a bounding box, to center everything.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const objectEntry of schematic.objects) {
    const object = objectEntry.parsed;
    if (object.hasOwnProperty('at')) {
      const at = (object as { at: [number, number] }).at;
      minX = Math.min(minX, at[0]);
      minY = Math.min(minY, at[1]);
      maxX = Math.max(maxX, at[0]);
      maxY = Math.max(maxY, at[1]);
    }
    if (object.hasOwnProperty('pts')) {
      const pts = (object as { pts: [number, number][] }).pts;
      for (const pt of pts) {
        minX = Math.min(minX, pt[0]);
        minY = Math.min(minY, pt[1]);
        maxX = Math.max(maxX, pt[0]);
        maxY = Math.max(maxY, pt[1]);
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

export function KicadRenderSchematic(props: {
  schematic: ParsedContent;
}) {
  const { symbols, objects } = props.schematic;

  const { minX, minY, maxX, maxY } = computeBoundingBox(props.schematic);

  const svgGuts = [];
  let keyCounter = 0;
  for (const objectEntry of objects) {
    const object = objectEntry.parsed;
    if (object.type === 'symbol') {
      const symbol = symbols.get(object.libId);
      if (symbol === undefined) {
        console.error('Symbol not found:', object.libId);
        continue;
      }
      svgGuts.push(
        <g
          key={keyCounter++}
          transform={transformToSvgTransform(object)}
          opacity={object.dnp ? 0.3 : 1}
        >
          {renderSymbol(symbol)}
        </g>
      );
      // Draw all of the properties.
      let propIndex = 0;
      for (const prop of object.properties) {
        if (prop.hide) {
          continue;
        }
        let justify = prop.justify;
        if (object.mirrorY) {
          justify = prop.justify === 'left' ? 'right' :
            prop.justify === 'right' ? 'left' : prop.justify;
        }
        svgGuts.push(
          <text key={keyCounter++}
            x={prop.at[0]} y={prop.at[1]}
            fontSize="2"
            textAnchor={
              justify === 'left' ? 'start' :
              justify === 'right' ? 'end' :
              'middle'
            }
            dominantBaseline="central"
          >
            {JSON.parse(prop.value)}
          </text>
        );
        propIndex++;
      }
    } else if (object.type === 'wire') {
      let path = 'M ';
      for (const point of object.pts) {
        path += `${point[0]} ${point[1]} L `;
      }
      path = path.slice(0, -2); // Remove the last ' L '
      svgGuts.push(
        <path key={keyCounter++}
          d={path}
          stroke="black"
          strokeWidth="0.2"
          fill="none"
        />
      );
    } else if (object.type === 'junction') {
      svgGuts.push(
        <circle key={keyCounter++}
          cx={object.at[0]} cy={object.at[1]}
          r="0.5"
          fill="black"
        />
      );
    } else if (object.type === 'text') {
      const text = JSON.parse(object.text);
      const lines = text.split('\n');
      lines.forEach((line: string, index: number) => {
        svgGuts.push(
          <text key={keyCounter++}
            x={object.at[0]} y={object.at[1] + index * 2}
            fontSize="2"
            fill="blue"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {line}
          </text>
        );
      });
    } else if (object.type === 'no_connect') {
      svgGuts.push(
        <line key={keyCounter++}
          x1={object.at[0] - 0.6} y1={object.at[1] - 0.6}
          x2={object.at[0] + 0.6} y2={object.at[1] + 0.6}
          stroke="black"
          strokeWidth="0.4"
        />
      );
      svgGuts.push(
        <line key={keyCounter++}
          x1={object.at[0] + 0.6} y1={object.at[1] - 0.6}
          x2={object.at[0] - 0.6} y2={object.at[1] + 0.6}
          stroke="black"
          strokeWidth="0.4"
        />
      );
    } else if (object.type === 'label') {
      svgGuts.push(
        <text key={keyCounter++}
          x={object.at[0]} y={object.at[1]}
          fontSize="2"
          fill="green"
          textAnchor={object.justify === 'left bottom' ? 'start' : 'end'}
          dominantBaseline="baseline"
        >
          {JSON.parse(object.text)}
        </text>
      );
    } else {
      console.error('Unknown object type:', object);
    }
  }

  // If the bounds are still infinity, then return null.
  if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
    return null;
  }

  return (
    <svg
      viewBox={`${minX - 5} ${minY - 17} ${maxX - minX + 10} ${maxY - minY + 27}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '70vh', border: '1px solid black' }}
    >
      {svgGuts}
    </svg>
  );
}
