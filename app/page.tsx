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
  Settings,
} from "lucide-react"
import Link from "next/link"

interface Video {
  id: string
  title: string
  url: string
  thumbnail?: string
  duration?: string
  createdAt?: string
}

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    // جلب الفيديوهات من قاعدة البيانات عبر API
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
        console.error("Error fetching videos:", error)
      }
    }
    fetchVideos()
  }, [])

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = pos * duration
    }
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

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying])

  const playVideo = (video: Video) => {
    setCurrentVideo(video)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }

  useEffect(() => {
    if (currentVideo && videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch((err) => console.log("[v0] Play error:", err))
    }
  }, [currentVideo])

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration)
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0)
    }
  }

  const playNext = useCallback(() => {
    if (!currentVideo) return
    const currentIndex = videos.findIndex((v) => v.id === currentVideo.id)
    if (currentIndex < videos.length - 1) {
      playVideo(videos[currentIndex + 1])
    }
  }, [currentVideo, videos])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-zinc-900 rounded-full flex items-center justify-center">
            <Play size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">لا توجد فيديوهات</h1>
          <p className="text-zinc-400 mb-6">يرجى إضافة فيديوهات من لوحة التحكم</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Settings size={20} />
            الذهاب إلى لوحة التحكم
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gradient-to-b from-black to-transparent fixed top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">
            <span className="text-primary">▶</span> مشغل الفيديو
          </h1>
          <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg transition-all"
          >
            <List size={20} />
            <span className="hidden sm:inline">قائمة التشغيل</span>
          </button>
          <Link
            href="/admin"
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-all"
          >
            <Settings size={20} />
            <span className="hidden sm:inline">الإعدادات</span>
          </Link>
        </div>
        </div>
      </header>

      <div className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div
              ref={containerRef}
              className="relative bg-black rounded-xl overflow-hidden group aspect-video"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
            >
              {currentVideo && (
                <video
                  ref={videoRef}
                  src={currentVideo.url}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={handlePlayPause}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={playNext}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => console.log("[v0] Video error:", e)}
                  playsInline
                  preload="metadata"
                />
              )}

              {!isPlaying && (
                <button
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity"
                >
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/50">
                    <Play size={40} fill="white" className="ml-1" />
                  </div>
                </button>
              )}

              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
                  showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <div
                  ref={progressRef}
                  className="h-1.5 bg-zinc-700 rounded-full cursor-pointer mb-4 group/progress"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-primary rounded-full relative transition-all"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={skipBackward}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      title="تراجع 10 ثواني"
                    >
                      <SkipBack size={20} />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="p-3 bg-primary hover:bg-primary/80 rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                    </button>
                    <button
                      onClick={skipForward}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      title="تقدم 10 ثواني"
                    >
                      <SkipForward size={20} />
                    </button>

                    <div className="flex items-center gap-2 group/volume">
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-primary cursor-pointer"
                      />
                    </div>

                    <span className="text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {currentVideo && (
              <div className="mt-4">
                <h2 className="text-xl font-bold">{currentVideo.title}</h2>
              </div>
            )}
          </div>

          <div
            className={`lg:w-80 bg-zinc-900/50 rounded-xl overflow-hidden transition-all duration-300 ${
              showPlaylist ? "block" : "hidden"
            }`}
          >
            <div className="p-4 bg-zinc-900 flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-lg">قائمة التشغيل</h3>
              <button
                onClick={() => setShowPlaylist(false)}
                className="lg:hidden p-1 hover:bg-white/20 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => playVideo(video)}
                  className={`w-full flex gap-3 p-2 rounded-lg transition-all text-right ${
                    currentVideo?.id === video.id
                      ? "bg-primary/20 border border-primary/50"
                      : "hover:bg-zinc-800"
                  }`}
                >
                  <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={24} className="text-zinc-600" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/80 text-xs px-1.5 py-0.5 rounded">
                      {video.duration}
                    </span>
                    {currentVideo?.id === video.id && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-medium text-sm line-clamp-2 ${
                        currentVideo?.id === video.id ? "text-primary" : ""
                      }`}
                    >
                      {video.title}
                    </h4>
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
