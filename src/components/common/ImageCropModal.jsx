import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import Modal from './Modal'
import Button from './Button'
import { IconCheck, IconAlertCircle } from '../icons/Icons'
import { getCroppedImg } from '../../lib/cropImage'

/**
 * Reusable Responsive Modal Image Cropper Foundation
 *
 * Props:
 * - isOpen: boolean
 * - imageSrc: string (Object URL of selected file)
 * - onClose: function
 * - onCropSave: function({ blob, previewUrl })
 * - initialCropShape: 'round' | 'rect' (defaults to 'round' for avatars)
 */
export default function ImageCropModal({
  isOpen = false,
  imageSrc,
  onClose,
  onCropSave,
  initialCropShape = 'round',
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [cropShape, setCropShape] = useState(initialCropShape)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const onCropComplete = useCallback((croppedArea, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const croppedData = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (onCropSave && typeof onCropSave === 'function') {
        await onCropSave(croppedData)
      }
      setIsProcessing(false)
      onClose()
    } catch (err) {
      console.error('[ImageCropModal] Save failed:', err)
      setIsProcessing(false)
      setErrorMessage(err.message || 'Failed to crop or upload image. Please try again.')
    }
  }

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setErrorMessage(null)
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isProcessing) onClose()
      }}
      title="Adjust Profile Photo"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="hidden sm:inline">Crop Ratio:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              1:1 Square
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              disabled={isProcessing || !croppedAreaPixels}
              onClick={handleApplyCrop}
              icon={<IconCheck className="w-4 h-4" />}
            >
              Apply Crop
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Instructions */}
        <p className="text-xs text-slate-500">
          Drag to reposition and use the slider or trackpad to zoom. Profile images are formatted to a 1:1 square.
        </p>

        {/* Cropper Canvas Container */}
        <div className="relative w-full h-64 sm:h-72 md:h-80 bg-slate-900 rounded-xl overflow-hidden shadow-inner select-none">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape={cropShape}
              showGrid={true}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              zoomSpeed={0.5}
              minZoom={1}
              maxZoom={3}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No image source provided.
            </div>
          )}
        </div>

        {/* Controls: Zoom & Shape Toggle */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 w-12 shrink-0">Zoom</span>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.2).toFixed(1)))}
              disabled={zoom <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Zoom out"
            >
              −
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Image zoom slider"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.2).toFixed(1)))}
              disabled={zoom >= 3}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Zoom in"
            >
              +
            </button>
            <span className="text-xs font-mono text-slate-500 w-10 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Mask Guide & Reset */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Preview Guide:</span>
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCropShape('round')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    cropShape === 'round'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Circular
                </button>
                <button
                  type="button"
                  onClick={() => setCropShape('rect')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    cropShape === 'rect'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Square
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-blue-600 transition-colors cursor-pointer underline"
            >
              Reset view
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
