import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, File as FileIcon, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // Bytes
  onFilesChange?: (files: File[]) => void;
  isUploading?: boolean;
  progress?: number;
  className?: string;
}

export function FileUpload({
  accept = '*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // Default 5MB
  onFilesChange,
  isUploading = false,
  progress = 0,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      // Simple check for mime types or extensions could be more robust, 
      // but basic mime check matches 'accept' standard behavior usually.
      // For 'image/*', check if starts with image/
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', ''));
        }
        if (type.startsWith('.')) {
           return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return type === fileType;
      });
      
      if (!isAccepted) {
        setError(`El archivo ${file.name} no es un tipo permitido (${accept})`);
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
          isDragging ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-gray-400 bg-gray-50",
          isUploading && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          disabled={isUploading}
        />
        
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          {isUploading ? (
            <div className="animate-pulse">
               <Upload className="w-8 h-8 text-blue-500" />
            </div>
          ) : (
            <Upload className={cn("w-8 h-8", isDragging ? "text-orange-500" : "text-gray-400")} />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
          </p>
          <p className="text-sm text-gray-500">
            o haz clic para seleccionar
          </p>
        </div>

        {accept && (
          <p className="mt-4 text-xs text-gray-400">
            Formatos aceptados: {accept.replace(/,/g, ', ')} (Máx. {(maxSize / 1024 / 1024).toFixed(0)}MB)
          </p>
        )}

        {error && (
          <div className="absolute bottom-2 left-0 right-0 text-center">
             <p className="text-sm text-red-500 flex items-center justify-center gap-1">
               <AlertCircle className="w-4 h-4" /> {error}
             </p>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
          <p className="text-xs text-right mt-1 text-gray-500">{progress}% Subiendo...</p>
        </div>
      )}

      {files.length > 0 && (
        <div className={cn("grid gap-4", multiple ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1")}>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square relative bg-gray-100 flex items-center justify-center overflow-hidden">
                {previews[index] ? (
                  <img 
                    src={previews[index]} 
                    alt={file.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileIcon className="w-12 h-12 text-gray-300" />
                )}
                
                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-700 truncate" title={file.name}>
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
