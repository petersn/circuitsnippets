import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './ESP32-C3FH4.kicad_sch';
import { editKicadCode, formatKicadCode, kicadSchematicToContents, parseKicad, reannotateSchematic } from '../../src/KicadParser';

const template = kicadSchematicToContents(schematicFile);

const ESP32C3FH4Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  const [bootselButton, setBootselButton] = React.useState<boolean>(true);

  let parsedContent = parseKicad(template);
  parsedContent = editKicadCode(parsedContent, new Map([
    ['BootselButton', bootselButton],
  ]));
  parsedContent = reannotateSchematic(parsedContent);
  props.setSchematic(formatKicadCode(parsedContent));
  props.setMessages([
    // {
    //   severity: 'info',
    //   text: 'This is a placeholder for the ESP32C3FH4 widget.',
    // },
  ]);

  return <div>
    <p>
      The ESP32-C3FH4 is programmable over the UART pins, but you must hold BOOTSEL low at power-on to enter programming mode.
    </p>
    <label>
      <input
        type="checkbox"
        checked={bootselButton}
        onChange={() => setBootselButton(!bootselButton)}
      />
      Add a button to put the ESP32-C3FH4 into programming mode
    </label>
  </div>;
});

export const deviceInfoESP32C3FH4: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 1.50,
  component: ESP32C3FH4Widget,
}
