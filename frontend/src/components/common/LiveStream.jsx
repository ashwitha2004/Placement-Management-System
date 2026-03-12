import React, { useState } from "react";
import { Play, Calendar, Users } from "lucide-react";

export default function LiveStream() {
  const [selectedStream, setSelectedStream] = useState(null);

  const liveStreams = [
    {
      id: 1,
      title: "Live Interview Preparation",
      platform: "YouTube",
      startTime: "2:00 PM",
      participants: 342,
      thumbnail: "bg-gradient-to-br from-blue-500 to-blue-700"
    },
    {
      id: 2,
      title: "Resume Review Session",
      platform: "Google Meet",
      startTime: "3:30 PM",
      participants: 156,
      thumbnail: "bg-gradient-to-br from-emerald-500 to-emerald-700"
    },
    {
      id: 3,
      title: "Company Culture & Internship Tips",
      platform: "YouTube",
      startTime: "4:00 PM",
      participants: 287,
      thumbnail: "bg-gradient-to-br from-purple-500 to-purple-700"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Play size={24} className="text-red-600" />
            Live Streams & Classes
          </h3>
          <p className="text-sm text-gray-600 mt-1">Join ongoing sessions or watch recorded videos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {liveStreams.map((stream) => (
          <div
            key={stream.id}
            onClick={() => setSelectedStream(stream)}
            className="cursor-pointer group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            {/* Thumbnail */}
            <div className={`${stream.thumbnail} h-40 relative overflow-hidden flex items-center justify-center`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition"></div>
              <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>
              <Play size={48} className="text-white opacity-70 group-hover:opacity-100 transition" />
            </div>

            {/* Info */}
            <div className="p-4 bg-white">
              <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{stream.title}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{stream.startTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{stream.participants} watching</span>
                </div>
              </div>
              <div className="mt-3 inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                {stream.platform}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStream && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Now viewing:</strong> {selectedStream.title} • {selectedStream.participants} participants
          </p>
          <button
            onClick={() => window.open("https://www.youtube.com/", "_blank")}
            className="mt-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
          >
            Join Now on {selectedStream.platform}
          </button>
        </div>
      )}
    </div>
  );
}
