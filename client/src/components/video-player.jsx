import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ src, poster, onProgress, onComplete, className = "" }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    console.log("VideoPlayer received src:", src);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    console.log("Video element mounted, src:", video.src);

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress && video.duration) {
        onProgress((video.currentTime / video.duration) * 100);
      }
    };

    const onLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", video.duration);
      setDuration(video.duration);
      setError(null);
    };
    const onEnded = () => {
      setPlaying(false);
      if (onComplete) onComplete();
    };
    const onError = (e) => {
      console.error("Video error:", e);
      console.error("Video src:", src);
      console.error("Video readyState:", video.readyState);
      console.error("Video networkState:", video.networkState);
      setError("Failed to load video. Please try again.");
      setPlaying(false);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, [onProgress, onComplete, retryCount]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
      console.warn("Video element not mounted");
      return;
    }
    if (video.paused) {
      video.play().catch((err) => {
        console.error("Play error:", err);
        setError("Failed to play video. Please try again.");
      });
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const handleVolumeChange = (value) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value[0];
    setVolume(value[0]);
    setMuted(value[0] === 0);
  };

  const handleSeek = (value) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => {
    if (playing) setShowControls(false);
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  // Error state UI
  if (error) {
    return (
      <div
        className={`relative group bg-black rounded-xl overflow-hidden flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group bg-black rounded-xl overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
        preload="metadata"
        key={`${src}-${retryCount}`}
      />

      {/* Big Play Button Overlay */}
      {!playing && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20"
          onClick={togglePlay}
        >
          <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all shadow-lg">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls Bar */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {/* Progress Bar */}
          <div className="mb-2">
            <Slider
              value={[currentTime]}
              max={duration || 0}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Skip Back */}
            <Button
              variant="ghost"
              size="sm"
              onClick={skipBackward}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="sm"
              onClick={skipForward}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2 w-32">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[muted ? 0 : volume]}
                max={1}
                step={0.05}
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
            </div>

            {/* Time */}
            <span className="text-xs text-white/80 min-w-max ml-auto">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {fullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}