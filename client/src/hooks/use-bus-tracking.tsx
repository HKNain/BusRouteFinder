import { useState, useEffect, useCallback } from 'react';
import { busStops as initialBusStops, generateRandomETA, type BusStop } from '@/lib/bus-data';

export function useBusTracking() {
  const [busStops, setBusStops] = useState<BusStop[]>(initialBusStops);
  const [currentStopIndex, setCurrentStopIndex] = useState(3); // Currently at IP Power Station
  const [busPosition, setBusPosition] = useState({ lat: 28.6139, lng: 77.2756 }); // IP Power Station coordinates

  const updateETAs = useCallback(() => {
    setBusStops(prevStops => 
      prevStops.map(stop => {
        if (stop.status === 'upcoming' && stop.eta !== undefined) {
          return { ...stop, eta: generateRandomETA() };
        }
        return stop;
      })
    );
  }, []);

  const simulateBusMovement = useCallback(() => {
    setBusStops(prevStops => {
      const newStops = [...prevStops];
      const currentStop = newStops[currentStopIndex];
      
      if (currentStop && currentStopIndex < newStops.length - 1) {
        // Move to next stop occasionally (every ~2 minutes for demo)
        if (Math.random() > 0.7) {
          // Mark current stop as completed
          newStops[currentStopIndex] = { ...currentStop, status: 'completed', eta: undefined };
          
          // Mark next stop as current
          const nextStopIndex = currentStopIndex + 1;
          newStops[nextStopIndex] = { ...newStops[nextStopIndex], status: 'current', eta: undefined };
          
          setCurrentStopIndex(nextStopIndex);
          setBusPosition({ lat: newStops[nextStopIndex].lat, lng: newStops[nextStopIndex].lng });
        }
      }
      
      return newStops;
    });
  }, [currentStopIndex]);

  useEffect(() => {
    // Update ETAs every 5 seconds
    const etaInterval = setInterval(updateETAs, 5000);
    
    // Simulate bus movement every 30 seconds
    const movementInterval = setInterval(simulateBusMovement, 30000);
    
    return () => {
      clearInterval(etaInterval);
      clearInterval(movementInterval);
    };
  }, [updateETAs, simulateBusMovement]);

  const currentStop = busStops[currentStopIndex];
  const nextStop = currentStopIndex < busStops.length - 1 ? busStops[currentStopIndex + 1] : null;

  return {
    busStops,
    currentStop,
    nextStop,
    busPosition,
    currentStopIndex
  };
}
