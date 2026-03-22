import { cn } from '@/lib/utils'

/**
 * 平台分类切换按钮组件属性
 */
interface PlatformCategoryButtonProps {
  category: 'international' | 'domestic'
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}

/**
 * 平台分类按钮组件
 *
 * 用于在社交平台选择器中切换国际/国内平台分类
 */
function PlatformCategoryButton({
  category,
  isActive,
  onClick,
  children,
}: PlatformCategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 px-3 py-2 text-sm font-medium transition-all",
        isActive
          ? "text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

/**
 * 平台分类切换组件属性
 */
interface PlatformCategorySwitchProps {
  activeCategory: 'international' | 'domestic'
  onCategoryChange: (category: 'international' | 'domestic') => void
}

/**
 * 平台分类切换组件
 *
 * 提取的静态 JSX 组件，用于切换社交平台分类
 */
export function PlatformCategorySwitch({
  activeCategory,
  onCategoryChange,
}: PlatformCategorySwitchProps) {
  return (
    <div className="relative flex items-center border-b border-border">
      <PlatformCategoryButton
        category="international"
        isActive={activeCategory === 'international'}
        onClick={() => onCategoryChange('international')}
      >
        国际平台
      </PlatformCategoryButton>
      <PlatformCategoryButton
        category="domestic"
        isActive={activeCategory === 'domestic'}
        onClick={() => onCategoryChange('domestic')}
      >
        国内平台
      </PlatformCategoryButton>
      {/* Active指示线 */}
      <div
        className={cn(
          "absolute bottom-0 h-0.5 w-1/2 bg-primary transition-all duration-200",
          activeCategory === 'international' ? "left-0" : "left-1/2"
        )}
      />
    </div>
  )
}
