import { useEffect, useRef, useState, type CSSProperties } from 'react';
import manifest from '../../public/media/manifest.json';
export const media = Object.fromEntries(manifest.map(asset => [asset.id, asset]));
export function mediaURL(id: string) { return `${import.meta.env.BASE_URL}media/${media[id].filename}`; }
export function Documentary({ id, className = '', style }: {
    id: string;
    className?: string;
    style?: CSSProperties;
}) {
    const asset = media[id];
    const [failed, setFailed] = useState(false);
    return <figure className={`documentary ${className} ${failed ? 'media-unavailable' : ''}`} style={style}>
    {!failed && <img src={mediaURL(id)} alt={asset.alt} onError={() => setFailed(true)} decoding="async" style={{ objectPosition: asset.position }}/>}
    {failed && <div className="media-fallback"><span>DOCUMENTARY ARCHIVE</span><p>{asset.context.split('. ')[0]}</p><small>Image unavailable. The story continues below.</small></div>}
    <figcaption><a href={asset.source} target="_blank" rel="noopener noreferrer">{asset.attribution}<span className="sr-only"> (opens in a new tab)</span></a></figcaption>
  </figure>;
}
export function FieldVideo({ active, reduced }: {
    active: boolean;
    reduced: boolean;
}) {
    const video = useRef<HTMLVideoElement>(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        if (!active || reduced || document.hidden) {
            video.current?.pause();
            return;
        }
        void video.current?.play().catch(() => setFailed(true));
        const hide = () => { if (document.hidden)
            video.current?.pause();
        else
            void video.current?.play().catch(() => { }); };
        document.addEventListener('visibilitychange', hide);
        return () => { video.current?.pause(); document.removeEventListener('visibilitychange', hide); };
    }, [active, reduced]);
    if (!active || reduced || failed)
        return null;
    return <figure className="documentary field-video"><video ref={video} src={mediaURL('irrigationVideo')} muted playsInline loop preload="none" onError={() => setFailed(true)} aria-label={media.irrigationVideo.alt}/><figcaption><a href={media.irrigationVideo.source} target="_blank" rel="noopener noreferrer">{media.irrigationVideo.attribution}</a></figcaption></figure>;
}
export function MediaCredits() {
    return <section className="media-credits" aria-labelledby="media-title"><p className="eyebrow">THE PEOPLE BEHIND THE PICTURES</p><h3 id="media-title">Documentary credits.</h3><p>Archival photographs and recorded footage retain their own places, dates, and stories. Digital gestures are symbolic. No donation or physical delivery occurs.</p><ol>{manifest.map(asset => <li key={asset.id}><a href={asset.source} target="_blank" rel="noopener noreferrer">{asset.attribution} ↗</a><p>{asset.context}</p><small>{asset.changes} <a href={asset.licenseUrl} target="_blank" rel="noopener noreferrer">License ↗</a></small></li>)}</ol><a href={`${import.meta.env.BASE_URL}media/manifest.json`}>Full asset manifest ↗</a></section>;
}
