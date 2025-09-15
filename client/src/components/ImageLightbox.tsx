import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  isOpen: boolean;
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, isOpen, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      data-testid="lightbox-overlay"
    >
      <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 rounded-full p-3"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          data-testid="button-close-lightbox"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/10 rounded-full p-3"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              data-testid="button-previous-lightbox"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/10 rounded-full p-3"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              data-testid="button-next-lightbox"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </>
        )}

        {/* Main Image */}
        <div 
          className="relative flex items-center justify-center w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[currentIndex]}
            alt={`Product afbeelding ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            data-testid={`lightbox-image-${currentIndex}`}
          />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
            {images.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-primary shadow-lg scale-110' 
                    : 'border-white/30 hover:border-white/60'
                }`}
                style={{ backgroundImage: `url(${image})` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                data-testid={`lightbox-thumbnail-${index}`}
              >
                <div className="w-full h-full bg-cover bg-center rounded-md" style={{ backgroundImage: `url(${image})` }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}