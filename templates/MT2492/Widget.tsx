import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './MT2492.kicad_sch';
import { kicadSchematicToContents } from '../../src/KicadParser';
import { BuckConverterWidget } from '../../src/BuckConverter';
import { medVoltageLowCurrent } from '../../src/CommonComponents';

const template = kicadSchematicToContents(schematicFile);

const MT2492Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  return <BuckConverterWidget
    device={'MT2492'}
    buckSettings={{
      template,
      basicMessages: (data) => [
        {
          severity: data.inputVoltage > 5 ? (data.features.get('EnableClamp') ? 'warning' : 'error') : 'info',
          text: 'Enable (EN) is limited to 6V, so clamp it with a zener diode if you pull it up to VIN, and VIN>5V.',
        },
      ],
      specialFeatures: [
        {
          description: 'Enable cap from VOUT to FB',
          onlyIfFlag: 'TransientResponseCap',
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
      vinMax: 16.0,
      voutMin: 0.6,
      voutMax: 16.0,
      currentMax: 2.0,
      defaultFilteringOptions: medVoltageLowCurrent,
    }}
    setSchematic={props.setSchematic}
    setMessages={props.setMessages}
  />;
});

export const deviceInfoMT2492: DeviceInfo = {
  datasheet: 'https://www.lcsc.com/datasheet/lcsc_datasheet_2408140941_XI-AN-Aerosemi-Tech-MT2492_C89358.pdf',
  description: 'TODO',
  roughCost: 0.04,
  component: MT2492Widget,
}
