import React from 'react';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Support multiple YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^#&?]*).*/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }
  
  return null;
};

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoUrl, 
  title, 
  className = "" 
}) => {
  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className={`bg-gray-900/50 rounded-2xl p-6 text-center border border-white/5 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-white/40">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Video no disponible</p>
            <p className="text-xs text-white/20 mt-1">URL inválida o no encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0&mute=0`;

  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${className}`}>
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title={title || 'Video de ejercicio'}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          <h3 className="text-white text-sm font-bold truncate drop-shadow-lg">
            {title}
          </h3>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;