import type { CollectedSignals, DetectionResult } from '../types'

export function detectUploadAutomation(signals: CollectedSignals): DetectionResult {
  const { upload } = signals.behavioral

  // Only meaningful on forms that actually received file attachments
  if (upload.filesAttached === 0) {
    return { detected: false, severity: 'low', reasons: [] }
  }

  const reasons: string[] = []

  if (upload.programmaticCount > 0 && upload.pickerCount === 0 && upload.dragDropCount === 0)
    reasons.push('files attached programmatically — no picker or drag-drop event observed')

  const aiDocs = upload.exifResults.filter(r => r.aiGenerated)
  if (aiDocs.length > 0)
    reasons.push(`${aiDocs.length} file(s) flagged as AI-generated (${aiDocs.map(r => r.software ?? 'unknown tool').join(', ')})`)

  const noExifPhotos = upload.exifResults.filter(r => r.fileType === 'jpeg' && !r.hasExif)
  if (noExifPhotos.length > 0)
    reasons.push(`${noExifPhotos.length} JPEG(s) missing EXIF metadata — possible AI-generated or scrubbed image`)

  return {
    detected: reasons.length > 0,
    // Programmatic file attachment has no innocent explanation — always high severity
    severity: 'high',
    reasons,
  }
}
