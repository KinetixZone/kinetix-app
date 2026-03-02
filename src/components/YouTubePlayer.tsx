import React from 'react';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Patrones para diferentes formatos de URL de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/user\/[^\/]+#[^\/]*\/[^\/]*\/[^\/]*\/([^&\n?#]+)/
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
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 dark:text-gray-400">
            <svg 
              className="w-8 h-8 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm">Video no disponible</p>
            <p className="text-xs text-gray-400 mt-1">URL inválida o no compatible</p>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`;
  
  return (
    <div className={`relative bg-black rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title={title || 'Video de ejercicio'}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
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

export default YouTubePlayer;