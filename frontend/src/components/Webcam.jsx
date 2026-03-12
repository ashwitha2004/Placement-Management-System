import React, { useRef, useEffect, useState } from 'react';

const Webcam = ({ width = 400, height = 300, className = '' }) => {
  const videoRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user');

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode }
          },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // Camera access denied or not available
      }
    };
    getCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleSwitchCamera = () => {
    setFacingMode((mode) => (mode === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <video ref={videoRef} width={width} height={height} autoPlay playsInline className="rounded-2xl bg-black" />
      <span className="text-xs text-gray-400 mt-2">Camera is live</span>
      <button
        type="button"
        onClick={handleSwitchCamera}
        className="md:hidden mt-2 px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500"
      >
        Switch Camera
      </button>
    </div>
  );
};

export default Webcam;
