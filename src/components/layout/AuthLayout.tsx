import type { ReactNode } from 'react'
import { BrandMark } from '@/components/common/BrandMark'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { appConfig } from '@/config/app.config'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
      <section className="bg-sidebar text-sidebar-ink hidden flex-col justify-between px-12 py-10 lg:flex">
        <BrandMark />
        <div>
          <p className="text-sidebar-muted text-sm font-medium tracking-wide uppercase">Console</p>
          <h1 className="mt-3 max-w-md text-4xl font-semibold tracking-tight">{appConfig.name}</h1>
          <p className="text-sidebar-muted mt-4 max-w-sm text-base">{appConfig.description}</p>
        </div>
        <p className="text-sidebar-muted text-sm">Authorized personnel only.</p>
      </section>
      <section className="bg-canvas flex min-h-svh flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <BrandMark compact className="lg:hidden" />
          <ThemeToggle className="ml-auto" />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </section>
    </div>
  )
}
