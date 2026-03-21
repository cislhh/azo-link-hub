'use client'

/**
 * 分享图片对话框组件
 *
 * 提供分享图片的预览和下载功能
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Download, Loader2, Share2 } from 'lucide-react'

interface ShareImageDialogProps {
  username: string
  displayName?: string | null
  trigger?: React.ReactNode
}

/**
 * 分享图片对话框
 */
export function ShareImageDialog({ username, displayName, trigger }: ShareImageDialogProps) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // 生成分享图片 URL
  const generateImageUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/api/share/${encodeURIComponent(username)}`
  }

  // 打开对话框时生成图片
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && !imageUrl) {
      setLoading(true)
      const url = generateImageUrl()
      // 预加载图片
      const img = new Image()
      img.onload = () => {
        setImageUrl(url)
        setLoading(false)
      }
      img.onerror = () => {
        setLoading(false)
      }
      img.src = url
    }
  }

  // 下载图片
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const url = imageUrl || generateImageUrl()
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${username}-share.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('下载失败:', error)
    } finally {
      setDownloading(false)
    }
  }

  // 复制分享链接
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/${username}`
    try {
      await navigator.clipboard.writeText(url)
      // 可以添加 toast 提示
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Share2 className="mr-2 h-4 w-4" />
      分享图片
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分享我的主页</DialogTitle>
          <DialogDescription>
            扫码或分享链接查看我的个人主页
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {loading ? (
            <div className="flex h-[400px] w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl || generateImageUrl()}
                alt={`${displayName || username} 的分享图片`}
                className="h-auto w-full max-w-[300px]"
                onLoad={() => setLoading(false)}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading || loading}
            >
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              下载图片
            </Button>
            <Button variant="default" onClick={handleCopyLink}>
              复制链接
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
