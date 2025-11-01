
export interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  vessels: number;
  type: string;
}

export interface Vessel {
  id: string;
  name: string;
  type: string;
  distance: string;
  status: 'Active' | 'Idle' | 'Anchored';
  speed: string;
  heading: string;
  lastUpdate: string;
}

// Major Malaysian Ports
export const MAJOR_PORTS: Port[] = [
  { id: 'MYPKG', name: 'Port Klang', country: 'Malaysia', lat: 3.0000, lng: 101.3833, vessels: 156, type: 'Commercial' },
  { id: 'MYTPP', name: 'Tanjung Pelepas', country: 'Malaysia', lat: 1.3667, lng: 103.5500, vessels: 142, type: 'Commercial' },
  { id: 'MYPEN', name: 'Penang Port', country: 'Malaysia', lat: 5.4164, lng: 100.3327, vessels: 98, type: 'Commercial' },
  { id: 'MYPGU', name: 'Johor Port', country: 'Malaysia', lat: 1.4655, lng: 103.7578, vessels: 87, type: 'Commercial' },
  { id: 'MYBTU', name: 'Bintulu Port', country: 'Malaysia', lat: 3.2167, lng: 113.0667, vessels: 74, type: 'Commercial/LNG' },
  { id: 'MYKUA', name: 'Kuantan Port', country: 'Malaysia', lat: 3.9667, lng: 103.4333, vessels: 63, type: 'Commercial' },
  { id: 'MYLMU', name: 'Lumut Port', country: 'Malaysia', lat: 4.2333, lng: 100.6167, vessels: 45, type: 'Naval/Commercial' },
  { id: 'MYKEM', name: 'Kemaman Port', country: 'Malaysia', lat: 4.2333, lng: 103.4167, vessels: 52, type: 'Commercial' },
];

export const NEARBY_VESSELS: Vessel[] = [
  { id: 'V001', name: 'Nelayan Jaya', type: 'Fishing Vessel', distance: '1.8 km', status: 'Active', speed: '7.2 kn', heading: '045°', lastUpdate: '2 min ago' },
  { id: 'V002', name: 'Putra Laut', type: 'Fishing Vessel', distance: '3.5 km', status: 'Active', speed: '6.8 kn', heading: '180°', lastUpdate: '5 min ago' },
  { id: 'V003', name: 'Maersk Essex', type: 'Cargo Ship', distance: '12.3 km', status: 'Active', speed: '14.5 kn', heading: '270°', lastUpdate: '3 min ago' },
  { id: 'V004', name: 'Ikan Bilis 5', type: 'Fishing Vessel', distance: '4.7 km', status: 'Idle', speed: '0 kn', heading: 'N/A', lastUpdate: '15 min ago' },
  { id: 'V005', name: 'MSC Mediterranean', type: 'Container Ship', distance: '18.9 km', status: 'Active', speed: '16.3 kn', heading: '090°', lastUpdate: '4 min ago' },
  { id: 'V006', name: 'Nelayan Bahagia', type: 'Fishing Vessel', distance: '5.2 km', status: 'Active', speed: '5.5 kn', heading: '315°', lastUpdate: '7 min ago' },
  { id: 'V007', name: 'Selat Express', type: 'Passenger Ferry', distance: '8.1 km', status: 'Active', speed: '18.2 kn', heading: '225°', lastUpdate: '2 min ago' },
  { id: 'V008', name: 'Petronas Marine 3', type: 'Tanker', distance: '14.5 km', status: 'Anchored', speed: '0 kn', heading: 'N/A', lastUpdate: '20 min ago' },
];

export const FISHING_ZONES = [
  { id: 'FZ001', name: 'Straits of Malacca - North', lat: 5.5, lng: 100.2, quality: 'Excellent', fish: ['Selar', 'Kembung', 'Cencaru'] },
  { id: 'FZ002', name: 'South China Sea - East Coast', lat: 4.8, lng: 103.5, quality: 'Good', fish: ['Tenggiri', 'Jenahak', 'Bawal'] },
  { id: 'FZ003', name: 'Terengganu Waters', lat: 5.3, lng: 103.1, quality: 'Excellent', fish: ['Ikan Merah', 'Kerapu', 'Pari'] },
];

export const getVesselIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'fishing vessel': return '🎣';
    case 'cargo ship': return '🚢';
    case 'container ship': return '🚢';
    case 'passenger ferry': return '⛴️';
    case 'yacht': return '⛵';
    case 'tanker': return '🛢️';
    default: return '🚢';
  }
};
