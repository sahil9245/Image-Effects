import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ImageState } from './ImageEffectsProcessor';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageState: ImageState;
  onDownload: () => void;
  effectName: string;
  isMobile?: boolean;
}

export function CanvasArea({ canvasRef, imageState, onDownload, effectName, isMobile = false }: CanvasAreaProps) {
  return (
    <div className={`${isMobile ? 'h-full' : 'flex-1'} bg-background relative overflow-hidden`}>
      {/* Header with download button */}
      <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-10 flex gap-2`}>
        {imageState.isProcessing && (
          <div className={`flex items-center gap-2 bg-card/90 backdrop-blur-sm ${isMobile ? 'px-2 py-1' : 'px-3 py-2'} rounded-md border border-border`}>
            <Loader2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} animate-spin text-primary`} />
            {!isMobile && <span className="text-sm text-muted-foreground">Processing...</span>}
          </div>
        )}
        <Button
          onClick={onDownload}
          disabled={!imageState.originalImage || imageState.isProcessing}
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          className="bg-card/90 hover:bg-accent border-border text-foreground backdrop-blur-sm"
        >
          <Download className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${isMobile ? '' : 'mr-2'}`} />
          {!isMobile && 'Download PNG'}
        </Button>
      </div>

      {/* Canvas Container */}
      <div className={`h-full flex items-center justify-center ${isMobile ? 'p-2' : 'p-8'}`}>
        {!imageState.originalImage && !imageState.isLoading ? (
          // Empty state
          <div className="text-center max-w-md">
            <Card className="border-dashed border-2 bg-card border-border">
              <CardContent className={`${isMobile ? 'p-6' : 'p-12'}`}>
                <div className="text-muted-foreground">
                  <ImageIcon className={`${isMobile ? 'w-8 h-8' : 'w-16 h-16'} mx-auto mb-4 text-muted-foreground`} />
                  <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium text-foreground mb-2`}>No Image Loaded</h3>
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                    Enter an image URL {isMobile ? 'below' : 'in the sidebar'} to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : imageState.isLoading ? (
          // Loading state
          <div className="text-center">
            <Loader2 className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} animate-spin mx-auto mb-4 text-primary`} />
            <p className={`text-foreground ${isMobile ? 'text-sm' : ''}`}>Processing image...</p>
            {!isMobile && <p className="text-xs text-muted-foreground mt-2">This may take a moment for large images</p>}
          </div>
        ) : (
          // Canvas with image
          <div className="max-w-full max-h-full flex items-center justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full border border-border rounded-lg shadow-2xl bg-card"
                style={{ 
                  imageRendering: 'crisp-edges'
                }}
              />
              
              {/* Effect overlay badge */}
              <div className={`absolute ${isMobile ? 'top-1 left-1' : 'top-2 left-2'}`}>
                <Badge className={`bg-card/90 border-border text-foreground backdrop-blur-sm ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
                  {effectName.charAt(0).toUpperCase() + effectName.slice(1).replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      {imageState.originalImage && !isMobile && (
        <div className="absolute bottom-4 left-4">
          <Badge variant="outline" className="bg-card/90 border-border text-foreground backdrop-blur-sm">
            {imageState.originalImage.width} × {imageState.originalImage.height} px
          </Badge>
        </div>
      )}

      {/* Watermark/branding - only on desktop */}
      {!isMobile && (
        <div className="absolute bottom-4 right-4">
          <Badge variant="outline" className="bg-card/90 border-border text-muted-foreground backdrop-blur-sm text-xs">
            Image Effects Pro
          </Badge>
        </div>
      )}
    </div>
  );
}