import { useState, useRef, useEffect } from 'react';
import { ControlPanel } from './ControlPanel';
import { CanvasArea } from './CanvasArea';

export interface ImageState {
  originalImage: HTMLImageElement | null;
  pixelSize: number;
  isLoading: boolean;
  error: string | null;
  imageUrl: string;
}

export function ImagePixelator() {
  const [imageState, setImageState] = useState<ImageState>({
    originalImage: null,
    pixelSize: 10,
    isLoading: false,
    error: null,
    imageUrl: ''
  });

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
      setImageState(prev => ({ ...prev, error: 'Please enter a valid image URL' }));
      return;
    }

    if (!validateUrl(url)) {
      setImageState(prev => ({ ...prev, error: 'Invalid URL format. Please enter a complete URL starting with http:// or https://' }));
      return;
    }

    setImageState(prev => ({ 
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
        setImageState(prev => ({ 
          ...prev, 
          originalImage: imgNoCORS, 
          isLoading: false, 
          error: null 
        }));
      };
      imgNoCORS.onerror = () => {
        setImageState(prev => ({ 
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
      setImageState(prev => ({ 
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
    setImageState(prev => ({ ...prev, pixelSize: size }));
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
      setImageState(prev => ({ 
        ...prev, 
        error: 'Unable to download image. This may be due to CORS restrictions on the source image.' 
      }));
    }
  };

  // Re-pixelate when pixel size changes or image loads
  useEffect(() => {
    if (imageState.originalImage) {
      pixelateImage(imageState.originalImage, imageState.pixelSize);
    }
  }, [imageState.originalImage, imageState.pixelSize]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ControlPanel
        imageState={imageState}
        onLoadImage={loadImage}
        onPixelSizeChange={handlePixelSizeChange}
      />
      <CanvasArea
        canvasRef={canvasRef}
        imageState={imageState}
        onDownload={downloadImage}
        effectName="pixelate"
      />
    </div>
  );
}