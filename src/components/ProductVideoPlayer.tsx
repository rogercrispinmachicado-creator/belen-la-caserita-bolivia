import React from 'react';
import { ExternalLink, Play } from 'lucide-react';

interface ProductVideoPlayerProps {
  videoUrl: string;
  productName: string;
  maxWidthClass?: string;
}

type ResolvedVideo =
  | { kind: 'native'; src: string }
  | { kind: 'iframe'; src: string; provider: string }
  | { kind: 'external'; src: string };

function resolveVideoSource(rawUrl: string): ResolvedVideo {
  const url = rawUrl.trim();

  // Direct uploaded files or direct video formats
  if (
    url.startsWith('/uploads/') ||
    url.startsWith('data:video/') ||
    url.startsWith('blob:') ||
    /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url)
  ) {
    return { kind: 'native', src: url };
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // YouTube Shorts & standard YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId = '';
      if (host.includes('youtu.be')) {
        videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2] || '';
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2] || '';
      } else {
        videoId = parsed.searchParams.get('v') || '';
      }
      if (videoId) {
        return {
          kind: 'iframe',
          src: `https://www.youtube.com/embed/${videoId}?rel=0`,
          provider: 'YouTube',
        };
      }
    }

    // TikTok video URL
    if (host.includes('tiktok.com')) {
      const match = parsed.pathname.match(/\/video\/(\d+)/);
      if (match?.[1]) {
        return {
          kind: 'iframe',
          src: `https://www.tiktok.com/embed/v2/${match[1]}`,
          provider: 'TikTok',
        };
      }
    }

    // Instagram Reels
    if (host.includes('instagram.com')) {
      const match = parsed.pathname.match(/\/(reel|reels|p)\/([^/]+)/);
      if (match?.[2]) {
        return {
          kind: 'iframe',
          src: `https://www.instagram.com/reel/${match[2]}/embed`,
          provider: 'Instagram Reels',
        };
      }
    }

    // Google Drive preview
    if (host.includes('drive.google.com')) {
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (match?.[1]) {
        return {
          kind: 'iframe',
          src: `https://drive.google.com/file/d/${match[1]}/preview`,
          provider: 'Google Drive',
        };
      }
    }
  } catch {
    // Fallback below if relative or non-standard URL
  }

  return { kind: 'external', src: url };
}

export function ProductVideoPlayer({
  videoUrl,
  productName,
  maxWidthClass = 'max-w-[290px] sm:max-w-[320px]',
}: ProductVideoPlayerProps) {
  if (!videoUrl || !videoUrl.trim()) {
    return null;
  }

  const resolved = resolveVideoSource(videoUrl);

  return (
    <div
      className={`aspect-[9/16] w-full ${maxWidthClass} mx-auto rounded-2xl overflow-hidden bg-black border border-[#10245A]/15 shadow-sm relative`}
    >
      {resolved.kind === 'native' && (
        <video
          src={resolved.src}
          controls
          playsInline
          preload="metadata"
          aria-label={`Video demostrativo vertical 9:16 de ${productName}`}
          className="w-full h-full object-contain bg-black"
        />
      )}

      {resolved.kind === 'iframe' && (
        <iframe
          src={resolved.src}
          title={`Video vertical 9:16 de ${productName} (${resolved.provider})`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      {resolved.kind === 'external' && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-5 text-center bg-[#10245A] text-white">
          <div className="w-12 h-12 rounded-full bg-[#E6007E] flex items-center justify-center">
            <Play className="w-6 h-6 fill-white text-white ml-0.5" />
          </div>
          <p className="text-xs font-semibold text-white/85">
            Video demostrativo vertical (9:16)
          </p>
          <a
            href={resolved.src}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#FFD500] hover:bg-[#FF6A00] hover:text-white text-[#10245A] font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span>Abrir video</span>
          </a>
        </div>
      )}
    </div>
  );
}
