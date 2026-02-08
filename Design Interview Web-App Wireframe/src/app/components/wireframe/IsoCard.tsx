interface IsoCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function IsoCard({ children, className = '', color = 'bg-white' }: IsoCardProps) {
  return (
    <div className="relative" style={{ perspective: '1000px' }}>
      <div 
        className={`border-2 border-black ${color} p-4 ${className}`}
        style={{
          transform: 'rotateX(2deg) rotateY(-2deg)',
          boxShadow: '6px 6px 0px rgba(0,0,0,1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
