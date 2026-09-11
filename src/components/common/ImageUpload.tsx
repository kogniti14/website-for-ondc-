import React, { useRef, useState } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  helperText?: string;
  multiple?: boolean;
  maxFiles?: number;
  variant?: 'light' | 'dark';
  aspectRatio?: 'square' | 'banner' | 'auto';
  className?: string;
}

/**
 * Compresses an image file using an offscreen canvas.
 * Scales down large device photos (e.g. 12MP-48MP smartphone cameras)
 * to a crisp, high-performance web resolution (max 1200px dimension)
 * while preserving aspect ratio and converting to WebP/JPEG dataURL.
 */
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Basic file format validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      reject(new Error('Unsupported file format. Please select a JPG, JPEG, PNG, or WebP image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file content.'));
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw dataURL if canvas context unavailable
          resolve(event.target?.result as string);
          return;
        }

        // Draw image with smooth anti-aliasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP if supported, otherwise JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', 0.88);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // Fallback to JPEG
        }

        const jpegData = canvas.toDataURL('image/jpeg', 0.88);
        resolve(jpegData);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Upload Image',
  helperText = 'Select a high-resolution image from your device (JPG, PNG, WebP supported)',
  multiple = false,
  maxFiles = 5,
  variant = 'light',
  aspectRatio = 'auto',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Normalize single vs multiple values
  const imagesList: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
    ? [value]
    : [];

  const isDark = variant === 'dark';

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);
    setUploadSuccess(false);

    try {
      const filesToProcess = multiple
        ? Array.from(files).slice(0, maxFiles - imagesList.length)
        : [files[0]];

      if (filesToProcess.length === 0) {
        setErrorMessage(`Maximum limit of ${maxFiles} images reached.`);
        setIsProcessing(false);
        return;
      }

      const compressedImages: string[] = [];
      for (const file of filesToProcess) {
        // Limit max file size to 15MB before client compression
        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds maximum allowed size (15MB).`);
        }
        const compressed = await compressImageFile(file);
        compressedImages.push(compressed);
      }

      if (multiple) {
        const updated = [...imagesList, ...compressedImages];
        onChange(updated);
      } else {
        onChange(compressedImages[0]);
      }

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload image. Please try another file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage(null);
    if (multiple) {
      const updated = imagesList.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const handleReplaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleMakePrimary = (indexToPrimary: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!multiple || indexToPrimary === 0) return;
    const target = imagesList[indexToPrimary];
    const rest = imagesList.filter((_, idx) => idx !== indexToPrimary);
    onChange([target, ...rest]);
  };

  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case 'square':
        return { aspectRatio: '1 / 1' };
      case 'banner':
        return { aspectRatio: '16 / 6' };
      default:
        return { minHeight: '160px' };
    }
  };

  return (
    <div className={`image-upload-wrapper ${className}`} style={{ width: '100%', marginBottom: '1.25rem' }}>
      {/* Label & Counter */}
      <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
        <label
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: isDark ? '#E2E8F0' : 'var(--slate-700)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <ImageIcon size={15} className={isDark ? 'text-amber-400' : 'text-blue-600'} />
          {label}
        </label>
        {multiple && (
          <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : 'var(--slate-500)' }}>
            {imagesList.length} / {maxFiles} images
          </span>
        )}
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* Single Image View with Image Already Uploaded */}
      {!multiple && imagesList.length > 0 ? (
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-md, 8px)',
            overflow: 'hidden',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid var(--border-color, #E2E8F0)',
            background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            ...getAspectRatioStyle(),
          }}
        >
          <img
            src={imagesList[0]}
            alt="Uploaded preview"
            style={{
              width: '100%',
              height: aspectRatio === 'banner' ? '180px' : '220px',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          {/* Action Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0.85rem',
            }}
          >
            <div className="flex items-center gap-2">
              <span
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <CheckCircle size={12} /> Image Ready
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReplaceClick}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#0F172A',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <RefreshCw size={13} /> Replace
              </button>

              <button
                type="button"
                onClick={(e) => handleRemove(0, e)}
                className="btn btn-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.95)',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <X size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging
              ? '2px dashed #3B82F6'
              : isDark
              ? '2px dashed rgba(255, 255, 255, 0.2)'
              : '2px dashed #CBD5E1',
            borderRadius: 'var(--radius-md, 8px)',
            background: isDragging
              ? isDark
                ? 'rgba(59, 130, 246, 0.15)'
                : '#EFF6FF'
              : isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : '#F8FAFC',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            ...getAspectRatioStyle(),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              color: isDark ? '#38BDF8' : '#2563EB',
            }}
          >
            {isProcessing ? (
              <RefreshCw size={22} className="animate-spin" />
            ) : (
              <Upload size={22} />
            )}
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isDark ? '#FFFFFF' : '#1E293B', marginBottom: '0.25rem' }}>
            {isProcessing ? 'Optimizing Image...' : 'Click to Upload Image or Drag & Drop'}
          </div>

          <div style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : 'var(--slate-500)', maxWidth: '360px', margin: '0 auto 0.75rem' }}>
            {helperText}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            style={{
              pointerEvents: 'none',
              borderRadius: 'var(--radius-full, 9999px)',
              padding: '0.35rem 1rem',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Upload size={13} /> Select Image from Device
          </button>
        </div>
      )}

      {/* Multiple Images Gallery Grid */}
      {multiple && imagesList.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569', marginBottom: '0.5rem' }}>
            Uploaded Gallery ({imagesList.length}):
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {imagesList.map((img, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: index === 0 ? '2px solid #2563EB' : isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #CBD5E1',
                  height: '95px',
                  background: isDark ? '#0F172A' : '#F1F5F9',
                }}
              >
                <img
                  src={img}
                  alt={`Gallery thumbnail ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Primary Tag */}
                {index === 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                    }}
                  >
                    Cover
                  </span>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => handleRemove(index, e)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Remove image"
                >
                  <X size={12} />
                </button>

                {/* Set as Primary Button for non-primary */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => handleMakePrimary(index, e)}
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '4px',
                      right: '4px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.25rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    Make Cover
                  </button>
                )}
              </div>
            ))}

            {/* Add More Tile */}
            {imagesList.length < maxFiles && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDark ? '1px dashed rgba(255, 255, 255, 0.25)' : '1px dashed #94A3B8',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                  height: '95px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                  gap: '0.3rem',
                }}
              >
                <Upload size={18} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>+ Add More</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          className="flex items-center gap-2"
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            color: '#DC2626',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Success Feedback */}
      {uploadSuccess && (
        <div
          className="flex items-center gap-1.5"
          style={{
            marginTop: '0.4rem',
            color: '#10B981',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={13} />
          <span>Image uploaded and optimized successfully from device!</span>
        </div>
      )}
    </div>
  );
};
