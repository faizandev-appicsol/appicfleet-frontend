import { AppRouter } from '@/app/router'
import { useThemeSync } from '@/features/ui/hooks/useTheme'

export function App() {
  useThemeSync()
  return <AppRouter />
}
