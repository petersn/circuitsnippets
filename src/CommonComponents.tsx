
export const resistorTo0402Lcsc: Record<number, string> = {
  10000: "C25744", 11000: "C25749",
  12000: "C25752", 13000: "C25754",
  15000: "C25756", 16000: "C25759",
  18000: "C25762", 20000: "C25765",
  22000: "C25768", 24000: "C25769",
  27000: "C25771", 30000: "C25776",
  33000: "C25779", 36000: "C43676",
  39000: "C25783", 43000: "C8329",
  47000: "C25563", 51000: "C25794",
  56000: "C25796", 62000: "C37825",
  68000: "C36871", 75000: "C25798",
  82000: "C4142",  91000: "C4147",
  100000: "C25741", 110000: "C25745",
  120000: "C25750", 130000: "C52929",
  150000: "C25755",
};

export const E12_VALUES = [
  10000, 12000, 15000, 18000, 22000, 27000, 33000, 39000, 47000, 56000, 68000, 82000, 100000, 120000, 150000,
];
export const E24_VALUES = Object.keys(resistorTo0402Lcsc).map(r => parseInt(r, 10));

export interface InductorOption {
  name: string;
  lcsc: string;
  datasheet: string;
  footprint: string;
  roughCost: number;
  inductanceNanoHenries: number;
  ratedCurrent: number;
  saturationCurrent: number | null;
  dcResistanceMilliohms: number;
}

export const inductorOptions: InductorOption[] = [
  {
    name: '2.2uH 2.3A (CY43-2.2UH)',
    lcsc: 'C2929416',
    datasheet: 'https://jlcpcb.com/api/file/downloadByFileSystemAccessId/8589784584884674560',
    footprint: 'Inductor_SMD:L_Taiyo-Yuden_NR-40xx',
    roughCost: 0.03,
    inductanceNanoHenries: 2200,
    ratedCurrent: 2.3,
    saturationCurrent: null,
    dcResistanceMilliohms: 42,
  },
  {
    name: '4.7uH 3.1A (CY54-4.7UH)',
    lcsc: 'C2929429',
    datasheet: 'https://jlcpcb.com/api/file/downloadByFileSystemAccessId/8590208144669777920',
    footprint: 'Inductor_SMD:L_Taiyo-Yuden_NR-50xx', // SMD,5.8x5.2mm
    roughCost: 0.04,
    inductanceNanoHenries: 4700,
    ratedCurrent: 3.1,
    saturationCurrent: null,
    dcResistanceMilliohms: 52,
  },
  {
    name: '47uH 5A (YSPI1365-470M)',
    lcsc: 'C497913',
    datasheet: 'https://jlcpcb.com/api/file/downloadByFileSystemAccessId/8588893478968942592',
    footprint: 'Inductor_SMD:L_Chilisin_BMRF00131350', // SMD,13.8x12.6x6.5mm
    roughCost: 0.53,
    inductanceNanoHenries: 47000,
    ratedCurrent: 5.0,
    saturationCurrent: null,
    dcResistanceMilliohms: 57.5,
  },
  {
    name: '330nH 25A (Würth 744308033)',
    lcsc: 'C2046998',
    datasheet: 'https://www.we-online.com/components/products/datasheet/744308033.pdf',
    footprint: 'Inductor_SMD:L_Wuerth_HCM-1050',
    roughCost: 0.56,
    inductanceNanoHenries: 330,
    ratedCurrent: 25.0,
    saturationCurrent: 32.0,
    dcResistanceMilliohms: 0.37,
  },
  {
    name: '680nH 33A (FXL1350-R68-M)',
    lcsc: 'C526009',
    datasheet: 'https://jlcpcb.com/api/file/downloadByFileSystemAccessId/8608737592758050816',
    footprint: 'Inductor_SMD:L_Wuerth_HCM-1390', // SMD,12.6x13.5mm
    roughCost: 0.53,
    inductanceNanoHenries: 680,
    ratedCurrent: 33.0,
    saturationCurrent: 46.0,
    dcResistanceMilliohms: 1.55,
  },
  {
    name: '1uH 34A (FHC1365-R82M)',
    lcsc: 'C2847568',
    datasheet: 'https://jlcpcb.com/api/file/downloadByFileSystemAccessId/8590183085879681024',
    footprint: 'Inductor_SMD:L_Wuerth_HCM-1390', // SMD,12.6x13.5mm
    roughCost: 0.65,
    inductanceNanoHenries: 1000,
    ratedCurrent: 34.0,
    saturationCurrent: 40.0,
    dcResistanceMilliohms: 1.6,
  },
];

export interface MlccOption {
  name: string;
  value: string;
  lcsc: string;
  datasheet: string;
  footprint: string;
  capacitanceMicroFarads: number;
  // esrMilliohms: number;
  voltageRating: number;
}

export const mlccOptions: MlccOption[] = [
  // X5R section
  {
    name: '25V 10uF X5R 0603',
    value: '25V 10uF',
    lcsc: 'C96446',
    datasheet: 'https://jlcpcb.com/partdetail/C96446',
    footprint: 'Capacitor_SMD:C_0603_1608Metric',
    capacitanceMicroFarads: 10,
    voltageRating: 25,
  },
  {
    name: '50V 1uF X5R 0603',
    value: '50V 1uF',
    lcsc: 'C15849',
    datasheet: 'https://jlcpcb.com/partdetail/C15849',
    footprint: 'Capacitor_SMD:C_0603_1608Metric',
    capacitanceMicroFarads: 1,
    voltageRating: 50,
  },
  {
    name: '16V 4.7uF X5R 0402',
    value: '16V 4.7uF',
    lcsc: 'C318563',
    datasheet: 'https://jlcpcb.com/partdetail/C318563',
    footprint: 'Capacitor_SMD:C_0402_1005Metric',
    capacitanceMicroFarads: 4.7,
    voltageRating: 16,
  },
  {
    name: '6.3V 22uF X5R 0402',
    value: '6.3V 22uF',
    lcsc: 'C415703',
    datasheet: 'https://jlcpcb.com/partdetail/C415703',
    footprint: 'Capacitor_SMD:C_0402_1005Metric',
    capacitanceMicroFarads: 22,
    voltageRating: 6.3,
  },
  {
    name: '50V 10uF X5R 0805',
    value: '50V 10uF',
    lcsc: 'C440198',
    datasheet: 'https://jlcpcb.com/partdetail/C440198',
    footprint: 'Capacitor_SMD:C_0805_2012Metric',
    capacitanceMicroFarads: 10,
    voltageRating: 50,
  },
  // X7R section
  {
    name: '10V 2.2uF X7R 0402',
    value: '10V 2.2uF',
    lcsc: 'C2997286',
    datasheet: 'https://jlcpcb.com/partdetail/C2997286',
    footprint: 'Capacitor_SMD:C_0402_1005Metric',
    capacitanceMicroFarads: 2.2,
    voltageRating: 10,
  },
  {
    name: '50V 0.1uF X7R 0402',
    value: '50V 0.1uF',
    lcsc: 'C307331',
    datasheet: 'https://jlcpcb.com/partdetail/C307331',
    footprint: 'Capacitor_SMD:C_0402_1005Metric',
    capacitanceMicroFarads: 0.1,
    voltageRating: 50,
  },
  {
    name: '50V 1uF X7R 0805',
    value: '50V 1uF',
    lcsc: 'C28323',
    datasheet: 'https://jlcpcb.com/partdetail/C28323',
    footprint: 'Capacitor_SMD:C_0805_2012Metric',
    capacitanceMicroFarads: 1,
    voltageRating: 50,
  },
];

export interface AlPolyOption {
  name: string;
  value: string;
  lcsc: string;
  datasheet: string;
  footprint: string;
  capacitanceMicroFarads: number;
  esrMilliohms: number;
  voltageRating: number;
}

export const alPolyOptions: AlPolyOption[] = [
  // {
  //   name: '25V 100uF D6.3mm',
  //   value: '25V 100uF',
  //   lcsc: 'FAKEO',
  //   footprint: 'Capacitor_THT:CP_Radial_D6.3mm_P2.50mm',
  //   datasheet: 'https://jlcpcb.com/partdetail/FAKEO',
  //   capacitanceMicroFarads: 100,
  //   esrMilliohms: 20,
  //   voltageRating: 25,
  // },
  {
    name: '25V 470uF D6.3mm',
    value: '25V 470uF',
    lcsc: 'C5243845',
    footprint: 'Capacitor_THT:CP_Radial_D6.3mm_P2.50mm',
    datasheet: 'https://jlcpcb.com/partdetail/C5243845',
    capacitanceMicroFarads: 470,
    esrMilliohms: 35,
    voltageRating: 25,
  },
  {
    name: '35V 220uF D6.3mm',
    value: '35V 220uF',
    lcsc: 'C46550432',
    footprint: 'Capacitor_THT:CP_Radial_D6.3mm_P2.50mm',
    datasheet: 'https://jlcpcb.com/partdetail/C46550432',
    capacitanceMicroFarads: 220,
    esrMilliohms: 16,
    voltageRating: 35,
  },
  {
    name: '63V 47uF D6.3mm',
    value: '63V 47uF',
    lcsc: 'C2691840',
    footprint: 'Capacitor_THT:CP_Radial_D6.3mm_P2.50mm',
    datasheet: 'https://jlcpcb.com/partdetail/C2691840',
    capacitanceMicroFarads: 47,
    esrMilliohms: 60,
    voltageRating: 63,
  },
];

export interface FilteringOptions {
  inductor: string;
  inputMlcc: string;
  inputMlccCount: number;
  inputAlPoly: string;
  inputAlPolyCount: number;
  outputMlcc: string;
  outputMlccCount: number;
  outputAlPoly: string;
  outputAlPolyCount: number;
}

export const medVoltageLowCurrent: FilteringOptions = {
  inductor: '2.2uH 2.3A (CY43-2.2UH)',
  inputMlcc: '25V 10uF X5R 0603',
  inputMlccCount: 1,
  inputAlPoly: '25V 470uF D6.3mm',
  inputAlPolyCount: 0,
  outputMlcc: '25V 10uF X5R 0603',
  outputMlccCount: 2,
  outputAlPoly: '25V 470uF D6.3mm',
  outputAlPolyCount: 0,
};

export const medVoltageHighCurrent: FilteringOptions = {
  inductor: '330nH 25A (Würth 744308033)',
  inputMlcc: '25V 10uF X5R 0603',
  inputMlccCount: 2,
  inputAlPoly: '25V 470uF D6.3mm',
  inputAlPolyCount: 1,
  outputMlcc: '25V 10uF X5R 0603',
  outputMlccCount: 4,
  outputAlPoly: '25V 470uF D6.3mm',
  outputAlPolyCount: 1,
};
