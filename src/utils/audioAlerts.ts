import { SoundAlert } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTimerAlert(sound: SoundAlert, volume: number = 0.8) {
  if (sound === 'none' || volume <= 0) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.min(1, Math.max(0, volume)), now);
    masterGain.connect(ctx.destination);

    switch (sound) {
      case 'zen-bell': {
        // Singing bowl chime with harmonics
        const frequencies = [432, 864, 1296, 2160];
        const gains = [0.6, 0.25, 0.1, 0.05];

        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(gains[idx], now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 4);
        });
        break;
      }

      case 'digital-chime': {
        // Crisp Android alert arpeggio: C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.09;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.5, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + 0.4);
        });
        break;
      }

      case 'gentle-marimba': {
        // Warm wooden percussive marimba chord
        const notes = [392.00, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.7, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + 0.7);
        });
        break;
      }

      case 'cosmic-gong': {
        // Deep resonating gong with low frequency shimmer
        const fundamental = 110; // A2
        [1, 2, 2.76, 4.07, 5.43].forEach((ratio, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = i === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(fundamental * ratio, now);

          gain.gain.setValueAtTime(0.5 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 4.6);
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function playTickSound(volume: number = 0.2) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(Math.min(0.3, volume * 0.3), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // ignore
  }
}

export function triggerHaptic(vibrate: boolean = true) {
  if (vibrate && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Android notification vibration pattern: 200ms pulse, 100ms pause, 200ms pulse, 100ms pause, 400ms pulse
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {
      // ignore
    }
  }
}
