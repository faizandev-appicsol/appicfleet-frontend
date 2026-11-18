/**
 * Design-token reference for TypeScript/docs.
 * Runtime styling still comes from `tokens.css` — keep names in sync when editing.
 */
export const tokens = {
  color: {
    canvas: 'var(--ui-canvas)',
    surface: 'var(--ui-surface)',
    ink: 'var(--ui-ink)',
    muted: 'var(--ui-muted)',
    line: 'var(--ui-line)',
    brand: 'var(--ui-brand)',
    brandStrong: 'var(--ui-brand-strong)',
    brandSoft: 'var(--ui-brand-soft)',
    brandContrast: 'var(--ui-brand-contrast)',
    danger: 'var(--ui-danger)',
    warning: 'var(--ui-warning)',
    success: 'var(--ui-success)',
    info: 'var(--ui-info)',
    sidebar: 'var(--ui-sidebar)',
    sidebarInk: 'var(--ui-sidebar-ink)',
    sidebarMuted: 'var(--ui-sidebar-muted)',
  },
  font: {
    sans: 'var(--font-family-sans)',
    display: 'var(--font-family-display)',
  },
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    md: 'var(--font-size-md)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
  },
  space: {
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    3: 'var(--space-3)',
    4: 'var(--space-4)',
    5: 'var(--space-5)',
    6: 'var(--space-6)',
    8: 'var(--space-8)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    '3xl': 'var(--radius-3xl)',
  },
  shadow: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    modal: 'var(--shadow-modal)',
  },
  motion: {
    duration: {
      fast: 'var(--duration-fast)',
      normal: 'var(--duration-normal)',
      moderate: 'var(--duration-moderate)',
      slow: 'var(--duration-slow)',
      slower: 'var(--duration-slower)',
    },
    ease: {
      standard: 'var(--ease-standard)',
      emphasized: 'var(--ease-emphasized)',
      entrance: 'var(--ease-entrance)',
      exit: 'var(--ease-exit)',
    },
  },
  z: {
    header: 'var(--z-header)',
    sidebar: 'var(--z-sidebar)',
    modal: 'var(--z-modal)',
    toast: 'var(--z-toast)',
  },
} as const
