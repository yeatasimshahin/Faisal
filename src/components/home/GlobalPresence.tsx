import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, X, Clock, Calendar } from 'lucide-react';

interface Location {
    city: string;
    country: string;
    mapUrl?: string;
    coords?: string;
    timezone: string;
}

const FlipUnit = ({ value }: { value: string }) => {
    return (
        <div className="relative w-6 h-8 bg-zinc-900 rounded-sm border border-white/5 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={value}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="text-red-500 font-mono text-sm font-bold"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5" />
        </div>
    );
};

const FlipClock = ({ timezone }: { timezone: string }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getTimeUnits = () => {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const parts = formatter.formatToParts(time);
        const h = parts.find(p => p.type === 'hour')?.value || '00';
        const m = parts.find(p => p.type === 'minute')?.value || '00';
        const s = parts.find(p => p.type === 'second')?.value || '00';
        return { h, m, s };
    };

    const dateString = time.toLocaleDateString('en-GB', {
        timeZone: timezone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '.');

    const { h, m, s } = getTimeUnits();

    return (
        <div className="flex flex-col items-end gap-3 mt-4">
            <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                    <FlipUnit value={h[0]} /><FlipUnit value={h[1]} />
                </div>
                <span className="text-zinc-700 font-mono animate-pulse">:</span>
                <div className="flex gap-0.5">
                    <FlipUnit value={m[0]} /><FlipUnit value={m[1]} />
                </div>
                <span className="text-zinc-700 font-mono animate-pulse">:</span>
                <div className="flex gap-0.5">
                    <FlipUnit value={s[0]} /><FlipUnit value={s[1]} />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono tracking-[0.2em] text-zinc-500 bg-white/5 px-2 py-1 rounded-sm border border-white/5">
                <Calendar size={10} className="text-red-500/50" />
                <span>{dateString}</span>
            </div>
        </div>
    );
};

const LocationCard = ({ loc, index, hoveredIndex, setHoveredIndex, setActiveMap }: {
    loc: Location;
    index: number;
    hoveredIndex: number | null;
    setHoveredIndex: (i: number | null) => void;
    setActiveMap: (url: string) => void;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onMouseMove={handleMouseMove}
            onClick={() => loc.mapUrl && setActiveMap(loc.mapUrl)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative h-[550px] bg-[#050505] hover:bg-zinc-900/40 transition-all duration-700 flex flex-col justify-between p-10 cursor-none overflow-hidden"
        >
            {/* Technical Grid Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                    background: `
                        linear-gradient(90deg, rgba(239, 68, 68, 0.05) 1px, transparent 1px),
                        linear-gradient(rgba(239, 68, 68, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    backgroundPosition: 'center'
                }}
            />

            {/* Mouse Scope (X/Y Axis) */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity"
                style={{ x: springX, y: springY }}
            >
                <div className="absolute left-[-100vw] right-[-100vw] top-0 h-[1px] bg-red-600/30" />
                <div className="absolute top-[-100vh] bottom-[-100vh] left-0 w-[1px] bg-red-600/30" />
                <div className="absolute top-2 left-2 text-[8px] font-mono whitespace-nowrap text-red-600">
                    AX_RDR: {Math.round(mouseX.get())}_{Math.round(mouseY.get())}
                </div>
            </motion.div>

            {/* Background Architectural Blueprint Fragment */}
            <div className="absolute top-40 right-[-40px] w-80 h-80 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 transform group-hover:rotate-12 group-hover:scale-110">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none" strokeWidth="0.5">
                    <rect x="10" y="10" width="80" height="60" />
                    <circle cx="50" cy="40" r="20" />
                    <line x1="0" y1="40" x2="100" y2="40" />
                    <line x1="50" y1="0" x2="50" y2="100" />
                    <path d="M10,10 L30,30 M90,10 L70,30 M10,70 L30,50 M90,70 L70,50" />
                    <circle cx="50" cy="40" r="30" strokeDasharray="2,2" />
                </svg>
            </div>

            <div className="relative flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <span className="text-zinc-600 text-[10px] font-mono tracking-widest uppercase">P_LOC_0{index + 1}</span>
                    {loc.coords && (
                        <span className="text-zinc-500 text-[9px] font-mono tracking-tighter uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                            {loc.coords}
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <motion.div
                        animate={{
                            rotate: hoveredIndex === index ? 45 : 0,
                            scale: hoveredIndex === index ? 1.2 : 1
                        }}
                        className="text-zinc-500 group-hover:text-red-500 transition-colors"
                    >
                        <ArrowUpRight size={18} strokeWidth={1} />
                    </motion.div>
                    <FlipClock timezone={loc.timezone} />
                </div>
            </div>

            <div className="relative z-10 mt-auto">
                <motion.div
                    animate={{
                        y: hoveredIndex === index ? -10 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-4xl md:text-5xl font-serif text-white group-hover:text-red-500 transition-colors duration-500">
                            {loc.city}
                        </h3>
                        <div className="relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                            <div className="absolute w-4 h-4 bg-red-600/30 rounded-full animate-ping" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-hidden">
                        <motion.div
                            animate={{ x: hoveredIndex === index ? 0 : -20 }}
                            className="h-[1px] w-8 bg-red-600"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            {loc.country}
                        </span>
                    </div>
                </motion.div>

                {loc.mapUrl && hoveredIndex === index && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-8 relative aspect-[16/6] w-full rounded-sm overflow-hidden border border-white/5 shadow-2xl"
                    >
                        <iframe
                            src={loc.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(1) invert(1) contrast(0.8)' }}
                            allowFullScreen
                            loading="lazy"
                        />
                    </motion.div>
                )}
            </div>

            {/* Bottom Specs Wrap */}
            <div className="absolute bottom-10 right-10 flex flex-col items-end gap-1 pointer-events-none">
                <span className="text-9xl font-serif text-white/[0.02] group-hover:text-white/[0.05] transition-all duration-1000 leading-none select-none">
                    {loc.city[0]}
                </span>
                <div className="flex flex-col items-end opacity-20 group-hover:opacity-60 transition-opacity">
                    <span className="text-[7px] font-mono text-white/50 tracking-[0.2em]">TYPE: ARCHITECTURAL_NODE</span>
                    <span className="text-[7px] font-mono text-white/50 tracking-[0.2em]">TIME_SYNC: ACTIVE</span>
                </div>
            </div>

            <motion.div
                className="absolute bottom-0 left-0 h-1 bg-red-600"
                initial={{ width: 0 }}
                animate={{ width: hoveredIndex === index ? "100%" : 0 }}
                transition={{ duration: 0.5 }}
            />
        </motion.div>
    );
};

const GlobalPresence = () => {
    const { settings } = useStore();
    const [locations, setLocations] = useState<Location[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeMap, setActiveMap] = useState<string | null>(null);

    useEffect(() => {
        if (settings?.global_locations_json) {
            setLocations(settings.global_locations_json);
        } else {
            setLocations([
                {
                    city: 'Khulna',
                    country: 'Bangladesh',
                    mapUrl: 'https://www.google.com/maps?q=22.8219352,89.5418377&z=19&output=embed',
                    coords: '22.8219° N, 89.5418° E',
                    timezone: 'Asia/Dhaka'
                },
                { city: 'London', country: 'UK', coords: '51.5074° N, 0.1278° W', timezone: 'Europe/London' },
                { city: 'Tokyo', country: 'Japan', coords: '35.6762° N, 139.6503° E', timezone: 'Asia/Tokyo' },
                { city: 'Dubai', country: 'UAE', coords: '25.2048° N, 55.2708° E', timezone: 'Asia/Dubai' }
            ]);
        }
    }, [settings]);

    return (
        <section id="locations" className="min-h-screen bg-[#050505] flex items-center justify-center border-t border-white/5 relative z-10 py-32 overflow-hidden">

            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-zinc-900/40 rounded-full blur-[120px] animation-delay-2000" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none scale-125 md:scale-100">
                <svg viewBox="0 0 1000 500" className="w-full max-w-7xl fill-white">
                    <path d="M150,100 Q400,50 600,100 T850,150 M100,200 Q300,180 500,220 T900,200 M200,300 Q450,350 700,300 T800,400" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" className="animate-[dash_60s_linear_infinite]" />
                    <circle cx="210" cy="150" r="2" /><circle cx="280" cy="120" r="2" /><circle cx="510" cy="110" r="2" /><circle cx="780" cy="160" r="2" />
                    <circle cx="150" cy="220" r="2" /><circle cx="420" cy="250" r="2" /><circle cx="650" cy="210" r="2" /><circle cx="880" cy="230" r="2" />
                    <circle cx="320" cy="380" r="2" /><circle cx="560" cy="350" r="2" /><circle cx="720" cy="410" r="2" />
                </svg>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-red-600 mb-8"
                        >
                            <span className="h-[1px] w-12 bg-red-600" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Network & Influence</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-6xl md:text-9xl font-serif text-white tracking-tighter leading-[0.85]"
                        >
                            Global <br />
                            <span className="text-transparent border-t-zinc-400 stroke-zinc-400" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>Presence</span>
                        </motion.h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="max-w-md"
                    >
                        <p className="text-gray-400 font-light uppercase tracking-widest text-xs md:text-sm leading-relaxed border-l border-white/10 pl-8">
                            From New York to Tokyo, our footprint is expanding across major metropolises, bringing precision architecture to the world's stage.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
                    {locations.map((loc, index) => (
                        <LocationCard
                            key={`${loc.city}-${index}`}
                            loc={loc}
                            index={index}
                            hoveredIndex={hoveredIndex}
                            setHoveredIndex={setHoveredIndex}
                            setActiveMap={setActiveMap}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {activeMap && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 md:p-20 backdrop-blur-xl"
                    >
                        <button
                            onClick={() => setActiveMap(null)}
                            className="absolute top-10 right-10 text-white hover:text-red-500 transition-colors p-4"
                        >
                            <X size={32} strokeWidth={1} />
                        </button>
                        <div className="w-full h-full max-w-7xl relative rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                            <iframe
                                src={activeMap}
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'grayscale(1) invert(1) brightness(0.8)' }}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {hoveredIndex !== null && !activeMap && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="fixed pointer-events-none z-[80] w-24 h-24 border border-red-500/50 rounded-full flex items-center justify-center mix-blend-difference"
                        style={{
                            left: 'var(--mouse-x)',
                            top: 'var(--mouse-y)',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes dash {
                    to { stroke-dashoffset: 1000; }
                }
                #locations:hover { cursor: crosshair; }
            `}} />
        </section>
    );
};

export default GlobalPresence;
