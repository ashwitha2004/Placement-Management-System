import React from "react";

// This component is deprecated. Use the in-app VideoConference component for all video calls.
export default function VideoCall() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Video Call</h3>
      <p className="text-gray-600">This feature now uses in-app video conferencing only.<br />
        Please use the Interview Room or VideoConference component for all calls.</p>
    </div>
  );
}
