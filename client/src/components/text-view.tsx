import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { BusStop } from '@/lib/bus-data';

interface TextViewProps {
  busStops: BusStop[];
}

export function TextView({ busStops }: TextViewProps) {
  const [showAllStops, setShowAllStops] = useState(false);
  const visibleStops = showAllStops ? busStops : busStops.slice(0, 10);
  const remainingStops = busStops.length - 10;

  return (
    <Card className="overflow-hidden" data-testid="text-view">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">All Bus Stops</h2>
        <p className="text-sm text-muted-foreground">Complete route with estimated arrival times</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Stop #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ETA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleStops.map((stop, index) => (
              <tr 
                key={stop.id} 
                className={`${
                  stop.status === 'completed' 
                    ? 'bg-green-50' 
                    : stop.status === 'current'
                    ? 'bg-blue-50 border-l-4 border-primary'
                    : ''
                }`}
                data-testid={`table-row-${stop.id}`}
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  stop.status === 'current' ? 'text-primary' : 'text-foreground'
                }`} data-testid={`table-stop-number-${stop.id}`}>
                  {index + 1}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  stop.status === 'current' ? 'font-semibold text-primary' : 'text-foreground'
                }`} data-testid={`table-stop-name-${stop.id}`}>
                  {stop.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-testid={`table-stop-status-${stop.id}`}>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stop.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : stop.status === 'current'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {stop.status === 'completed' 
                      ? 'Completed'
                      : stop.status === 'current'
                      ? 'Current Stop'
                      : 'Upcoming'
                    }
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  stop.status === 'current' ? 'font-medium text-primary' : 'text-foreground'
                }`} data-testid={`table-stop-eta-${stop.id}`}>
                  {stop.status === 'completed' 
                    ? '—'
                    : stop.status === 'current'
                    ? 'Now'
                    : stop.eta 
                    ? `${stop.eta} min`
                    : '—'
                  }
                </td>
              </tr>
            ))}
            
            {!showAllStops && remainingStops > 0 && (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-muted-foreground" colSpan={4}>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAllStops(true)}
                    className="text-primary hover:text-primary/80 font-medium"
                    data-testid="load-remaining-stops"
                  >
                    Load remaining {remainingStops} stops...
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
