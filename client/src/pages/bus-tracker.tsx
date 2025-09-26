import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapView } from '@/components/map-view';
import { OrderView } from '@/components/order-view';
import { TextView } from '@/components/text-view';
import { useBusTracking } from '@/hooks/use-bus-tracking';

type ViewMode = 'map' | 'order' | 'text';

export default function BusTracker() {
  
  const [activeMode, setActiveMode] = useState<ViewMode>('map');
  const { busStops, currentStop, nextStop, busPosition, isMoving, movementProgress } = useBusTracking();


  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border shadow-sm" data-testid="top-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-foreground" data-testid="app-title">
              Bus ETA Prototype
            </h1>
            <div className="flex space-x-1 bg-secondary p-1 rounded-lg">
              <Button
                variant={activeMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveMode('map')}
                className="text-sm font-medium transition-colors"
                data-testid="button-map"
              >
                Map
              </Button>
              <Button
                variant={activeMode === 'order' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveMode('order')}
                className="text-sm font-medium transition-colors"
                data-testid="button-order"
              >
                Order
              </Button>
              {/* <Button
                variant={activeMode === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveMode('text')}
                className="text-sm font-medium transition-colors"
                data-testid="button-text"
              >
                Text
              </Button> */}
            </div>
          </div>
        </div>
      </nav>
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeMode === 'map' && (
          <MapView 
          busStops={busStops}
          currentStop={currentStop}
          nextStop={nextStop}
          busPosition={busPosition}
          isMoving={isMoving}
          movementProgress={movementProgress}
        />
        )}
        
        {activeMode === 'order' && (
          <OrderView busStops={busStops} />
        )}
        
        {/* {activeMode === 'text' && (
          <TextView busStops={busStops} />
        )} */}
      </main>
    </div>
  );
}