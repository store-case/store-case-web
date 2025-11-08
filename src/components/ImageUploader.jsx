import { useMemo } from 'react'
import ICONS from '../constants/icons'

const MAX_IMAGE_COUNT = 5

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

export const createImageItem = () => ({
  id: generateId(),
  preview: '',
  imageUrl: '',
  imageId: '',
  status: 'idle',
  error: null,
})

export const revokePreview = (preview) => {
  if (preview?.startsWith('blob:') && typeof URL !== 'undefined' && URL.revokeObjectURL) {
    URL.revokeObjectURL(preview)
  }
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      resolve('')
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const ensurePlaceholder = (images) => {
  if (!images || images.length === 0) {
    return [createImageItem()]
  }
  return images
}

const ImageUploader = ({
  label = '상품 이미지',
  helperText = '최대 5개까지 이미지를 첨부할 수 있습니다.',
  images,
  onChange,
  maxImages = MAX_IMAGE_COUNT,
  addButtonLabel = '이미지 추가',
  inputIdPrefix = 'productImage',
  onUpload,
}) => {
  const safeImages = useMemo(() => ensurePlaceholder(images), [images])
  const filledImageCount = safeImages.filter((item) => Boolean(item.preview)).length
  const showAddButton =
    filledImageCount < maxImages && safeImages.length > 0 && safeImages.every((item) => item.preview)

  const updateImages = (updateFn) => {
    const next = ensurePlaceholder(updateFn(safeImages))
    onChange?.(next)
  }

  const handleImageChange = async (inputId, event) => {
    const { target } = event
    const file = target.files?.[0]
    if (!file) {
      return
    }

    target.value = ''

    const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : ''

    try {
      let previewSource = objectUrl
      if (!previewSource) {
        previewSource = await readFileAsDataUrl(file)
      }

      updateImages((prev) => {
        let updated = prev.map((input) => {
          if (input.id !== inputId) return input

          if (input.preview && input.preview !== previewSource) {
            revokePreview(input.preview)
          }

          return {
            ...input,
            preview: previewSource,
            imageUrl: onUpload ? '' : previewSource,
            imageId: '',
            status: onUpload ? 'uploading' : 'success',
            error: null,
          }
        })

        const filledCount = updated.filter((input) => Boolean(input.preview)).length
        const hasEmpty = updated.some((input) => !input.preview)

        if (!hasEmpty && filledCount < maxImages) {
          updated = [...updated, createImageItem()]
        }

        if (updated.length > maxImages && filledCount >= maxImages) {
          updated = updated.filter((input) => input.preview).slice(0, maxImages)
        }

        return updated
      })

      if (onUpload) {
        const result = await onUpload(file)
        const remoteUrl = result?.imageUrl || previewSource
        if (result?.imageUrl && objectUrl) {
          revokePreview(objectUrl)
        }
        updateImages((prev) =>
          prev.map((input) =>
            input.id === inputId
              ? {
                  ...input,
                  preview: remoteUrl || '',
                  imageUrl: remoteUrl || '',
                  imageId: result?.imageId !== undefined && result?.imageId !== null ? String(result.imageId) : '',
                  status: 'success',
                  error: null,
                }
              : input,
          ),
        )
      }
    } catch (error) {
      if (objectUrl) {
        revokePreview(objectUrl)
      }
      const errorMessage = error?.message || '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
      updateImages((prev) =>
        prev.map((input) =>
          input.id === inputId
            ? {
                ...input,
                preview: '',
                imageUrl: '',
                imageId: '',
                status: 'error',
                error: errorMessage,
              }
            : input,
        ),
      )
      // eslint-disable-next-line no-console
      console.error('이미지 파일을 읽을 수 없습니다.', error)
    }
  }

  const handleAddImageInput = () => {
    updateImages((prev) => {
      if (prev.length >= maxImages || prev.some((input) => !input.preview)) {
        return prev
      }
      return [...prev, createImageItem()]
    })
  }

  const handleRemoveImage = (inputId) => {
    updateImages((prev) => {
      const target = prev.find((input) => input.id === inputId)

      if (target?.preview) {
        revokePreview(target.preview)
      }

      const filtered = prev.filter((input) => input.id !== inputId)

      if (filtered.length === 0) {
        return [createImageItem()]
      }

      if (!filtered.some((input) => !input.preview) && filtered.length < maxImages) {
        return [...filtered, createImageItem()]
      }

      return filtered
    })
  }

  return (
    <section className="product-register__section">
      <span className="product-register__label">{label}</span>
      <div className="product-register__dropzone" aria-describedby="product-image-helper">
        <div className="product-register__dropzone-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-4.5-3.6a1 1 0 0 0-1.3.1l-2.86 2.87-3.45-4.02a1 1 0 0 0-1.52-.03L4 17V5Zm8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          </svg>
        </div>
        <p id="product-image-helper" className="product-register__helper">
          {helperText}
        </p>
      </div>
      <div className="product-register__image-inputs">
        {safeImages.map((input, index) => (
          <div className="product-register__image-input" key={input.id}>
            <label className="product-register__file-label" htmlFor={`${inputIdPrefix}-${input.id}`}>
              <span>이미지 {index + 1} 선택</span>
              <input
                id={`${inputIdPrefix}-${input.id}`}
                type="file"
                accept="image/*"
                className="product-register__file-input"
                onChange={(event) => handleImageChange(input.id, event)}
              />
            </label>
            {input.preview && (
              <div className="product-register__image-preview">
                <img src={input.preview} alt={`미리보기 ${index + 1}`} />
                {input.status === 'uploading' ? (
                  <div className="product-register__image-status">
                    <span className="product-register__image-spinner" aria-hidden="true" />
                    <span>업로드 중...</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="product-register__image-remove"
                  aria-label={`이미지 ${index + 1} 삭제`}
                  onClick={() => handleRemoveImage(input.id)}
                >
                  <img src={ICONS.delete} alt="" aria-hidden="true" />
                </button>
              </div>
            )}
            {input.status === 'error' && input.error ? (
              <p className="product-register__image-error" role="alert">
                {input.error}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {showAddButton && (
        <button type="button" className="product-register__option-button" onClick={handleAddImageInput}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 3.333a1 1 0 0 1 1 1v4.667h4.667a1 1 0 0 1 0 2H11v4.667a1 1 0 0 1-2 0V11H4.333a1 1 0 1 1 0-2H9V4.333a1 1 0 0 1 1-1Z" />
          </svg>
          {addButtonLabel}
        </button>
      )}
    </section>
  )
}

export default ImageUploader
