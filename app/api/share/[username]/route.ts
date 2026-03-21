/**
 * 分享图片 API Route
 *
 * GET /api/share/[username]
 * 生成并返回用户的分享图片
 */

import { NextRequest, NextResponse } from 'next/server'
import { linkService } from '@/lib/services/link.service'
import { generateShareImage } from '@/lib/services/share-image.service'
import { env } from '@/lib/env'

/**
 * GET /api/share/[username]
 *
 * 查询参数:
 * - size: 图片宽度 (默认 1080)
 * - bg: 背景颜色 (默认 #ffffff)
 *
 * 返回: PNG 图片
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { success: false, error: '用户名不能为空' },
        { status: 400 }
      )
    }

    // 获取用户链接信息
    const link = await linkService.getLinkByUsername(username)

    if (!link) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const sizeParam = searchParams.get('size')
    const bgParam = searchParams.get('bg')

    // 解析尺寸
    let width = 1080
    let height = 1920
    if (sizeParam) {
      const size = parseInt(sizeParam, 10)
      if (!isNaN(size) && size >= 300 && size <= 2000) {
        width = size
        height = Math.round(size * (16 / 9))
      }
    }

    // 解析背景色
    let backgroundColor = '#ffffff'
    if (bgParam) {
      // 验证十六进制颜色
      if (/^#[0-9A-Fa-f]{6}$/.test(bgParam)) {
        backgroundColor = bgParam
      }
    }

    // 获取网站 URL
    const siteUrl = env.NEXTAUTH_URL || request.headers.get('host') || 'https://linkhub.azo.dev'

    // 生成分享图片
    const imageBuffer = await generateShareImage(
      {
        displayName: link.displayName || link.username,
        username: link.username,
        bio: link.bio,
        avatar: link.avatar,
        qrCode: `${siteUrl}/${link.username}`,
        siteUrl: `${siteUrl}/${link.username}`,
      },
      { width, height, backgroundColor }
    )

    // 返回图片
    return new NextResponse(imageBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Disposition': `inline; filename="${username}-share.png"`,
      },
    })
  } catch (error) {
    console.error('生成分享图片失败:', error)
    return NextResponse.json(
      { success: false, error: '生成分享图片失败' },
      { status: 500 }
    )
  }
}

/**
 * 配置静态生成（可选）
 */
export const dynamic = 'force-dynamic'
