import React from "react";
import { addCopyOfSchematicAtOffset, assert, editKicadCode, formatKicadCode, parseKicad, reannotateSchematic } from "./KicadParser";
import { E12_VALUES, E24_VALUES, FilteringOptions, alPolyOptions, inductorOptions, mlccOptions, resistorTo0402Lcsc } from "./CommonComponents";
import { Message, CollapsibleSection, Device, applySubs } from "./App";
import { computeBoundingBox } from "./KicadRenderer";
import { AL_POLY_TEMPLATE, FILTER_LABEL_TEMPLATE, MLCC_TEMPLATE } from "./Strings";

interface Feedback {
  resistances: (number | null)[];
  achievedVoltage: number;
  totalResistance: number;
}

function iteratorPower<T>(x: T[], n: number): T[][] {
  if (n === 0) {
    return [[]];
  }
  const result: T[][] = [];
  for (const item of x) {
    const subCombinations = iteratorPower(x, n - 1);
    for (const sub of subCombinations) {
      result.push([item, ...sub]);
    }
  }
  return result;
}

function getResistance(pair: (number | null)[]): number {
  const [ a, b ] = pair;
  assert(a !== null);
  return 1 / (1 / a + (b === null ? 0 : 1 / b));
}

function makeFeedback(
  formula: (r1: number, r2: number) => number,
  targetFeedbackResistance: number,
  outputVoltage: number,
  onlyE12: boolean,
): Feedback[] {
  const resistors = (onlyE12 ? E12_VALUES : E24_VALUES)
  let options = iteratorPower([...resistors, null], 4);
  // Skip everything that either isn't sorted, or has a null in positions 0 or 2.
  options = options.filter((r) => {
    return r[0] !== null && r[2] !== null &&
      (r[1] === null || r[0] <= r[1]) &&
      (r[3] === null || r[2] <= r[3])
  });

  const getVoltage = (solution: (number | null)[]) => {
    const r1 = getResistance(solution.slice(0, 2));
    const r2 = getResistance(solution.slice(2, 4));
    return formula(r1, r2);
  };

  const grade = (solution: (number | null)[]) => {
    const r1 = getResistance(solution.slice(0, 2));
    const r2 = getResistance(solution.slice(2, 4));
    const achievedVoltage = formula(r1, r2);
    const voltageError = Math.abs(outputVoltage - achievedVoltage);
    const resistanceError = Math.abs(targetFeedbackResistance - (r1 + r2));
    const resistorsUsed = solution.filter(r => r !== null).length;
    return 1e5 * voltageError + 0.25 * resistanceError + 3e3 * resistorsUsed;
  };

  const OPTION_COUNT = 6;
  let best: [number, (number | null)[]][] = [];
  for (const option of options) {
    const score = grade(option);
    if (best.length < OPTION_COUNT || score < best[0][0]) {
      best.push([score, option]);
      best.sort((a, b) => a[0] - b[0]);
      if (best.length > OPTION_COUNT) {
        best.pop();
      }
    }
  }
  return best.map(([_, option]) => ({
    resistances: option,
    achievedVoltage: getVoltage(option),
    totalResistance: getResistance(option.slice(0, 2)) + getResistance(option.slice(2, 4)),
  }));
}

export interface BuckMessagesData {
  inputVoltage: number;
  outputVoltage: number;
  features: Map<string, boolean>;
}

export interface BuckConverterSettings {
  template: string;
  basicMessages: (data: BuckMessagesData) => Message[];
  // hasEnable: boolean;
  // hasPgood: boolean;
  // hasRcSnubber: boolean;
  // hasTransientResponseCap: boolean;
  // hasEnableClamp: boolean;
  // hasPgoodClamp: boolean;
  specialFeatures: {
    description: string;
    onlyIfFlag: string;
    defaultState: boolean;
  }[];
  referenceVoltage: number;
  vinMin: number;
  vinMax: number;
  voutMin: number;
  voutMax: number;
  currentMax: number;
  defaultFilteringOptions: FilteringOptions;
}

export const BuckConverterWidget = React.memo((props: {
  device: Device;
  buckSettings: BuckConverterSettings;
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  const { buckSettings } = props;
  const [targetFeedbackResistance, setTargetFeedbackResistance] = React.useState<number>(100);
  const defaultFeatures = new Map<string, boolean>();
  for (const feature of buckSettings.specialFeatures) {
    defaultFeatures.set(feature.onlyIfFlag, feature.defaultState);
  }
  const [features, setFeatures] = React.useState<Map<string, boolean>>(defaultFeatures);
  const [inputVoltage, setInputVoltage] = React.useState<number>(12.0);
  const [outputVoltage, setOutputVoltage] = React.useState<number>(3.3);
  const [inductorIndex, setInductorIndex] = React.useState<number>(0);
  const [inputMlccIndex, setInputMlccIndex] = React.useState<number>(0);
  const [inputMlccCount, setInputMlccCount] = React.useState<number>(1);
  const [inputAlpolyIndex, setInputAlPolyIndex] = React.useState<number>(0);
  const [inputAlPolyCount, setInputAlPolyCount] = React.useState<number>(0);
  const [outputMlccIndex, setOutputMlccIndex] = React.useState<number>(0);
  const [outputMlccCount, setOutputMlccCount] = React.useState<number>(2);
  const [outputAlpolyIndex, setOutputAlPolyIndex] = React.useState<number>(0);
  const [outputAlPolyCount, setOutputAlPolyCount] = React.useState<number>(0);
  const [feedbackOptionIndex, setFeedbackOptionIndex] = React.useState<number>(0);
  const [allowedResistorValues, setAllowedResistorValues] = React.useState<'e12' | 'e24'>('e24');
  const [topOptions, setTopOptions] = React.useState<Feedback[]>([]);

  const messages: Message[] = props.buckSettings.basicMessages({
    inputVoltage,
    outputVoltage,
    features,
  });

  // We just changed to this device.
  React.useEffect(() => {
    const fo = buckSettings.defaultFilteringOptions;
    // setFeatures(defaultFeatures);
    // Reset filtering options.
    function nn(x: number): number {
      if (x < 0) {
        alert('BUG: findIndex returned negative!');
        throw new Error('findIndex returned negative!');
      }
      return x;
    }
    const x = nn(inductorOptions.findIndex((inductor) => inductor.name === fo.inductor));
    setInductorIndex(x);
    setInputMlccIndex(mlccOptions.findIndex((mlcc) => mlcc.name === fo.inputMlcc));
    setInputMlccCount(fo.inputMlccCount);
    setInputAlPolyIndex(nn(alPolyOptions.findIndex((alPoly) => alPoly.name === fo.inputAlPoly)));
    setInputAlPolyCount(fo.inputAlPolyCount);
    setOutputMlccIndex(nn(mlccOptions.findIndex((mlcc) => mlcc.name === fo.outputMlcc)));
    setOutputMlccCount(fo.outputMlccCount);
    setOutputAlPolyIndex(nn(alPolyOptions.findIndex((alPoly) => alPoly.name === fo.outputAlPoly)));
    setOutputAlPolyCount(fo.outputAlPolyCount);
    // Reset feedback option.
    setFeedbackOptionIndex(0);
  }, [props.device]);

  React.useEffect(() => {
    const options = makeFeedback(
      (r1, r2) => buckSettings.referenceVoltage * (1 + r1 / r2),
      1e3 * targetFeedbackResistance,
      outputVoltage,
      allowedResistorValues === 'e12',
    );
    setTopOptions(options);
  }, [
    targetFeedbackResistance,
    outputVoltage,
    allowedResistorValues,
  ]);

  const defaultFakeOption: Feedback = {
    resistances: [0, null, 0, null],
    achievedVoltage: 0,
    totalResistance: 0,
  };
  const selectedOption = topOptions.length === 0 ? defaultFakeOption
    : topOptions[feedbackOptionIndex];

  const chosenInductor = inductorOptions[inductorIndex];
  const nH = chosenInductor.inductanceNanoHenries;
  const formattedInductance = nH > 1000 ? `${nH / 1000}u` : `${nH}n`;

  // We now add filtering caps right below the bounding box.
  const inputMlcc = mlccOptions[inputMlccIndex];
  const inputAlPoly = alPolyOptions[inputAlpolyIndex];
  const outputMlcc = mlccOptions[outputMlccIndex];
  const outputAlPoly = alPolyOptions[outputAlpolyIndex];

  if (chosenInductor.ratedCurrent < 0.66 * buckSettings.currentMax) {
    messages.unshift({
      severity: 'warning',
      text: `The inductor's rated current (${chosenInductor.ratedCurrent}A) is relatively low compared to the buck converter's rated current (${buckSettings.currentMax}A).`,
    });
  }
  if (inputVoltage < buckSettings.vinMin) {
    messages.unshift({
      severity: 'error',
      text: `Input voltage (${inputVoltage}V) is below the minimum (${buckSettings.vinMin}V).`,
    });
  }
  if (inputVoltage > buckSettings.vinMax) {
    messages.unshift({
      severity: 'error',
      text: `Input voltage (${inputVoltage}V) is above the maximum (${buckSettings.vinMax}V).`,
    });
  }
  if (outputVoltage < buckSettings.voutMin) {
    messages.unshift({
      severity: 'error',
      text: `Output voltage (${outputVoltage}V) is below the minimum (${buckSettings.voutMin}V).`,
    });
  }
  if (outputVoltage > buckSettings.voutMax) {
    messages.unshift({
      severity: 'error',
      text: `Output voltage (${outputVoltage}V) is above the maximum (${buckSettings.voutMax}V).`,
    });
  }
  if (outputVoltage > inputVoltage) {
    messages.unshift({
      severity: 'error',
      text: `Output voltage (${outputVoltage}V) can't be higher than input voltage (${inputVoltage}V).`,
    });
  }

  let parsedContent = parseKicad(buckSettings.template);
  // Let's reconstitute the Kicad code with the selected flags, and eliminating dead parts.
  const editFeatures = new Map(features);
  editFeatures.set('R1Second', selectedOption.resistances[1] !== null);
  editFeatures.set('R2Second', selectedOption.resistances[3] !== null);
  parsedContent = editKicadCode(
    parsedContent, editFeatures,
  );
  const boundingBox = computeBoundingBox(parsedContent);

  if (inputVoltage > 0.75 * inputMlcc.voltageRating && inputMlccCount > 0) {
    const qualifier = inputVoltage > inputMlcc.voltageRating ? '' : ' 75% of';
    messages.unshift({
      severity: inputVoltage > inputMlcc.voltageRating ? 'error' : 'warning',
      text: `Input voltage (${inputVoltage}V) is more than${qualifier} the input MLCC voltage rating (${inputMlcc.voltageRating}V).`,
    });
  }
  if (inputVoltage > 0.75 * inputAlPoly.voltageRating && inputAlPolyCount > 0) {
    const qualifier = inputVoltage > inputAlPoly.voltageRating ? '' : ' 75% of';
    messages.unshift({
      severity: inputVoltage > inputAlPoly.voltageRating ? 'error' : 'warning',
      text: `Input voltage (${inputVoltage}V) is more than${qualifier} the input Al-poly voltage rating (${inputAlPoly.voltageRating}V).`,
    });
  }
  if (outputVoltage > 0.75 * outputMlcc.voltageRating && outputMlccCount > 0) {
    const qualifier = outputVoltage > outputMlcc.voltageRating ? '' : ' 75% of';
    messages.unshift({
      severity: outputVoltage > outputMlcc.voltageRating ? 'error' : 'warning',
      text: `Output voltage (${outputVoltage}V) is more than${qualifier} the output MLCC voltage rating (${outputMlcc.voltageRating}V).`,
    });
  }
  if (outputVoltage > 0.75 * outputAlPoly.voltageRating && outputAlPolyCount > 0) {
    const qualifier = outputVoltage > outputAlPoly.voltageRating ? '' : ' 75% of';
    messages.unshift({
      severity: outputVoltage > outputAlPoly.voltageRating ? 'error' : 'warning',
      text: `Output voltage (${outputVoltage}V) is more than${qualifier} the output Al-poly voltage rating (${outputAlPoly.voltageRating}V).`,
    });
  }

  const inputFilterSubs = {
    "{{FILTER_LABEL}}": 'VIN',
    "{{MLCCvalue}}": inputMlcc.value,
    "{{MLCCfootprint}}": inputMlcc.footprint,
    "{{MLCCdatasheet}}": inputMlcc.datasheet,
    "{{MLCClcsc}}": inputMlcc.lcsc,
    "{{AlPolyvalue}}": inputAlPoly.value,
    "{{AlPolyfootprint}}": inputAlPoly.footprint,
    "{{AlPolydatasheet}}": inputAlPoly.datasheet,
    "{{AlPolylcsc}}": inputAlPoly.lcsc,
  };
  const outputFilterSubs = {
    "{{FILTER_LABEL}}": 'VOUT',
    "{{MLCCvalue}}": outputMlcc.value,
    "{{MLCCfootprint}}": outputMlcc.footprint,
    "{{MLCCdatasheet}}": outputMlcc.datasheet,
    "{{MLCClcsc}}": outputMlcc.lcsc,
    "{{AlPolyvalue}}": outputAlPoly.value,
    "{{AlPolyfootprint}}": outputAlPoly.footprint,
    "{{AlPolydatasheet}}": outputAlPoly.datasheet,
    "{{AlPolylcsc}}": outputAlPoly.lcsc,
  };
  const parsedInputFilterLabel = parseKicad(applySubs(FILTER_LABEL_TEMPLATE, inputFilterSubs));
  const parsedInputFilterMlcc = parseKicad(applySubs(MLCC_TEMPLATE, inputFilterSubs));
  const parsedInputFilterAlPoly = parseKicad(applySubs(AL_POLY_TEMPLATE, inputFilterSubs));
  const parsedOutputFilterLabel = parseKicad(applySubs(FILTER_LABEL_TEMPLATE, outputFilterSubs));
  const parsedOutputFilterMlcc = parseKicad(applySubs(MLCC_TEMPLATE, outputFilterSubs));
  const parsedOutputFilterAlPoly = parseKicad(applySubs(AL_POLY_TEMPLATE, outputFilterSubs));

  const PER_CAP_WIDTH = 12.7;
  const inputFiltersWidth = (inputAlPolyCount + inputMlccCount) * PER_CAP_WIDTH;
  const outputFiltersWidth = (outputAlPolyCount + outputMlccCount) * PER_CAP_WIDTH;

  // We now figure out if we can fit the input and output filters abreast.
  const SPACING_BETWEEN = 1.27; //8.89;
  const totalFiltersWidth = inputFiltersWidth + outputFiltersWidth + SPACING_BETWEEN;
  const canFitAbreast = (boundingBox.maxX - boundingBox.minX) + 5 >= totalFiltersWidth;
  // const inputFilterXStart = (boundingBox.minX + boundingBox.maxX) / 2 -
  //   (canFitAbreast ? totalFiltersWidth : inputFiltersWidth) / 2;
  // const outputFilterXStart = (boundingBox.minX + boundingBox.maxX) / 2 +
  //   (canFitAbreast ? -totalFiltersWidth / 2 + inputFiltersWidth + SPACING_BETWEEN
  //   : -outputFiltersWidth / 2);
  const inputFilterXStart = boundingBox.minX + PER_CAP_WIDTH;
  const outputFilterXStart = (canFitAbreast ? inputFilterXStart + inputFiltersWidth + SPACING_BETWEEN
    : boundingBox.minX) + PER_CAP_WIDTH;
  const inputFilterY = boundingBox.maxY + 10.16;
  const outputFilterY = canFitAbreast ? inputFilterY : inputFilterY + 20.32;

  addCopyOfSchematicAtOffset(
    parsedContent,
    [inputFilterXStart, inputFilterY],
    parsedInputFilterLabel,
  );
  for (let i = 0; i < Math.min(inputAlPolyCount + inputMlccCount, 30); i++) {
    const isAlPoly = i < inputAlPolyCount;
    addCopyOfSchematicAtOffset(
      parsedContent,
      [inputFilterXStart + i * PER_CAP_WIDTH, inputFilterY],
      isAlPoly ? parsedInputFilterAlPoly : parsedInputFilterMlcc,
    );
  }
  addCopyOfSchematicAtOffset(
    parsedContent,
    [outputFilterXStart, outputFilterY],
    parsedOutputFilterLabel,
  );
  for (let i = 0; i < Math.min(outputAlPolyCount + outputMlccCount, 30); i++) {
    const isAlPoly = i < outputAlPolyCount;
    addCopyOfSchematicAtOffset(
      parsedContent,
      [outputFilterXStart + i * PER_CAP_WIDTH, outputFilterY],
      isAlPoly ? parsedOutputFilterAlPoly : parsedOutputFilterMlcc,
    );
  }

  // Let's trim things again, to remove stubs of wires from the filters.
  parsedContent = editKicadCode(parsedContent, editFeatures);
  parsedContent = reannotateSchematic(parsedContent);

  let codeText = applySubs(
    formatKicadCode(parsedContent),
    {
      "{{VOUT}}": selectedOption.achievedVoltage.toFixed(2),
      "{{R1val}}": `${(selectedOption.resistances[0]! * 1e-3).toFixed(0)}k`,
      "{{R1val2}}": `${((selectedOption.resistances[1] || 0) * 1e-3).toFixed(0)}k`,
      "{{R2val}}": `${(selectedOption.resistances[2]! * 1e-3).toFixed(0)}k`,
      "{{R2val2}}": `${((selectedOption.resistances[3] || 0) * 1e-3).toFixed(0)}k`,
      "{{R1lcsc}}": resistorTo0402Lcsc[selectedOption.resistances[0]!],
      "{{R1lcsc2}}": selectedOption.resistances[1] !== null ?
        resistorTo0402Lcsc[selectedOption.resistances[1]!] : 'C00000',
      "{{R2lcsc}}": resistorTo0402Lcsc[selectedOption.resistances[2]!],
      "{{R2lcsc2}}": selectedOption.resistances[3] !== null ?
        resistorTo0402Lcsc[selectedOption.resistances[3]!] : 'C00000',
      "{{L1val}}": formattedInductance,
      "{{L1lcsc}}": chosenInductor.lcsc,
      "{{L1datasheet}}": chosenInductor.datasheet,
      "{{L1footprint}}": chosenInductor.footprint,
    },
  );

  props.setMessages(messages);
  props.setSchematic(codeText);

  return <>
    Vin: {buckSettings.vinMin}V - {buckSettings.vinMax}V<br/>
    Vout: {buckSettings.voutMin}V - {buckSettings.voutMax}V<br/>
    Output current: {buckSettings.currentMax}A<br/>

    <label htmlFor="voltage">Input Voltage: </label>
    <input
      id="vin"
      type="number"
      step="0.1"
      value={inputVoltage}
      onChange={(e) => setInputVoltage(parseFloat(e.target.value))}
    /><br/>
    <label htmlFor="voltage">Output Voltage: </label>
    <input
      id="vout"
      type="number"
      step="0.1"
      value={outputVoltage}
      onChange={(e) => setOutputVoltage(parseFloat(e.target.value))}
    /><br/>
    <label htmlFor="resistance">Target Feedback Resistance: </label>
    <input
      id="resistance"
      type="number"
      step="1"
      value={targetFeedbackResistance}
      onChange={(e) => setTargetFeedbackResistance(parseInt(e.target.value))}
    />k<br/>

    {buckSettings.specialFeatures.length > 0 && <CollapsibleSection defaultOpen title="Special features:">
      {buckSettings.specialFeatures.map((feature, index) => <React.Fragment key={index}>
        <label htmlFor={feature.onlyIfFlag}>{feature.description} </label>
        <input
          id={feature.onlyIfFlag}
          type="checkbox"
          checked={features.get(feature.onlyIfFlag) as boolean ?? false}
          onChange={(e) => {
            const newFeatures = new Map(features);
            newFeatures.set(feature.onlyIfFlag, e.target.checked);
            setFeatures(newFeatures);
          }}
        /><br/>
      </React.Fragment>)}
    </CollapsibleSection>}

    <CollapsibleSection title="Inductor:">
      <label htmlFor="inductor">Inductor: </label>
      <select
        id="inductor"
        value={inductorIndex}
        onChange={(e) => setInductorIndex(parseInt(e.target.value))}
      >
        {inductorOptions.map((inductor, index) => (
          <option key={index} value={index}>
            {inductor.name}
          </option>
        ))}
      </select><br/>
      <p>
        <a href={'https://jlcpcb.com/partdetail/' + chosenInductor.lcsc} target="_blank" rel="noopener noreferrer">
          JLCPCB page
        </a> | Costs roughly ${chosenInductor.roughCost.toFixed(2)}<br/>
        Rated current: {chosenInductor.ratedCurrent}A {
          chosenInductor.saturationCurrent !== null &&
          <>(saturation: {chosenInductor.saturationCurrent}A)</>
        }
        <br/>
        DC resistance: {chosenInductor.dcResistanceMilliohms}mΩ<br/>
        nH/mΩ: {(chosenInductor.inductanceNanoHenries / chosenInductor.dcResistanceMilliohms).toFixed(0)}µs<br/>
        <br/>
      </p>
    </CollapsibleSection>

    <CollapsibleSection title="Filtering capacitors:">
      <label htmlFor="inputMlccPart">Input MLCC part: </label>
      <select
        id="inputMlccPart"
        value={inputMlccIndex}
        onChange={(e) => setInputMlccIndex(parseInt(e.target.value))}
      >
        {mlccOptions.map((mlcc, index) => (
          <option key={index} value={index}>
            {mlcc.name}
          </option>
        ))}
      </select><br/>
      <label htmlFor="inputMlccCount">Input MLCC count: </label>
      <input
        id="inputMlccCount"
        type="number"
        value={inputMlccCount}
        onChange={(e) => setInputMlccCount(Math.max(0, parseInt(e.target.value)))}
      /><br/>
      <label htmlFor="inputAlPolyPart">Input Al-poly bulk capacitor part: </label>
      <select
        id="inputAlPolyPart"
        value={inputAlpolyIndex}
        onChange={(e) => setInputAlPolyIndex(parseInt(e.target.value))}
      >
        {alPolyOptions.map((alPoly, index) => (
          <option key={index} value={index}>
            {alPoly.name}
          </option>
        ))}
      </select><br/>
      <label htmlFor="inputAlPolyCount">Input Al-poly bulk capacitor count: </label>
      <input
        id="inputAlPolyCount"
        type="number"
        value={inputAlPolyCount}
        onChange={(e) => setInputAlPolyCount(Math.max(0, parseInt(e.target.value)))}
      /><br/>
      <label htmlFor="outputMlccPart">Output MLCC part: </label>
      <select
        id="outputMlccPart"
        value={outputMlccIndex}
        onChange={(e) => setOutputMlccIndex(parseInt(e.target.value))}
      >
        {mlccOptions.map((mlcc, index) => (
          <option key={index} value={index}>
            {mlcc.name}
          </option>
        ))}
      </select><br/>
      <label htmlFor="outputMlccCount">Output MLCC count: </label>
      <input
        id="outputMlccCount"
        type="number"
        value={outputMlccCount}
        onChange={(e) => setOutputMlccCount(Math.max(0, parseInt(e.target.value)))}
      /><br/>
      <label htmlFor="outputAlPolyPart">Output Al-poly bulk capacitor part: </label>
      <select
        id="outputAlPolyPart"
        value={outputAlpolyIndex}
        onChange={(e) => setOutputAlPolyIndex(parseInt(e.target.value))}
      >
        {alPolyOptions.map((alPoly, index) => (
          <option key={index} value={index}>
            {alPoly.name}
          </option>
        ))}
      </select><br/>
      <label htmlFor="outputAlPolyCount">Output Al-poly bulk capacitor count: </label>
      <input
        id="outputAlPolyCount"
        type="number"
        value={outputAlPolyCount}
        onChange={(e) => setOutputAlPolyCount(Math.max(0, parseInt(e.target.value)))}
      /><br/>
    </CollapsibleSection>

    <h2>Feedback network solutions:</h2>
    <label htmlFor="allowedResistorValues">Allowed Resistor Values: </label>
    <select
      id="allowedResistorValues"
      value={allowedResistorValues}
      onChange={(e) => setAllowedResistorValues(e.target.value as 'e12' | 'e24')}
    >
      <option value="e12">E12</option>
      <option value="e24">E24</option>
    </select><br/>

    {topOptions.map((option, index) => {
      function format(pair: (number | null)[]): string {
        const [ a, b ] = pair;
        assert(a !== null);
        if (b === null) {
          return `${(a * 1e-3).toFixed(0)}k`;
        } else {
          return `${(a * 1e-3).toFixed(0)}k || ${(b * 1e-3).toFixed(0)}k`;
        }
      }
      const desc = <>
        R<sub>1</sub>={format(option.resistances.slice(0, 2))},
        R<sub>2</sub>={format(option.resistances.slice(2, 4))}
      </>;
      return <>
        <label key={index}>
          <input type="radio" value={index} checked={feedbackOptionIndex === index}
            onChange={() => setFeedbackOptionIndex(index)}
          />
            V<sub>OUT</sub> = {option.achievedVoltage.toFixed(3)}V,
            R<sub>1</sub>+R<sub>2</sub> = {(option.totalResistance * 1e-3).toFixed(1)}kΩ,
            ({desc})
        </label>
        <br/>
      </>;
    })}
  </>;
});

// export function renderBuckConverter(
//   device: Device,
//   // settings: Map<string, string | number | boolean>,
//   // setSettings: (settings: Map<string, string | number | boolean>) => void,
//   buckSettings: BuckConverterSettings,
// ): DeviceResults {
//   return {
//     schematic: buckSettings.template,
//     rendering: <BuckConverterWidget
//       device={device}
//       buckSettings={buckSettings}
//       // settings={settings}
//       // setSettings={setSettings}
//     />,
//   };
// }
