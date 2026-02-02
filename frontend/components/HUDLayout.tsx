import { motion } from 'framer-motion';

export default function HUDLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-full min-h-screen">
            {/* Background Grid */}
            <div className="fixed inset-0 z-0 bg-grid-pattern pointer-events-none" />

            {/* Corner Markers */}
            <div className="fixed top-8 left-8 w-4 h-4 border-l-2 border-t-2 border-white/30 z-50" />
            <div className="fixed top-8 right-8 w-4 h-4 border-r-2 border-t-2 border-white/30 z-50" />
            <div className="fixed bottom-8 left-8 w-4 h-4 border-l-2 border-b-2 border-white/30 z-50" />
            <div className="fixed bottom-8 right-8 w-4 h-4 border-r-2 border-b-2 border-white/30 z-50" />

            {/* HUD Status Line */}
            <div className="fixed bottom-8 left-16 right-16 h-px bg-white/10 z-50 flex justify-between items-center">
                <span className="bg-aeris-black px-2 text-[10px] items-center gap-2 text-gray-500 font-mono hidden md:flex">
                    <span className="w-1.5 h-1.5 bg-radar-green rounded-full animate-pulse" />
                    SYSTEM OK
                </span>
                <span className="bg-aeris-black px-2 text-[10px] text-gray-600 font-mono hidden md:block">
                    AERISQ // V3.0 // PHYSICS_CORE
                </span>
            </div>

            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    )
}
