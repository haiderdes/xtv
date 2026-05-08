"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Trash2,
  Edit2,
  LogOut,
  Video,
  Save,
  X,
  Home,
  Lock,
} from "lucide-react"

interface VideoItem {
  id: string
  title: string
  url: string
  thumbnail?: string
  duration?: string
  createdAt?: string
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newVideo, setNewVideo] = useState({
    title: "",
    url: "",
    thumbnail: "",
    duration: "",
  })

  // جلب الفيديوهات من قاعدة البيانات
  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/videos")
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
    }
  }

  useEffect(() => {
    const authToken = sessionStorage.getItem("admin_auth")
    if (authToken === "authenticated") {
      setIsAuthenticated(true)
      fetchVideos()
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem("admin_auth", "authenticated")
        setIsAuthenticated(true)
        fetchVideos()
      } else {
        setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة")
      }
    } catch {
      setLoginError("حدث خطأ في الاتصال")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth")
    setIsAuthenticated(false)
    setUsername("")
    setPassword("")
  }

  const addVideo = async () => {
    if (!newVideo.title || !newVideo.url) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVideo),
      })

      if (response.ok) {
        const addedVideo = await response.json()
        setVideos([addedVideo, ...videos])
        setNewVideo({ title: "", url: "", thumbnail: "", duration: "" })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error("Error adding video:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteVideo = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفيديو؟")) return

    try {
      const response = await fetch(`/api/videos?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setVideos(videos.filter((v) => v.id !== id))
      }
    } catch (error) {
      console.error("Error deleting video:", error)
    }
  }

  const updateVideo = async (id: string, updates: Partial<VideoItem>) => {
    try {
      const response = await fetch("/api/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })

      if (response.ok) {
        const updatedVideo = await response.json()
        setVideos(videos.map((v) => (v.id === id ? updatedVideo : v)))
        setIsEditing(null)
      }
    } catch (error) {
      console.error("Error updating video:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
              <p className="text-zinc-400 mt-2">تسجيل الدخول للإدارة</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>

              {loginError && (
                <p className="text-red-500 text-sm text-center">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                تسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Video size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة التحكم</h1>
              <p className="text-xs text-zinc-400">إدارة الفيديوهات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Home size={18} />
              <span className="hidden sm:inline">الرئيسية</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">الفيديوهات</h2>
            <p className="text-zinc-400">{videos.length} فيديو</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/80 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            إضافة فيديو
          </button>
        </div>

        {showAddForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">إضافة فيديو جديد</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  عنوان الفيديو *
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="أدخل عنوان الفيديو"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  رابط الفيديو المباشر *
                </label>
                <input
                  type="url"
                  value={newVideo.url}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, url: e.target.value })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="https://example.com/video.mp4"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  رابط الصورة المصغرة
                </label>
                <input
                  type="url"
                  value={newVideo.thumbnail}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, thumbnail: e.target.value })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="https://example.com/thumbnail.jpg"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  المدة
                </label>
                <input
                  type="text"
                  value={newVideo.duration}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, duration: e.target.value })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="10:30"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={addVideo}
                disabled={!newVideo.title || !newVideo.url || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Save size={18} />
                {isSubmitting ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا توجد فيديوهات</h3>
            <p className="text-zinc-400 mb-4">
              ابدأ بإضافة فيديوهات لعرضها في الموقع
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              إضافة فيديو
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-full sm:w-48 h-28 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video size={32} className="text-zinc-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing === video.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        defaultValue={video.title}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        id={`title-${video.id}`}
                      />
                      <input
                        type="url"
                        defaultValue={video.url}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        dir="ltr"
                        id={`url-${video.id}`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const titleInput = document.getElementById(
                              `title-${video.id}`
                            ) as HTMLInputElement
                            const urlInput = document.getElementById(
                              `url-${video.id}`
                            ) as HTMLInputElement
                            updateVideo(video.id, {
                              title: titleInput.value,
                              url: urlInput.value,
                            })
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/80 rounded-lg text-sm transition-colors"
                        >
                          <Save size={14} />
                          حفظ
                        </button>
                        <button
                          onClick={() => setIsEditing(null)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg mb-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-zinc-400 truncate mb-2" dir="ltr">
                        {video.url}
                      </p>
                      <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                        {video.duration || "—"}
                      </span>
                    </>
                  )}
                </div>

                {isEditing !== video.id && (
                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => setIsEditing(video.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                      <span className="sm:hidden">تعديل</span>
                    </button>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      <span className="sm:hidden">حذف</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
