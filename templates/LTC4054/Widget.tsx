import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './LTC4054.kicad_sch';
import { editKicadCode, formatKicadCode, kicadSchematicToContents, parseKicad, reannotateSchematic } from '../../src/KicadParser';

const template = kicadSchematicToContents(schematicFile);

const LTC4054Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  let parsedContent = parseKicad(template);
  parsedContent = editKicadCode(parsedContent, new Map([]));
  parsedContent = reannotateSchematic(parsedContent);
  props.setSchematic(formatKicadCode(parsedContent));
  props.setMessages([]);

  return <div>
    The LTC4054 is a charger IC for a single Li-ion cell battery.
    It automatically shuts off once the battery has reached the 4.2V target voltage, and once charge current has fallen below 10% of the programmed charge current.
    The IC charges at a current of 1000 V / R<sub>PROG</sub>, or about 800 mA as configured on the right.
  </div>;
});

export const deviceInfoLTC4054: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 1.00,
  component: LTC4054Widget,
}
