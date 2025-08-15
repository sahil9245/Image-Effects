import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { ImageState, EffectType, EffectParams } from './ImageEffectsProcessor';
import { AlertCircle, CheckCircle, Loader2, Grid, Circle, Diamond, Square } from 'lucide-react';

interface EffectControlPanelProps {
  imageState: ImageState;
  selectedEffect: EffectType;
  effectParams: Record<EffectType, EffectParams>;
  onLoadImage: (url: string) => void;
  onEffectChange: (effect: EffectType) => void;
  onParamsChange: (effect: EffectType, params: Partial<EffectParams>) => void;
  isMobile?: boolean;
  showOnlyUrlAndEffects?: boolean;
  showOnlySettings?: boolean;
}

const effectConfig = {
  pixelate: { name: 'Pixelate', icon: '▦', symbol: Grid },
  halftone: { name: 'Halftone', icon: '●', symbol: Circle },
  blur: { name: 'Blur', icon: '◐', symbol: Circle },
  noise: { name: 'Noise', icon: '∴', symbol: Grid },
  posterize: { name: 'Posterize', icon: '▊', symbol: Square },
  'glass-refraction': { name: 'Glass', icon: '◇', symbol: Diamond },
  emboss: { name: 'Emboss', icon: '◈', symbol: Diamond },
  vintage: { name: 'Vintage', icon: '🟤', symbol: Circle }
};

export function EffectControlPanel({ 
  imageState, 
  selectedEffect, 
  effectParams, 
  onLoadImage, 
  onEffectChange, 
  onParamsChange,
  isMobile = false,
  showOnlyUrlAndEffects = false,
  showOnlySettings = false
}: EffectControlPanelProps) {
  const [urlInput, setUrlInput] = useState('');

  const handleLoadClick = () => {
    onLoadImage(urlInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadClick();
    }
  };

  const renderEffectControls = () => {
    const params = effectParams[selectedEffect];

    switch (selectedEffect) {
      case 'pixelate':
        const pixelParams = params as any;
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-foreground">Pixel Size</Label>
              <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                {pixelParams.pixelSize}px
              </Badge>
            </div>
            <Slider
              value={[pixelParams.pixelSize]}
              onValueChange={(values) => onParamsChange('pixelate', { pixelSize: values[0] })}
              min={1}
              max={120}
              step={1}
              disabled={!imageState.originalImage}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1px</span>
              <span>120px</span>
            </div>
          </div>
        );

      case 'halftone':
        const halftoneParams = params as any;
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-foreground">Shape Type</Label>
              <ToggleGroup 
                type="single" 
                value={halftoneParams.shapeType}
                onValueChange={(value) => value && onParamsChange('halftone', { shapeType: value as 'circle' | 'diamond' | 'rectangle' })}
                className="grid grid-cols-3 gap-2"
              >
                <ToggleGroupItem value="circle" className="bg-card border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <Circle className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="diamond" className="bg-card border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <Diamond className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="rectangle" className="bg-card border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <Square className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Dot Radius</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {halftoneParams.dotRadius}px
                </Badge>
              </div>
              <Slider
                value={[halftoneParams.dotRadius]}
                onValueChange={(values) => onParamsChange('halftone', { dotRadius: values[0] })}
                min={1}
                max={20}
                step={1}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Angle</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {halftoneParams.angle}°
                </Badge>
              </div>
              <Slider
                value={[halftoneParams.angle]}
                onValueChange={(values) => onParamsChange('halftone', { angle: values[0] })}
                min={0}
                max={360}
                step={5}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-foreground">Color Mode</Label>
              <Switch
                checked={halftoneParams.colorMode}
                onCheckedChange={(checked) => onParamsChange('halftone', { colorMode: checked })}
                disabled={!imageState.originalImage}
              />
            </div>
          </div>
        );

      case 'blur':
        const blurParams = params as any;
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-foreground">Blur Radius</Label>
              <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                {blurParams.radius}px
              </Badge>
            </div>
            <Slider
              value={[blurParams.radius]}
              onValueChange={(values) => onParamsChange('blur', { radius: values[0] })}
              min={0}
              max={50}
              step={1}
              disabled={!imageState.originalImage}
              className="w-full"
            />
          </div>
        );

      case 'noise':
        const noiseParams = params as any;
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-foreground">Noise Amount</Label>
              <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                {noiseParams.amount}%
              </Badge>
            </div>
            <Slider
              value={[noiseParams.amount]}
              onValueChange={(values) => onParamsChange('noise', { amount: values[0] })}
              min={0}
              max={100}
              step={1}
              disabled={!imageState.originalImage}
              className="w-full"
            />
          </div>
        );

      case 'posterize':
        const posterizeParams = params as any;
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-foreground">Color Levels</Label>
              <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                {posterizeParams.levels}
              </Badge>
            </div>
            <Slider
              value={[posterizeParams.levels]}
              onValueChange={(values) => onParamsChange('posterize', { levels: values[0] })}
              min={2}
              max={16}
              step={1}
              disabled={!imageState.originalImage}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2 (High contrast)</span>
              <span>16 (Subtle)</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• 2-3 levels: High contrast posterization</div>
              <div>• 4-6 levels: Medium posterization</div>
              <div>• 8+ levels: Subtle color reduction</div>
            </div>
          </div>
        );

      case 'glass-refraction':
        const glassParams = params as any;
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Intensity</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {glassParams.intensity}%
                </Badge>
              </div>
              <Slider
                value={[glassParams.intensity]}
                onValueChange={(values) => onParamsChange('glass-refraction', { intensity: values[0] })}
                min={0}
                max={100}
                step={1}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Frequency</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {glassParams.frequency}
                </Badge>
              </div>
              <Slider
                value={[glassParams.frequency]}
                onValueChange={(values) => onParamsChange('glass-refraction', { frequency: values[0] })}
                min={1}
                max={20}
                step={1}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Amplitude</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {glassParams.amplitude}px
                </Badge>
              </div>
              <Slider
                value={[glassParams.amplitude]}
                onValueChange={(values) => onParamsChange('glass-refraction', { amplitude: values[0] })}
                min={1}
                max={50}
                step={1}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Direction</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {glassParams.direction}°
                </Badge>
              </div>
              <Slider
                value={[glassParams.direction]}
                onValueChange={(values) => onParamsChange('glass-refraction', { direction: values[0] })}
                min={0}
                max={360}
                step={15}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'emboss':
        const embossParams = params as any;
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-foreground">Strength</Label>
              <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                {embossParams.strength.toFixed(1)}
              </Badge>
            </div>
            <Slider
              value={[embossParams.strength]}
              onValueChange={(values) => onParamsChange('emboss', { strength: values[0] })}
              min={0.1}
              max={3.0}
              step={0.1}
              disabled={!imageState.originalImage}
              className="w-full"
            />
          </div>
        );

      case 'vintage':
        const vintageParams = params as any;
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Sepia</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {vintageParams.sepia}%
                </Badge>
              </div>
              <Slider
                value={[vintageParams.sepia]}
                onValueChange={(values) => onParamsChange('vintage', { sepia: values[0] })}
                min={0}
                max={100}
                step={5}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Grain</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {vintageParams.grain}%
                </Badge>
              </div>
              <Slider
                value={[vintageParams.grain]}
                onValueChange={(values) => onParamsChange('vintage', { grain: values[0] })}
                min={0}
                max={50}
                step={1}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Vignette</Label>
                <Badge variant="outline" className="font-mono bg-card border-border text-foreground">
                  {vintageParams.vignette}%
                </Badge>
              </div>
              <Slider
                value={[vintageParams.vignette]}
                onValueChange={(values) => onParamsChange('vintage', { vignette: values[0] })}
                min={0}
                max={100}
                step={5}
                disabled={!imageState.originalImage}
                className="w-full"
              />
            </div>
          </div>
        );

      default:
        return <div className="text-muted-foreground text-sm">Effect controls will appear here</div>;
    }
  };

  // Mobile URL and Effects section
  if (isMobile && showOnlyUrlAndEffects) {
    return (
      <div className="h-full bg-sidebar border-b border-sidebar-border p-4 flex flex-col">
        <div className="flex-1 space-y-4 min-h-0">
          {/* Compact header */}
          <div className="text-center">
            <h2 className="text-lg font-medium text-sidebar-foreground">Image Effects</h2>
          </div>

          {/* URL Input Section */}
          <div className="space-y-3">
            <Label htmlFor="image-url" className="text-sidebar-foreground text-sm font-medium">Image URL</Label>
            <div className="flex gap-3">
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground text-sm h-10"
              />
              <Button 
                onClick={handleLoadClick}
                disabled={imageState.isLoading || !urlInput.trim()}
                size="sm"
                className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground whitespace-nowrap px-4 h-10"
              >
                {imageState.isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {imageState.isLoading ? 'Loading' : 'Load'}
              </Button>
            </div>
          </div>

          {/* Effect Selector - Clean horizontal row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sidebar-foreground text-sm font-medium">Effect Type</Label>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {effectConfig[selectedEffect].name}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 px-1">
              {Object.entries(effectConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedEffect === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => onEffectChange(key as EffectType)}
                  className={`flex items-center justify-center p-4 h-12 w-12 text-lg rounded-lg min-w-[48px] ${
                    selectedEffect === key 
                      ? 'bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-sidebar-primary shadow-sm' 
                      : 'bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground border-sidebar-border'
                  }`}
                  title={config.name}
                >
                  <span>{config.icon}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Status Messages - Responsive */}
          {(imageState.error || imageState.isLoading || imageState.originalImage) && (
            <div className="space-y-2">
              {imageState.error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 py-2">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-destructive-foreground text-xs leading-relaxed">
                    {imageState.error.length > 60 ? 
                      `${imageState.error.substring(0, 60)}...` : 
                      imageState.error
                    }
                  </AlertDescription>
                </Alert>
              )}
              
              {imageState.isLoading && (
                <Alert className="bg-primary/10 border-primary/20 py-2">
                  <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
                  <AlertDescription className="text-foreground text-xs">
                    Loading image...
                  </AlertDescription>
                </Alert>
              )}
              
              {imageState.originalImage && !imageState.isLoading && (
                <Alert className="bg-primary/10 border-primary/20 py-2">
                  <CheckCircle className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-foreground text-xs">
                    <span className="block">
                      Image loaded
                    </span>
                    <span className="text-muted-foreground">
                      {imageState.originalImage.width}×{imageState.originalImage.height}px
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile Settings section
  if (isMobile && showOnlySettings) {
    return (
      <div className="h-full bg-sidebar p-4 flex flex-col">
        <div className="flex-1 space-y-3 min-h-0">
          <div className="flex items-center justify-between flex-shrink-0">
            <Label className="text-sidebar-foreground text-sm font-medium">
              {effectConfig[selectedEffect].name} Settings
            </Label>
            <span className="text-xl">
              {effectConfig[selectedEffect].icon}
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {renderEffectControls()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (original)
  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-sidebar-foreground mb-2">Image Effects</h1>
        <p className="text-muted-foreground text-sm">Professional image processing tools</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* URL Input Section */}
        <div className="space-y-3">
          <Label htmlFor="image-url" className="text-sidebar-foreground">Image URL</Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button 
            onClick={handleLoadClick}
            disabled={imageState.isLoading || !urlInput.trim()}
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
          >
            {imageState.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {imageState.isLoading ? 'Loading...' : 'Load Image'}
          </Button>
        </div>

        {/* Effect Selector */}
        <div className="space-y-3">
          <Label className="text-sidebar-foreground">Effect Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(effectConfig).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedEffect === key ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange(key as EffectType)}
                className={`flex flex-col items-center p-3 h-auto ${
                  selectedEffect === key 
                    ? 'bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-sidebar-primary' 
                    : 'bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground border-sidebar-border'
                }`}
              >
                <span className="text-lg mb-1">{config.icon}</span>
                <span className="text-xs">{config.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Dynamic Effect Controls */}
        <div className="space-y-4">
          <Label className="text-sidebar-foreground">{effectConfig[selectedEffect].name} Settings</Label>
          {renderEffectControls()}
        </div>

        {/* Status Messages */}
        <div className="space-y-3">
          {imageState.error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive-foreground">
                {imageState.error}
              </AlertDescription>
            </Alert>
          )}
          
          {imageState.isLoading && (
            <Alert className="bg-primary/10 border-primary/20">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="text-foreground">Loading image...</AlertDescription>
            </Alert>
          )}

          {imageState.originalImage && !imageState.isLoading && (
            <Alert className="bg-primary/10 border-primary/20">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-foreground">
                Image loaded ({imageState.originalImage.width}×{imageState.originalImage.height})
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Instructions - Hidden on mobile as requested */}
      {!isMobile && (
        <div className="mt-auto">
          <Separator className="mb-4 bg-sidebar-border" />
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-sidebar-foreground">Instructions</h3>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• Load an image using a public URL</li>
              <li>• Select an effect from the grid above</li>
              <li>• Adjust settings for real-time preview</li>
              <li>• Download your processed image</li>
            </ul>
            
            <div className="mt-3 p-3 bg-muted/20 rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Some URLs may not work due to CORS restrictions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}