import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './LMR33630.kicad_sch';
import { kicadSchematicToContents } from '../../src/KicadParser';
import { BuckConverterWidget } from '../../src/BuckConverter';
import { medVoltageLowCurrent } from '../../src/CommonComponents';

const template = kicadSchematicToContents(schematicFile);

const LMR33630Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  return <BuckConverterWidget
    device={'LMR33630'}
    buckSettings={{
      template,
      basicMessages: (data) => [
        {
          severity: 'info',
          text: 'Enable (EN) is limited to VIN+0.3V, so no clamping is needed.',
        },
        {
          severity: 'info',
          text: 'PGOOD is open-drain, so you must pull it up if you use it!',
        },
        {
          severity: data.inputVoltage > 20 ? 'warning' : 'info',
          text: "PGOOD is limited to 22V, so make sure to pull up PGOOD to the VCC pin (not VIN), if VIN>20V.",
        },
      ],
      specialFeatures: [
        {
          description: 'Enable cap from VOUT to FB',
          onlyIfFlag: 'TransientResponseCap',
          defaultState: false,
        },
      ],
      referenceVoltage: 1.0,
      vinMin: 3.8,
      vinMax: 36.0,
      voutMin: 1.0,
      voutMax: 24.0,
      currentMax: 3.0,
      defaultFilteringOptions: medVoltageLowCurrent,
    }}
    setSchematic={props.setSchematic}
    setMessages={props.setMessages}
  />;
});

export const deviceInfoLMR33630: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 0.00,
  component: LMR33630Widget,
}
