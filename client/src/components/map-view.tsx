import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import type { BusStop } from '@/lib/bus-data';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLngTuple } from "leaflet";

// Fix for default markers in react-leaflet
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
  isMoving?: boolean;
  movementProgress?: number;
}

// Custom marker icons with improved animations - FIXED HOVER ISSUES
const createMarkerIcon = (color: string, size: number = 25, isAnimated: boolean = false, isMoving: boolean = false) => {
  let animationStyle = '';
  
  if (isAnimated && isMoving) {
    animationStyle = `
      animation: busMovingPulse 1.5s ease-in-out infinite;
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.8);
    `;
  } else if (isAnimated) {
    animationStyle = `
      animation: busMarkerPulse 2.5s ease-in-out infinite;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
    `;
  }
  
  return L.divIcon({
    html: `<div style="
      width: ${size}px; 
      height: ${size}px; 
      background-color: ${color}; 
      border: 3px solid white; 
      border-radius: 50%; 
      ${animationStyle}
      position: relative;
      z-index: ${isAnimated ? 1000 : 500};
      transition: all 0.3s ease;
    "></div>`,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Interpolate position along path for smooth movement
function interpolateAlongPath(path: LatLngTuple[], progress: number): LatLngTuple {
  if (!path || path.length < 2) {
    return (path && path[0]) || [28.6, 77.2] as LatLngTuple;
  }
  
  const totalLength = path.length - 1;
  const exactPosition = progress * totalLength;
  const currentIndex = Math.floor(exactPosition);
  const localProgress = exactPosition - currentIndex;
  
  if (currentIndex >= totalLength) {
    return path[path.length - 1];
  }
  
  const start = path[currentIndex];
  const end = path[currentIndex + 1];
  
  return [
    start[0] + (end[0] - start[0]) * localProgress,
    start[1] + (end[1] - start[1]) * localProgress
  ] as LatLngTuple;
}

// Enhanced MapController with smooth animations - FIXED PATH MOVEMENT
function MapController({ busStops, busPosition, isMoving = false, movementProgress = 0 }: { 
  busStops: BusStop[], 
  busPosition: { lat: number; lng: number },
  isMoving?: boolean,
  movementProgress?: number 
}) {
  const map = useMap();
  const busMarkerRef = useRef<L.Marker | null>(null);
  const [interpolatedBusPosition, setInterpolatedBusPosition] = useState<LatLngTuple>([busPosition.lat, busPosition.lng]);
  
  const currentStopIndex = busStops.findIndex(stop => stop.status === 'current');
  const currentStop = busStops[currentStopIndex];
  const nextStop = currentStopIndex < busStops.length - 1 ? busStops[currentStopIndex + 1] : null;

  // Realistic route path following actual Delhi major roads
  const realisticRoutePath: [number, number][] = [
    [28.6674, 77.2275], [28.6650, 77.2290], [28.6600, 77.2320], [28.6550, 77.2360],
    [28.6500, 77.2420], [28.6450, 77.2480], [28.6419, 77.2506], [28.6380, 77.2480],
    [28.6340, 77.2450], [28.6304, 77.2422], [28.6280, 77.2500], [28.6250, 77.2580],
    [28.6220, 77.2650], [28.6190, 77.2720], [28.6158, 77.2838], [28.6140, 77.2800],
    [28.6133, 77.2756], [28.6100, 77.2720], [28.6089, 77.2689], [28.6050, 77.2650],
    [28.6000, 77.2600], [28.5950, 77.2570], [28.5900, 77.2530], [28.5875, 77.2500],
    [28.5828, 77.2500], [28.5800, 77.2520], [28.5789, 77.2581], [28.5750, 77.2550],
    [28.5700, 77.2520], [28.5650, 77.2490], [28.5631, 77.2464], [28.5600, 77.2440],
    [28.5564, 77.2417], [28.5530, 77.2390], [28.5492, 77.2361], [28.5520, 77.2400],
    [28.5580, 77.2420], [28.5650, 77.2440], [28.5678, 77.2432], [28.5640, 77.2380],
    [28.5600, 77.2340], [28.5547, 77.2289], [28.5500, 77.2250], [28.5450, 77.2210],
    [28.5433, 77.2194], [28.5480, 77.2200], [28.5550, 77.2190], [28.5650, 77.2190],
    [28.5703, 77.2189], [28.5680, 77.2150], [28.5672, 77.2100], [28.5655, 77.2070],
    [28.5633, 77.2056], [28.5600, 77.2040], [28.5570, 77.2020], [28.5540, 77.2000],
    [28.5494, 77.1989], [28.5520, 77.2020], [28.5560, 77.2050], [28.5594, 77.2069],
    [28.5520, 77.2060], [28.5470, 77.2065], [28.5431, 77.2069], [28.5400, 77.2060],
    [28.5350, 77.2058], [28.5289, 77.2056], [28.5320, 77.2020], [28.5370, 77.1980],
    [28.5420, 77.1940], [28.5458, 77.1917], [28.5430, 77.1890], [28.5380, 77.1860],
    [28.5330, 77.1840], [28.5256, 77.1833], [28.5220, 77.1820], [28.5190, 77.1805],
    [28.5147, 77.1792], [28.5200, 77.1750], [28.5280, 77.1700], [28.5369, 77.1664],
    [28.5420, 77.1665], [28.5506, 77.1667], [28.5450, 77.1720], [28.5380, 77.1780],
    [28.5320, 77.1820], [28.5244, 77.1855], [28.5210, 77.1854], [28.5175, 77.1853]
  ];

  // Extract subpath between current and next stop
  const activePath: LatLngTuple[] = (() => {
    if (!currentStop || !nextStop) return [];
    
    const currentIndex = realisticRoutePath.findIndex(
      ([lat, lng]) => Math.abs(lat - currentStop.lat) < 0.001 && Math.abs(lng - currentStop.lng) < 0.001
    );
    const nextIndex = realisticRoutePath.findIndex(
      ([lat, lng]) => Math.abs(lat - nextStop.lat) < 0.001 && Math.abs(lng - nextStop.lng) < 0.001
    );

    if (currentIndex !== -1 && nextIndex !== -1) {
      return realisticRoutePath.slice(
        Math.min(currentIndex, nextIndex),
        Math.max(currentIndex, nextIndex) + 1
      ) as LatLngTuple[];
    }

    // Fallback: create a path segment from the realistic route
    const segmentLength = Math.floor(realisticRoutePath.length / busStops.length);
    const startIdx = currentStopIndex * segmentLength;
    const endIdx = Math.min((currentStopIndex + 1) * segmentLength, realisticRoutePath.length - 1);
    
    if (startIdx < realisticRoutePath.length && endIdx < realisticRoutePath.length) {
      return realisticRoutePath.slice(startIdx, endIdx + 1) as LatLngTuple[];
    }

    return [[currentStop.lat, currentStop.lng], [nextStop.lat, nextStop.lng]] as LatLngTuple[];
  })();

  // Update interpolated bus position when moving
  useEffect(() => {
    if (isMoving && activePath.length > 1) {
      const newPosition = interpolateAlongPath(activePath, movementProgress);
      setInterpolatedBusPosition(newPosition);
    } else {
      setInterpolatedBusPosition([busPosition.lat, busPosition.lng]);
    }
  }, [isMoving, movementProgress, activePath, busPosition]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Route path */}
      <Polyline 
        positions={realisticRoutePath} 
        color="#2563eb" 
        weight={6} 
        opacity={0.8}
      />
  
      {/* Active route segment - highlighted when bus is moving */}
      {isMoving && activePath.length > 1 && (
        <Polyline 
          positions={activePath} 
          color="#f59e0b" 
          weight={8} 
          opacity={0.9}
          dashArray="10, 10"
        />
      )}
  
      {/* Bus stop markers with fixed tooltips */}
      {busStops.map((stop, index) => {
        const isStart = index === 0;
        const isEnd = index === busStops.length - 1;
        
        let markerColor = '#64748b';
        let markerSize = 20;
        
        if (stop.status === 'completed') {
          markerColor = '#16a34a';
        } else if (stop.status === 'current') {
          markerColor = '#f59e0b';
          markerSize = 25;
        } else if (isStart) {
          markerColor = '#16a34a';
          markerSize = 25;
        } else if (isEnd) {
          markerColor = '#dc2626';
          markerSize = 25;
        }

        return (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createMarkerIcon(markerColor, markerSize)}
            eventHandlers={{
              mouseover: (e) => {
                e.target.openTooltip();
              },
              mouseout: (e) => {
                e.target.closeTooltip();
              },
            }}
          >
            <Tooltip 
              direction="top"
              offset={[0, -15]}
              permanent={false}
              interactive={false}
              opacity={0.95}
              className="custom-tooltip"
            >
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{stop.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Stop {index + 1}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      stop.status === 'completed' ? 'text-green-600' :
                      stop.status === 'current' ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {stop.status === 'completed' ? 'Completed' :
                       stop.status === 'current' ? 'Current' : 'Upcoming'}
                    </span>
                  </div>
                  
                  {stop.eta && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ETA:</span>
                      <span className="font-medium text-blue-600">{stop.eta} min</span>
                    </div>
                  )}
                  
                  {/* {stop.estimatedArrivalTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Arrival:</span>
                      <span className="font-medium text-green-600">{stop.estimatedArrivalTime}</span>
                    </div>
                  )} */}
                  
                  {isStart && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      🚀 Journey Start
                    </div>
                  )}
                  
                  {isEnd && (
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      🏁 Final Destination
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
  
      {/* Enhanced bus marker with smooth movement */}
      <Marker
        ref={busMarkerRef}
        position={interpolatedBusPosition}
        icon={createMarkerIcon('#f59e0b', 32, true, isMoving)}
        zIndexOffset={1000}
        eventHandlers={{
          mouseover: (e) => {
            e.target.openTooltip();
          },
          mouseout: (e) => {
            e.target.closeTooltip();
          },
        }}
      >
        <Tooltip 
          permanent={false} 
          direction="top" 
          offset={[0, -20]} 
          interactive={false}
          opacity={0.95}
          className="custom-tooltip bus-tooltip"
        >
          <div className="p-3 min-w-[250px]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🚌</span>
              <h3 className="font-semibold text-gray-900">Live Bus Location</h3>
            </div>
            
            {isMoving ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    En Route
                  </span>
                </div>
                
                 <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(movementProgress * 100)}%
                  </span>
                </div> 
                 <div className="bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${movementProgress * 100}%` }}
                  ></div>
                </div> 
                
                <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500">From</div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {currentStop?.name || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">To</div>
                    <div className="text-sm font-medium text-orange-600 truncate">
                      {nextStop?.name || 'Final Stop'}
                    </div>
                  </div>
                </div>
                
                {nextStop?.eta && (
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">Next stop in:</span>
                    <span className="text-sm font-medium text-orange-600">
                      ~{nextStop.eta} min
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium text-orange-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    At Stop
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Location:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentStop?.name || 'Unknown'}
                  </span>
                </div>
                
                {nextStop && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next Destination:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {nextStop.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}

// Helper to format time
function formatTime(date: Date | string | number) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Main export with exact same name
export function MapView({ 
  busStops, 
  currentStop, 
  nextStop, 
  busPosition, 
  isMoving = false, 
  movementProgress = 0 
}: MapViewProps) {
  // State for real-time information
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [nextStopArrival, setNextStopArrival] = useState<Date | null>(null);

  // Calculate center of Delhi route
  const delhiCenter: [number, number] = [28.6, 77.2];
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate realistic speed based on movement
  useEffect(() => {
    if (isMoving && movementProgress > 0) {
      const baseSpeed = 22;
      let speedMultiplier = 1;
      if (movementProgress < 0.2) {
        speedMultiplier = 0.4 + (movementProgress / 0.2) * 0.4;
      } else if (movementProgress > 0.8) {
        speedMultiplier = 0.8 + ((1 - movementProgress) / 0.2) * 0.4;
      } else {
        speedMultiplier = 0.8 + Math.sin((movementProgress - 0.2) * Math.PI / 0.6) * 0.3;
      }
      
      const calculatedSpeed = Math.round(baseSpeed * speedMultiplier);
      setCurrentSpeed(Math.max(5, calculatedSpeed));
    } else {
      setCurrentSpeed(0);
    }

    // Calculate next stop arrival time
    if (nextStop?.eta) {
      const arrivalTime = new Date(Date.now() + nextStop.eta * 60 * 1000);
      setNextStopArrival(arrivalTime);
    }
  }, [isMoving, movementProgress, nextStop]);

  // Add enhanced CSS animations and tooltip styles - FIXED TO PREVENT BLINKING
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes busMarkerPulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.8);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
        }
      }
      
      @keyframes busMovingPulse {
        0% {
          transform: scale(1) rotate(0deg);
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.8);
        }
        25% {
          transform: scale(1.1) rotate(1deg);
          box-shadow: 0 0 30px rgba(245, 158, 11, 1);
        }
        50% {
          transform: scale(1.05) rotate(0deg);
          box-shadow: 0 0 35px rgba(245, 158, 11, 0.9);
        }
        75% {
          transform: scale(1.1) rotate(-1deg);
          box-shadow: 0 0 30px rgba(245, 158, 11, 1);
        }
        100% {
          transform: scale(1) rotate(0deg);
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.8);
        }
      }
      
      .leaflet-tooltip.custom-tooltip {
        background: rgba(255, 255, 255, 0.98) !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(10px) !important;
        transition: opacity 0.2s ease-out !important;
        pointer-events: none !important;
        z-index: 9999 !important;
      }
      
      .leaflet-tooltip.custom-tooltip::before {
        border-top-color: rgba(255, 255, 255, 0.98) !important;
      }
      
      .leaflet-tooltip.bus-tooltip {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%) !important;
        border: 1px solid rgba(245, 158, 11, 0.2) !important;
      }
      
      .custom-marker {
        background: transparent !important;
        border: none !important;
      }
      
      .custom-marker > div {
        transition: transform 0.2s ease-out !important;
      }
      
      .custom-marker:hover > div {
        transform: scale(1.1) !important;
      }
      
      .leaflet-tooltip {
        transition: opacity 0.2s !important;
      }
      
      .leaflet-tooltip-pane {
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden" data-testid="map-view">
      <div className="p-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold mb-2">Map Mode (High Bandwidth)</h2>

          {/* Enhanced real-time status bar */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground">Current Time</span>
                <span className="font-mono text-lg font-semibold text-blue-600">{formatTime(currentTime)}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-muted-foreground">Current Speed</span>
                <span className={`font-mono text-lg font-semibold ${currentSpeed > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {currentSpeed} km/h
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-muted-foreground">Next Stop Arrival</span>
                <span className="font-mono text-lg font-semibold text-orange-600">
                  {nextStopArrival ? formatTime(nextStopArrival) : "--:--"}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${isMoving ? 'text-green-600' : 'text-orange-600'}`}>
                  {isMoving ? `Moving (${Math.round(movementProgress * 100)}%)` : 'Stopped'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-muted-foreground">Current Location:</span>
                <span className="font-medium text-foreground">{currentStop?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-muted-foreground">Next Stop:</span>
                <span className="font-medium text-orange-600">{nextStop?.name || 'Final Destination'}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Upcoming</span>
            </div>
          </div>
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
              <MapController 
                busStops={busStops} 
                busPosition={busPosition} 
                isMoving={isMoving}
                movementProgress={movementProgress}
              />
            </MapContainer>
          </div>
          
          {/* Enhanced map overlay info */}
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
            <div className="text-sm font-medium text-foreground">
              {isMoving ? 'Bus En Route' : 'Current Stop'}
            </div>
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
            
            {/* Movement progress bar */}
            {isMoving && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Progress to next stop</div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${movementProgress * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Legend */}
          <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
            <div className="text-xs font-medium text-foreground mb-2">Legend</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
              <span>Moving Bus</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>Current Stop</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Upcoming</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}