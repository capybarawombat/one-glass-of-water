import { useEffect } from 'react';
/** Quiet synthesized water-like sound design. Never represented as location audio. */
export function useAmbience(enabled: boolean, active: boolean) {
    useEffect(() => {
        if (!enabled || !active || typeof AudioContext === 'undefined')
            return;
        const context = new AudioContext();
        const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
        const samples = buffer.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < samples.length; i++) {
            brown = (brown + (Math.random() * 2 - 1) * .02) / 1.02;
            samples[i] = brown * 3;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 720;
        const gain = context.createGain();
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(.065, context.currentTime + 1);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        source.start();
        void context.resume().catch(() => { });
        const visibility = () => { if (document.hidden)
            void context.suspend();
        else
            void context.resume().catch(() => { }); };
        document.addEventListener('visibilitychange', visibility);
        return () => { source.stop(); void context.close(); document.removeEventListener('visibilitychange', visibility); };
    }, [enabled, active]);
}
