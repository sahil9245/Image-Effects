import React, { useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Download, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { ImageState } from './ImageEffectsProcessor';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageState: ImageState;
  onDownload: () => void;
  onImageLoad: (file: File) => void;
  effectName: string;
}

export function CanvasArea({ canvasRef, imageState, onDownload, onImageLoad, effectName }: CanvasAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Basic file validation
    if (!file.type.startsWith('image/')) {
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return;
    }
    
    onImageLoad(file);
  }, [onImageLoad]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      {/* Header with reupload and download buttons - Responsive positioning */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 lg:top-6 lg:right-6 z-10 flex gap-1.5 sm:gap-2">
        {imageState.isProcessing && (
          <div className="flex items-center gap-1.5 sm:gap-2 bg-card/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-md border border-border">
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary" />
            <span className="hidden sm:inline text-sm text-muted-foreground">Processing...</span>
          </div>
        )}
        {imageState.originalImage && (
          <Button
            onClick={triggerFileInput}
            disabled={imageState.isProcessing}
            variant="outline"
            size="sm"
            className="bg-card/90 hover:bg-accent border-border text-foreground backdrop-blur-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reupload</span>
          </Button>
        )}
        <Button
          onClick={onDownload}
          disabled={!imageState.originalImage || imageState.isProcessing}
          variant="outline"
          size="sm"
          className="bg-card/90 hover:bg-accent border-border text-foreground backdrop-blur-sm"
        >
          <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">Download PNG</span>
        </Button>
        {/* Hidden file input for reupload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Canvas Container - Full viewport usage */}
      <div className="h-full w-full flex items-center justify-center p-2">
        {!imageState.originalImage && !imageState.isLoading ? (
          // Empty state with upload button
          <div className="text-center">
            <Card className="border-dashed border-2 bg-card border-border inline-block">
              <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
                <div className="text-muted-foreground">
                  <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-sm sm:text-base md:text-lg font-medium text-foreground mb-2">No Image Loaded</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mb-4">
                    Upload an image to start applying effects
                  </p>
                  <Button 
                    onClick={triggerFileInput}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : imageState.isLoading ? (
          // Loading state - Responsive sizing
          <div className="text-center">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm sm:text-base text-foreground">Processing image...</p>
            <p className="hidden sm:block text-xs text-muted-foreground mt-2">This may take a moment for large images</p>
          </div>
        ) : (
          // Canvas with image - Full viewport usage
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full border border-border rounded-lg shadow-lg bg-card"
                style={{ 
                  imageRendering: 'crisp-edges'
                }}
              />
              
              {/* Effect overlay badge - Responsive positioning and sizing */}
              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 md:top-3 md:left-3">
                <Badge className="bg-card/90 border-border text-foreground backdrop-blur-sm text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">
                  {effectName.charAt(0).toUpperCase() + effectName.slice(1).replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar - Responsive positioning and visibility */}
      {imageState.originalImage && (
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 md:bottom-4 md:left-4 lg:bottom-6 lg:left-6">
          <Badge variant="outline" className="bg-card/90 border-border text-foreground backdrop-blur-sm text-xs sm:text-sm">
            {imageState.originalImage.width} × {imageState.originalImage.height} px
          </Badge>
        </div>
      )}

      {/* Watermark/branding - Responsive positioning */}
      <div className="hidden sm:block absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 lg:bottom-6 lg:right-6">
        <Badge variant="outline" className="bg-card/90 border-border text-muted-foreground backdrop-blur-sm text-xs">
          Image Effects Pro
        </Badge>
      </div>
    </div>
  );
}