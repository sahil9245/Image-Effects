import React, { useState, useRef, useCallback } from 'react';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  ImageIcon, 
  FileImage, 
  AlertCircle, 
  Loader2
} from 'lucide-react';

interface ImageUploaderProps {
  onImageLoad: (imageData: File) => void;
  isLoading: boolean;
  error: string | null;
  className?: string;
  isMobile?: boolean;
}

export function ImageUploader({
  onImageLoad,
  isLoading,
  error,
  className = '',
  isMobile = false
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file (PNG, JPG, JPEG, GIF, WebP, SVG)';
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      // Create a mock event to show error
      onImageLoad(''); // This will trigger error handling in parent
      return;
    }

    onImageLoad(file);
  }, [onImageLoad]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);


  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Mobile-optimized compact version
  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`
              relative border-2 border-dashed rounded-lg p-4 cursor-pointer
              transition-all duration-200 hover:border-purple-400/70 hover:bg-purple-50/50
              ${isDragOver 
                ? 'border-purple-500 bg-purple-50 scale-[1.02] shadow-sm' 
                : 'border-gray-300 dark:border-gray-600'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`
                p-2 rounded-full transition-colors duration-200
                ${isDragOver 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-purple-500'
                }
              `}>
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isDragOver ? 'Drop image here' : 'Tap to upload image'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 py-2">
            <AlertCircle className="h-3 w-3 flex-shrink-0 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300 text-xs leading-relaxed">
              {error.length > 60 ? `${error.substring(0, 60)}...` : error}
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading && (
          <Alert className="bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 py-2">
            <Loader2 className="h-3 w-3 animate-spin flex-shrink-0 text-purple-500" />
            <AlertDescription className="text-gray-700 dark:text-gray-300 text-xs">
              Processing image...
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Header */}
      <div className="space-y-3">
        <Label className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-500" />
          Upload Image
        </Label>
      </div>

      {/* File Upload Area */}
      <div className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`
            relative border-2 border-dashed rounded-lg p-8 cursor-pointer
            transition-all duration-300 hover:border-purple-400/70 hover:bg-purple-50/30 dark:hover:bg-purple-950/30
            ${isDragOver 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 scale-[1.02] shadow-lg shadow-purple-500/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={`
              p-4 rounded-full transition-all duration-300
              ${isDragOver 
                ? 'bg-purple-500 text-white scale-110 shadow-lg shadow-purple-500/30' 
                : 'bg-gray-100 dark:bg-gray-800 text-purple-500'
              }
            `}>
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                {isDragOver ? 'Drop your image here' : 'Choose or drag an image'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Supports PNG, JPG, JPEG, GIF, WebP, SVG up to 10MB
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800">
              <FileImage className="w-3 h-3" />
              Click to browse files
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Status Messages */}
      <div className="space-y-3">
        {error && (
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading && (
          <Alert className="bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            <AlertDescription className="text-gray-700 dark:text-gray-300">
              Processing your image...
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}