import React from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Switch } from './ui/switch';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { ImageState, EffectType, EffectParams } from './ImageEffectsProcessor';
import { Grid, Circle, Diamond, Square } from 'lucide-react';

interface EffectControlPanelProps {
  imageState: ImageState;
  selectedEffect: EffectType;
  effectParams: Record<EffectType, EffectParams>;
  onEffectChange: (effect: EffectType) => void;
  onParamsChange: (effect: EffectType, params: Partial<EffectParams>) => void;
  isMobile?: boolean;
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
  onEffectChange, 
  onParamsChange,
  isMobile = false,
  showOnlySettings = false
}: EffectControlPanelProps) {

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


  // Mobile Effect Selector section
  if (isMobile && !showOnlySettings) {
    return (
      <div className="bg-sidebar border-b border-sidebar-border p-4">
        <div className="space-y-4">
          {/* Compact header */}
          <div className="text-center">
            <h2 className="text-lg font-medium text-sidebar-foreground">Image Effects</h2>
          </div>

          {/* Effect Selector - Clean horizontal row */}
          <div className="space-y-3">
            <Label className="text-sidebar-foreground text-sm font-medium">
              Effect Type <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded ml-2">
                {effectConfig[selectedEffect].name}
              </span>
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 w-full" style={{minHeight: '52px'}}>
              <Button
                variant={selectedEffect === 'pixelate' ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange('pixelate')}
                className="flex-shrink-0 flex items-center justify-center p-3 h-12 w-12 text-lg rounded-lg"
                title="Pixelate"
              >
                <span>▦</span>
              </Button>
              <Button
                variant={selectedEffect === 'halftone' ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange('halftone')}
                className="flex-shrink-0 flex items-center justify-center p-3 h-12 w-12 text-lg rounded-lg"
                title="Halftone"
              >
                <span>●</span>
              </Button>
              <Button
                variant={selectedEffect === 'blur' ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange('blur')}
                className="flex-shrink-0 flex items-center justify-center p-3 h-12 w-12 text-lg rounded-lg"
                title="Blur"
              >
                <span>◐</span>
              </Button>
              <Button
                variant={selectedEffect === 'noise' ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange('noise')}
                className="flex-shrink-0 flex items-center justify-center p-3 h-12 w-12 text-lg rounded-lg"
                title="Noise"
              >
                <span>∴</span>
              </Button>
              <Button
                variant={selectedEffect === 'posterize' ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange('posterize')}
                className="flex-shrink-0 flex items-center justify-center p-3 h-12 w-12 text-lg rounded-lg"
                title="Posterize"
              >
                <span>▊</span>
              </Button>
              <Button
                variant={selectedEffect === 'glass-refraction' ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange('glass-refraction')}
                className="flex-shrink-0 flex items-center justify-center p-3 h-12 w-12 text-lg rounded-lg"
                title="Glass"
              >
                <span>◇</span>
              </Button>
              <Button
                variant={selectedEffect === 'emboss' ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange('emboss')}
                className="flex-shrink-0 flex items-center justify-center p-3 h-12 w-12 text-lg rounded-lg"
                title="Emboss"
              >
                <span>◈</span>
              </Button>
              <Button
                variant={selectedEffect === 'vintage' ? "default" : "outline"}
                size="sm"
                onClick={() => onEffectChange('vintage')}
                className="flex-shrink-0 flex items-center justify-center p-3 h-12 w-12 text-lg rounded-lg"
                title="Vintage"
              >
                <span>🟤</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Settings section
  if (isMobile && showOnlySettings) {
    return (
      <div className="bg-sidebar p-4 pb-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sidebar-foreground text-sm font-medium">
              {effectConfig[selectedEffect].name} Settings
            </Label>
            <span className="text-xl">
              {effectConfig[selectedEffect].icon}
            </span>
          </div>
          <div className="space-y-4">
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

      </div>

      {/* Instructions Accordion - Hidden on mobile, positioned at bottom */}
      {!isMobile && (
        <div className="mt-auto">
          <Separator className="mb-4 bg-sidebar-border" />
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="instructions" className="border-0">
              <AccordionTrigger className="text-sm font-medium text-sidebar-foreground hover:no-underline py-2 px-0">
                Instructions
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-3">
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Load an image using a public URL</li>
                    <li>• Select an effect from the grid above</li>
                    <li>• Adjust settings for real-time preview</li>
                    <li>• Download your processed image</li>
                  </ul>
                  
                  <div className="p-3 bg-muted/20 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Some URLs may not work due to CORS restrictions.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}