import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './TPS53355.kicad_sch';
import { kicadSchematicToContents } from '../../src/KicadParser';
import { BuckConverterWidget } from '../../src/BuckConverter';
import { medVoltageHighCurrent } from '../../src/CommonComponents';

const template = kicadSchematicToContents(schematicFile);

const TPS53355Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  return <BuckConverterWidget
    device={'TPS53355'}
    buckSettings={{
      template,
      basicMessages: (data) => [
        {
          severity: 'info',
          text: <>To get the footprint for this part run:<br/><code>easyeda2kicad --full --lcsc_id=C148172</code></>,
        },
        {
          severity: (
            data.inputVoltage > 5 ?
              (data.features.get('EnableClamp') ? 'warning' : 'error')
              : 'info'
          ) as 'info' | 'warning' | 'error',
          text: 'Enable (EN) is limited to 7V, so clamp it with a zener diode if you pull it up to VIN, and VIN>5V.',
        },
        {
          severity: 'info',
          text: 'PGOOD is open-drain, so you must pull it up if you use it!',
        },
        {
          severity: data.inputVoltage > 5 ? 'warning' : 'info',
          text: "PGOOD is limited to 7V, so make sure to pull up PGOOD to the VREG pin (not VIN), if VIN>5V.",
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
      vinMin: 4.5,
      vinMax: 15.0,
      voutMin: 0.6,
      voutMax: 5.5,
      currentMax: 30.0,
      defaultFilteringOptions: medVoltageHighCurrent,
    }}
    setSchematic={props.setSchematic}
    setMessages={props.setMessages}
  />;
});

export const deviceInfoTPS53355: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 0.00,
  component: TPS53355Widget,
}
