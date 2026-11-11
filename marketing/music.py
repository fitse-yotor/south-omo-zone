"""Generates an original ambient music bed for the promo video (no samples, no licences needed).
Usage: python3 marketing/music.py <seconds> <out.wav>
Warm pads in D major, a kalimba-style arpeggio, soft bass and a light shaker, with reverb."""
import sys, wave
import numpy as np

SR = 44100
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 60
OUT = sys.argv[2] if len(sys.argv) > 2 else "music.wav"
BPM = 84
BEAT = 60 / BPM
BAR = 4 * BEAT
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def hz(m): return 440 * 2 ** ((m - 69) / 12)
# Dmaj7, Bm7, Gmaj7, A6sus4 (MIDI), each held for two bars
CHORDS = [[50, 54, 57, 61], [47, 50, 54, 57], [43, 47, 50, 54], [45, 50, 52, 54]]
L = np.zeros(N); R = np.zeros(N)

def env(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai) ** 2
    e[-ri:] *= np.linspace(1, 0, ri) ** 1.5
    return e

def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))

# Pads: two bars per chord, overlapping by a second for smooth changes
k = 0; start = 0.0
while start < DUR:
    ch = CHORDS[k % 4]; length = 2 * BAR + 1.2
    n = int(length * SR); tt = np.arange(n) / SR; e = env(n, 1.4, 1.6)
    for m in ch:
        for det, pan in ((-0.0025, -0.6), (0.0025, 0.6)):
            f = hz(m) * (1 + det)
            s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
            s *= 1 + 0.15 * np.sin(2 * np.pi * 0.2 * tt + m)  # slow shimmer
            add(s * e, start, pan, 0.028)
    # bass: root on each bar
    for b in range(2):
        bn = int(BAR * SR); bt = np.arange(bn) / SR
        bass = np.sin(2 * np.pi * hz(ch[0] - 12) * bt) * np.exp(-bt * 1.1) * np.minimum(1, bt * 60)
        add(bass, start + b * BAR, 0, 0.11 if start > 3 else 0.0)
    k += 1; start += 2 * BAR

# Kalimba arpeggio: enters after the intro, 8th notes on chord tones an octave up
def kalimba(f, dur=1.4):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3.2) + 0.25 * np.sin(2 * np.pi * f * 3.9 * tt) * np.exp(-tt * 9)
    return s * np.minimum(1, tt * 400)

pattern = [0, 2, 1, 3, 2, 1, 3, 2]
step = BEAT / 2; i = 0; x = 4 * BEAT
while x < DUR - 2.5:
    ch = CHORDS[int(x // (2 * BAR)) % 4]
    note = ch[pattern[i % 8]] + 12 + (12 if (i % 16) in (6, 14) else 0)
    vel = 0.55 + 0.45 * ((i % 4 == 0) * 1.0) + rng.uniform(-0.08, 0.08)
    add(kalimba(hz(note)), x + rng.uniform(-0.006, 0.006), 0.45 if i % 2 else -0.45, 0.085 * vel)
    i += 1; x += step

# Shaker: soft high noise on 8ths from bar 8
x = 8 * BAR
while x < DUR - 3:
    n = int(0.09 * SR); s = rng.normal(size=n); s = np.diff(s, prepend=0); s = np.diff(s, prepend=0)
    s *= np.exp(-np.arange(n) / SR * 60)
    add(s, x, 0.25, 0.0009 if int(round(x / step)) % 2 else 0.0017)
    x += step

# Reverb: convolution with a 2.8 s decaying noise tail (computed by FFT)
def reverb(sig, seed):
    r = np.random.default_rng(seed); ln = int(2.8 * SR)
    ir = r.normal(size=ln) * np.exp(-np.arange(ln) / SR * 2.4); ir[0] = 0; ir /= np.sqrt((ir ** 2).sum())
    size = 1 << int(np.ceil(np.log2(len(sig) + ln)))
    wet = np.fft.irfft(np.fft.rfft(sig, size) * np.fft.rfft(ir, size), size)[: len(sig)]
    return 0.72 * sig + 0.45 * wet
L, R = reverb(L, 1), reverb(R, 2)

# Master: fades, gentle saturation, normalise
fade = np.ones(N); fi, fo = int(2.5 * SR), int(4 * SR)
fade[:fi] = np.linspace(0, 1, fi) ** 2; fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
mix = np.stack([L, R], 1) * fade[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.2) * 0.85
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("music:", OUT, f"{DUR:.1f}s")
