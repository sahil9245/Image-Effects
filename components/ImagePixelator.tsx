import { useState, useRef, useEffect } from 'react';
import { ControlPanel } from './ControlPanel';
import { CanvasArea } from './CanvasArea';
import { ImageState } from './ImageEffectsProcessor';

// Interface for the pixelator-specific state
interface PixelatorImageState {
  originalImage: HTMLImageElement | null;
  pixelSize: number;
  isLoading: boolean;
  error: string | null;
  imageUrl: string;
}

export function ImagePixelator() {
  const [pixelatorState, setPixelatorState] = useState<PixelatorImageState>({
    originalImage: null,
    pixelSize: 10,
    isLoading: false,
    error: null,
    imageUrl: ''
  });

  // Convert to ImageState format for CanvasArea
  const imageState: ImageState = {
    originalImage: pixelatorState.originalImage,
    isLoading: pixelatorState.isLoading,
    isProcessing: false,
    error: pixelatorState.error,
    imageUrl: pixelatorState.imageUrl
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pixelateImage = (image: HTMLImageElement, pixelSize: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pixelated version
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Create temporary canvas to get pixel data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    tempCtx.drawImage(image, 0, 0);

    const originalData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

    // Pixelate algorithm
    for (let y = 0; y < canvas.height; y += pixelSize) {
      for (let x = 0; x < canvas.width; x += pixelSize) {
        // Get average color for this pixel block
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;

        for (let py = y; py < Math.min(y + pixelSize, canvas.height); py++) {
          for (let px = x; px < Math.min(x + pixelSize, canvas.width); px++) {
            const index = (py * canvas.width + px) * 4;
            r += originalData.data[index];
            g += originalData.data[index + 1];
            b += originalData.data[index + 2];
            a += originalData.data[index + 3];
            count++;
          }
        }

        // Calculate average
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);

        // Fill the pixel block with average color
        for (let py = y; py < Math.min(y + pixelSize, canvas.height); py++) {
          for (let px = x; px < Math.min(x + pixelSize, canvas.width); px++) {
            const index = (py * canvas.width + px) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = a;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const loadImage = (url: string) => {
    if (!url.trim()) {
      setPixelatorState(prev => ({ ...prev, error: 'Please enter a valid image URL' }));
      return;
    }

    if (!validateUrl(url)) {
      setPixelatorState(prev => ({ ...prev, error: 'Invalid URL format. Please enter a complete URL starting with http:// or https://' }));
      return;
    }

    setPixelatorState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      imageUrl: url 
    }));

    const img = new Image();
    
    // Try to load without CORS first for same-origin images
    const loadWithoutCORS = () => {
      const imgNoCORS = new Image();
      imgNoCORS.onload = () => {
        setPixelatorState(prev => ({ 
          ...prev, 
          originalImage: imgNoCORS, 
          isLoading: false, 
          error: null 
        }));
      };
      imgNoCORS.onerror = () => {
        setPixelatorState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to load image. This may be due to CORS restrictions or the image URL being invalid. Try using images from services like Unsplash, Picsum, or imgur that support cross-origin requests.' 
        }));
      };
      imgNoCORS.src = url;
    };

    // Set up CORS for cross-origin images
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      setPixelatorState(prev => ({ 
        ...prev, 
        originalImage: img, 
        isLoading: false, 
        error: null 
      }));
    };

    img.onerror = () => {
      // Try without CORS as fallback
      loadWithoutCORS();
    };

    img.src = url;
  };

  const handlePixelSizeChange = (size: number) => {
    setPixelatorState(prev => ({ ...prev, pixelSize: size }));
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = 'pixelated-image.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      setPixelatorState(prev => ({ 
        ...prev, 
        error: 'Unable to download image. This may be due to CORS restrictions on the source image.' 
      }));
    }
  };

  // Re-pixelate when pixel size changes or image loads
  useEffect(() => {
    if (pixelatorState.originalImage) {
      pixelateImage(pixelatorState.originalImage, pixelatorState.pixelSize);
    }
  }, [pixelatorState.originalImage, pixelatorState.pixelSize]);

  return (
    <div className="h-screen bg-background text-foreground">
      {/* Responsive Layout */}
      <div className="h-full flex flex-col lg:flex-row">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 lg:h-full lg:border-r border-sidebar-border">
          <ControlPanel
            imageState={pixelatorState}
            onLoadImage={loadImage}
            onPixelSizeChange={handlePixelSizeChange}
          />
        </div>

        {/* Canvas Area - Single instance that scales responsively */}
        <div className="flex-1 h-1/2 lg:h-full border-b lg:border-b-0 border-border">
          <CanvasArea
            canvasRef={canvasRef}
            imageState={imageState}
            onDownload={downloadImage}
            effectName="pixelate"
          />
        </div>
        
        {/* Mobile Controls */}
        <div className="lg:hidden h-1/2 flex flex-col overflow-y-auto">
          {/* URL Section */}
          <div className="border-b border-border p-4 flex-shrink-0">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Image URL</h3>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={pixelatorState.imageUrl}
                onChange={(e) => {
                  setPixelatorState(prev => ({ ...prev, imageUrl: e.target.value }));
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    loadImage(e.currentTarget.value);
                  }
                }}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              />
              <button
                onClick={() => loadImage(pixelatorState.imageUrl)}
                disabled={pixelatorState.isLoading || !pixelatorState.imageUrl.trim()}
                className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pixelatorState.isLoading ? 'Loading...' : 'Load Image'}
              </button>
            </div>
          </div>
          
          {/* Effect Type Section */}
          <div className="border-b border-border p-4 flex-shrink-0">
            <div>
              <h3 className="text-sm font-medium text-foreground">Effect Type</h3>
              <p className="text-xs text-muted-foreground">Pixelate</p>
            </div>
          </div>
          
          {/* Pixelate Settings */}
          <div className="p-4 flex-1 min-h-0">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Pixelate Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pixel Size</span>
                  <span className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                    {pixelatorState.pixelSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={pixelatorState.pixelSize}
                  onChange={(e) => handlePixelSizeChange(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  disabled={!pixelatorState.originalImage}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1px (Original)</span>
                  <span>120px (Very Pixelated)</span>
                </div>
              </div>
              
              {/* Status Messages */}
              {pixelatorState.error && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                  {pixelatorState.error}
                </div>
              )}
              
              {pixelatorState.originalImage && !pixelatorState.isLoading && (
                <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-700">
                  Image loaded ({pixelatorState.originalImage.width}×{pixelatorState.originalImage.height})
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}