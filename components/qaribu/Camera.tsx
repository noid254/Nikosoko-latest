import React, { useEffect, useRef, useState } from 'react';

// The live camera, and nothing else: there is no way to choose a file from the gallery, because a photo of a
// premise or a vacancy must be taken now. Each photo is shrunk to about 1280 pixels (which also drops any hidden
// location data from the file) and handed to onShot, which sends it. The camera stays open for the next one.

const MAX_SIDE = 1280;
const MAX_BYTES = 380_000; // the server accepts 400 KB

function cameraMessage(err: unknown): string {
  const name = (err as { name?: string })?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'The camera is blocked. Allow the camera for this site in your browser settings, then try again.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera was found on this device.';
  return 'The camera could not be opened. Close other apps that use it and try again.';
}

// A JPEG small enough for the server: lower the quality, then the size, until it fits.
async function toJpeg(video: HTMLVideoElement): Promise<Blob> {
  let scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
  for (let round = 0; round < 4; round++) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.7, 0.58, 0.46]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_BYTES) return blob;
    }
    scale *= 0.8;
  }
  throw new Error('Could not make the photo small enough. Try again.');
}

export interface CameraProps {
  title: string;
  // What to photograph next, shown above the shutter. A function of how many are taken so far, so a guide can walk through
  // "outside, living room, bedroom…". Optional.
  hint?: (taken: number) => string;
  // How many photos are needed in all (shown as "2 of 4"), counting those already saved before the camera opened.
  needed?: number;
  alreadyHave?: number;
  // One photo, then the camera closes (the cover photo).
  single?: boolean;
  onShot: (photo: Blob) => Promise<void>;
  onClose: () => void;
}

const Camera: React.FC<CameraProps> = ({ title, hint, needed, alreadyHave = 0, single, onShot, onClose }) => {
  const video = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const taken = alreadyHave + thumbs.length;

  useEffect(() => {
    let alive = true;
    let stream: MediaStream | null = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot open the camera here. Use Chrome or Safari on your phone, on the nikosoko.com address.');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((s) => {
        if (!alive) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          void video.current.play().catch(() => undefined);
        }
      })
      .catch((err) => alive && setError(cameraMessage(err)));
    return () => {
      alive = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => () => thumbs.forEach((u) => URL.revokeObjectURL(u)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const take = async () => {
    const v = video.current;
    if (!v || busy) return;
    if (!v.videoWidth) {
      setError('The camera is not ready yet. Wait a moment and try again.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const blob = await toJpeg(v);
      await onShot(blob);
      if (single) {
        onClose();
        return;
      }
      setThumbs((list) => [...list, URL.createObjectURL(blob)]);
    } catch (err: any) {
      setError(err.message || 'Could not save the photo.');
    } finally {
      setBusy(false);
    }
  };

  const enough = needed !== undefined && taken >= needed;
  return (
    <div data-testid="camera" className="fixed inset-0 z-50 bg-black flex flex-col" role="dialog" aria-label={title}>
      <div className="bg-brand-navy text-white px-4 py-3 flex items-center">
        <button onClick={onClose} className="mr-3 text-xl" aria-label="Close camera" data-testid="camera-done">&larr;</button>
        <h2 className="text-lg font-bold flex-1">{title}</h2>
        {needed !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${enough ? 'bg-green-500 text-white' : 'bg-white/20'}`}>{Math.min(taken, needed)} of {needed}</span>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* The shutter stays off until the picture is really arriving, so a tap is never lost. */}
        <video ref={video} playsInline muted onLoadedData={() => setLive(true)} className="absolute inset-0 w-full h-full object-cover" />
        {!live && !error && <p className="absolute inset-0 flex items-center justify-center text-white text-sm">Opening the camera…</p>}
        {error && <p data-testid="camera-error" className="absolute inset-x-4 top-4 bg-white text-red-600 text-sm rounded-lg p-3">{error}</p>}
        {hint && !single && live && <p className="absolute inset-x-4 bottom-4 bg-black/60 text-white text-sm rounded-lg px-3 py-2 text-center">{hint(taken)}</p>}
      </div>

      <div className="bg-white p-4 space-y-3 max-w-md w-full mx-auto">
        {thumbs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar" aria-label="Photos taken now">
            {thumbs.map((u) => (
              <img key={u} src={u} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={take} disabled={!live || busy} data-testid="camera-take" className="flex-1 bg-brand-gold text-brand-navy font-bold py-3 rounded-lg active-scale disabled:opacity-50">
            {busy ? 'Saving…' : single ? 'Take photo' : thumbs.length ? 'Take another' : 'Take photo'}
          </button>
          {!single && thumbs.length > 0 && (
            <button onClick={onClose} className="px-5 font-bold rounded-lg border border-gray-300 text-gray-800 active-scale">Done</button>
          )}
        </div>
        <p className="text-xs text-gray-400">Photos come from the camera only. Take them in good light, and keep people and number plates out of the picture.</p>
      </div>
    </div>
  );
};

export default Camera;
