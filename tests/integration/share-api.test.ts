/**
 * 分享图片 API 测试
 *
 * 测试 /api/share/[username] 端点
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/share/[username]/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { isDbConnected } from '@/tests/setup'

describe('GET /api/share/[username]', () => {
  beforeEach(async () => {
    if (!isDbConnected) return
    // 清理数据库
    await prisma.socialLink.deleteMany()
    await prisma.extraLink.deleteMany()
    await prisma.link.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  })

  it('应该返回用户的分享图片（PNG 格式）', async () => {
    if (!isDbConnected) {
      console.warn('数据库未连接，跳过测试')
      return
    }

    // 创建测试用户和链接
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: '测试用户',
      },
    })

    await prisma.link.create({
      data: {
        userId: user.id,
        username: 'testuser',
        displayName: '测试用户',
        bio: '这是我的个人简介',
        backgroundValue: '#ffffff',
        isActive: true,
        publishedAt: new Date(),
      },
    })

    const request = new NextRequest('http://localhost:3000/api/share/testuser')
    const response = await GET(request, { params: Promise.resolve({ username: 'testuser' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toContain('public')
  })

  it('应该支持自定义尺寸查询参数', async () => {
    if (!isDbConnected) {
      console.warn('数据库未连接，跳过测试')
      return
    }

    const user = await prisma.user.create({
      data: {
        email: 'test2@example.com',
      },
    })

    await prisma.link.create({
      data: {
        userId: user.id,
        username: 'testuser2',
        displayName: '用户2',
        backgroundValue: '#ffffff',
        isActive: true,
        publishedAt: new Date(),
      },
    })

    const request = new NextRequest('http://localhost:3000/api/share/testuser2?size=540')
    const response = await GET(request, { params: Promise.resolve({ username: 'testuser2' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
  })

  it('应该支持自定义背景色查询参数', async () => {
    if (!isDbConnected) {
      console.warn('数据库未连接，跳过测试')
      return
    }

    const user = await prisma.user.create({
      data: {
        email: 'test3@example.com',
      },
    })

    await prisma.link.create({
      data: {
        userId: user.id,
        username: 'testuser3',
        displayName: '用户3',
        backgroundValue: '#ffffff',
        isActive: true,
        publishedAt: new Date(),
      },
    })

    const request = new NextRequest('http://localhost:3000/api/share/testuser3?bg=%23f0f0f0')
    const response = await GET(request, { params: Promise.resolve({ username: 'testuser3' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
  })

  it('应该返回 404 当用户不存在', async () => {
    if (!isDbConnected) {
      console.warn('数据库未连接，跳过测试')
      return
    }

    const request = new NextRequest('http://localhost:3000/api/share/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ username: 'nonexistent' }) })

    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toContain('application/json')
  })

  it('应该返回 404 当链接未激活', async () => {
    if (!isDbConnected) {
      console.warn('数据库未连接，跳过测试')
      return
    }

    const user = await prisma.user.create({
      data: {
        email: 'inactive@example.com',
      },
    })

    await prisma.link.create({
      data: {
        userId: user.id,
        username: 'inactiveuser',
        displayName: '未激活用户',
        backgroundValue: '#ffffff',
        isActive: false, // 未激活
      },
    })

    const request = new NextRequest('http://localhost:3000/api/share/inactiveuser')
    const response = await GET(request, { params: Promise.resolve({ username: 'inactiveuser' }) })

    expect(response.status).toBe(404)
  })

  it('应该处理缺少 bio 的用户', async () => {
    if (!isDbConnected) {
      console.warn('数据库未连接，跳过测试')
      return
    }

    const user = await prisma.user.create({
      data: {
        email: 'nobio@example.com',
      },
    })

    await prisma.link.create({
      data: {
        userId: user.id,
        username: 'nobiouser',
        displayName: '无简介用户',
        bio: null,
        backgroundValue: '#ffffff',
        isActive: true,
        publishedAt: new Date(),
      },
    })

    const request = new NextRequest('http://localhost:3000/api/share/nobiouser')
    const response = await GET(request, { params: Promise.resolve({ username: 'nobiouser' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
  })

  it('应该处理特殊字符用户名', async () => {
    if (!isDbConnected) {
      console.warn('数据库未连接，跳过测试')
      return
    }

    const user = await prisma.user.create({
      data: {
        email: 'special@example.com',
      },
    })

    await prisma.link.create({
      data: {
        userId: user.id,
        username: 'user_123',
        displayName: '特殊字符用户',
        backgroundValue: '#ffffff',
        isActive: true,
        publishedAt: new Date(),
      },
    })

    const request = new NextRequest('http://localhost:3000/api/share/user_123')
    const response = await GET(request, { params: Promise.resolve({ username: 'user_123' }) })

    expect(response.status).toBe(200)
  })

  it('应该设置正确的缓存头', async () => {
    if (!isDbConnected) {
      console.warn('数据库未连接，跳过测试')
      return
    }

    const user = await prisma.user.create({
      data: {
        email: 'cache@example.com',
      },
    })

    await prisma.link.create({
      data: {
        userId: user.id,
        username: 'cacheuser',
        displayName: '缓存测试用户',
        backgroundValue: '#ffffff',
        isActive: true,
        publishedAt: new Date(),
      },
    })

    const request = new NextRequest('http://localhost:3000/api/share/cacheuser')
    const response = await GET(request, { params: Promise.resolve({ username: 'cacheuser' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('public')
    expect(response.headers.get('cache-control')).toContain('max-age')
  })
})
