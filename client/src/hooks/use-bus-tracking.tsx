import { useState, useEffect, useCallback, useRef } from 'react';
import { busStops as initialBusStops, generateRandomETA, type BusStop } from '@/lib/bus-data';

// Easing function for smooth animation
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Linear interpolation between two points
const lerp = (start: number, end: number, progress: number): number => {
  return start + (end - start) * progress;
};

// Calculate distance between two coordinates (rough approximation)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export function useBusTracking() {
  const [busStops, setBusStops] = useState<BusStop[]>(initialBusStops);
  const [currentStopIndex, setCurrentStopIndex] = useState(3); // Currently at IP Power Station
  const [busPosition, setBusPosition] = useState({ lat: 28.6158, lng: 77.2838 }); // IP Power Station coordinates
  const [isMoving, setIsMoving] = useState(false);
  const [movementStartTime, setMovementStartTime] = useState<number>(0);
  const [segmentDuration, setSegmentDuration] = useState<number>(30000); // 30 seconds default
  const animationFrameRef = useRef<number>();
  
  // Calculate realistic travel time between stops based on distance and speed
  const calculateTravelTime = useCallback((fromStop: BusStop, toStop: BusStop): number => {
    const distance = calculateDistance(fromStop.lat, fromStop.lng, toStop.lat, toStop.lng);
    const avgSpeed = 25; // km/h average speed in Delhi traffic
    const travelTimeHours = distance / avgSpeed;
    const travelTimeMs = travelTimeHours * 3600 * 1000;
    
    // Add some randomness for realistic variation (±20%)
    const variation = 0.8 + Math.random() * 0.4;
    return Math.max(15000, travelTimeMs * variation); // Minimum 15 seconds
  }, []);

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

  // Smooth animation loop
  const animateBusPosition = useCallback(() => {
    if (!isMoving || currentStopIndex >= busStops.length - 1) {
      return;
    }

    const currentTime = Date.now();
    const elapsed = currentTime - movementStartTime;
    const progress = Math.min(elapsed / segmentDuration, 1);

    const currentStop = busStops[currentStopIndex];
    const nextStop = busStops[currentStopIndex + 1];

    if (currentStop && nextStop) {
      // Apply easing for more natural movement
      const easedProgress = easeInOutCubic(progress);
      
      const newLat = lerp(currentStop.lat, nextStop.lat, easedProgress);
      const newLng = lerp(currentStop.lng, nextStop.lng, easedProgress);
      
      setBusPosition({ lat: newLat, lng: newLng });

      if (progress < 1) {
        // Continue animation
        animationFrameRef.current = requestAnimationFrame(animateBusPosition);
      } else {
        // Reached destination
        setIsMoving(false);
        setBusPosition({ lat: nextStop.lat, lng: nextStop.lng });
        
        // Update stop statuses
        setBusStops(prevStops => {
          const newStops = [...prevStops];
          // Mark current stop as completed
          newStops[currentStopIndex] = { 
            ...newStops[currentStopIndex], 
            status: 'completed', 
            eta: undefined,
            arrivalTime: new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          };
          
          // Mark next stop as current
          newStops[currentStopIndex + 1] = { 
            ...newStops[currentStopIndex + 1], 
            status: 'current', 
            eta: undefined 
          };
          
          return newStops;
        });
        
        setCurrentStopIndex(prev => prev + 1);
      }
    }
  }, [isMoving, currentStopIndex, busStops, movementStartTime, segmentDuration]);

  // Start movement to next stop
  const startMovement = useCallback(() => {
    if (currentStopIndex < busStops.length - 1 && !isMoving) {
      const currentStop = busStops[currentStopIndex];
      const nextStop = busStops[currentStopIndex + 1];
      
      if (currentStop && nextStop) {
        const travelTime = calculateTravelTime(currentStop, nextStop);
        setSegmentDuration(travelTime);
        setMovementStartTime(Date.now());
        setIsMoving(true);
      }
    }
  }, [currentStopIndex, busStops, isMoving, calculateTravelTime]);

  // Simulate bus movement decisions
  const simulateBusMovement = useCallback(() => {
    if (!isMoving && currentStopIndex < busStops.length - 1) {
      // Random chance to start moving (simulating real bus schedule)
      if (Math.random() > 0.6) { // 40% chance every interval
        startMovement();
      }
    }
  }, [isMoving, currentStopIndex, busStops.length, startMovement]);

  // Animation frame loop
  useEffect(() => {
    if (isMoving) {
      animationFrameRef.current = requestAnimationFrame(animateBusPosition);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateBusPosition, isMoving]);

  useEffect(() => {
    // Update ETAs every 5 seconds
    const etaInterval = setInterval(updateETAs, 5000);
    
    // Check for movement every 10 seconds (more frequent checks)
    const movementInterval = setInterval(simulateBusMovement, 10000);
    
    // Auto-start first movement after 3 seconds
    const initialMovementTimeout = setTimeout(() => {
      if (!isMoving) startMovement();
    }, 3000);
    
    return () => {
      clearInterval(etaInterval);
      clearInterval(movementInterval);
      clearTimeout(initialMovementTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateETAs, simulateBusMovement, isMoving, startMovement]);

  const currentStop = busStops[currentStopIndex];
  const nextStop = currentStopIndex < busStops.length - 1 ? busStops[currentStopIndex + 1] : null;

  return {
    busStops,
    currentStop,
    nextStop,
    busPosition,
    currentStopIndex,
    isMoving,
    movementProgress: isMoving ? Math.min((Date.now() - movementStartTime) / segmentDuration, 1) : 0
  };
}