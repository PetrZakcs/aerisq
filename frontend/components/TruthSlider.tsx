'use client';

import { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface TruthSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
}

export default function TruthSlider({
    beforeImage,
    afterImage,
    beforeLabel = 'Optical (Sentinel-2)',
    afterLabel = 'AerisQ Radar (Sentinel-1)'
}: TruthSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update container width on resize
    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const handleMouseDown = () => setIsDragging(true);

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const relativeX = e.clientX - containerRect.left;
            const percentage = Math.min(Math.max((relativeX / containerRect.width) * 100, 0), 100);

            setSliderPosition(percentage);
        };

        if (isDragging) {
            window.addEventListener('mouseup', handleGlobalMouseUp);
            window.addEventListener('mousemove', handleGlobalMouseMove);
        }

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [isDragging]);

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = e.touches[0].clientX - containerRect.left;
        const percentage = Math.min(Math.max((relativeX / containerRect.width) * 100, 0), 100);
        setSliderPosition(percentage);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[600px] bg-black rounded-2xl border border-white/10 overflow-hidden select-none cursor-ew-resize group"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
        >
            {/* Background Image (After - Radar) */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={afterImage}
                    alt="After Analysis"
                    className="w-full h-full object-cover"
                    draggable={false}
                />
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-radar-green/50 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
                    <span className="text-radar-green font-mono text-xs font-bold tracking-wider">{afterLabel.toUpperCase()}</span>
                </div>
            </div>

            {/* Foreground Image (Before - Optical) */}
            <div
                className="absolute inset-0 h-full overflow-hidden border-r border-white/50"
                style={{ width: `${sliderPosition}%`, zIndex: 10 }}
            >
                <img
                    src={beforeImage}
                    alt="Before Optical"
                    className="h-full object-cover max-w-none"
                    style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
                    draggable={false}
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/20 flex items-center gap-2">
                    <span className="text-white font-mono text-xs font-bold tracking-wider">{beforeLabel.toUpperCase()}</span>
                </div>
            </div>

            {/* Handle */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white z-20 cursor-ew-resize shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                    <MoveHorizontal className="w-4 h-4 text-black" />
                </div>
            </div>
        </div>
    );
}
