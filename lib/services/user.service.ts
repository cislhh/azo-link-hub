import { prisma } from '@/lib/db'
import type { User, Link } from '@prisma/client'
import { AppError } from '@/lib/errors'

/**
 * 用户创建输入类型
 */
export type CreateUserInput = {
  email: string
  name?: string | null
  image?: string | null
}

/**
 * 用户更新输入类型
 */
export type UpdateUserInput = {
  email?: string
  name?: string | null
  image?: string | null
}

/**
 * 用户关联 Link 类型
 */
export type UserWithLink = User & {
  link: Link | null
}

/**
 * 用户服务类
 *
 * 封装用户相关的业务逻辑和数据访问操作
 * 提供用户 CRUD 操作以及用户与 Link 关联的操作
 */
export class UserService {
  /**
   * 根据 ID 获取用户
   *
   * @param id - 用户 ID
   * @returns 用户对象或 null
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })
      return user
    } catch (error) {
      throw new AppError('获取用户失败', 'GET_USER_ERROR', error)
    }
  }

  /**
   * 根据邮箱获取用户
   *
   * @param email - 用户邮箱
   * @returns 用户对象或 null
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      return user
    } catch (error) {
      throw new AppError('获取用户失败', 'GET_USER_ERROR', error)
    }
  }

  /**
   * 创建新用户
   *
   * @param data - 用户创建数据
   * @returns 创建的用户对象
   */
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      const user = await prisma.user.create({
        data,
      })
      return user
    } catch (error) {
      throw new AppError('创建用户失败', 'CREATE_USER_ERROR', error)
    }
  }

  /**
   * 更新用户信息
   *
   * @param id - 用户 ID
   * @param data - 用户更新数据
   * @returns 更新后的用户对象或 null
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
      })
      return user
    } catch (error) {
      // 用户不存在时返回 null
      if ((error as any).code === 'P2025') {
        return null
      }
      throw new AppError('更新用户失败', 'UPDATE_USER_ERROR', error)
    }
  }

  /**
   * 删除用户
   *
   * 注意：这会级联删除用户的所有关联数据（Link、Account、Session 等）
   *
   * @param id - 用户 ID
   * @returns 被删除的用户对象或 null
   */
  async deleteUser(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.delete({
        where: { id },
      })
      return user
    } catch (error) {
      // 用户不存在时返回 null
      if ((error as any).code === 'P2025') {
        return null
      }
      throw new AppError('删除用户失败', 'DELETE_USER_ERROR', error)
    }
  }

  /**
   * 获取用户及其关联的 Link
   *
   * @param id - 用户 ID
   * @returns 用户对象（包含 Link）或 null
   */
  async getUserWithLink(id: string): Promise<UserWithLink | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          link: true,
        },
      })
      return user as UserWithLink | null
    } catch (error) {
      throw new AppError('获取用户失败', 'GET_USER_ERROR', error)
    }
  }

  /**
   * 为用户创建默认的 Link
   *
   * @param userId - 用户 ID
   * @returns 创建的 Link 对象
   */
  async createLinkForUser(userId: string): Promise<Link> {
    try {
      const link = await prisma.link.create({
        data: {
          userId,
          username: `user_${Date.now()}`, // 临时用户名，用户需要后续修改
          backgroundValue: '#ffffff', // 默认白色背景
        },
      })
      return link
    } catch (error) {
      throw new AppError('创建用户 Link 失败', 'CREATE_LINK_ERROR', error)
    }
  }

  /**
   * 确保用户有 Link，如果没有则创建
   *
   * @param userId - 用户 ID
   * @returns 用户的 Link 对象
   */
  async ensureUserHasLink(userId: string): Promise<Link> {
    try {
      // 先尝试查找用户的 Link
      const existingLink = await prisma.link.findUnique({
        where: { userId },
      })

      if (existingLink) {
        return existingLink
      }

      // 如果没有 Link，创建一个新的
      return await this.createLinkForUser(userId)
    } catch (error) {
      throw new AppError('确保用户 Link 失败', 'ENSURE_LINK_ERROR', error)
    }
  }
}

// 导出单例实例
export const userService = new UserService()
