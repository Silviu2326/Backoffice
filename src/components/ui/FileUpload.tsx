import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, File as FileIcon, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  accept?: string | Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number; // Bytes
  onFilesChange?: (files: File[]) => void;
  isUploading?: boolean;
  progress?: number;
  className?: string;
  dropzoneClassName?: string;
}

export default function FileUpload({
  accept = '*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // Default 5MB
  onFilesChange,
  isUploading = false,
  progress = 0,
  className,
  dropzoneClassName,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper to get string representation of accepted types for display
  const getAcceptString = (): string => {
    if (typeof accept === 'string') return accept;
    return Object.values(accept).flat().join(', ');
  };

  // Helper to get string representation for input attribute
  const getInputAccept = (): string => {
    if (typeof accept === 'string') return accept;
    return Object.entries(accept)
      .map(([mime, exts]) => `${mime},${exts.join(',')}`)
      .join(',');
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  }, [isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    if (maxSize && file.size > maxSize) {
      setError(`El archivo ${file.name} excede el tamaño máximo de ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
      return false;
    }

    // Validate file type
    if (accept && accept !== '*') {
      let isAccepted = false;
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (typeof accept === 'string') {
        const acceptedTypes = accept.split(',').map(t => t.trim());
        isAccepted = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', ''));
          }
          if (type.startsWith('.')) {
            return fileName.endsWith(type.toLowerCase());
          }
          return type === fileType;
        });
      } else {
        // Object format: { 'image/*': ['.png', '.jpg'] }
        isAccepted = Object.entries(accept).some(([mimeType, extensions]) => {
          if (mimeType === '*' || mimeType === '*/*') return true;
          if (mimeType.endsWith('/*')) {
            if (fileType.startsWith(mimeType.replace('/*', ''))) return true;
          } else if (mimeType === fileType) {
            return true;
          }
          // Check extensions
          return extensions.some(ext => fileName.endsWith(ext.toLowerCase()));
        });
      }

      if (!isAccepted) {
        setError(`El archivo ${file.name} no es un tipo permitido`);
        return false;
      }
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (isUploading) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [isUploading, multiple, maxSize, accept]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(validateFile);

    if (validFiles.length === 0) return;

    let updatedFiles: File[];
    if (multiple) {
      updatedFiles = [...files, ...validFiles];
    } else {
      updatedFiles = [validFiles[0]];
    }

    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);

    // Generate previews
    const newPreviews = validFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });

    if (multiple) {
      setPreviews(prev => [...prev, ...newPreviews]);
    } else {
      setPreviews(newPreviews);
    }
  };

  const removeFile = (index: number) => {
    if (isUploading) return;

    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    // Revoke URL to avoid memory leaks
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFilesChange?.(updatedFiles);
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      previews.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[200px]",
          isDragging ? "border-brand-orange bg-brand-orange/10" : "border-white/10 hover:border-white/20 bg-white/5",
          isUploading && "opacity-50 cursor-not-allowed",
          error && "border-red-500/50 bg-red-500/10",
          dropzoneClassName
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={getInputAccept()}
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <div className="bg-white/5 p-4 rounded-full shadow-sm mb-4">
          {isUploading ? (
            <div className="animate-pulse">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
          ) : (
            <Upload className={cn("w-8 h-8", isDragging ? "text-brand-orange" : "text-text-secondary")} />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-white">
            {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
          </p>
          <p className="text-sm text-text-secondary">
            o haz clic para seleccionar
          </p>
        </div>

        {accept && (
          <p className="mt-4 text-xs text-text-secondary/70">
            Formatos aceptados: {getAcceptString()} (Máx. {(maxSize / 1024 / 1024).toFixed(0)}MB)
          </p>
        )}

        {error && (
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <p className="text-sm text-red-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="w-full bg-white/10 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
          <p className="text-xs text-right mt-1 text-text-secondary">{progress}% Subiendo...</p>
        </div>
      )}

      {files.length > 0 && (
        <div className={cn("grid gap-4", multiple ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1")}>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group bg-[#2C2C2C] border border-white/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square relative bg-white/5 flex items-center justify-center overflow-hidden">
                {previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileIcon className="w-12 h-12 text-gray-600" />
                )}

                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-2 right-2 p-1 bg-[#1E1E1E] rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-300 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
