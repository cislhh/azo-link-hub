export function normalizeHexColor(hexColor: string): string {
  const rawHex = hexColor.replace('#', '')
  const normalizedHex =
    rawHex.length === 3
      ? rawHex
          .split('')
          .map((char) => char + char)
          .join('')
      : rawHex

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) {
    return 'ffffff'
  }

  return normalizedHex
}

type BackgroundPatternVariant = 'fine-grid' | 'wide-grid' | 'dot-grid'

const BACKGROUND_VARIANTS: Record<string, BackgroundPatternVariant> = {
  ffffff: 'fine-grid',
  f8f9fa: 'dot-grid',
  e9ecef: 'wide-grid',
  '1a1a1a': 'fine-grid',
  '2d2d2d': 'dot-grid',
  '0a1628': 'wide-grid',
  '0a0a23': 'dot-grid',
  '1a0a2e': 'fine-grid',
}

export function isDarkBackground(hexColor: string): boolean {
  const hex = normalizeHexColor(hexColor)
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance < 0.55
}

export function getBackgroundPatternVariant(
  backgroundColor: string
): BackgroundPatternVariant {
  return BACKGROUND_VARIANTS[normalizeHexColor(backgroundColor)] ?? 'fine-grid'
}

export function getBackgroundPatternLabel(backgroundColor: string): string {
  const labels: Record<BackgroundPatternVariant, string> = {
    'fine-grid': '细网格',
    'wide-grid': '大网格',
    'dot-grid': '点阵',
  }

  return labels[getBackgroundPatternVariant(backgroundColor)]
}

export function getBackgroundFillStyle(backgroundColor: string) {
  const dark = isDarkBackground(backgroundColor)
  const gridColor = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
  const accentGlow = dark
    ? 'rgba(148, 163, 184, 0.16)'
    : 'rgba(148, 163, 184, 0.22)'
  const variant = getBackgroundPatternVariant(backgroundColor)

  const stylesByVariant: Record<
    BackgroundPatternVariant,
    { backgroundImage: string; backgroundSize: string; backgroundPosition?: string }
  > = {
    'fine-grid': {
      backgroundImage: [
        `linear-gradient(${gridColor} 1px, transparent 1px)`,
        `linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        `radial-gradient(circle at 15% 20%, ${accentGlow} 0%, transparent 60%)`,
      ].join(', '),
      backgroundSize: '18px 18px, 18px 18px, 100% 100%',
    },
    'wide-grid': {
      backgroundImage: [
        `linear-gradient(${gridColor} 1px, transparent 1px)`,
        `linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        `radial-gradient(circle at 15% 20%, ${accentGlow} 0%, transparent 60%)`,
      ].join(', '),
      backgroundSize: '32px 32px, 32px 32px, 100% 100%',
    },
    'dot-grid': {
      backgroundImage: [
        `radial-gradient(${gridColor} 1px, transparent 1px)`,
        `radial-gradient(circle at 15% 20%, ${accentGlow} 0%, transparent 60%)`,
      ].join(', '),
      backgroundSize: '18px 18px, 100% 100%',
      backgroundPosition: '0 0, 0 0',
    },
  }

  return {
    backgroundColor,
    ...stylesByVariant[variant],
  }
}
