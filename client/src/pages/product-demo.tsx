import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Upload,
  Wrench,
  Volume2,
  Settings,
  Car,
  Sparkles,
  BarChart3,
  Palette,
  MousePointer
} from "lucide-react";

export default function ProductDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<'stock' | 'alpine'>('stock');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [carFitImage, setCarFitImage] = useState<string | null>(null);
  const [installStep, setInstallStep] = useState(0);
  const [powerLevel, setPowerLevel] = useState([50]);
  const [selectedColor, setSelectedColor] = useState('black');
  const [cartOpen, setCartOpen] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio comparison data
  const audioSamples = {
    stock: { name: "Stock Car Audio", description: "Standaard fabriek audio", quality: 3 },
    alpine: { name: "Alpine Premium", description: "Alpine CDE-W296BT systeem", quality: 9 }
  };

  // Installation steps
  const installSteps = [
    { title: "Dashboard demontage", time: "15 min", description: "Voorzichtig verwijderen van originele unit" },
    { title: "Bedrading controle", time: "10 min", description: "Checken van alle connecties" },
    { title: "Alpine installatie", time: "20 min", description: "Installeren van nieuwe hoofdunit" },
    { title: "Testing & kalibratie", time: "15 min", description: "Geluid optimaliseren" }
  ];

  const productColors = {
    black: { name: "Carbon Black", price: 0, hex: "#1a1a1a" },
    silver: { name: "Titanium Silver", price: 25, hex: "#c0c0c0" },
    blue: { name: "Alpine Blue", price: 50, hex: "#0066cc" }
  };

  const basePrice = 299;
  const currentPrice = basePrice + productColors[selectedColor as keyof typeof productColors].price;

  // Mock frequency response data
  const generateFrequencyData = (quality: number) => {
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    return frequencies.map(freq => ({
      freq,
      response: Math.random() * quality + (10 - quality)
    }));
  };

  const stockData = generateFrequencyData(3);
  const alpineData = generateFrequencyData(9);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        // Simulate audio visualization
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setCartOpen(true)} />
      
      <div className="container px-4 mx-auto py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Exclusieve Product Demo
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Next-Level Product Experience
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ontdek hoe onze geavanceerde product features je webshop naar een hoger niveau tillen.
            Test alle innovatieve functionaliteiten die je klanten zullen verrassen.
          </p>
        </div>

        {/* Demo Sections */}
        <Tabs defaultValue="audio" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="audio" className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Audio Compare</span>
            </TabsTrigger>
            <TabsTrigger value="360" className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">360° View</span>
            </TabsTrigger>
            <TabsTrigger value="fit" className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Car Fit</span>
            </TabsTrigger>
            <TabsTrigger value="install" className="flex items-center space-x-2">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Installation</span>
            </TabsTrigger>
            <TabsTrigger value="specs" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Tech Specs</span>
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Builder</span>
            </TabsTrigger>
          </TabsList>

          {/* Audio Comparison */}
          <TabsContent value="audio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="w-6 h-6 text-primary" />
                  <span>Audio Comparison Player</span>
                  <Badge variant="secondary">Game Changer</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stock Audio */}
                  <Card className={`cursor-pointer transition-all ${selectedAudio === 'stock' ? 'ring-2 ring-primary' : ''}`} 
                        onClick={() => setSelectedAudio('stock')} data-testid="card-stock-audio">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Stock Car Audio</h3>
                        <Badge variant="outline">Original</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Kwaliteit:</span>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded ${i < 3 ? 'bg-yellow-500' : 'bg-muted'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Standaard fabriek speakers, beperkte dynamiek
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alpine Audio */}
                  <Card className={`cursor-pointer transition-all ${selectedAudio === 'alpine' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedAudio('alpine')} data-testid="card-alpine-audio">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Alpine Premium</h3>
                        <Badge className="bg-primary">Upgraded</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Kwaliteit:</span>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded ${i < 5 ? 'bg-green-500' : 'bg-muted'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Alpine CDE-W296BT, kristalheldere audio
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-center space-x-4 p-6 bg-muted/30 rounded-lg">
                  <Button
                    variant={isPlaying ? "secondary" : "default"}
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <div className="text-center">
                    <div className="font-medium">Nu speelt:</div>
                    <div className="text-sm text-muted-foreground">
                      {audioSamples[selectedAudio].name}
                    </div>
                  </div>
                </div>

                {/* Frequency Response Visualization */}
                <div className="space-y-4">
                  <h4 className="font-medium">Frequentie Response Vergelijking</h4>
                  <div className="h-48 bg-muted/20 rounded-lg p-4 relative overflow-hidden">
                    <div className="grid grid-cols-10 h-full gap-2">
                      {(selectedAudio === 'stock' ? stockData : alpineData).map((point, index) => (
                        <div key={index} className="flex flex-col justify-end items-center space-y-2">
                          <div 
                            className={`w-full rounded-t transition-all duration-1000 ${
                              selectedAudio === 'alpine' ? 'bg-primary' : 'bg-muted-foreground/50'
                            }`}
                            style={{ height: `${point.response * 8}%` }}
                          />
                          <div className="text-xs text-muted-foreground transform -rotate-45 origin-center">
                            {point.freq}Hz
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 360° Product Viewer */}
          <TabsContent value="360" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RotateCcw className="w-6 h-6 text-primary" />
                  <span>360° Product Viewer</span>
                  <Badge variant="secondary">Interactive</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl relative overflow-hidden flex items-center justify-center">
                  {/* 3D Product Mock */}
                  <div 
                    className="w-64 h-64 bg-gradient-to-r from-slate-800 to-slate-600 rounded-lg shadow-2xl transition-transform duration-300 flex items-center justify-center relative"
                    style={{ transform: `rotateY(${rotation}deg) scale(${zoom})` }}
                    data-testid="product-3d-view"
                  >
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold mb-2">ALPINE</div>
                      <div className="text-sm opacity-80">CDE-W296BT</div>
                    </div>
                    
                    {/* Interactive Hotspots */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse cursor-pointer" 
                         title="USB Port" />
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-primary rounded-full animate-pulse cursor-pointer" 
                         title="AUX Input" />
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label>Rotatie</Label>
                    <Slider
                      value={[rotation]}
                      onValueChange={(value) => setRotation(value[0])}
                      max={360}
                      min={0}
                      step={5}
                      className="w-full"
                      data-testid="slider-rotation"
                    />
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setRotation(0)}>
                        Reset
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setRotation(rotation + 90)}>
                        90° ↻
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Zoom</Label>
                    <Slider
                      value={[zoom]}
                      onValueChange={(value) => setZoom(value[0])}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                      data-testid="slider-zoom"
                    />
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.2))}>
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <MousePointer className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Klik hotspots</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">360° draaien</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <ZoomIn className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Zoom details</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Car Fit Visualizer */}
          <TabsContent value="fit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="w-6 h-6 text-primary" />
                  <span>Car Fit Visualizer</span>
                  <Badge variant="secondary">AR-Like</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-video bg-muted/20 rounded-2xl relative overflow-hidden border-2 border-dashed border-muted-foreground/30">
                  {carFitImage ? (
                    <img src={carFitImage} alt="Dashboard" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Upload je dashboard foto</h3>
                      <p className="text-muted-foreground mb-6">
                        We overlayden de Alpine hoofdunit op je dashboard voor perfecte fit visualisatie
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()} data-testid="button-upload-dashboard">
                        <Upload className="w-4 h-4 mr-2" />
                        Dashboard Foto Uploaden
                      </Button>
                    </div>
                  )}
                  
                  {carFitImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-slate-800 rounded-lg p-4 shadow-2xl border-2 border-primary/50">
                        <div className="text-white text-center">
                          <div className="font-bold">ALPINE CDE-W296BT</div>
                          <div className="text-xs opacity-80 mt-1">Perfect Fit ✓</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setCarFitImage(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4 text-center">
                      <div className="text-green-600 dark:text-green-400 font-semibold mb-1">✓ Perfect Fit</div>
                      <div className="text-sm text-muted-foreground">Dimensies matchen exact</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4 text-center">
                      <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">180 x 50mm</div>
                      <div className="text-sm text-muted-foreground">Standard DIN formaat</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4 text-center">
                      <div className="text-orange-600 dark:text-orange-400 font-semibold mb-1">~iPhone formaat</div>
                      <div className="text-sm text-muted-foreground">Voor referentie</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Installation Preview */}
          <TabsContent value="install" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="w-6 h-6 text-primary" />
                  <span>Installation Preview</span>
                  <Badge variant="secondary">Step by Step</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {installSteps.map((step, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all ${
                        index === installStep ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setInstallStep(index)}
                      data-testid={`step-${index}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index <= installStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <Badge variant="outline">{step.time}</Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔧</div>
                    <h3 className="text-xl font-semibold mb-2">
                      Stap {installStep + 1}: {installSteps[installStep].title}
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      {installSteps[installStep].description}
                    </p>
                    <Badge className="mt-4">
                      Geschatte tijd: {installSteps[installStep].time}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Totale installatietijd</h4>
                      <div className="text-2xl font-bold text-primary">60 minuten</div>
                      <p className="text-sm text-muted-foreground">Inclusief testen en kalibratie</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Installatie kosten</h4>
                      <div className="text-2xl font-bold text-primary">€89</div>
                      <p className="text-sm text-muted-foreground">Door gecertificeerde monteur</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tech Specs Visualizer */}
          <TabsContent value="specs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <span>Tech Specs Visualizer</span>
                  <Badge variant="secondary">Interactive</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Power Level: {powerLevel[0]}W</Label>
                    <Slider
                      value={powerLevel}
                      onValueChange={setPowerLevel}
                      max={200}
                      min={10}
                      step={5}
                      className="w-full"
                      data-testid="slider-power"
                    />
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground">RMS Power</div>
                        <div className="text-lg font-bold">{powerLevel[0]}W</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground">Peak Power</div>
                        <div className="text-lg font-bold">{powerLevel[0] * 2}W</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground">Kwaliteit</div>
                        <div className="text-lg font-bold">
                          {powerLevel[0] > 150 ? '🔥' : powerLevel[0] > 100 ? '⭐' : '✓'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Power vs Kwaliteit</h4>
                    <div className="h-48 bg-muted/20 rounded-lg p-4 relative">
                      <div className="h-full flex items-end space-x-2">
                        {[20, 40, 60, 80, 100, 120, 150, 180, 200].map((power) => (
                          <div key={power} className="flex-1 flex flex-col items-center">
                            <div 
                              className={`w-full rounded-t transition-all duration-300 ${
                                power <= powerLevel[0] ? 'bg-primary' : 'bg-muted'
                              }`}
                              style={{ height: `${(power / 200) * 100}%` }}
                            />
                            <div className="text-xs mt-1 text-muted-foreground">
                              {power}W
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="font-medium">
                        {powerLevel[0] <= 50 && "Basic kwaliteit - geschikt voor dagelijks gebruik"}
                        {powerLevel[0] > 50 && powerLevel[0] <= 100 && "Goede kwaliteit - merkbare verbetering"}
                        {powerLevel[0] > 100 && powerLevel[0] <= 150 && "Premium kwaliteit - uitstekende audio"}
                        {powerLevel[0] > 150 && "Audiofiel niveau - beste mogelijk geluid"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Builder */}
          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-6 h-6 text-primary" />
                  <span>Interactive Product Builder</span>
                  <Badge variant="secondary">Configurator</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Preview */}
                  <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl flex items-center justify-center relative">
                    <div 
                      className="w-64 h-40 rounded-lg shadow-2xl transition-all duration-300 flex items-center justify-center"
                      style={{ backgroundColor: productColors[selectedColor as keyof typeof productColors].hex }}
                    >
                      <div className="text-white text-center">
                        <div className="text-xl font-bold">ALPINE</div>
                        <div className="text-sm opacity-80">CDE-W296BT</div>
                        <div className="text-xs opacity-60 mt-1">
                          {productColors[selectedColor as keyof typeof productColors].name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-background rounded-lg p-2 shadow-lg">
                      <div className="text-sm text-muted-foreground">Live Preview</div>
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold">Kleur Selectie</Label>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {Object.entries(productColors).map(([key, color]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedColor(key)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedColor === key ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                            data-testid={`color-${key}`}
                          >
                            <div 
                              className="w-8 h-8 rounded-full mx-auto mb-2 border"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="text-sm font-medium">{color.name}</div>
                            {color.price > 0 && (
                              <div className="text-xs text-muted-foreground">+€{color.price}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold">Alpine CDE-W296BT</span>
                          <Badge variant="outline">Custom Build</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Basis prijs:</span>
                            <span>€{basePrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{productColors[selectedColor as keyof typeof productColors].name}:</span>
                            <span>€{productColors[selectedColor as keyof typeof productColors].price}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Totaal:</span>
                            <span className="text-primary">€{currentPrice}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4" data-testid="button-add-custom-product">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Voeg Custom Product Toe
                        </Button>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <Settings className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <div className="text-sm font-medium">Real-time Preview</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <div className="text-sm font-medium">Custom Pricing</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Impressed? Dit is pas het begin!</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Deze features maken jouw webshop uniek in de markt. Geen enkele concurrent heeft dit niveau van interactiviteit.
              Klanten zullen versteld staan van de professionele ervaring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Sparkles className="w-5 h-5 mr-2" />
                Implementeer in Live Shop
              </Button>
              <Button size="lg" variant="outline">
                <Car className="w-5 h-5 mr-2" />
                Bekijk Meer Demos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}