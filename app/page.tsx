"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  List,
  X,
} from "lucide-react"

interface Video {
  id: string
  title: string
  url: string
  thumbnail?: string
  duration?: string
}

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [videos, setVideos] = useState<Video[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showPlaylist, setShowPlaylist] = useState(true)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos")

        if (response.ok) {
          const data = await response.json()

          setVideos(data)

          if (data.length > 0) {
            setCurrentVideo(data[0])
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchVideos()
  }, [])

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    }

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`
  }

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleVolumeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = parseFloat(e.target.value)

    setVolume(newVolume)

    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return

    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return

    setDuration(videoRef.current.duration)
  }

  const handleProgressClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!progressRef.current || !videoRef.current) return

    const rect =
      progressRef.current.getBoundingClientRect()

    const pos = (e.clientX - rect.left) / rect.width

    videoRef.current.currentTime = pos * duration
  }

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const playVideo = (video: Video) => {
    setCurrentVideo(video)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (currentVideo && videoRef.current) {
      videoRef.current.load()

      videoRef.current
        .play()
        .catch((err) => console.log(err))
    }
  }, [currentVideo])

  const skipForward = () => {
    if (!videoRef.current) return

    videoRef.current.currentTime = Math.min(
      videoRef.current.currentTime + 10,
      duration
    )
  }

  const skipBackward = () => {
    if (!videoRef.current) return

    videoRef.current.currentTime = Math.max(
      videoRef.current.currentTime - 10,
      0
    )
  }

  const playNext = useCallback(() => {
    if (!currentVideo) return

    const currentIndex = videos.findIndex(
      (v) => v.id === currentVideo.id
    )

    if (currentIndex < videos.length - 1) {
      playVideo(videos[currentIndex + 1])
    }
  }, [currentVideo, videos])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    )

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      )
    }
  }, [])

  const progress =
    duration > 0
      ? (currentTime / duration) * 100
      : 0

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gradient-to-b from-black to-transparent fixed top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
  <img
    src="/logo.png"
    alt="Logo"
    className="w-10 h-10 object-contain"
  />

  <h1 className="text-2xl font-bold text-primary">
    مشاهدة التطبيق - XSAT
  </h1>
</div>

          <button
            onClick={() =>
              setShowPlaylist(!showPlaylist)
            }
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg transition-all"
          >
            <List size={20} />

            <span className="hidden sm:inline">
              قائمة التشغيل
            </span>
          </button>
        </div>
      </header>

      <div className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div
              ref={containerRef}
              className="relative bg-black rounded-xl overflow-hidden group aspect-video"
            >
              {currentVideo && (
                <video
                  ref={videoRef}
                  src={currentVideo.url}
                  className="w-full h-full object-contain"
                  onClick={handlePlayPause}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={
                    handleLoadedMetadata
                  }
                  onEnded={playNext}
                  onPlay={() =>
                    setIsPlaying(true)
                  }
                  onPause={() =>
                    setIsPlaying(false)
                  }
                  playsInline
                  preload="metadata"
                />
              )}

              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 ${
                  showControls
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                <div
                  ref={progressRef}
                  className="h-1.5 bg-zinc-700 rounded-full cursor-pointer mb-4"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={skipBackward}>
                      <SkipBack size={20} />
                    </button>

                    <button
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause size={24} />
                      ) : (
                        <Play size={24} />
                      )}
                    </button>

                    <button onClick={skipForward}>
                      <SkipForward size={20} />
                    </button>

                    <button onClick={toggleMute}>
                      {isMuted ? (
                        <VolumeX size={20} />
                      ) : (
                        <Volume2 size={20} />
                      )}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={
                        handleVolumeChange
                      }
                    />

                    <span>
                      {formatTime(currentTime)} /{" "}
                      {formatTime(duration)}
                    </span>
                  </div>

                  <button
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize size={20} />
                    ) : (
                      <Maximize size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {currentVideo && (
              <div className="mt-4">
                <h2 className="text-xl font-bold">
                  {currentVideo.title}
                </h2>
              </div>
            )}
          </div>

          <div
            className={`lg:w-80 bg-zinc-900/50 rounded-xl overflow-hidden ${
              showPlaylist ? "block" : "hidden"
            }`}
          >
            <div className="p-4 bg-zinc-900 flex items-center justify-between">
              <h3 className="font-bold text-lg">
                قائمة التشغيل
              </h3>

              <button
                onClick={() =>
                  setShowPlaylist(false)
                }
                className="lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-2 max-h-[600px] overflow-y-auto">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() =>
                    playVideo(video)
                  }
                  className={`w-full flex gap-3 p-2 rounded-lg text-right ${
                    currentVideo?.id === video.id
                      ? "bg-primary/20"
                      : "hover:bg-zinc-800"
                  }`}
                >
                  <div className="w-32 h-20 bg-zinc-800 rounded-lg overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4>{video.title}</h4>

                    {video.duration && (
                      <p className="text-sm text-zinc-400 mt-1">
                        {video.duration}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}