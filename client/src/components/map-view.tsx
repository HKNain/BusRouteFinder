import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import type { BusStop } from '@/lib/bus-data';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: '',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  busStops: BusStop[];
  currentStop: BusStop | null;
  nextStop: BusStop | null;
  busPosition: { lat: number; lng: number };
}

// Custom marker icons
const createMarkerIcon = (color: string, size: number = 25, isAnimated: boolean = false) => {
  const animationStyle = isAnimated ? `
    animation: busMarkerPulse 2s infinite;
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
  ` : '';
  
  return L.divIcon({
    html: `<div style="
      width: ${size}px; 
      height: ${size}px; 
      background-color: ${color}; 
      border: 3px solid white; 
      border-radius: 50%; 
      ${animationStyle}
      position: relative;
      z-index: 1000;
    "></div>`,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Custom component to handle map initialization and bus position updates
function MapController({ busStops, busPosition }: { busStops: BusStop[], busPosition: { lat: number; lng: number } }) {
  // Calculate current bus position based on current stop
  const currentStopIndex = busStops.findIndex(stop => stop.status === 'current');
  const currentStop = busStops[currentStopIndex];
  const nextStop = currentStopIndex < busStops.length - 1 ? busStops[currentStopIndex + 1] : null;
  
  // Calculate realistic bus position between current and next stop
  let realBusPosition = busPosition;
  if (currentStop && nextStop) {
    // Position bus 30% of the way from current to next stop
    const progress = 0.3;
    realBusPosition = {
      lat: currentStop.lat + (nextStop.lat - currentStop.lat) * progress,
      lng: currentStop.lng + (nextStop.lng - currentStop.lng) * progress
    };
  } else if (currentStop) {
    // If no next stop, position bus at current stop
    realBusPosition = {
      lat: currentStop.lat,
      lng: currentStop.lng
    };
  }

  // Create realistic route path following actual Delhi roads
  // Based on DTC Route 533: ISBT Kashmiri Gate → Mehrauli Terminal
  // Following Ring Road → Netaji Subhash Marg → Rajpath → Aurobindo Marg → Mehrauli Road
  const realisticRoutePath: [number, number][] = [
    // Starting from ISBT Kashmiri Gate area - Ring Road approach
    [28.6674, 77.2275], // ISBT Kashmiri Gate
    [28.6650, 77.2300], // Ring Road junction
    [28.6600, 77.2350], // Ring Road towards Yamuna
    [28.6550, 77.2400], // Ring Road continuation
    [28.6500, 77.2450], // Approaching Red Fort area
    [28.6450, 77.2480], // Raj Ghat approach
    [28.6419, 77.2506], // Raj Ghat (bus stop)
    
    // Delhi Gate and Red Fort area via Netaji Subhash Marg
    [28.6380, 77.2520], // Netaji Subhash Marg
    [28.6350, 77.2500], // Delhi Gate approach
    [28.6320, 77.2480], // Delhi Gate area
    [28.6304, 77.2422], // IG Stadium (bus stop)
    
    // Moving towards IP Extension via connecting roads
    [28.6280, 77.2600], // Connecting road to IP
    [28.6250, 77.2700], // IP Extension approach
    [28.6200, 77.2750], // IP area roads
    [28.6158, 77.2838], // IP Power Station (bus stop)
    [28.6140, 77.2800], // IP internal roads
    [28.6133, 77.2756], // IP Depot (bus stop)
    [28.6120, 77.2720], // IP Extension roads
    [28.6100, 77.2700], // Connecting to sports complex
    [28.6089, 77.2689], // Yamuna Sports Complex (bus stop)
    
    // Moving towards Central Delhi via Ring Road
    [28.6050, 77.2650], // Ring Road connection
    [28.6000, 77.2600], // Towards Nizamuddin
    [28.5950, 77.2550], // Nizamuddin approach
    [28.5900, 77.2520], // Nizamuddin area roads
    [28.5875, 77.2500], // Nizamuddin Bridge (bus stop)
    [28.5850, 77.2520], // Nizamuddin Railway area
    [28.5828, 77.2500], // Hazrat Nizamuddin Railway (bus stop)
    [28.5800, 77.2550], // Towards Sarai Kale Khan
    [28.5789, 77.2581], // Sarai Kale Khan ISBT (bus stop)
    
    // Moving towards South Delhi via Mathura Road
    [28.5750, 77.2520], // Mathura Road
    [28.5700, 77.2480], // Mathura Road continuation
    [28.5660, 77.2470], // Towards Maharani Bagh
    [28.5631, 77.2464], // Maharani Bagh (bus stop)
    [28.5600, 77.2450], // Nehru Nagar approach
    [28.5564, 77.2417], // Nehru Nagar (bus stop)
    [28.5520, 77.2380], // Towards Srinivaspuri
    [28.5492, 77.2361], // Srinivaspuri (bus stop)
    
    // Lajpat Nagar area via Ring Road
    [28.5520, 77.2400], // Ring Road connection
    [28.5600, 77.2420], // Ring Road to Lajpat Nagar
    [28.5678, 77.2432], // Lajpat Nagar (bus stop)
    [28.5620, 77.2380], // Ring Road continuation
    [28.5580, 77.2350], // Towards Amar Colony
    [28.5547, 77.2289], // Amar Colony (bus stop)
    [28.5500, 77.2250], // Towards Andrews Ganj
    [28.5450, 77.2220], // Andrews Ganj approach
    [28.5433, 77.2194], // Andrews Ganj (bus stop)
    
    // South Extension and AIIMS via Ring Road
    [28.5500, 77.2180], // Ring Road to South Extension
    [28.5600, 77.2180], // Ring Road continuation
    [28.5703, 77.2189], // South Extension (bus stop)
    [28.5690, 77.2140], // Towards AIIMS
    [28.5672, 77.2100], // AIIMS (bus stop)
    [28.5650, 77.2080], // AIIMS area roads
    [28.5633, 77.2056], // Safdarjung Hospital (bus stop)
    
    // Green Park and Aurobindo Marg
    [28.5600, 77.2050], // Aurobindo Marg
    [28.5550, 77.2020], // Aurobindo Marg continuation
    [28.5520, 77.2000], // Yusuf Sarai approach
    [28.5494, 77.1989], // Yusuf Sarai (bus stop)
    [28.5550, 77.2040], // Green Park approach
    [28.5594, 77.2069], // Green Park Metro (bus stop)
    [28.5500, 77.2060], // Hauz Khas approach
    [28.5431, 77.2069], // Hauz Khas Metro (bus stop)
    [28.5380, 77.2060], // Malviya Nagar approach
    [28.5289, 77.2056], // Malviya Nagar Metro (bus stop)
    
    // IIT Delhi and Outer Ring Road
    [28.5350, 77.2000], // Towards IIT area
    [28.5400, 77.1970], // Outer Ring Road
    [28.5458, 77.1917], // IIT Delhi Gate (bus stop)
    [28.5400, 77.1880], // IIT campus area
    [28.5350, 77.1860], // Towards Adchini
    [28.5300, 77.1850], // Adchini approach
    [28.5256, 77.1833], // Adchini (bus stop)
    
    // Khel Gaon and JNU area
    [28.5220, 77.1820], // Khel Gaon approach
    [28.5200, 77.1800], // Khel Gaon Marg area
    [28.5147, 77.1792], // Khel Gaon Marg (bus stop)
    [28.5250, 77.1750], // JNU approach roads
    [28.5300, 77.1700], // JNU area roads
    [28.5369, 77.1664], // JNU New Campus (bus stop)
    [28.5450, 77.1670], // Munirka approach
    [28.5506, 77.1667], // Munirka (bus stop)
    
    // Final stretch to Mehrauli via Mehrauli-Gurgaon Road
    [28.5400, 77.1750], // Connecting to Mehrauli road
    [28.5350, 77.1800], // Mehrauli-Gurgaon Road
    [28.5300, 77.1830], // Qutub area approach
    [28.5244, 77.1855], // Qutub Minar (bus stop)
    [28.5200, 77.1850], // Final approach to terminal
    [28.5175, 77.1853]  // Mehrauli Terminal (bus stop)
  ];

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Realistic route path following actual Delhi roads */}
      <Polyline 
        positions={realisticRoutePath} 
        color="#2563eb" 
        weight={6} 
        opacity={0.8}
      />

      {/* Bus stop markers */}
      {busStops.map((stop, index) => {
        const isStart = index === 0;
        const isEnd = index === busStops.length - 1;
        
        let markerColor = '#64748b'; // default gray
        let markerSize = 20;
        
        if (stop.status === 'completed') {
          markerColor = '#16a34a'; // green
        } else if (stop.status === 'current') {
          markerColor = '#2563eb'; // blue
          markerSize = 25;
        } else if (isStart) {
          markerColor = '#16a34a'; // green for start
          markerSize = 25;
        } else if (isEnd) {
          markerColor = '#dc2626'; // red for end
          markerSize = 25;
        }

        return (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createMarkerIcon(markerColor, markerSize)}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -10]}>
              <div className="p-2">
                <h3 className="font-semibold">{stop.name}</h3>
                <p className="text-sm text-gray-600">Stop {index + 1}</p>
                {stop.status === 'completed' && stop.arrivalTime && (
                  <p className="text-sm font-medium text-green-600">Arrived at: {stop.arrivalTime}</p>
                )}
                {stop.status === 'upcoming' && stop.eta && (
                  <div>
                    <p className="text-sm font-medium">ETA: {stop.eta} min</p>
                    {stop.estimatedArrivalTime && (
                      <p className="text-sm text-blue-600">Arrival time: {stop.estimatedArrivalTime}</p>
                    )}
                  </div>
                )}
                {stop.status === 'current' && (
                  <p className="text-sm font-medium text-blue-600">Current Stop</p>
                )}
              </div>
            </Tooltip>
          </Marker>
        );
      })}

      {/* Moving bus marker */}
      <Marker
        position={[realBusPosition.lat, realBusPosition.lng]}
        icon={createMarkerIcon('#f59e0b', 30, true)}
        zIndexOffset={1000}
      >
        <Tooltip permanent={false} direction="top" offset={[0, -15]}>
          <div className="p-2">
            <h3 className="font-semibold">🚌 Bus Location</h3>
            <p className="text-sm text-gray-600">Currently en route</p>
            {currentStop && (
              <p className="text-sm">From: {currentStop.name}</p>
            )}
            {nextStop && (
              <p className="text-sm">To: {nextStop.name}</p>
            )}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}

export function MapView({ busStops, currentStop, nextStop, busPosition }: MapViewProps) {
  // Calculate center of Delhi route
  const delhiCenter: [number, number] = [28.6, 77.2]; // Center of Delhi
  
  // Add CSS for bus marker animation
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes busMarkerPulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
        }
        50% {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.8);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
        }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Card className="overflow-hidden" data-testid="map-view">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Live Route Map</h2>
        <p className="text-sm text-muted-foreground">ISBT Kashmiri Gate → Mehrauli Terminal</p>
      </div>
      <div className="relative">
        <div className="h-[600px] w-full" data-testid="google-map">
          <MapContainer
            center={delhiCenter}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            attributionControl={true}
          >
            <MapController busStops={busStops} busPosition={busPosition} />
          </MapContainer>
        </div>
        
        {/* Map overlay info */}
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
          <div className="text-sm font-medium text-foreground">Current Stop</div>
          <div className="text-lg font-semibold text-primary" data-testid="current-stop-name">
            {currentStop?.name || 'Unknown'}
          </div>
          <div className="text-sm text-muted-foreground">
            Next: <span data-testid="next-stop-name">{nextStop?.name || 'Final Destination'}</span>
            {nextStop?.eta && (
              <>
                {' • '}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" data-testid="next-stop-eta">
                  {nextStop.eta} min
                </span>
              </>
            )}
            {nextStop?.estimatedArrivalTime && (
              <>
                {' • '}
                <span className="text-xs text-blue-600">
                  Arrives: {nextStop.estimatedArrivalTime}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
          <div className="text-xs font-medium text-foreground mb-2">Legend</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            Current Bus
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            Current Stop
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            Completed/Start
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            End Point
          </div>
        </div>
      </div>
    </Card>
  );
}