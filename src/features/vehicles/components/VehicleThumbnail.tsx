import { useEffect, useState } from 'react'
import { useGetVehiclePhotoQuery } from '@/features/vehicles/api/vehiclesApi'
import { cn } from '@/utils/cn'

/** Soft car illustration used when no photo is stored. */
function CarIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 48"
      fill="none"
      aria-hidden
      className={cn('text-brand', className)}
    >
      <path
        d="M12 32.5h56c1.8 0 3.2-1.2 3.5-2.9l1.2-7.1c.3-1.7-.6-3.4-2.2-4.1L58 13.8c-1-.5-2.1-.6-3.1-.3L42.5 16H24.8c-1.2 0-2.4.5-3.2 1.4L14.2 26c-.7.8-1.1 1.9-1 3l.2 1.6c.2 1.1 1.2 1.9 2.3 1.9Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M14 30.5h52M18.5 30.5v-3.2c0-1 .6-1.9 1.5-2.3l8.2-3.5c.4-.2.9-.2 1.3 0L42 25.2c.6.3 1.3.3 1.9 0l8.8-4.2c.7-.3 1.5-.2 2.1.3L62 27.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 33.5h60" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="22" cy="34" r="4.2" fill="currentColor" opacity="0.22" />
      <circle cx="58" cy="34" r="4.2" fill="currentColor" opacity="0.22" />
      <circle cx="22" cy="34" r="3.1" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="58" cy="34" r="3.1" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M28 20.5h12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

/** Vehicle photo when available; otherwise a soft car placeholder. */
export function VehicleThumbnail({
  className,
  size = 'md',
  vehicleId,
  hasPhoto = false,
  alt = '',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'hero'
  vehicleId?: string
  hasPhoto?: boolean
  alt?: string
}) {
  const shouldLoad = Boolean(vehicleId && hasPhoto)
  const photoQuery = useGetVehiclePhotoQuery(vehicleId ?? '', { skip: !shouldLoad })
  const [photoUrl, setPhotoUrl] = useState<string>()

  useEffect(() => {
    if (!photoQuery.data) {
      setPhotoUrl(undefined)
      return
    }
    const url = URL.createObjectURL(photoQuery.data)
    setPhotoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [photoQuery.data])

  const sizeClass =
    size === 'hero'
      ? 'h-44 w-56 rounded-2xl sm:h-52 sm:w-64'
      : size === 'lg'
        ? 'size-28 rounded-2xl'
        : size === 'sm'
          ? 'size-10 rounded-lg'
          : 'size-12 rounded-xl'

  const artClass =
    size === 'hero'
      ? 'h-20 w-[7.5rem] sm:h-24 sm:w-36'
      : size === 'lg'
        ? 'h-12 w-[4.5rem]'
        : size === 'sm'
          ? 'h-5 w-8'
          : 'h-6 w-10'

  return (
    <div
      className={cn(
        'bg-brand-soft text-brand flex shrink-0 items-center justify-center overflow-hidden',
        sizeClass,
        className,
      )}
      aria-hidden={!alt}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={alt} className="size-full object-cover" />
      ) : (
        <CarIllustration className={artClass} />
      )}
    </div>
  )
}
