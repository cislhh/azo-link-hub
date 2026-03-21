/**
 * Phone Preview 组件使用示例
 *
 * 这个文件展示了如何使用 PhonePreview 组件
 */

'use client'

import { PhonePreview, PhonePreviewProps } from './phone-preview'
import { SocialLink } from '../link/social-links-form'
import { ExtraLink } from '../link/extra-links-form'

/**
 * 示例 1: 基础用法
 */
export function PhonePreviewExample1() {
  const exampleData: PhonePreviewProps = {
    username: 'johndoe',
    displayName: 'John Doe',
    bio: '全栈开发者 | 开源爱好者 | 技术博主',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    backgroundType: 'solid',
    backgroundValue: '#f0f9ff',
    socialLinks: [
      { platform: 'github', url: 'https://github.com/johndoe', isVisible: true },
      { platform: 'twitter', url: 'https://twitter.com/johndoe', isVisible: true },
      { platform: 'linkedin', url: 'https://linkedin.com/in/johndoe', isVisible: true },
    ],
    extraLinks: [
      {
        title: '我的博客',
        url: 'https://blog.johndoe.com',
        description: '分享技术心得和学习笔记',
        isVisible: true,
      },
      {
        title: '项目作品集',
        url: 'https://portfolio.johndoe.com',
        description: '查看我的开源项目',
        isVisible: true,
      },
    ],
  }

  return <PhonePreview {...exampleData} />
}

/**
 * 示例 2: 与表单集成（实时预览）
 */
import { useState } from 'react'
import { LinkForm, LinkFormData } from '../link/link-form'

export function PhonePreviewWithForm() {
  const [previewData, setPreviewData] = useState<LinkFormData>({
    username: 'johndoe',
    displayName: 'John Doe',
    bio: '全栈开发者',
    avatar: '',
    backgroundType: 'solid',
    backgroundValue: '#ffffff',
    socialLinks: [],
    extraLinks: [],
  })

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* 左侧：表单 */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">编辑链接页面</h2>
        <LinkForm
          defaultValues={previewData}
          onSubmit={(data) => {
            setPreviewData(data)
            console.log('保存数据:', data)
          }}
          submitButtonText="保存更改"
        />
      </div>

      {/* 右侧：预览 */}
      <div className="lg:sticky lg:top-8 lg:h-fit">
        <h2 className="mb-4 text-2xl font-bold">实时预览</h2>
        <PhonePreview
          username={previewData.username}
          displayName={previewData.displayName}
          bio={previewData.bio}
          avatar={previewData.avatar}
          backgroundType={previewData.backgroundType}
          backgroundValue={previewData.backgroundValue}
          socialLinks={previewData.socialLinks}
          extraLinks={previewData.extraLinks}
        />
      </div>
    </div>
  )
}

/**
 * 示例 3: 不同背景色
 */
export function PhonePreviewBackgrounds() {
  const backgrounds = [
    { name: '纯白', value: '#ffffff' },
    { name: '淡蓝', value: '#f0f9ff' },
    { name: '淡粉', value: '#fdf2f8' },
    { name: '淡绿', value: '#f0fdf4' },
    { name: '淡紫', value: '#faf5ff' },
  ]

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {backgrounds.map((bg) => (
        <div key={bg.value} className="space-y-2">
          <h3 className="text-center font-medium">{bg.name}</h3>
          <PhonePreview
            username="demo"
            displayName="演示用户"
            bio="这是一个演示"
            backgroundValue={bg.value}
            socialLinks={[]}
            extraLinks={[]}
          />
        </div>
      ))}
    </div>
  )
}

/**
 * 示例 4: 完整配置（所有社交平台）
 */
export function PhonePreviewAllPlatforms() {
  const allPlatforms: SocialLink[] = [
    { platform: 'github', url: '#', isVisible: true },
    { platform: 'twitter', url: '#', isVisible: true },
    { platform: 'instagram', url: '#', isVisible: true },
    { platform: 'youtube', url: '#', isVisible: true },
    { platform: 'linkedin', url: '#', isVisible: true },
    { platform: 'facebook', url: '#', isVisible: true },
    { platform: 'telegram', url: '#', isVisible: true },
    { platform: 'whatsapp', url: '#', isVisible: true },
    { platform: 'email', url: 'mailto:example@email.com', isVisible: true },
  ]

  return (
    <PhonePreview
      username="allplatforms"
      displayName="所有社交平台"
      bio="展示所有支持的社交平台图标"
      backgroundValue="#ffffff"
      socialLinks={allPlatforms}
      extraLinks={[]}
    />
  )
}
