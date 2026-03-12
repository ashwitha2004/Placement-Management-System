import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoConference from '../components/VideoConference';

export default function InterviewRoomPage({ user, roomId: propRoomId }) {
  const { roomId: routeRoomId } = useParams();
  const initialRoomId = propRoomId || routeRoomId || '';

  const [joined, setJoined] = useState(Boolean(initialRoomId));
  const [roomId, setRoomId] = useState(initialRoomId);

  useEffect(() => {
    const resolvedRoomId = propRoomId || routeRoomId || '';
    setRoomId(resolvedRoomId);
    setJoined(Boolean(resolvedRoomId));
  }, [propRoomId, routeRoomId]);

  const handleJoin = () => {
    if (roomId) setJoined(true);
  };
  const handleLeave = () => {
    setJoined(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 sm:p-6">
      {!joined ? (
        <div className="mx-auto mt-20 w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
          <h2 className="mb-4 text-2xl font-bold text-white">Join Interview Room</h2>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            onClick={handleJoin}
            disabled={!roomId}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Join
          </button>
        </div>
      ) : (
        <VideoConference roomId={roomId} user={user} onLeave={handleLeave} />
      )}
    </div>
  );
}
