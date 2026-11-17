import { useEffect } from 'react'
import { appConfig } from '@/config/app.config'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${appConfig.name}` : appConfig.name
  }, [title])
}
