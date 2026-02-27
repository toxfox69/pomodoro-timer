import { useState, useEffect, useRef, useCallback } from 'react';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

const MODES = {
  WORK: 'work',
  BREAK: 'break',
  LONG_BREAK: 'longBreak',
};

const MODE_CONFIG = {
  [MODES.WORK]: { label: 'FOCUS', duration: WORK_TIME, color: '#ff4444' },
  [MODES.BREAK]: { label: 'BREAK', duration: BREAK_TIME, color: '#00cc66' },
  [MODES.LONG_BREAK]: { label: 'LONG BREAK', duration: LONG_BREAK_TIME, color: '#00cc66' },
};

export default function App() {
  const [mode, setMode] = useState(MODES.WORK);
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef(null);

  const config = MODE_CONFIG[mode];
  const totalTime = config.duration;
  const progress = 1 - timeLeft / totalTime;

  const switchMode = useCallback((completedCount) => {
    if (completedCount > 0 && completedCount % 4 === 0) {
      setMode(MODES.LONG_BREAK);
      setTimeLeft(LONG_BREAK_TIME);
    } else {
      setMode(MODES.BREAK);
      setTimeLeft(BREAK_TIME);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (mode === MODES.WORK) {
            const newCount = completedPomodoros + 1;
            setCompletedPomodoros(newCount);
            setTimeout(() => {
              switchMode(newCount);
              setIsRunning(true);
            }, 0);
          } else {
            setTimeout(() => {
              setMode(MODES.WORK);
              setTimeLeft(WORK_TIME);
              setIsRunning(true);
            }, 0);
          }
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, completedPomodoros, switchMode]);

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode(MODES.WORK);
    setTimeLeft(WORK_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={{ ...styles.modeLabel, color: config.color }}>{config.label}</span>
      </div>

      <div style={styles.timerContainer}>
        <svg width="280" height="280" viewBox="0 0 280 280" style={styles.svg}>
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="8"
          />
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 140 140)"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div style={styles.timerText}>
          <span style={{ ...styles.timeDisplay, color: config.color }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div style={styles.sessionCounter}>
        <span style={styles.sessionLabel}>SESSIONS</span>
        <div style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                backgroundColor: i < (completedPomodoros % 4) ? config.color : '#1a1a2e',
                borderColor: config.color,
              }}
            />
          ))}
        </div>
        <span style={styles.sessionCount}>{completedPomodoros}</span>
      </div>

      <div style={styles.controls}>
        <button
          onClick={handleReset}
          style={styles.secondaryButton}
        >
          RESET
        </button>
        <button
          onClick={handleStartPause}
          style={{
            ...styles.primaryButton,
            backgroundColor: config.color,
            boxShadow: `0 0 30px ${config.color}44`,
          }}
        >
          {isRunning ? 'PAUSE' : 'START'}
        </button>
      </div>

      <div style={styles.footer}>
        <span style={styles.brand}>ENERGENAI</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#08080e',
    color: '#e0e0ff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '40px 20px',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  header: {
    textAlign: 'center',
  },
  modeLabel: {
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '6px',
    textTransform: 'uppercase',
    transition: 'color 0.3s ease',
  },
  timerContainer: {
    position: 'relative',
    width: '280px',
    height: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerText: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
  },
  timeDisplay: {
    fontSize: '56px',
    fontWeight: '200',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '4px',
    transition: 'color 0.3s ease',
  },
  sessionCounter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  sessionLabel: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '4px',
    color: '#555',
  },
  dots: {
    display: 'flex',
    gap: '12px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  sessionCount: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500',
  },
  controls: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  primaryButton: {
    width: '160px',
    height: '56px',
    borderRadius: '28px',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
  },
  secondaryButton: {
    width: '100px',
    height: '56px',
    borderRadius: '28px',
    border: '2px solid #333',
    background: 'transparent',
    color: '#666',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '3px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  footer: {
    textAlign: 'center',
  },
  brand: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '6px',
    color: '#333',
  },
};
