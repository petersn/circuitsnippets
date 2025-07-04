import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './IR3887.kicad_sch';
import { kicadSchematicToContents } from '../../src/KicadParser';
import { BuckConverterWidget } from '../../src/BuckConverter';
import { medVoltageHighCurrent } from '../../src/CommonComponents';

const template = kicadSchematicToContents(schematicFile);

const IR3887Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  return <BuckConverterWidget
    device={'IR3887'}
    buckSettings={{
      template,
      basicMessages: (data) => [
        {
          severity: 'info',
          text: <>To get the weird footprint for this part run:<br/><code>easyeda2kicad --full --lcsc_id=C537724</code></>,
        },
        {
          severity: 'info',
          text: 'Enable (EN) is limited to 25V, so no clamping is needed.',
        },
        {
          severity: 'info',
          text: 'PGOOD is open-drain, so you must pull it up if you use it!',
        },
        {
          severity: data.inputVoltage > 5 ? 'warning' : 'info',
          text: "PGOOD is limited to 6V, so make sure to pull up PGOOD to the VCC/LDO pin (not VIN), if VIN>5V.",
        },
      ],
      specialFeatures: [
        {
          description: 'Enable RC snubber',
          onlyIfFlag: 'RCSnubber',
          defaultState: false,
        },
        {
          description: 'Clamp voltage on EN pin',
          onlyIfFlag: 'EnableClamp',
          defaultState: false,
        },
      ],
      referenceVoltage: 0.6,
      vinMin: 4.3,
      vinMax: 17.0,
      voutMin: 0.6,
      voutMax: 6.0,
      currentMax: 30.0,
      defaultFilteringOptions: medVoltageHighCurrent,
    }}
    setSchematic={props.setSchematic}
    setMessages={props.setMessages}
  />;
});

export const deviceInfoIR3887: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 0.00,
  component: IR3887Widget,
}
