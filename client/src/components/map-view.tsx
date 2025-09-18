import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import type { BusStop } from '@/lib/bus-data';

interface MapViewProps {
  busStops: BusStop[];
  currentStop: BusStop | null;
  nextStop: BusStop | null;
  busPosition: { lat: number; lng: number };
}

declare global {
  interface Window {
    google: any;
  }
}

export function MapView({ busStops, currentStop, nextStop, busPosition }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const busMarker = useRef<any>(null);
  const routePolyline = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API || "demo_key";
    
    if (!mapInstance.current) {
      // Initialize map centered on Delhi
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 11,
        center: { lat: 28.5355, lng: 77.2000 }, // Center between start and end points
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "all",
            elementType: "geometry.fill",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          }
        ]
      });

      // Create route polyline
      const routePath = busStops.map(stop => ({ lat: stop.lat, lng: stop.lng }));
      routePolyline.current = new window.google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: '#2563eb',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: mapInstance.current
      });

      // Add stop markers
      busStops.forEach((stop, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map: mapInstance.current,
          title: stop.name,
          icon: {
            fillColor: stop.status === 'completed' ? '#16a34a' : 
                      stop.status === 'current' ? '#2563eb' :
                      index === busStops.length - 1 ? '#dc2626' : '#64748b',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: index === 0 || index === busStops.length - 1 ? 8 : 6,
            path: window.google.maps.SymbolPath.CIRCLE
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2">
            <h3 class="font-semibold">${stop.name}</h3>
            <p class="text-sm text-gray-600">Stop ${index + 1}</p>
            ${stop.eta ? `<p class="text-sm font-medium">ETA: ${stop.eta} min</p>` : ''}
          </div>`
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
        });
      });

      // Add bus marker
      busMarker.current = new window.google.maps.Marker({
        position: busPosition,
        map: mapInstance.current,
        title: 'Bus Location',
        icon: {
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: '#ffffff',
          scale: 12,
          path: window.google.maps.SymbolPath.CIRCLE
        },
        animation: window.google.maps.Animation.BOUNCE
      });
    }
  }, []);

  // Update bus position
  useEffect(() => {
    if (busMarker.current) {
      busMarker.current.setPosition(busPosition);
    }
  }, [busPosition]);

  return (
    <Card className="overflow-hidden" data-testid="map-view">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Live Route Map</h2>
        <p className="text-sm text-muted-foreground">ISBT Kashmiri Gate → Mehrauli Terminal</p>
      </div>
      <div className="relative">
        <div ref={mapRef} className="h-96 w-full" data-testid="google-map"></div>
        
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
          </div>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
          <div className="text-xs font-medium text-foreground mb-2">Legend</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            Current Bus
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            Start Point
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
