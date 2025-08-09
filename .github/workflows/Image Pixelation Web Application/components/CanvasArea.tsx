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
}

export function CanvasArea({ canvasRef, imageState, onDownload, effectName }: CanvasAreaProps) {
  return (
    <div className="flex-1 bg-background relative overflow-hidden">
      {/* Header with download button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={onDownload}
          disabled={!imageState.originalImage}
          variant="outline"
          size="sm"
          className="bg-card/90 hover:bg-accent border-border text-foreground backdrop-blur-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      {/* Canvas Container */}
      <div className="h-full flex items-center justify-center p-8">
        {!imageState.originalImage && !imageState.isLoading ? (
          // Empty state
          <div className="text-center max-w-md">
            <Card className="border-dashed border-2 bg-card border-border">
              <CardContent className="p-12">
                <div className="text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Image Loaded</h3>
                  <p className="text-muted-foreground">Enter an image URL in the sidebar to get started</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : imageState.isLoading ? (
          // Loading state
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-foreground">Processing image...</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a moment for large images</p>
          </div>
        ) : (
          // Canvas with image
          <div className="max-w-full max-h-full flex items-center justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full border border-border rounded-lg shadow-2xl bg-card"
                style={{ 
                  imageRendering: 'pixelated',
                  imageRendering: '-moz-crisp-edges',
                  imageRendering: 'crisp-edges'
                }}
              />
              
              {/* Effect overlay badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-card/90 border-border text-foreground backdrop-blur-sm">
                  {effectName.charAt(0).toUpperCase() + effectName.slice(1).replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      {imageState.originalImage && (
        <div className="absolute bottom-4 left-4">
          <Badge variant="outline" className="bg-card/90 border-border text-foreground backdrop-blur-sm">
            {imageState.originalImage.width} × {imageState.originalImage.height} px
          </Badge>
        </div>
      )}

      {/* Watermark/branding */}
      <div className="absolute bottom-4 right-4">
        <Badge variant="outline" className="bg-card/90 border-border text-muted-foreground backdrop-blur-sm text-xs">
          Image Effects Pro
        </Badge>
      </div>
    </div>
  );
}