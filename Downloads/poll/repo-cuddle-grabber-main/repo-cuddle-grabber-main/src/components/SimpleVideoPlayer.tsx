import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";

const DEFAULT_MEDIA_ID = "ty53stvjwv";

type WistiaPlayerElement = HTMLElement & {
  currentTime: number;
  duration: number;
  muted: boolean;
  paused: boolean;
  playbackRate: number;
  play: () => void;
  pause: () => void;
  requestFullscreen: () => void;
};

interface SimpleVideoPlayerProps {
  mediaId?: string;
}

const SimpleVideoPlayer = ({ mediaId = DEFAULT_MEDIA_ID }: SimpleVideoPlayerProps) => {
  const PLAYER_ELEMENT_ID = `wistia-player-${mediaId}`;
  const paddingTop = "56.25%"; // 16:9
  const wistiaAspect = "1.7778";

  const [hasStarted, setHasStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const playerRef = useRef<WistiaPlayerElement | null>(null);
  const shouldAutoplayRef = useRef(false);
  const controlsTimeoutRef = useRef<number | null>(null);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const playerScript = document.createElement("script");
    playerScript.src = "https://fast.wistia.com/player.js";
    playerScript.async = true;
    document.head.appendChild(playerScript);

    const embedScript = document.createElement("script");
    embedScript.src = `https://fast.wistia.com/embed/${mediaId}.js`;
    embedScript.async = true;
    embedScript.type = "module";
    document.head.appendChild(embedScript);

    return () => {
      if (playerScript.parentNode) playerScript.parentNode.removeChild(playerScript);
      if (embedScript.parentNode) embedScript.parentNode.removeChild(embedScript);
    };
  }, [hasStarted, mediaId]);

  useEffect(() => {
    if (!hasStarted) return;
    let mounted = true;
    let attempts = 0;

    const attach = (player: WistiaPlayerElement) => {
      playerRef.current = player;

      const syncBasics = () => {
        if (!mounted) return;
        setDuration(player.duration || 0);
        setCurrentTime(player.currentTime || 0);
        setIsMuted(!!player.muted);
        setIsPlaying(!player.paused);
      };

      const onApiReady = () => {
        if (!mounted) return;
        setIsReady(true);
        syncBasics();
        if (shouldAutoplayRef.current) {
          try {
            player.play();
          } catch {}
        }
      };

      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onEnded = () => setIsPlaying(false);
      const onLoadedMetadata = () => {
        if (!mounted) return;
        setDuration(player.duration || 0);
      };
      const onTimeUpdate = () => {
        if (!mounted) return;
        setCurrentTime(player.currentTime || 0);
        setDuration(player.duration || 0);
      };
      const onMuteChange = (event: Event) => {
        if (!mounted) return;
        const e = event as CustomEvent<{ isMuted: boolean }>;
        setIsMuted(!!(e.detail?.isMuted ?? player.muted));
      };

      player.addEventListener("api-ready", onApiReady);
      player.addEventListener("loaded-metadata", onLoadedMetadata);
      player.addEventListener("time-update", onTimeUpdate);
      player.addEventListener("play", onPlay);
      player.addEventListener("pause", onPause);
      player.addEventListener("ended", onEnded);
      player.addEventListener("mute-change", onMuteChange as EventListener);

      return () => {
        player.removeEventListener("api-ready", onApiReady);
        player.removeEventListener("loaded-metadata", onLoadedMetadata);
        player.removeEventListener("time-update", onTimeUpdate);
        player.removeEventListener("play", onPlay);
        player.removeEventListener("pause", onPause);
        player.removeEventListener("ended", onEnded);
        player.removeEventListener("mute-change", onMuteChange as EventListener);
      };
    };

    let detach: null | (() => void) = null;

    const tryFindAndAttach = () => {
      attempts += 1;
      const el = document.getElementById(PLAYER_ELEMENT_ID) as WistiaPlayerElement | null;
      if (el) {
        detach = attach(el) || null;
        return true;
      }
      return false;
    };

    const interval = window.setInterval(() => {
      if (tryFindAndAttach() || attempts > 40) {
        window.clearInterval(interval);
      }
    }, 50);

    tryFindAndAttach();

    return () => {
      mounted = false;
      window.clearInterval(interval);
      detach?.();
    };
  }, [hasStarted, PLAYER_ELEMENT_ID]);

  const handleStart = () => {
    shouldAutoplayRef.current = true;
    setHasStarted(true);
  };

  const formatTime = (seconds: number) => {
    const safe = Number.isFinite(seconds) ? seconds : 0;
    const mins = Math.floor(safe / 60);
    const secs = Math.floor(safe % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showControlsForAWhile = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, isMobile ? 3000 : 2500);
  };

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (isPlaying) player.pause();
      else player.play();
    } catch {}
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    player.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.requestFullscreen();
    } catch {}
  };

  // Preview state - minimal design
  if (!hasStarted) {
    return (
      <div className="w-full mx-auto">
        <div
          className="relative rounded-xl overflow-hidden cursor-pointer group"
          style={{
            paddingTop,
            background: "linear-gradient(135deg, hsl(0 30% 8%) 0%, hsl(0 20% 5%) 100%)",
            border: "2px solid hsl(0 60% 40% / 0.4)",
            boxShadow: "0 0 40px hsl(0 70% 40% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.05)",
          }}
          onClick={handleStart}
          role="button"
          tabIndex={0}
        >
          {/* Thumbnail */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{
              backgroundImage: `url('https://fast.wistia.com/embed/medias/${mediaId}/swatch')`,
            }}
          />

          {/* Gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, transparent 0%, hsl(0 20% 4% / 0.8) 100%)",
            }}
          />

          {/* Center play button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative mb-6">
              {/* Outer pulse ring */}
              <div 
                className="absolute -inset-6 rounded-full animate-ping"
                style={{
                  background: "hsl(0 70% 50% / 0.15)",
                  animationDuration: "2s",
                }}
              />
              
              {/* Inner glow ring */}
              <div 
                className="absolute -inset-3 rounded-full animate-pulse"
                style={{
                  background: "radial-gradient(circle, hsl(0 70% 50% / 0.4) 0%, transparent 70%)",
                  animationDuration: "1.5s",
                }}
              />
              
              {/* Play button */}
              <button
                type="button"
                className="relative w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, hsl(0 70% 50%) 0%, hsl(0 80% 40%) 100%)",
                  boxShadow: "0 8px 40px hsl(0 70% 40% / 0.6), 0 0 0 6px hsl(0 70% 50% / 0.25), 0 0 60px hsl(0 70% 50% / 0.3)",
                }}
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="white" />
              </button>
            </div>

            {/* Text below button */}
            <p className="text-white/60 text-xs uppercase tracking-widest">
              Clique para assistir
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="w-full mx-auto">
      <style>
        {`
          wistia-player[media-id='${mediaId}']:not(:defined) {
            background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch');
            display: block;
            filter: blur(5px);
            padding-top: ${paddingTop};
          }
        `}
      </style>

      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: "hsl(0 20% 5%)",
          border: "2px solid hsl(0 60% 40% / 0.3)",
          boxShadow: "0 0 40px hsl(0 70% 40% / 0.1)",
        }}
        onMouseMove={() => {
          if (!isMobile) showControlsForAWhile();
        }}
        onMouseLeave={() => {
          if (!isMobile && isPlaying) setShowControls(false);
        }}
        onClick={() => {
          if (isMobile) {
            if (!showControls) {
              showControlsForAWhile();
            } else {
              togglePlay();
              showControlsForAWhile();
            }
          } else {
            showControlsForAWhile();
            togglePlay();
          }
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <wistia-player
                id="${PLAYER_ELEMENT_ID}"
                media-id="${mediaId}"
                aspect="${wistiaAspect}"
                autoplay="true"
                controls-visible-on-load="false"
                big-play-button="false"
                play-pause-control="false"
                play-bar-control="false"
                volume-control="false"
                fullscreen-control="false"
                settings-control="false"
              ></wistia-player>
            `,
          }}
        />

        {/* Paused overlay */}
        {!isPlaying && isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(0 70% 50%) 0%, hsl(0 80% 40%) 100%)",
                boxShadow: "0 4px 20px hsl(0 70% 40% / 0.5)",
              }}
            >
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 pt-8">
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{ 
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, hsl(0 70% 50%) 0%, hsl(0 60% 60%) 100%)",
                }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    showControlsForAWhile();
                    togglePlay();
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  )}
                </button>

                <span className="text-white/70 text-xs font-medium tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showControlsForAWhile();
                    toggleMute();
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showControlsForAWhile();
                    handleFullscreen();
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleVideoPlayer;
