import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  US_RESISTOR_TEMPLATE,
} from './Strings';
import {
  formatKicadCode,
  parseKicad,
  mergeInSymbols,
} from './KicadParser';
import { KicadRenderSchematic } from './KicadRenderer';
import { deviceInfoMT2492 } from '../templates/MT2492/Widget';
import { deviceInfoTLV62568 } from '../templates/TLV62568/Widget';
import { deviceInfoLMR33630 } from '../templates/LMR33630/Widget';
import { deviceInfoIR3887 } from '../templates/IR3887/Widget';
import { deviceInfoTPS53355 } from '../templates/TPS53355/Widget';
import { deviceInfoRP2040 } from '../templates/RP2040/Widget';
import { deviceInfoESP32C3FH4 } from '../templates/ESP32-C3FH4/Widget';
import { deviceInfoFT2232H } from '../templates/FT2232H/Widget';
import { deviceInfoINA219 } from '../templates/INA219/Widget';
import { deviceInfoLTC4054 } from '../templates/LTC4054/Widget';

export function applySubs(text: string, replacements: Record<string, string>): string {
  for (const [key, value] of Object.entries(replacements)) {
    text = text.replaceAll(key, value);
  }
  return text;
}

export interface Message {
  severity: 'info' | 'warning' | 'error';
  text: JSX.Element | string;
}

const DEVICE_LIST = [
  'MT2492',
  'TLV62568',
  'LMR33630',
  'IR3887',
  'TPS53355',
  'RP2040',
  'ESP32-C3FH4',
  'FT2232H',
  'INA219',
  'LTC4054',
];

export type Device = typeof DEVICE_LIST[number];

export interface DeviceInfo {
  datasheet: string;
  description: string;
  roughCost: number;
  component: React.ComponentType<{
    setSchematic: (schematic: string) => void;
    setMessages: (messages: Message[]) => void;
  }>;
}

const deviceInfoTable: Record<Device, DeviceInfo> = {
  MT2492: deviceInfoMT2492,
  TLV62568: deviceInfoTLV62568,
  LMR33630: deviceInfoLMR33630,
  IR3887: deviceInfoIR3887,
  TPS53355: deviceInfoTPS53355,
  RP2040: deviceInfoRP2040,
  'ESP32-C3FH4': deviceInfoESP32C3FH4,
  FT2232H: deviceInfoFT2232H,
  INA219: deviceInfoINA219,
  LTC4054: deviceInfoLTC4054,
};

export function CollapsibleSection({
  title, children, defaultOpen,
}: {
  title: string,
  children: React.ReactNode,
  defaultOpen?: boolean,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  return (
    <div style={{ marginTop: 10 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          fontWeight: 'bold',
          fontSize: '130%',
          backgroundColor: '#f0f0f0',
          borderRadius: 3,
          marginBottom: 10,
        }}
      >
        {title} {isOpen ? '▼' : '▶'}
      </div>
      {isOpen && <div style={{ paddingLeft: 10 }}>{children}</div>}
    </div>
  );
}

function DeviceButton(props: {
  thisDevice: Device;
  device: Device;
  setDevice: (device: Device) => void;
  children?: React.ReactNode;
}) {
  return <>
    <button onClick={() => props.setDevice(props.thisDevice)} style={{
      backgroundColor: props.device === props.thisDevice ? '#d0ffd0' : '#d0d0d0',
      margin: 1,
    }} className='hover-button'>
      {props.thisDevice}
    </button> {props.children}
    <br/>
  </>;
}

function App() {
  const [device, setDevice] = useState<Device>('LMR33630');
  // Global settings.
  const [usSymbols, setUsSymbols] = useState(false);
  const [passiveSize, setPassiveSize] = useState<'0201' | '0402' | '0603'>('0402');
  const [schematic, setSchematic] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  // Widget-specific settings.
  // const [settings, realSetSettings] = useState<Map<string, string | number | boolean>>(new Map());
  const deviceInfo = deviceInfoTable[device];

  // const setSettings = (newSettings: Map<string, string | number | boolean>) => {
  //   console.log('SETTING NEW SETTINGS:', newSettings);
  //   realSetSettings(newSettings);
  // };

  // console.log('Rerendering entire app with:', settings);

  // const rendering = deviceInfo.render(setSchematic, setMessages);
  const DeviceComponent = deviceInfo.component;

  let parsedContent = parseKicad(schematic);

  if (usSymbols) {
    mergeInSymbols(parsedContent, parseKicad(US_RESISTOR_TEMPLATE).symbols);
    console.log(parsedContent.symbols);
  }
  let codeText = formatKicadCode(parsedContent);
  if (usSymbols) {
    codeText = applySubs(codeText, {'(lib_id "Device:R")': '(lib_id "Device:R_US")'});
  }
  parsedContent = parseKicad(codeText);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeText).then(() => {
      alert('Design copied to clipboard! Simply paste directly into your kicad schematic.');
    });
  };

  const bomCounter = new Map<string, {
    count: number;
    name: string;
  }>();
  for (const object of parsedContent.objects) {
    if (object.parsed.type !== 'symbol') {
      continue;
    }
    // Find the LCSC entry.
    const lcscNode = object.parsed.properties.find((prop) => prop.name === '"LCSC"');
    if (lcscNode === undefined) {
      continue;
    }
    const lcsc = JSON.parse(lcscNode.value);
    if (lcsc === '') {
      continue;
    }
    const value = JSON.parse(object.parsed.properties.find((prop) => prop.name === '"Value"')!.value);
    let name = `${value}`;
    const prefixTable: any = {
      "Device:R_US": 'Resistor',
      "Device:R": 'Resistor',
      "Device:C": 'Capacitor MLCC',
      "Device:C_Polarized_US": 'Capacitor Al-Poly',
      "Device:L": 'Inductor',
    };
    const libId = JSON.parse(object.parsed.libId);
    if (libId in prefixTable) {
      name = `${prefixTable[libId]} ${name}`;
    }
    if (!bomCounter.has(lcsc)) {
      bomCounter.set(lcsc, { count: 0, name });
    }
    bomCounter.get(lcsc)!.count += 1;
  }
  const bomEntries = Array.from(bomCounter.entries()).map(([lcsc, { count, name }]) => ({
    lcsc,
    count,
    name,
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{
      display: 'flex',
    }}>
      <div style={{
        width: 500,
        minWidth: 500,
        maxWidth: 500,
        height: '100vh',
        backgroundColor: '#f0f0f0',
        paddingLeft: 20,
        paddingRight: 20,
        overflowY: 'auto',
      }}>
        {/* <div style={{ fontWeight: 'bold', fontSize: '180%', margin: 10 }}>Circuit Snippet Generator</div> */}
        {/* <div style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          <div style={{
            border: '1px solid black',
            borderRadius: 5,
            padding: 5,
            backgroundColor: '#fff',
          }}> */}

        <CollapsibleSection defaultOpen title='Devices'>
          <div style={{ fontWeight: 'bold', fontSize: '120%' }}>
            Buck converters:
          </div>
          <DeviceButton thisDevice='MT2492' device={device} setDevice={setDevice}>
            The most popular buck converter on JLCPCB
          </DeviceButton>
          <DeviceButton thisDevice='TLV62568' device={device} setDevice={setDevice}>
            1A buck converter with PGOOD
          </DeviceButton>
          <DeviceButton thisDevice='LMR33630' device={device} setDevice={setDevice}>
            3A buck converter with PGOOD, wide range
          </DeviceButton>
          <DeviceButton thisDevice='IR3887' device={device} setDevice={setDevice}>
            30A fancy buck converter, kind of pricey
          </DeviceButton>
          <DeviceButton thisDevice='TPS53355' device={device} setDevice={setDevice}>
            30A fancy buck converter (recommended)
          </DeviceButton>

          <div style={{ fontWeight: 'bold', fontSize: '120%' }}>
            Microcontrollers:
          </div>
          <DeviceButton thisDevice='RP2040' device={device} setDevice={setDevice}>
            The Raspberry Pi Pico microcontroller
          </DeviceButton>
          <DeviceButton thisDevice='ESP32-C3FH4' device={device} setDevice={setDevice}>
            Very simple, with integrated wifi+bluetooth
          </DeviceButton>

          <div style={{ fontWeight: 'bold', fontSize: '120%' }}>
            Misc:
          </div>
          <DeviceButton thisDevice='FT2232H' device={device} setDevice={setDevice}>
            USB to UART/I2C/JTAG/SPI/GPIO converter
          </DeviceButton>
          <DeviceButton thisDevice='INA219' device={device} setDevice={setDevice}>
            Current and voltage shunt monitor with I2C
          </DeviceButton>
          <DeviceButton thisDevice='LTC4054' device={device} setDevice={setDevice}>
            1S Li-ion battery charger with indicator LEDs
          </DeviceButton>
        </CollapsibleSection>

        {/* <label htmlFor="device" style={{ fontWeight: 'bold', fontSize: '120%' }}>Device: </label> */}
        {/* <select
          id="device"
          value={device}
          onChange={(e) => setDevice(e.target.value as Device)}
        >
          {DEVICE_LIST.map((dev) => (
            <option key={dev} value={dev}>{dev}</option>
          ))}
        </select><br/> */}

        <hr/>

        <span style={{ fontWeight: 'bold', fontSize: '120%' }}>Device: {device}</span>

        <div style={{
          marginTop: 10,
        }}>
          <DeviceComponent
            setSchematic={setSchematic}
            setMessages={setMessages}
          />
        </div>

        {/* <p>
          <a href={deviceInfo.datasheet} target="_blank" rel="noopener noreferrer">
            Datasheet
          </a> | Costs roughly ${deviceInfo.roughCost.toFixed(2)}<br/>
        </p> */}

        <br/>
        <label htmlFor="usSymbols">Use US symbols: </label>
        <input
          id="usSymbols"
          type="checkbox"
          checked={usSymbols}
          onChange={(e) => setUsSymbols(e.target.checked)}
        /><br/>

        <label htmlFor="passiveSize">Default passive size: </label>
        <select
          id="passiveSize"
          value={passiveSize}
          onChange={(e) => setPassiveSize(e.target.value as '0201' | '0402' | '0603')}
        >
          {/* <option value="0201">0201</option> */}
          <option value="0402">0402</option>
          {/* <option value="0603">0603</option> */}
        </select><br/>

        <hr/>

        <div style={{
          opacity: 0.7,
          marginBottom: 10,
          textAlign: 'center',
        }}>
          Created by <a href="https://peter.website/">Peter Schmidt-Nielsen</a>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
      }}>
        <KicadRenderSchematic schematic={parsedContent} />
        <div style={{
          borderLeft: '1px solid black',
          height: '30vh',
          backgroundColor: '#ccc',
          display: 'flex',
        }}>
          {/* BOM and parts */}
          <div style={{
            width: 450,
            minWidth: 450,
            padding: 5,
            borderRight: '1px solid black',
            overflowY: 'auto',
          }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 20,
            }}>Messages:</div>
            {messages.map((msg, index) => (
              <div key={index} style={{
                color: { info: 'black', warning: '#b84', error: 'red' }[msg.severity],
                padding: 3,
                border: '1px solid ' + { info: 'black', warning: 'orange', error: 'red' }[msg.severity],
                borderRadius: 3,
                backgroundColor: { info: '#f0f0f0', warning: '#fff8e1', error: '#ffebee' }[msg.severity],
                marginBottom: 3,
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* BOM and parts */}
          <div style={{
            padding: 5,
            overflowY: 'auto',
            width: '100%',
          }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 20,
            }}>BOM:</div>
            <ul>
              {bomEntries.map((entry, index) => (
                <li key={index}>
                  {entry.count} pcs - <a href={'https://jlcpcb.com/partdetail/' + entry.lcsc} target="_blank" rel="noopener noreferrer">
                    ({entry.lcsc}) {entry.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <button style={{
        position: 'absolute',
        right: 20,
        top: 20,
        fontSize: '120%',
      }} className='glow-on-load' onClick={copyToClipboard}>
        Copy KiCad Design to Clipboard!
      </button>
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
