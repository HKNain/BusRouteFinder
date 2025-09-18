import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useState } from 'react';
import type { BusStop } from '@/lib/bus-data';

interface OrderViewProps {
  busStops: BusStop[];
}

export function OrderView({ busStops }: OrderViewProps) {
  const [showAllStops, setShowAllStops] = useState(false);
  const visibleStops = showAllStops ? busStops : busStops.slice(0, 7);
  const remainingStops = busStops.length - 7;

  return (
    <Card data-testid="order-view">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Route Progress</h2>
        <p className="text-sm text-muted-foreground">Track your bus journey in real-time</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {visibleStops.map((stop, index) => (
            <div key={stop.id} className="relative flex items-start" data-testid={`stop-item-${stop.id}`}>
              {/* Stepper line */}
              {index < visibleStops.length - 1 && (
                <div className={`absolute left-3 top-6 bottom-0 w-0.5 ${
                  stop.status === 'completed' || (stop.status === 'current' && index < visibleStops.length - 1) 
                    ? 'bg-primary' 
                    : 'bg-border'
                }`}></div>
              )}
              
              {/* Step circle */}
              <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                stop.status === 'completed' 
                  ? 'bg-green-600 border-green-600' 
                  : stop.status === 'current'
                  ? 'bg-primary border-primary animate-pulse'
                  : 'bg-background border-border'
              }`} data-testid={`stop-circle-${stop.id}`}>
                {stop.status === 'completed' ? (
                  <Check className="w-3 h-3 text-white" />
                ) : stop.status === 'current' ? (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                )}
              </div>
              
              {/* Stop content */}
              <div className="ml-4 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    stop.status === 'current' ? 'text-primary' : 'text-foreground'
                  }`} data-testid={`stop-name-${stop.id}`}>
                    {stop.name}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    stop.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : stop.status === 'current'
                      ? 'bg-yellow-100 text-yellow-800'
                      : stop.eta 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`} data-testid={`stop-eta-${stop.id}`}>
                    {stop.status === 'completed' 
                      ? 'Completed'
                      : stop.status === 'current'
                      ? 'Current Stop'
                      : stop.eta 
                      ? `${stop.eta} min`
                      : 'Upcoming'
                    }
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Stop {index + 1}
                  {stop.status === 'current' && ' • Bus arriving now'}
                </p>
              </div>
            </div>
          ))}
          
          {/* Show more button */}
          {!showAllStops && remainingStops > 0 && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowAllStops(true)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
                data-testid="show-more-stops"
              >
                Show {remainingStops} more stops →
              </Button>
            </div>
          )}
          
          {showAllStops && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowAllStops(false)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
                data-testid="show-fewer-stops"
              >
                Show fewer stops ←
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
