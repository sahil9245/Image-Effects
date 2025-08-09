import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageState } from './ImagePixelator';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ControlPanelProps {
  imageState: ImageState;
  onLoadImage: (url: string) => void;
  onPixelSizeChange: (size: number) => void;
}

export function ControlPanel({ imageState, onLoadImage, onPixelSizeChange }: ControlPanelProps) {
  const [urlInput, setUrlInput] = useState('');

  const handleLoadClick = () => {
    onLoadImage(urlInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadClick();
    }
  };

  return (
    <div className="w-80 bg-background border-r border-border p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-foreground mb-2">Image Pixelator</h1>
        <p className="text-muted-foreground text-sm">Transform images with adjustable pixel effects</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* URL Input Section */}
        <div className="space-y-3">
          <Label htmlFor="image-url">Image URL</Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button 
            onClick={handleLoadClick}
            disabled={imageState.isLoading || !urlInput.trim()}
            className="w-full"
          >
            {imageState.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {imageState.isLoading ? 'Loading...' : 'Load Image'}
          </Button>
        </div>

        {/* Pixel Size Control */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Pixel Size</Label>
            <Badge variant="secondary" className="font-mono">
              {imageState.pixelSize}px
            </Badge>
          </div>
          <Slider
            value={[imageState.pixelSize]}
            onValueChange={(values) => onPixelSizeChange(values[0])}
            min={1}
            max={120}
            step={1}
            disabled={!imageState.originalImage}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1px (Original)</span>
            <span>120px (Very Pixelated)</span>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-3">
          {imageState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {imageState.error}
              </AlertDescription>
            </Alert>
          )}
          
          {imageState.isLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Loading image...</AlertDescription>
            </Alert>
          )}

          {imageState.originalImage && !imageState.isLoading && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Image loaded ({imageState.originalImage.width}×{imageState.originalImage.height})
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-auto">
        <Separator className="mb-4" />
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Instructions</h3>
          <ul className="text-muted-foreground text-sm space-y-1">
            <li>• Use images from Unsplash, Picsum, or similar services</li>
            <li>• Adjust pixel size from 1px (original) to 120px</li>
            <li>• Download your pixelated creation as PNG</li>
          </ul>
          
          <div className="mt-3 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Some image URLs may not work due to CORS restrictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}