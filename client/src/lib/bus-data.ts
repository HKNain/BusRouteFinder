export interface BusStop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: 'completed' | 'current' | 'upcoming';
  eta?: number; // minutes, undefined for completed stops
  arrivalTime?: string; // HH:MM format for completed stops
  estimatedArrivalTime?: string; // HH:MM format for upcoming stops
}

export const busStops: BusStop[] = [
  { id: 1, name: "ISBT Kashmiri Gate", lat: 28.6674, lng: 77.2275, status: 'completed', arrivalTime: '09:00' },
  { id: 2, name: "Raj Ghat", lat: 28.6419, lng: 77.2506, status: 'completed', arrivalTime: '09:12' },
  { id: 3, name: "IG Stadium", lat: 28.6304, lng: 77.2422, status: 'completed', arrivalTime: '09:25' },
  { id: 4, name: "IP Power Station", lat: 28.6158, lng: 77.2838, status: 'current' },
  { id: 5, name: "IP Depot", lat: 28.6133, lng: 77.2756, status: 'upcoming', eta: 4, estimatedArrivalTime: '09:42' },
  { id: 6, name: "Yamuna Sports Complex", lat: 28.6089, lng: 77.2689, status: 'upcoming', eta: 7, estimatedArrivalTime: '09:45' },
  { id: 7, name: "Nizamuddin Bridge", lat: 28.5875, lng: 77.2500, status: 'upcoming', eta: 10, estimatedArrivalTime: '09:48' },
  { id: 8, name: "Sarai Kale Khan ISBT", lat: 28.5789, lng: 77.2581, status: 'upcoming', eta: 13, estimatedArrivalTime: '09:51' },
  { id: 9, name: "Hazrat Nizamuddin Railway Station", lat: 28.5828, lng: 77.2500, status: 'upcoming', eta: 16, estimatedArrivalTime: '09:54' },
  { id: 10, name: "Maharani Bagh", lat: 28.5631, lng: 77.2464, status: 'upcoming', eta: 19, estimatedArrivalTime: '09:57' },
  { id: 11, name: "Nehru Nagar", lat: 28.5564, lng: 77.2417, status: 'upcoming', eta: 22, estimatedArrivalTime: '10:00' },
  { id: 12, name: "Srinivaspuri", lat: 28.5492, lng: 77.2361, status: 'upcoming', eta: 25, estimatedArrivalTime: '10:03' },
  { id: 13, name: "Lajpat Nagar", lat: 28.5678, lng: 77.2432, status: 'upcoming', eta: 28, estimatedArrivalTime: '10:06' },
  { id: 14, name: "Amar Colony", lat: 28.5547, lng: 77.2289, status: 'upcoming', eta: 31, estimatedArrivalTime: '10:09' },
  { id: 15, name: "Andrews Ganj", lat: 28.5433, lng: 77.2194, status: 'upcoming', eta: 34, estimatedArrivalTime: '10:12' },
  { id: 16, name: "South Extension", lat: 28.5703, lng: 77.2189, status: 'upcoming', eta: 37, estimatedArrivalTime: '10:15' },
  { id: 17, name: "AIIMS", lat: 28.5672, lng: 77.2100, status: 'upcoming', eta: 40, estimatedArrivalTime: '10:18' },
  { id: 18, name: "Safdarjung Hospital", lat: 28.5633, lng: 77.2056, status: 'upcoming', eta: 43, estimatedArrivalTime: '10:21' },
  { id: 19, name: "Yusuf Sarai", lat: 28.5494, lng: 77.1989, status: 'upcoming', eta: 46, estimatedArrivalTime: '10:24' },
  { id: 20, name: "Green Park Metro", lat: 28.5594, lng: 77.2069, status: 'upcoming', eta: 49, estimatedArrivalTime: '10:27' },
  { id: 21, name: "Hauz Khas Metro", lat: 28.5431, lng: 77.2069, status: 'upcoming', eta: 52, estimatedArrivalTime: '10:30' },
  { id: 22, name: "Malviya Nagar Metro", lat: 28.5289, lng: 77.2056, status: 'upcoming', eta: 55, estimatedArrivalTime: '10:33' },
  { id: 23, name: "IIT Delhi Gate", lat: 28.5458, lng: 77.1917, status: 'upcoming', eta: 58, estimatedArrivalTime: '10:36' },
  { id: 24, name: "Adchini", lat: 28.5256, lng: 77.1833, status: 'upcoming', eta: 61, estimatedArrivalTime: '10:39' },
  { id: 25, name: "Khel Gaon Marg", lat: 28.5147, lng: 77.1792, status: 'upcoming', eta: 64, estimatedArrivalTime: '10:42' },
  { id: 26, name: "JNU New Campus", lat: 28.5369, lng: 77.1664, status: 'upcoming', eta: 67, estimatedArrivalTime: '10:45' },
  { id: 27, name: "Munirka", lat: 28.5506, lng: 77.1667, status: 'upcoming', eta: 70, estimatedArrivalTime: '10:48' },
  { id: 28, name: "Qutub Minar", lat: 28.5244, lng: 77.1855, status: 'upcoming', eta: 73, estimatedArrivalTime: '10:51' },
  { id: 29, name: "Mehrauli Terminal", lat: 28.5175, lng: 77.1853, status: 'upcoming', eta: 76, estimatedArrivalTime: '10:54' }
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
