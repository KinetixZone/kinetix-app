import React from 'react';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoUrl, 
  title, 
  className = "" 
}) => {
  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 text-center ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Video no disponible</p>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title={title || 'Video de ejercicio'}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
        </div>
      )}
    </div>
  );
};