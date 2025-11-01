
// Vessel scraper for Malaysia ports from VesselFinder
// Note: In production, this should be done server-side to avoid CORS issues

export interface VesselDetails {
  name: string;
  imo: string;
  mmsi: string;
  type: string;
  flag: string;
  destination: string;
  eta: string;
  status: 'Expected' | 'Arrivals' | 'Departures' | 'In Port';
  lastPosition: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export interface PortVesselData {
  portName: string;
  portCode: string;
  expected: VesselDetails[];
  arrivals: VesselDetails[];
  departures: VesselDetails[];
  inPort: VesselDetails[];
}

// Malaysia major ports
export const MALAYSIA_PORTS = [
  { name: 'Port Klang', code: 'MYPKG', url: 'https://www.vesselfinder.com/ports/MYPKG' },
  { name: 'Penang Port', code: 'MYPEN', url: 'https://www.vesselfinder.com/ports/MYPEN' },
  { name: 'Johor Port', code: 'MYPGU', url: 'https://www.vesselfinder.com/ports/MYPGU' },
  { name: 'Kuantan Port', code: 'MYKUA', url: 'https://www.vesselfinder.com/ports/MYKUA' },
  { name: 'Bintulu Port', code: 'MYBTU', url: 'https://www.vesselfinder.com/ports/MYBTU' },
  { name: 'Tanjung Pelepas', code: 'MYTPP', url: 'https://www.vesselfinder.com/ports/MYTPP' },
  { name: 'Lumut Port', code: 'MYLMU', url: 'https://www.vesselfinder.com/ports/MYLMU' },
  { name: 'Kemaman Port', code: 'MYKEM', url: 'https://www.vesselfinder.com/ports/MYKEM' },
];

// This function would need a backend API to avoid CORS
// For now, we'll use mock data based on real vessel patterns
export const fetchPortVesselData = async (portCode: string): Promise<PortVesselData | null> => {
  try {
    // In production, this would call your backend API that scrapes VesselFinder
    // For now, return realistic mock data
    return getMockPortVesselData(portCode);
  } catch (error) {
    console.error('Error fetching vessel data:', error);
    return null;
  }
};

const getMockPortVesselData = (portCode: string): PortVesselData => {
  const port = MALAYSIA_PORTS.find(p => p.code === portCode);
  
  return {
    portName: port?.name || 'Unknown Port',
    portCode,
    expected: [
      {
        name: 'MAERSK ESSEX',
        imo: '9632495',
        mmsi: '219635000',
        type: 'Container Ship',
        flag: 'Denmark',
        destination: portCode,
        eta: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'Expected',
        lastPosition: { lat: 3.0, lng: 101.5, timestamp: new Date().toISOString() }
      }
    ],
    arrivals: [
      {
        name: 'COSCO SHIPPING',
        imo: '9728294',
        mmsi: '477123400',
        type: 'Container Ship',
        flag: 'Hong Kong',
        destination: portCode,
        eta: new Date(Date.now() - 3600000).toISOString(),
        status: 'Arrivals',
        lastPosition: { lat: 3.1, lng: 101.4, timestamp: new Date().toISOString() }
      }
    ],
    departures: [
      {
        name: 'MSC MEDITERRANEAN',
        imo: '9456789',
        mmsi: '372123456',
        type: 'Container Ship',
        flag: 'Panama',
        destination: 'SGSIN',
        eta: new Date(Date.now() + 43200000).toISOString(),
        status: 'Departures',
        lastPosition: { lat: 3.2, lng: 101.3, timestamp: new Date().toISOString() }
      }
    ],
    inPort: [
      {
        name: 'EVER GIVEN',
        imo: '9811000',
        mmsi: '353136000',
        type: 'Container Ship',
        flag: 'Panama',
        destination: portCode,
        eta: new Date(Date.now() - 86400000).toISOString(),
        status: 'In Port',
        lastPosition: { lat: 3.0, lng: 101.4, timestamp: new Date().toISOString() }
      },
      {
        name: 'PACIFIC TRADER',
        imo: '9234567',
        mmsi: '563789012',
        type: 'Cargo Ship',
        flag: 'Singapore',
        destination: portCode,
        eta: new Date(Date.now() - 172800000).toISOString(),
        status: 'In Port',
        lastPosition: { lat: 3.0, lng: 101.4, timestamp: new Date().toISOString() }
      }
    ]
  };
};

export const getTotalVesselsCount = (portData: PortVesselData): number => {
  return portData.expected.length + portData.arrivals.length + 
         portData.departures.length + portData.inPort.length;
};
