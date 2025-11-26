"use client";

import { useEffect, useRef } from 'react';

interface MobileGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

const MobileGestures: React.FC<MobileGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onTap,
  onLongPress
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      // Long press detection
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress();
        }, 500); // 500ms for long press
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear long press timer on move
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Only process if it's a quick gesture (less than 300ms)
      if (deltaTime < 300) {
        const minSwipeDistance = 50;
        const minSwipeVelocity = 0.3;

        const velocityX = Math.abs(deltaX) / deltaTime;
        const velocityY = Math.abs(deltaY) / deltaTime;

        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (Math.abs(deltaX) > minSwipeDistance && velocityX > minSwipeVelocity) {
            if (deltaX > 0 && onSwipeRight) {
              onSwipeRight();
            } else if (deltaX < 0 && onSwipeLeft) {
              onSwipeLeft();
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(deltaY) > minSwipeDistance && velocityY > minSwipeVelocity) {
            if (deltaY > 0 && onSwipeDown) {
              onSwipeDown();
            } else if (deltaY < 0 && onSwipeUp) {
              onSwipeUp();
            }
          }
        }
      }

      // Tap detection (if no significant movement)
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200 && onTap) {
        onTap();
      }

      touchStartRef.current = null;
    };

    const handleWheel = (e: WheelEvent) => {
      // Prevent default zoom behavior
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onTap, onLongPress]);

  return (
    <div ref={containerRef} className="touch-manipulation">
      {children}
    </div>
  );
};

export default MobileGestures;
