import { useState, useEffect } from 'react';
import { getTimeRemaining, cn } from '../../lib/utils';

interface CountdownTimerProps {
  endTime: string | Date;
  variant?: 'default' | 'compact' | 'digits';
  className?: string;
}

export function CountdownTimer({ endTime, variant = 'default', className }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(endTime);
      setTimeRemaining(remaining);
      if (remaining.total === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (timeRemaining.total === 0) return <span className={cn('text-red-400 font-semibold', className)}>Ended</span>;
  const { days, hours, minutes, seconds } = timeRemaining;

  if (variant === 'compact') {
    if (days > 0) return <span className={cn('text-gray-300 font-mono', className)}>{days}d {hours}h left</span>;
    if (hours > 0) return <span className={cn('text-gray-300 font-mono', className)}>{hours}h {minutes}m left</span>;
    if (minutes > 0) return <span className={cn('text-primary-400 font-mono font-semibold', className)}>{minutes}m {seconds}s left</span>;
    return <span className={cn('text-red-400 font-mono font-bold animate-pulse', className)}>{seconds}s left</span>;
  }

  if (variant === 'digits') {
    return (
      <div className={cn('flex gap-2', className)}>
        {days > 0 && <><div className="countdown-digit">{String(days).padStart(2, '0')}</div><span className="text-primary-400 font-bold text-xl self-center">:</span></>}
        <div className="countdown-digit">{String(hours).padStart(2, '0')}</div>
        <span className="text-primary-400 font-bold text-xl self-center">:</span>
        <div className="countdown-digit">{String(minutes).padStart(2, '0')}</div>
        <span className="text-primary-400 font-bold text-xl self-center">:</span>
        <div className={cn('countdown-digit', minutes === 0 && seconds < 60 && 'bg-red-500/20 text-red-400 border-red-500/30')}>
          {String(seconds).padStart(2, '0')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {days > 0 && <><div className="text-center"><div className="text-2xl font-bold text-white font-mono">{String(days).padStart(2, '0')}</div><div className="text-xs text-gray-500 uppercase">Days</div></div><span className="text-primary-400 text-xl font-bold">:</span></>}
      <div className="text-center"><div className="text-2xl font-bold text-white font-mono">{String(hours).padStart(2, '0')}</div><div className="text-xs text-gray-500 uppercase">Hours</div></div>
      <span className="text-primary-400 text-xl font-bold">:</span>
      <div className="text-center"><div className={cn('text-2xl font-bold font-mono', minutes === 0 && hours === 0 && days === 0 ? 'text-red-400 animate-pulse' : 'text-white')}>{String(minutes).padStart(2, '0')}</div><div className="text-xs text-gray-500 uppercase">Mins</div></div>
      <span className="text-primary-400 text-xl font-bold">:</span>
      <div className="text-center"><div className={cn('text-2xl font-bold font-mono', minutes === 0 && hours === 0 && days === 0 ? 'text-red-400 animate-pulse' : 'text-white')}>{String(seconds).padStart(2, '0')}</div><div className="text-xs text-gray-500 uppercase">Secs</div></div>
    </div>
  );
}
