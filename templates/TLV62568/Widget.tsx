import React from 'react';
import { Message, DeviceInfo } from '../../src/App';
import schematicFile from './TLV62568.kicad_sch';
import { kicadSchematicToContents } from '../../src/KicadParser';
import { BuckConverterWidget } from '../../src/BuckConverter';
import { medVoltageLowCurrent } from '../../src/CommonComponents';

const template = kicadSchematicToContents(schematicFile);

const TLV62568Widget = React.memo((props: {
  setSchematic: (schematic: string) => void;
  setMessages: (messages: Message[]) => void;
}) => {
  return <BuckConverterWidget
    device={'TLV62568'}
    buckSettings={{
      template,
      basicMessages: (data) => [
        {
          severity: 'info',
          text: 'PGOOD is open-drain, so you must pull it up if you use it!',
        },
        {
          severity: 'info',
          text: "ENABLE and PGOOD are not to exceed 6V.",
        },
      ],
      specialFeatures: [],
      referenceVoltage: 0.6,
      vinMin: 2.5,
      vinMax: 5.5,
      voutMin: 0.6,
      voutMax: 5.5,
      currentMax: 1.0,
      defaultFilteringOptions: medVoltageLowCurrent,
    }}
    setSchematic={props.setSchematic}
    setMessages={props.setMessages}
  />;
});

export const deviceInfoTLV62568: DeviceInfo = {
  datasheet: '',
  description: 'TODO',
  roughCost: 0.00,
  component: TLV62568Widget,
}
