export interface BusStop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: 'completed' | 'current' | 'upcoming';
  eta?: number; // minutes, undefined for completed stops
}

export const busStops: BusStop[] = [
  { id: 1, name: "ISBT Kashmiri Gate", lat: 28.6667, lng: 77.2167, status: 'completed' },
  { id: 2, name: "Raj Ghat", lat: 28.6419, lng: 77.2506, status: 'completed' },
  { id: 3, name: "IG Stadium", lat: 28.6139, lng: 77.2489, status: 'completed' },
  { id: 4, name: "IP Power Station", lat: 28.6139, lng: 77.2756, status: 'current' },
  { id: 5, name: "IP Depot", lat: 28.6067, lng: 77.2750, status: 'upcoming', eta: 4 },
  { id: 6, name: "Railway Road Bridge", lat: 28.5986, lng: 77.2711, status: 'upcoming', eta: 7 },
  { id: 7, name: "Nizamuddin Road Bridge", lat: 28.5875, lng: 77.2647, status: 'upcoming', eta: 10 },
  { id: 8, name: "Sarai Kale Khan", lat: 28.5789, lng: 77.2581, status: 'upcoming', eta: 13 },
  { id: 9, name: "Gurudwara Bala Sahib", lat: 28.5703, lng: 77.2514, status: 'upcoming', eta: 16 },
  { id: 10, name: "Maharani Bagh", lat: 28.5631, lng: 77.2464, status: 'upcoming', eta: 19 },
  { id: 11, name: "Nehru Nagar", lat: 28.5564, lng: 77.2417, status: 'upcoming', eta: 22 },
  { id: 12, name: "Sri Niwas Puri", lat: 28.5492, lng: 77.2361, status: 'upcoming', eta: 25 },
  { id: 13, name: "Lajpat Nagar", lat: 28.5419, lng: 77.2306, status: 'upcoming', eta: 28 },
  { id: 14, name: "Gupta Market", lat: 28.5347, lng: 77.2250, status: 'upcoming', eta: 31 },
  { id: 15, name: "Andrew Ganj", lat: 28.5275, lng: 77.2194, status: 'upcoming', eta: 34 },
  { id: 16, name: "South Extension", lat: 28.5203, lng: 77.2139, status: 'upcoming', eta: 37 },
  { id: 17, name: "AIIMS - 1", lat: 28.5131, lng: 77.2083, status: 'upcoming', eta: 40 },
  { id: 18, name: "AIIMS - 2", lat: 28.5069, lng: 77.2042, status: 'upcoming', eta: 43 },
  { id: 19, name: "Yusuf Sarai", lat: 28.5006, lng: 77.2000, status: 'upcoming', eta: 46 },
  { id: 20, name: "Green Park", lat: 28.4944, lng: 77.1958, status: 'upcoming', eta: 49 },
  { id: 21, name: "Hauz Khas", lat: 28.4881, lng: 77.1917, status: 'upcoming', eta: 52 },
  { id: 22, name: "Padmini Enclave", lat: 28.4819, lng: 77.1875, status: 'upcoming', eta: 55 },
  { id: 23, name: "IIT Gate", lat: 28.4756, lng: 77.1833, status: 'upcoming', eta: 58 },
  { id: 24, name: "Adchini Village", lat: 28.4694, lng: 77.1792, status: 'upcoming', eta: 61 },
  { id: 25, name: "MMTC", lat: 28.4631, lng: 77.1750, status: 'upcoming', eta: 64 },
  { id: 26, name: "PTS", lat: 28.4569, lng: 77.1708, status: 'upcoming', eta: 67 },
  { id: 27, name: "DDF Flats Lado Sarai", lat: 28.4506, lng: 77.1667, status: 'upcoming', eta: 70 },
  { id: 28, name: "Qutub Minar", lat: 28.4444, lng: 77.1625, status: 'upcoming', eta: 73 },
  { id: 29, name: "Mehrauli Terminal", lat: 28.4381, lng: 77.1583, status: 'upcoming', eta: 76 }
];

export function generateRandomETA(): number {
  return Math.floor(Math.random() * 8) + 2; // 2-10 minutes
}

export function getCurrentStopIndex(stops: BusStop[]): number {
  return stops.findIndex(stop => stop.status === 'current');
}

export function getNextStop(stops: BusStop[]): BusStop | null {
  const currentIndex = getCurrentStopIndex(stops);
  return currentIndex >= 0 && currentIndex < stops.length - 1 ? stops[currentIndex + 1] : null;
}
