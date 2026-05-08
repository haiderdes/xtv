import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'data', 'videos.json')

function ensureDB() {
  const dir = join(process.cwd(), 'data')
  if (!existsSync(dir)) {
    require('fs').mkdirSync(dir, { recursive: true })
  }
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify([]))
  }
}

function getVideos() {
  ensureDB()
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function saveVideos(videos: any) {
  ensureDB()
  writeFileSync(DB_PATH, JSON.stringify(videos, null, 2))
}

export async function GET() {
  try {
    const videos = getVideos()
    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const videos = getVideos()
    
    const newVideo = {
      id: Date.now().toString(),
      title: body.title,
      url: body.url,
      thumbnail: body.thumbnail || '',
      duration: body.duration || '',
      createdAt: new Date().toISOString()
    }
    
    videos.unshift(newVideo)
    saveVideos(videos)
    
    return NextResponse.json(newVideo, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    let videos = getVideos()
    videos = videos.filter((v: any) => v.id !== id)
    saveVideos(videos)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, url, thumbnail, duration } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    let videos = getVideos()
    const index = videos.findIndex((v: any) => v.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    
    videos[index] = {
      ...videos[index],
      title,
      url,
      thumbnail: thumbnail || '',
      duration: duration || '',
      updatedAt: new Date().toISOString()
    }
    
    saveVideos(videos)
    return NextResponse.json(videos[index])
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}
