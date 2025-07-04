import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './FT2232H.kicad_sch';
import { editKicadCode, formatKicadCode, kicadSchematicToContents, parseKicad, reannotateSchematic } from '../../src/KicadParser';

const template = kicadSchematicToContents(schematicFile);

const FT2232HWidget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  const [useEeprom, setUseEeprom] = React.useState<boolean>(true);

  let parsedContent = parseKicad(template);
  parsedContent = editKicadCode(parsedContent, new Map([
    ['UseEEPROM', useEeprom],
  ]));
  parsedContent = reannotateSchematic(parsedContent);
  props.setSchematic(formatKicadCode(parsedContent));
  props.setMessages([
    // {
    //   severity: 'info',
    //   text: 'This is a placeholder for the FT2232H widget.',
    // },
  ]);

  return <div>
    <p>
      By default the FT2232H shows up with a generic FTDI name reported to the OS.
      If you want to customize this string (or configure other special settings) you need to include the configuration EEPROM.
      For basic usage (JTAG, UART, GPIO, etc. with the default name for the OS) you don't need this.
    </p>
    <label>
      <input
        type="checkbox"
        checked={useEeprom}
        onChange={() => setUseEeprom(!useEeprom)}
      />
      Include the configuration EEPROM
    </label>
  </div>;
});

export const deviceInfoFT2232H: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 0.70,
  component: FT2232HWidget,
}
