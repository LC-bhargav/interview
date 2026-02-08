import { Image } from 'lucide-react';

interface WireframeImageProps {
  width?: string | number;
  height?: string | number;
  label?: string;
  className?: string;
}

export function WireframeImage({ 
  width = '100%', 
  height = '200px', 
  label = 'IMAGE',
  className = '' 
}: WireframeImageProps) {
  return (
    <div
      className={`border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="mb-2 flex justify-center">
          <Image size={48} strokeWidth={1.5} className="text-gray-500" />
        </div>
        <div className="font-mono text-xs text-gray-500 uppercase">{label}</div>
      </div>
    </div>
  );
}