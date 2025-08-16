import { useState, useRef, useEffect, useCallback } from 'react';
import { EffectControlPanel } from './EffectControlPanel';
import { CanvasArea } from './CanvasArea';

export type EffectType = 'pixelate' | 'halftone' | 'blur' | 'noise' | 'posterize' | 'glass-refraction' | 'emboss' | 'vintage';

export interface ImageState {
  originalImage: HTMLImageElement | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  imageUrl: string;
}

export interface PixelateParams {
  pixelSize: number;
}

export interface HalftoneParams {
  shapeType: 'circle' | 'diamond' | 'rectangle';
  dotRadius: number;
  angle: number;
  colorMode: boolean;
}

export interface BlurParams {
  radius: number;
}

export interface NoiseParams {
  amount: number;
}

export interface PosterizeParams {
  levels: number;
}

export interface GlassRefractionParams {
  intensity: number;
  frequency: number;
  amplitude: number;
  direction: number;
}

export interface EmbossParams {
  strength: number;
}

export interface VintageParams {
  sepia: number;
  grain: number;
  vignette: number;
}

export type EffectParams = PixelateParams | HalftoneParams | BlurParams | NoiseParams | PosterizeParams | GlassRefractionParams | EmbossParams | VintageParams;

export function ImageEffectsProcessor() {
  const [imageState, setImageState] = useState<ImageState>({
    originalImage: null,
    isLoading: false,
    isProcessing: false,
    error: null,
    imageUrl: ''
  });

  const [selectedEffect, setSelectedEffect] = useState<EffectType>('pixelate');
  const [effectParams, setEffectParams] = useState<Record<EffectType, EffectParams>>({
    pixelate: { pixelSize: 10 },
    halftone: { shapeType: 'circle', dotRadius: 8, angle: 45, colorMode: false },
    blur: { radius: 5 },
    noise: { amount: 25 },
    posterize: { levels: 4 },
    'glass-refraction': { intensity: 50, frequency: 8, amplitude: 10, direction: 0 },
    emboss: { strength: 1 },
    vintage: { sepia: 30, grain: 20, vignette: 40 }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced effect application
  const debouncedApplyEffect = useCallback((image: HTMLImageElement, effect: EffectType, params: EffectParams) => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    setImageState(prev => ({ ...prev, isProcessing: true }));
    
    processingTimeoutRef.current = setTimeout(() => {
      applyEffect(image, effect, params);
      setImageState(prev => ({ ...prev, isProcessing: false }));
    }, 100); // Wait 100ms after last change
  }, []);

  const applyEffect = (image: HTMLImageElement, effect: EffectType, params: EffectParams) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Optimize canvas size for performance
    const MAX_DIMENSION = 1200; // Limit processing size for performance
    let { width, height } = image;
    
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create optimized image for processing
    const processImage = new Image();
    processImage.onload = () => {
      processEffectWithOptimizedImage(ctx, processImage, effect, params, width, height);
    };
    
    // Draw resized image to temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(image, 0, 0, width, height);
    processImage.src = tempCanvas.toDataURL();
  };

  const processEffectWithOptimizedImage = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, effect: EffectType, params: EffectParams, width: number, height: number) => {

    switch (effect) {
      case 'pixelate':
        applyPixelateEffect(ctx, image, params as PixelateParams);
        break;
      case 'halftone':
        applyHalftoneEffect(ctx, image, params as HalftoneParams);
        break;
      case 'blur':
        applyBlurEffect(ctx, image, params as BlurParams);
        break;
      case 'noise':
        applyNoiseEffect(ctx, image, params as NoiseParams);
        break;
      case 'posterize':
        applyPosterizeEffect(ctx, image, params as PosterizeParams);
        break;
      case 'glass-refraction':
        applyGlassRefractionEffect(ctx, image, params as GlassRefractionParams);
        break;
      case 'emboss':
        applyEmbossEffect(ctx, image, params as EmbossParams);
        break;
      case 'vintage':
        applyVintageEffect(ctx, image, params as VintageParams);
        break;
    }
  };

  const applyPixelateEffect = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, params: PixelateParams) => {
    const { pixelSize } = params;
    
    // Use faster approach: draw scaled down then scale up
    const smallCanvas = document.createElement('canvas');
    const smallCtx = smallCanvas.getContext('2d')!;
    
    const scale = pixelSize;
    smallCanvas.width = Math.ceil(image.width / scale);
    smallCanvas.height = Math.ceil(image.height / scale);
    
    // Disable smoothing for pixelated effect
    smallCtx.imageSmoothingEnabled = false;
    
    // Draw image scaled down
    smallCtx.drawImage(image, 0, 0, smallCanvas.width, smallCanvas.height);
    
    // Disable smoothing for main canvas too
    ctx.imageSmoothingEnabled = false;
    
    // Draw scaled up to create pixelated effect
    ctx.drawImage(smallCanvas, 0, 0, image.width, image.height);
    
    // Re-enable smoothing
    ctx.imageSmoothingEnabled = true;
  };

  const applyHalftoneEffect = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, params: HalftoneParams) => {
    const { shapeType, dotRadius, angle, colorMode } = params;
    
    // Draw the original image to a temporary canvas to get image data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    tempCtx.drawImage(image, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, image.width, image.height);
    
    // Clear the main canvas with background color
    ctx.fillStyle = colorMode ? '#ffffff' : '#ffffff';
    ctx.fillRect(0, 0, image.width, image.height);
    
    // Calculate dot spacing based on radius - adjust for small dots
    let spacing;
    if (dotRadius <= 2) {
      // For very small dots, use tighter spacing
      spacing = dotRadius * 1.8;
    } else if (dotRadius <= 5) {
      // For small dots, use moderate spacing
      spacing = dotRadius * 2.0;
    } else {
      // For larger dots, use normal spacing
      spacing = dotRadius * 2.5;
    }
    
    const angleRad = (angle * Math.PI) / 180;
    
    // Adjust minimum dot size threshold for small radii
    const minDotThreshold = dotRadius <= 2 ? 0.1 : 0.3;
    
    // Create halftone pattern
    for (let y = spacing / 2; y < image.height; y += spacing) {
      for (let x = spacing / 2; x < image.width; x += spacing) {
        // Sample the brightness at this position
        const sampleX = Math.floor(Math.max(0, Math.min(x, image.width - 1)));
        const sampleY = Math.floor(Math.max(0, Math.min(y, image.height - 1)));
        const pixelIndex = (sampleY * image.width + sampleX) * 4;
        
        const r = imageData.data[pixelIndex];
        const g = imageData.data[pixelIndex + 1];
        const b = imageData.data[pixelIndex + 2];
        
        // Calculate brightness (0-255)
        const brightness = (r + g + b) / 3;
        
        // Calculate dot size based on brightness
        // Invert brightness for better effect (darker areas = larger dots)
        const normalizedBrightness = colorMode ? brightness / 255 : 1 - (brightness / 255);
        
        // For small dot radii, ensure a minimum dot size for visibility
        let dotSize = normalizedBrightness * dotRadius;
        
        // For very small radii, ensure dots are more visible
        if (dotRadius <= 2) {
          // Increase contrast and minimum size for small dots
          dotSize = Math.max(dotSize * 1.2, normalizedBrightness > 0.1 ? 0.3 : 0);
        } else if (dotRadius <= 3) {
          // Slight enhancement for medium-small dots
          dotSize = Math.max(dotSize, normalizedBrightness > 0.1 ? 0.4 : 0);
        }
        
        // Only draw if dot size is above threshold
        if (dotSize > minDotThreshold) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angleRad);
          
          if (colorMode) {
            // Use original colors
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          } else {
            // Use black dots
            ctx.fillStyle = '#000000';
          }
          
          // For very small dots, ensure they're crisp
          if (dotRadius <= 2) {
            ctx.imageSmoothingEnabled = false;
          }
          
          // Draw the shape
          switch (shapeType) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(0, 0, dotSize, 0, Math.PI * 2);
              ctx.fill();
              break;
              
            case 'diamond':
              ctx.beginPath();
              ctx.moveTo(0, -dotSize);
              ctx.lineTo(dotSize, 0);
              ctx.lineTo(0, dotSize);
              ctx.lineTo(-dotSize, 0);
              ctx.closePath();
              ctx.fill();
              break;
              
            case 'rectangle':
              // For rectangles, ensure minimum 1px size for very small dots
              const rectSize = Math.max(dotSize, dotRadius <= 2 ? 0.5 : dotSize);
              ctx.fillRect(-rectSize, -rectSize, rectSize * 2, rectSize * 2);
              break;
          }
          
          ctx.restore();
        }
      }
    }
  };

  const applyBlurEffect = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, params: BlurParams) => {
    ctx.filter = `blur(${params.radius}px)`;
    ctx.drawImage(image, 0, 0);
    ctx.filter = 'none';
  };

  const applyNoiseEffect = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, params: NoiseParams) => {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * params.amount * 2;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const applyPosterizeEffect = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, params: PosterizeParams) => {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    
    // Ensure minimum levels and create proper quantization levels
    const levels = Math.max(2, Math.floor(params.levels));
    
    // Create an array of quantization levels
    const quantLevels: number[] = [];
    for (let i = 0; i < levels; i++) {
      quantLevels.push(Math.round((i / (levels - 1)) * 255));
    }
    
    // Function to find nearest quantization level
    const quantize = (value: number): number => {
      let nearest = quantLevels[0];
      let minDiff = Math.abs(value - nearest);
      
      for (let i = 1; i < quantLevels.length; i++) {
        const diff = Math.abs(value - quantLevels[i]);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = quantLevels[i];
        }
      }
      
      return nearest;
    };
    
    // Apply posterization to each pixel
    for (let i = 0; i < data.length; i += 4) {
      data[i] = quantize(data[i]);         // Red
      data[i + 1] = quantize(data[i + 1]); // Green
      data[i + 2] = quantize(data[i + 2]); // Blue
      // Alpha channel remains unchanged
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const applyGlassRefractionEffect = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, params: GlassRefractionParams) => {
    // Draw original image to temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    tempCtx.drawImage(image, 0, 0);
    
    const originalData = tempCtx.getImageData(0, 0, image.width, image.height);
    const outputData = ctx.createImageData(image.width, image.height);
    
    const { intensity, frequency, amplitude, direction } = params;
    const width = image.width;
    const height = image.height;
    
    // Convert direction from degrees to radians
    const directionRad = (direction * Math.PI) / 180;
    const cosDir = Math.cos(directionRad);
    const sinDir = Math.sin(directionRad);
    
    // Normalize parameters for better control
    const intensityFactor = intensity / 100; // 0-1
    const freqFactor = frequency * 0.1; // Scale frequency
    const ampFactor = amplitude * intensityFactor; // Scale amplitude by intensity
    
    // Apply glass refraction effect
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate wave patterns for realistic glass distortion
        const normalizedX = x / width;
        const normalizedY = y / height;
        
        // Create multiple wave patterns for complex glass texture
        const wave1 = Math.sin(normalizedX * Math.PI * freqFactor) * Math.cos(normalizedY * Math.PI * freqFactor);
        const wave2 = Math.sin(normalizedY * Math.PI * freqFactor * 1.3) * Math.cos(normalizedX * Math.PI * freqFactor * 0.7);
        const wave3 = Math.sin((normalizedX + normalizedY) * Math.PI * freqFactor * 0.8);
        
        // Combine waves for complex refraction pattern
        const combinedWave = (wave1 + wave2 * 0.7 + wave3 * 0.5) / 2.2;
        
        // Apply directional bias to the distortion
        const distortionX = combinedWave * ampFactor * cosDir;
        const distortionY = combinedWave * ampFactor * sinDir;
        
        // Add some perpendicular distortion for more realistic glass effect
        const perpDistortionX = combinedWave * ampFactor * 0.3 * (-sinDir);
        const perpDistortionY = combinedWave * ampFactor * 0.3 * cosDir;
        
        // Calculate source pixel coordinates
        const sourceX = Math.round(x + distortionX + perpDistortionX);
        const sourceY = Math.round(y + distortionY + perpDistortionY);
        
        // Clamp coordinates to image boundaries
        const clampedX = Math.max(0, Math.min(width - 1, sourceX));
        const clampedY = Math.max(0, Math.min(height - 1, sourceY));
        
        // Get source pixel
        const sourceIndex = (clampedY * width + clampedX) * 4;
        const outputIndex = (y * width + x) * 4;
        
        // Copy pixel data with slight color shift for glass effect
        let r = originalData.data[sourceIndex];
        let g = originalData.data[sourceIndex + 1];
        let b = originalData.data[sourceIndex + 2];
        const a = originalData.data[sourceIndex + 3];
        
        // Add subtle color aberration effect (like chromatic aberration in glass)
        if (intensityFactor > 0.3) {
          const aberrationOffset = Math.floor(ampFactor * 0.5);
          
          if (aberrationOffset > 0) {
            // Red channel offset
            const redX = Math.max(0, Math.min(width - 1, clampedX + aberrationOffset));
            const redIndex = (clampedY * width + redX) * 4;
            r = originalData.data[redIndex];
            
            // Blue channel offset in opposite direction
            const blueX = Math.max(0, Math.min(width - 1, clampedX - aberrationOffset));
            const blueIndex = (clampedY * width + blueX) * 4;
            b = originalData.data[blueIndex + 2];
          }
        }
        
        // Apply slight brightness variation to simulate glass thickness
        const brightnessVariation = Math.sin(combinedWave * Math.PI) * 0.1 * intensityFactor;
        const brightnessFactor = 1 + brightnessVariation;
        
        outputData.data[outputIndex] = Math.max(0, Math.min(255, Math.round(r * brightnessFactor)));
        outputData.data[outputIndex + 1] = Math.max(0, Math.min(255, Math.round(g * brightnessFactor)));
        outputData.data[outputIndex + 2] = Math.max(0, Math.min(255, Math.round(b * brightnessFactor)));
        outputData.data[outputIndex + 3] = a;
      }
    }
    
    ctx.putImageData(outputData, 0, 0);
    
    // Optional: Add subtle blur for glass smoothness
    if (intensityFactor > 0.5) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = `blur(${intensityFactor * 0.5}px)`;
      ctx.globalAlpha = 0.15;
      
      const blurCanvas = document.createElement('canvas');
      const blurCtx = blurCanvas.getContext('2d')!;
      blurCanvas.width = width;
      blurCanvas.height = height;
      blurCtx.putImageData(outputData, 0, 0);
      
      ctx.drawImage(blurCanvas, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const applyEmbossEffect = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, params: EmbossParams) => {
    // Draw original image to temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    tempCtx.drawImage(image, 0, 0);
    
    const originalData = tempCtx.getImageData(0, 0, image.width, image.height);
    const outputData = ctx.createImageData(image.width, image.height);
    
    const { strength } = params;
    const width = image.width;
    const height = image.height;
    
    // Emboss convolution kernel - creates 3D raised effect
    // This kernel emphasizes edges and creates the characteristic emboss look
    const kernel = [
      [-2 * strength, -1 * strength, 0],
      [-1 * strength,  1 * strength, 1 * strength],
      [0,              1 * strength, 2 * strength]
    ];
    
    // Apply convolution with the emboss kernel
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        // Apply the 3x3 kernel
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelY = y + ky;
            const pixelX = x + kx;
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const kernelValue = kernel[ky + 1][kx + 1];
            
            r += originalData.data[pixelIndex] * kernelValue;
            g += originalData.data[pixelIndex + 1] * kernelValue;
            b += originalData.data[pixelIndex + 2] * kernelValue;
          }
        }
        
        // Add offset to bring result into visible range (128 = neutral gray)
        // This is crucial for emboss effects to show highlights and shadows
        const offset = 128;
        r += offset;
        g += offset;
        b += offset;
        
        // Clamp values to valid range
        r = Math.max(0, Math.min(255, Math.round(r)));
        g = Math.max(0, Math.min(255, Math.round(g)));
        b = Math.max(0, Math.min(255, Math.round(b)));
        
        // For a more traditional emboss look, convert to grayscale
        // but preserve some color information based on strength
        const gray = Math.round((r + g + b) / 3);
        const colorBlend = Math.min(1, strength * 0.3); // Blend factor based on strength
        
        const outputIndex = (y * width + x) * 4;
        outputData.data[outputIndex] = Math.round(gray * (1 - colorBlend) + r * colorBlend);
        outputData.data[outputIndex + 1] = Math.round(gray * (1 - colorBlend) + g * colorBlend);
        outputData.data[outputIndex + 2] = Math.round(gray * (1 - colorBlend) + b * colorBlend);
        outputData.data[outputIndex + 3] = originalData.data[outputIndex + 3]; // preserve alpha
      }
    }
    
    // Handle edge pixels by copying from original (no emboss on edges)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          const index = (y * width + x) * 4;
          outputData.data[index] = originalData.data[index];
          outputData.data[index + 1] = originalData.data[index + 1];
          outputData.data[index + 2] = originalData.data[index + 2];
          outputData.data[index + 3] = originalData.data[index + 3];
        }
      }
    }
    
    ctx.putImageData(outputData, 0, 0);
  };

  const applyVintageEffect = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, params: VintageParams) => {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    
    // Apply sepia tone
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      
      data[i] = Math.min(255, r + (tr - r) * (params.sepia / 100));
      data[i + 1] = Math.min(255, g + (tg - g) * (params.sepia / 100));
      data[i + 2] = Math.min(255, b + (tb - b) * (params.sepia / 100));
      
      // Add grain
      const grain = (Math.random() - 0.5) * params.grain;
      data[i] = Math.max(0, Math.min(255, data[i] + grain));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Add vignette
    const centerX = image.width / 2;
    const centerY = image.height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxDist);
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${params.vignette / 100})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, image.width, image.height);
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
      loadWithoutCORS();
    };

    img.src = url;
  };

  const updateEffectParams = (effect: EffectType, newParams: Partial<EffectParams>) => {
    setEffectParams(prev => ({
      ...prev,
      [effect]: { ...prev[effect], ...newParams }
    }));
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = `${selectedEffect}-effect.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      setImageState(prev => ({ 
        ...prev, 
        error: 'Unable to download image. This may be due to CORS restrictions on the source image.' 
      }));
    }
  };

  useEffect(() => {
    if (imageState.originalImage) {
      debouncedApplyEffect(imageState.originalImage, selectedEffect, effectParams[selectedEffect]);
    }
  }, [imageState.originalImage, selectedEffect, effectParams, debouncedApplyEffect]);

  return (
    <div className="h-screen bg-background text-foreground">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full">
        <EffectControlPanel
          imageState={imageState}
          selectedEffect={selectedEffect}
          effectParams={effectParams}
          onLoadImage={loadImage}
          onEffectChange={setSelectedEffect}
          onParamsChange={updateEffectParams}
          isMobile={false}
        />
        <CanvasArea
          canvasRef={canvasRef}
          imageState={imageState}
          onDownload={downloadImage}
          effectName={selectedEffect}
          isMobile={false}
        />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-full flex flex-col">
        {/* Image Area - 50% */}
        <div className="h-1/2 border-b border-border">
          <CanvasArea
            canvasRef={canvasRef}
            imageState={imageState}
            onDownload={downloadImage}
            effectName={selectedEffect}
            isMobile={true}
          />
        </div>
        
        {/* Controls Area - 50% split into URL/Effects (30%) and Settings (20%) */}
        <div className="h-1/2 flex flex-col">
          {/* URL and Effect Selection - 60% of bottom half (30% of total) */}
          <div className="h-3/5 border-b border-border">
            <EffectControlPanel
              imageState={imageState}
              selectedEffect={selectedEffect}
              effectParams={effectParams}
              onLoadImage={loadImage}
              onEffectChange={setSelectedEffect}
              onParamsChange={updateEffectParams}
              isMobile={true}
              showOnlyUrlAndEffects={true}
            />
          </div>
          
          {/* Settings Area - 40% of bottom half (20% of total) */}
          <div className="h-2/5">
            <EffectControlPanel
              imageState={imageState}
              selectedEffect={selectedEffect}
              effectParams={effectParams}
              onLoadImage={loadImage}
              onEffectChange={setSelectedEffect}
              onParamsChange={updateEffectParams}
              isMobile={true}
              showOnlySettings={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}