import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './RP2040.kicad_sch';
import { editKicadCode, formatKicadCode, kicadSchematicToContents, parseKicad, reannotateSchematic } from '../../src/KicadParser';

const template = kicadSchematicToContents(schematicFile);

const RP2040Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  const [ldoOption, setLdoOption] = React.useState<null | 'small' | 'big'>('small');
  const [bootselButton, setBootselButton] = React.useState<boolean>(true);

  let parsedContent = parseKicad(template);
  parsedContent = editKicadCode(parsedContent, new Map([
    ['SmallLDO', ldoOption === 'small'],
    ['BigLDO', ldoOption === 'big'],
    ['BootselButton', bootselButton],
  ]));
  parsedContent = reannotateSchematic(parsedContent);
  props.setSchematic(formatKicadCode(parsedContent));
  props.setMessages([
    // {
    //   severity: 'info',
    //   text: 'This is a placeholder for the RP2040 widget.',
    // },
  ]);

  return <div>
    Pick a power source for the RP2040:<br/>
    {[
      [null, 'No LDO (you must provide +3V3)'],
      // Small LDO: 3.3V to 6V in, 200 mA out.
      ['small', 'Small LDO for running off of +5V from USB (200mA max output)'],
      // Big LDO: 4.5V to 14V in, 1,000 mA out.
      ['big', 'Big LDO for running off of 4.5V to 12V (1A max output)'],
    ].map(([value, label]) => <>
      <label key={value}>
        <input
          type="radio"
          name="ldoOption"
          value={value ?? ''}
          checked={ldoOption === value}
          onChange={() => setLdoOption(value as 'small' | 'big' | null)}
        />
        {label}
      </label><br/>
    </>)}
    <p>
      If you want to minimize power draw then disconnect pin 45 (the RP2040's internal LDO), and provide the 1.1V and 3.3V rails yourself.
    </p>

    <p>
      The RP2040 is programmable over USB, but after flashing if you don't enable USB IO it becomes unavailable, unless you hold QSPI_SS low on start-up to enter bootsel mode.
      You can short the pin with some tweezers or something, or put a bootsel button down to hold QSPI_SS low (like the Pico board does).
    </p>
    <label>
      <input
        type="checkbox"
        checked={bootselButton}
        onChange={() => setBootselButton(!bootselButton)}
      />
      Add a button to put the RP2040 into bootsel mode
    </label>
  </div>;
});

export const deviceInfoRP2040: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 0.70,
  component: RP2040Widget,
}
