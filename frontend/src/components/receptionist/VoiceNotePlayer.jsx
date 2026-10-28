import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '../../lib/utils';
export const VoiceNotePlayer = ({ durationSeconds = 7, className, }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 1
    const timerRef = useRef(null);
    // Predefined heights for realistic speech frequency audio waveform
    const waveformHeights = [
        25, 45, 70, 90, 60, 40, 80, 100, 75, 50, 85, 95, 65, 45, 90, 70, 40, 60, 80, 55, 30,
    ];
    useEffect(() => {
        if (isPlaying) {
            const intervalMs = 100;
            const step = intervalMs / (durationSeconds * 1000);
            timerRef.current = window.setInterval(() => {
                setProgress((prev) => {
                    const next = prev + step;
                    if (next >= 1) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return next;
                });
            }, intervalMs);
        }
        else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isPlaying, durationSeconds]);
    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    };
    const currentSeconds = Math.floor(progress * durationSeconds);
    const formattedTime = isPlaying
        ? `0:0${Math.min(currentSeconds, durationSeconds)}`
        : `0:0${durationSeconds}`;
    return (<div className={cn('inline-flex items-center gap-3 p-2.5 sm:p-3 bg-closr-card border border-closr-border rounded-2xl shadow-xs select-none max-w-[280px]', className)}>
      {/* Play/Pause Button */}
      <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause audio note' : 'Play audio note (0:07)'} className="w-8 h-8 rounded-full bg-closr-forest text-white flex items-center justify-center shrink-0 hover:bg-closr-forest-hover transition-colors closr-focus active:scale-95 shadow-soft">
        {isPlaying ? (<Pause className="w-3.5 h-3.5 fill-current"/>) : (<Play className="w-3.5 h-3.5 fill-current ml-0.5"/>)}
      </button>

      {/* Waveform Visualization */}
      <div className="flex items-center gap-[2.5px] h-7 flex-1 min-w-[120px] px-1">
        {waveformHeights.map((height, index) => {
            const barFraction = index / waveformHeights.length;
            const isPlayed = barFraction <= progress;
            return (<span key={index} style={{ height: `${height}%` }} className={cn('w-[3px] rounded-full transition-colors duration-100', isPlayed
                    ? 'bg-closr-forest'
                    : 'bg-closr-text-muted/30 group-hover:bg-closr-text-muted/50')}/>);
        })}
      </div>

      {/* Duration Label */}
      <span className="text-[11px] font-mono text-closr-text-muted shrink-0 w-8 text-right font-medium">
        {formattedTime}
      </span>
    </div>);
};
