import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './INA219.kicad_sch';
import { editKicadCode, formatKicadCode, kicadSchematicToContents, parseKicad, reannotateSchematic } from '../../src/KicadParser';

const template = kicadSchematicToContents(schematicFile);

const INA219Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  let parsedContent = parseKicad(template);
  parsedContent = editKicadCode(parsedContent, new Map([]));
  parsedContent = reannotateSchematic(parsedContent);
  props.setSchematic(formatKicadCode(parsedContent));
  props.setMessages([]);

  return <div>
    The INA219 is a high-side current and voltage shunt monitor with an I2C interface.
  </div>;
});

export const deviceInfoINA219: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 1.00,
  component: INA219Widget,
}
