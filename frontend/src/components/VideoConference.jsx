import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import VideoChat from './VideoChat';
import { notificationsAPI } from '../services/api';

const SOCKET_URL = import.meta.env.MODE === 'production'
  ? window.location.origin
  : 'http://localhost:5001';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false
});

export default function VideoConference({ roomId, user, onLeave, autoStart, compact = false }) {
  const [screensharing, setScreensharing] = useState(false);
  const screenshareStreamRef = useRef();
  // Fullscreen state
  const [fullscreen, setFullscreen] = useState(false);
  const [layout, setLayout] = useState('half'); // grid or half
  const videosContainerRef = useRef();
  const [error, setError] = useState(null);
  const peersRef = useRef({});

  const handleFullscreen = () => {
    setFullscreen((f) => {
      if (!f && videosContainerRef.current) {
        if (videosContainerRef.current.requestFullscreen) {
          videosContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      return !f;
    });
  };

  const handleLayout = () => {
    setLayout((l) => (l === 'grid' ? 'half' : 'grid'));
  };

  const localVideoRef = useRef();
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [peers, setPeers] = useState({});
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('user');
  const [callStarted, setCallStarted] = useState(!!autoStart);
  const localStreamRef = useRef();
  const [participants, setParticipants] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef();
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [inviteValue, setInviteValue] = useState('');
  const [inviteRole, setInviteRole] = useState('student');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  useEffect(() => {
    if (!callStarted) return;
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('user-joined', ({ userId, user }) => {
      setParticipants((prev) => [...prev, { userId, user }]);
    });
    socket.on('user-left', ({ userId }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
    });
    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [callStarted]);
  const handleStartRecording = () => {
    if (localStreamRef.current) {
      const recorder = new MediaRecorder(localStreamRef.current);
      mediaRecorderRef.current = recorder;
      setRecordedChunks([]);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
      };
      recorder.start();
      setRecording(true);
    }
  };
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (!callStarted) return;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'user' }
          },
          audio: true
        });
        localStreamRef.current = stream;
        stream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        socket.emit('join-room', { roomId, user });
      } catch (err) {
        setError('Unable to access camera or microphone. Please check your browser permissions.');
      }
    }
    start();

    socket.on('user-joined', ({ userId }) => {
      const peer = createPeer(userId, true);
      setPeers((prev) => ({ ...prev, [userId]: peer }));
    });

    socket.on('signal', async ({ signal, userId }) => {
      let peer = peersRef.current[userId];
      if (!peer) {
        peer = createPeer(userId, false);
        setPeers((prev) => {
          const updated = { ...prev, [userId]: peer };
          peersRef.current = updated;
          return updated;
        });
      }
      if (signal.sdp) {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        if (signal.sdp.type === 'offer') {
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit('signal', { roomId, signal: { sdp: peer.localDescription }, userId });
        }
      } else if (signal.candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    socket.on('user-left', ({ userId }) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        setPeers((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          peersRef.current = copy;
          return copy;
        });
        setRemoteStreams((prev) => prev.filter((s) => s.userId !== userId));
      }
    });

    return () => {
      socket.emit('leave-room', { roomId });
      Object.values(peersRef.current).forEach((peer) => peer.close());
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setPeers({});
      peersRef.current = {};
      setRemoteStreams([]);
    };
    // eslint-disable-next-line
  }, [roomId, callStarted]);

  function createPeer(userId, initiator) {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    // Add tracks from local video or screenshare
    const stream = screensharing && screenshareStreamRef.current ? screenshareStreamRef.current : localStreamRef.current;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('signal', { roomId, signal: { candidate: e.candidate }, userId });
      }
    };
    peer.ontrack = (e) => {
      setRemoteStreams((prev) => {
        const stream = e.streams[0];
        const index = prev.findIndex((item) => item.userId === userId);
        if (index === -1) {
          return [...prev, { userId, stream }];
        }
        const updated = [...prev];
        updated[index] = { userId, stream };
        return updated;
      });
    };
    if (initiator) {
      peer.onnegotiationneeded = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('signal', { roomId, signal: { sdp: peer.localDescription }, userId });
      };
    }
    return peer;
  }

  const handleMute = () => {
    setMuted((m) => {
      localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = m));
      return !m;
    });
  };
  const handleCamera = () => {
    setCameraOn((c) => {
      localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !c));
      return !c;
    });
  };

  const handleSwitchCamera = async () => {
    const nextFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nextFacingMode }
        },
        audio: true
      });

      const previousStream = localStreamRef.current;
      localStreamRef.current = nextStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = nextStream;
      }

      Object.values(peers).forEach((peer) => {
        nextStream.getTracks().forEach((track) => {
          const sender = peer.getSenders().find((s) => s.track && s.track.kind === track.kind);
          if (sender) sender.replaceTrack(track);
        });
      });

      if (previousStream) {
        previousStream.getTracks().forEach((track) => track.stop());
      }

      setCameraFacingMode(nextFacingMode);
      setCameraOn(true);
      setError(null);
    } catch (err) {
      setError('Unable to switch camera on this device.');
    }
  };
  const handleLeave = () => {
    socket.emit('leave-room', { roomId, user, role: user?.role || 'hr' });
    setCallStarted(false);
    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (onLeave) onLeave();
  };

  const handleScreenshare = async () => {
    if (!screensharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenshareStreamRef.current = stream;
        setScreensharing(true);
        // Replace local video with screenshare
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // Replace tracks in all peers
        Object.values(peers).forEach((peer) => {
          stream.getTracks().forEach((track) => {
            const sender = peer.getSenders().find((s) => s.track && s.track.kind === track.kind);
            if (sender) sender.replaceTrack(track);
          });
        });
        stream.getVideoTracks()[0].onended = () => {
          // Stop screenshare when user ends
          setScreensharing(false);
          if (localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          Object.values(peers).forEach((peer) => {
            localStreamRef.current.getTracks().forEach((track) => {
              const sender = peer.getSenders().find((s) => s.track && s.track.kind === track.kind);
              if (sender) sender.replaceTrack(track);
            });
          });
        };
      } catch (err) {
        setScreensharing(false);
      }
    } else {
      // Stop screenshare
      setScreensharing(false);
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      Object.values(peers).forEach((peer) => {
        localStreamRef.current.getTracks().forEach((track) => {
          const sender = peer.getSenders().find((s) => s.track && s.track.kind === track.kind);
          if (sender) sender.replaceTrack(track);
        });
      });
    }
  };
  const hasRemoteParticipants = remoteStreams.length > 0;
  const videoGridClass = hasRemoteParticipants
    ? (layout === 'half'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-3 p-3 h-full'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 h-full')
    : 'grid grid-cols-1 md:grid-cols-2 gap-3 p-3 h-full';

  const localTileClass = hasRemoteParticipants
    ? 'border-2 border-indigo-500 bg-black rounded-xl overflow-hidden relative min-h-[180px]'
    : 'border-2 border-indigo-500 bg-black rounded-xl overflow-hidden relative min-h-[180px]';
  const remoteTileClass = 'border-2 border-blue-400 bg-black rounded-xl overflow-hidden relative min-h-[180px]';

  const rawRole = String(user?.role || '').toLowerCase().trim();
  const currentRole = rawRole.includes('student')
    ? 'student'
    : rawRole.includes('staff')
      ? 'staff'
      : rawRole.includes('hr')
        ? 'hr'
        : 'hr';

  const roleConnectionMatrix = {
    hr: ['student', 'staff'],
    student: ['hr', 'staff'],
    staff: ['student', 'hr']
  };

  const inviteRoleOptions = roleConnectionMatrix[currentRole] || ['student', 'staff'];

  useEffect(() => {
    if (!inviteRoleOptions.includes(inviteRole)) {
      setInviteRole(inviteRoleOptions[0]);
    }
  }, [inviteRole, inviteRoleOptions]);

  const handleSendInvite = async () => {
    const value = String(inviteValue || '').trim();
    if (!value) {
      setInviteStatus({ type: 'error', text: 'Enter recipient ID or email.' });
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isObjectId = /^[a-f\d]{24}$/i.test(value);

    if (!isEmail && !isObjectId) {
      setInviteStatus({ type: 'error', text: 'Use a valid email or 24-character user ID.' });
      return;
    }

    try {
      setInviteLoading(true);
      setInviteStatus({ type: '', text: '' });

      const payload = {
        title: 'Interview meeting request',
        message: `${user?.name || 'A user'} invited you to join a one-to-one interview call. [RoomID:${roomId}]`,
        type: 'interview',
        targetRole: inviteRole,
        metadata: {
          roomId,
          fromRole: currentRole,
          fromUserId: user?._id || user?.id || ''
        }
      };

      if (isEmail) {
        payload.recipientEmail = value;
      } else {
        payload.recipientId = value;
      }

      await notificationsAPI.sendDirect(payload);
      setInviteStatus({ type: 'success', text: 'Join request sent successfully.' });
      setInviteValue('');
    } catch (error) {
      setInviteStatus({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to send join request.'
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const attachStream = (element, stream) => {
    if (!element || !stream) return;
    if (element.srcObject !== stream) {
      element.srcObject = stream;
    }
  };

  if (!callStarted) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-indigo-500/50 p-6 text-center">
        <p className="text-slate-200 font-semibold mb-4">Camera and microphone are off until you join the call.</p>
        <button
          onClick={() => setCallStarted(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
        >
          Join Call
        </button>
      </div>
    );
  }

  const controlBtnBase = compact
    ? 'w-full min-h-[40px] px-3 py-2 rounded-xl text-white font-bold text-sm transition-all'
    : 'w-full min-h-[46px] px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all';

  return (
    <div className={`vc-root ${fullscreen ? 'fullscreen' : ''} flex justify-center items-start ${compact ? 'min-h-[340px]' : 'min-h-[460px]'} px-2 sm:px-4`}>
      <div className={`bg-slate-900 rounded-3xl shadow-2xl border border-indigo-500/60 ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5 lg:p-6'} w-full max-w-5xl overflow-hidden ${compact ? 'space-y-3' : 'space-y-4'}`}>
        {error && (
          <div className="bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl p-3 font-bold text-center">
            {error}
          </div>
        )}

        <div
          className="bg-black rounded-2xl shadow-lg border border-indigo-400/70 relative w-full overflow-hidden"
          ref={videosContainerRef}
          style={{
            width: '100%',
            aspectRatio: fullscreen ? undefined : compact ? '16 / 9' : '16 / 10',
            height: fullscreen ? '80vh' : 'auto',
            minHeight: fullscreen ? undefined : compact ? '180px' : '220px'
          }}
        >
          <div className={videoGridClass}>
            <div className={localTileClass}>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full"
                style={{ boxShadow: '0 4px 24px #0004', objectFit: 'cover' }}
              />
              {!cameraOn && !screensharing && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white text-sm font-bold px-3 py-1 rounded-lg bg-black/60">Camera is off</span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 rounded bg-black/60 text-white">
                You
              </span>
            </div>

            {remoteStreams.map((remote) => (
              <div className={remoteTileClass} key={remote.userId}>
                <video
                  autoPlay
                  playsInline
                  ref={(element) => attachStream(element, remote.stream)}
                  className="w-full h-full"
                  style={{ boxShadow: '0 4px 24px #0004', objectFit: 'cover' }}
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 rounded bg-black/60 text-white">
                  {participants.find((p) => p.userId === remote.userId)?.user?.name || 'Participant'}
                </span>
              </div>
            ))}

            {!hasRemoteParticipants && (
              <div className={remoteTileClass}>
                <div className="absolute inset-0 bg-slate-900/85 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-3">
                    <span className="text-indigo-300 text-xl font-black">OP</span>
                  </div>
                  <p className="text-slate-100 font-semibold">Remote participant screen</p>
                  <p className="text-slate-300 text-xs mt-1">Waiting for the other person to join this room</p>
                </div>
                <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 rounded bg-black/60 text-white">
                  Opposite Person
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          <button onClick={handleMute} className={`${controlBtnBase} bg-blue-600 hover:bg-blue-500`}>{muted ? 'Unmute' : 'Mute'}</button>
          <button onClick={handleCamera} className={`${controlBtnBase} bg-blue-600 hover:bg-blue-500`}>{cameraOn ? 'Camera Off' : 'Camera On'}</button>
          <button onClick={handleSwitchCamera} disabled={screensharing} className={`${controlBtnBase} bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed`}>Switch Camera</button>
          <button onClick={handleFullscreen} className={`${controlBtnBase} bg-violet-600 hover:bg-violet-500`}>{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
          <button onClick={handleLayout} className={`${controlBtnBase} bg-slate-600 hover:bg-slate-500`}>{layout === 'grid' ? 'Half Layout' : 'Grid Layout'}</button>
          <button onClick={handleScreenshare} className={`${controlBtnBase} bg-yellow-500 hover:bg-yellow-400`}>{screensharing ? 'Stop Screenshare' : 'Screenshare'}</button>
          {!recording ? (
            <button onClick={handleStartRecording} className={`${controlBtnBase} bg-red-500 hover:bg-red-400`}>Start Recording</button>
          ) : (
            <button onClick={handleStopRecording} className={`${controlBtnBase} bg-red-700 hover:bg-red-600`}>Stop & Save Recording</button>
          )}
          <button onClick={handleLeave} className={`${controlBtnBase} bg-red-600 hover:bg-red-500`}>End Call</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-slate-900/90 rounded-2xl p-5 shadow-lg border border-slate-700 space-y-4">
            <h3 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Participants</h3>
            <ul className="text-sm text-slate-100">
              <li className="font-bold">You ({user?.name || 'HR'})</li>
              {participants.map((p) => (
                <li key={p.userId}>{p.user?.name || p.userId}</li>
              ))}
            </ul>

            <div className="pt-3 border-t border-slate-700">
              <p className="text-sm font-semibold text-slate-200 mb-2">Send join request</p>
              <div className="space-y-2">
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm"
                >
                  {inviteRoleOptions.map((role) => (
                    <option key={role} value={role}>{role.toUpperCase()}</option>
                  ))}
                </select>
                <input
                  value={inviteValue}
                  onChange={(event) => setInviteValue(event.target.value)}
                  placeholder="Enter user ID or email"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm placeholder:text-slate-400"
                />
                <button
                  onClick={handleSendInvite}
                  disabled={inviteLoading}
                  className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-60"
                >
                  {inviteLoading ? 'Sending...' : 'Send Request'}
                </button>
                {inviteStatus.text && (
                  <p className={`text-xs ${inviteStatus.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                    {inviteStatus.text}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-slate-900/90 rounded-2xl p-4 shadow-lg border border-slate-700 overflow-hidden">
            <VideoChat socket={socket} roomId={roomId} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
