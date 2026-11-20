import { useEffect, useId, useRef, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { useUploadCustomerDocumentMutation } from '@/features/customers/api/customersApi'
import { useCustomerOptions } from '@/features/customers/hooks/useCustomerOptions'
import {
  MAX_UPLOAD_BYTES,
  type UploadDocumentBody,
} from '@/features/customers/schemas/customer.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { isTodayOrFutureDate, todayDateInput } from '@/utils/dates'

const MIME_BY_EXTENSION: Record<string, UploadDocumentBody['mimeType']> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
}

type ChosenFile = {
  filename: string
  mimeType: UploadDocumentBody['mimeType']
  contentBase64: string
  previewUrl?: string
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot).toLowerCase() : ''
}

function resolveMime(file: File): UploadDocumentBody['mimeType'] | null {
  const declared = file.type.toLowerCase()
  if (
    declared === 'image/jpeg' ||
    declared === 'image/png' ||
    declared === 'image/webp' ||
    declared === 'application/pdf'
  ) {
    return declared
  }
  return MIME_BY_EXTENSION[extensionOf(file.name)] ?? null
}

function readBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('read'))
    reader.readAsDataURL(file)
  })
}

export function DocumentCaptureDialog({
  open,
  customerId,
  onClose,
}: {
  open: boolean
  customerId: string
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const options = useCustomerOptions()
  const fileInputId = useId()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [documentType, setDocumentType] = useState<UploadDocumentBody['documentType']>('passport')
  const [issuedOn, setIssuedOn] = useState('')
  const [expiresOn, setExpiresOn] = useState('')
  const [chosen, setChosen] = useState<ChosenFile | null>(null)
  const [cameraLive, setCameraLive] = useState(false)
  const [cameraError, setCameraError] = useState<'denied' | 'unsupported' | 'unavailable' | null>(
    null,
  )
  const [scannerNote, setScannerNote] = useState(false)
  const [error, setError] = useState<string>()
  const [upload, uploadState] = useUploadCustomerDocumentMutation()

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraLive(false)
  }

  useEffect(() => {
    const video = videoRef.current
    const stream = streamRef.current
    if (!cameraLive || !video || !stream) return
    video.srcObject = stream
    void video.play().catch(() => undefined)
  }, [cameraLive])

  useEffect(() => {
    if (!open) {
      stopCamera()
      setChosen((current) => {
        if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl)
        return null
      })
      setIssuedOn('')
      setExpiresOn('')
      setError(undefined)
      setCameraError(null)
      setScannerNote(false)
      setDocumentType('passport')
    }
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [open])

  const acceptBlob = async (blob: Blob, filename: string, mimeType: UploadDocumentBody['mimeType']) => {
    if (blob.size <= 0) {
      setError(t('customers.documents.emptyFile'))
      return
    }
    if (blob.size > MAX_UPLOAD_BYTES) {
      setError(t('customers.documents.tooLarge'))
      return
    }
    const contentBase64 = await readBase64(blob)
    setChosen((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl)
      return {
        filename,
        mimeType,
        contentBase64,
        previewUrl: mimeType.startsWith('image/') ? URL.createObjectURL(blob) : undefined,
      }
    })
    setError(undefined)
    stopCamera()
  }

  const acceptFile = async (file: File) => {
    const mimeType = resolveMime(file)
    if (!mimeType) {
      setError(t('customers.documents.invalidType'))
      return
    }
    try {
      await acceptBlob(file, file.name, mimeType)
    } catch {
      setError(t('customers.documents.readFailed'))
    }
  }

  const openCamera = async () => {
    setCameraError(null)
    setError(undefined)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('unsupported')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      setCameraLive(true)
    } catch (caught) {
      const name = caught instanceof DOMException ? caught.name : ''
      setCameraError(name === 'NotAllowedError' || name === 'PermissionDeniedError' ? 'denied' : 'unavailable')
    }
  }

  const captureFrame = async () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) {
      setCameraError('unavailable')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) {
      setCameraError('unavailable')
      return
    }
    context.drawImage(video, 0, 0)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92),
    )
    if (!blob) {
      setCameraError('unavailable')
      return
    }
    await acceptBlob(blob, `capture-${Date.now()}.jpg`, 'image/jpeg')
  }

  const onSubmit = async () => {
    if (!chosen) {
      setError(t('customers.documents.fileRequired'))
      return
    }
    if (expiresOn && !isTodayOrFutureDate(expiresOn)) {
      setError(t('customers.validation.expiryMustBeFuture'))
      return
    }
    if (issuedOn && expiresOn && expiresOn < issuedOn) {
      setError(t('customers.documents.expiryOrder'))
      return
    }
    setError(undefined)
    try {
      await upload({
        customerId,
        body: {
          documentType,
          filename: chosen.filename,
          mimeType: chosen.mimeType,
          contentBase64: chosen.contentBase64,
          issuedOn: issuedOn || undefined,
          expiresOn: expiresOn || undefined,
        },
      }).unwrap()
      onClose()
    } catch (caught) {
      setError(normalizeApiError(caught).message)
    }
  }

  return (
    <Modal
      open={open}
      size="wide"
      title={t('customers.documents.uploadTitle')}
      description={t('customers.documents.uploadDescription')}
      onClose={onClose}
    >
      <div className="grid gap-4">
        {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
        {cameraError ? (
          <Alert tone="warning">{t(`customers.documents.camera.${cameraError}`)}</Alert>
        ) : null}
        {scannerNote ? <Alert tone="info">{t('customers.documents.scannerHint')}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('customers.documents.type')}
            required
            value={documentType}
            onChange={(event) =>
              setDocumentType(event.target.value as UploadDocumentBody['documentType'])
            }
            options={options.fileTypeOptions}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('customers.documents.issuedOn')}
              type="date"
              dir="ltr"
              value={issuedOn}
              onChange={(event) => setIssuedOn(event.target.value)}
            />
            <Input
              label={t('customers.documents.expiresOn')}
              type="date"
              dir="ltr"
              min={todayDateInput()}
              value={expiresOn}
              onChange={(event) => setExpiresOn(event.target.value)}
            />
          </div>
        </div>

        <div
          className="border-line grid gap-3 rounded-lg border border-dashed p-4"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const file = event.dataTransfer.files[0]
            if (file) void acceptFile(file)
          }}
        >
          <p className="text-ink text-sm font-medium">{t('customers.documents.dropTitle')}</p>
          <p className="text-muted text-sm">{t('customers.documents.dropHint')}</p>
          <div className="flex flex-wrap gap-2">
            <input
              id={fileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void acceptFile(file)
                event.target.value = ''
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => document.getElementById(fileInputId)?.click()}
            >
              {t('customers.documents.chooseFile')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => void openCamera()}>
              {t('customers.documents.openCamera')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setScannerNote(true)
                document.getElementById(fileInputId)?.click()
              }}
            >
              {t('customers.documents.scanner')}
            </Button>
          </div>
        </div>

        {cameraLive ? (
          <div className="grid gap-3">
            <video
              ref={videoRef}
              className="bg-ink max-h-80 w-full rounded-lg object-contain"
              autoPlay
              playsInline
              muted
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void captureFrame()}>
                {t('customers.documents.capture')}
              </Button>
              <Button type="button" variant="secondary" onClick={stopCamera}>
                {t('customers.documents.closeCamera')}
              </Button>
            </div>
          </div>
        ) : null}

        {chosen ? (
          <div className="grid gap-3">
            {chosen.previewUrl ? (
              <img
                src={chosen.previewUrl}
                alt={t('customers.documents.previewAlt')}
                className="max-h-80 w-full rounded-lg object-contain"
              />
            ) : (
              <p className="text-ink text-sm" dir="ltr">
                {chosen.filename}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (chosen.previewUrl) URL.revokeObjectURL(chosen.previewUrl)
                  setChosen(null)
                  void openCamera()
                }}
              >
                {t('customers.documents.retake')}
              </Button>
            </div>
          </div>
        ) : null}

        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={uploadState.isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="button" loading={uploadState.isLoading} onClick={() => void onSubmit()}>
            {uploadState.isLoading ? t('customers.documents.uploading') : t('customers.documents.confirm')}
          </Button>
        </ModalActions>
      </div>
    </Modal>
  )
}
