"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({ targetDate }: { targetDate: Date | null }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        if (!targetDate) return;

        const target = new Date(targetDate).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000); // Update every second

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex justify-center items-center gap-1 md:gap-4 text-white font-mono font-bold">
            <TimeUnit value={timeLeft.days} label="Days" />
            <Separator />
            <TimeUnit value={timeLeft.hours} label="Hrs" />
            <Separator />
            <TimeUnit value={timeLeft.minutes} label="Min" />
            <Separator />
            <TimeUnit value={timeLeft.seconds} label="Sec" />
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center w-[70px]">
            <div className="relative h-12 w-full flex items-center justify-center overflow-hidden">
                <span 
                    key={value}
                    className="text-4xl tabular-nums tracking-tighter transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                >
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] text-[#a4d6d2] uppercase tracking-widest mt-1 opacity-80">{label}</span>
        </div>
    );
}

function Separator() {
    return <span className="text-xl md:text-3xl mb-6 text-[#a4d6d2] opacity-30">:</span>;
}
