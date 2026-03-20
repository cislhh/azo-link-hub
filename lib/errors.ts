import { z } from 'zod'

/**
 * 自定义错误类
 *
 * 提供结构化的错误处理，便于前端展示和日志记录
 */

/**
 * API 错误基类
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
    }
  }
}

/**
 * 验证错误（400 Bad Request）
 */
export class ValidationError extends ApiError {
  constructor(message: string = '请求参数验证失败') {
    super(400, message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

/**
 * 未授权错误（401 Unauthorized）
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = '未授权访问') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

/**
 * 禁止访问错误（403 Forbidden）
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = '禁止访问') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * 资源未找到错误（404 Not Found）
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = '资源') {
    super(404, `${resource}不存在`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

/**
 * 冲突错误（409 Conflict）
 */
export class ConflictError extends ApiError {
  constructor(message: string = '资源冲突') {
    super(409, message, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

/**
 * 服务器错误（500 Internal Server Error）
 */
export class InternalServerError extends ApiError {
  constructor(message: string = '服务器内部错误') {
    super(500, message, 'INTERNAL_SERVER_ERROR')
    this.name = 'InternalServerError'
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends ApiError {
  constructor(message: string = '数据库操作失败') {
    super(500, message, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

/**
 * 错误处理工具函数
 */

/**
 * 处理未知错误
 *
 * 将任意错误转换为 ApiError 实例
 */
export function handleError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0]
    return new ValidationError(firstIssue?.message || '验证失败')
  }

  if (error instanceof Error) {
    // 开发环境返回详细错误信息
    if (process.env.NODE_ENV === 'development') {
      return new InternalServerError(error.message)
    }
    return new InternalServerError()
  }

  return new InternalServerError()
}

/**
 * 格式化错误响应
 *
 * 用于 API 路由中统一返回错误格式
 */
export function errorResponse(error: ApiError) {
  return Response.json(error.toJSON(), { status: error.statusCode })
}
