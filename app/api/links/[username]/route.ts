import { NextRequest, NextResponse } from 'next/server'
import { getLinkByUsernameCached } from '@/lib/services/link.service'
import { AppError } from '@/lib/errors'

/**
 * GET /api/links/[username]
 *
 * 获取用户的公开链接页面数据
 *
 * @param request - Next.js 请求对象
 * @param context - 路由上下文，包含 params（Promise）
 * @returns JSON 响应，包含链接数据或错误信息
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: '用户名不能为空',
        },
        { status: 400 }
      )
    }

    const link = await getLinkByUsernameCached(username)

    if (!link) {
      return NextResponse.json(
        {
          success: false,
          error: '链接不存在或未激活',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: link,
    })
  } catch (error) {
    console.error('Error fetching link:', error)

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
      },
      { status: 500 }
    )
  }
}
