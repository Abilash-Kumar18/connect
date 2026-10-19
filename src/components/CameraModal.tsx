import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhoto: (dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapturePhoto,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err: any) {
        setCameraError(err.message || 'Camera access not permitted or unavailable.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const handleSend = () => {
    if (capturedImage) {
      onCapturePhoto(capturedImage);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md bg-white dark:bg-[#1a1f18] rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF2D55] flex items-center justify-center text-white">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Take Photo</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-4 text-zinc-300 text-xs">
                  <Camera className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <p className="font-semibold text-rose-300">Camera Unavailable</p>
                  <p className="mt-1 text-zinc-400 text-[11px]">{cameraError}</p>
                </div>
              ) : capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Snapshot"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              {capturedImage ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#FF2D55] hover:bg-[#e02449] text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Send Photo</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-center gap-4">
                  <button
                    type="button"
                    disabled={!!cameraError}
                    onClick={handleTakeSnapshot}
                    className="w-14 h-14 rounded-full border-4 border-white shadow-lg bg-[#FF2D55] hover:bg-[#e02449] active:scale-95 transition-transform flex items-center justify-center text-white disabled:opacity-40"
                    title="Capture"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
