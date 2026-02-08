interface IsoButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit';
}

export function IsoButton({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    type = 'button'
}: IsoButtonProps) {
    const bgColor = variant === 'primary' ? 'bg-black text-white' : 'bg-white text-black';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`relative border-2 border-black ${bgColor} px-6 py-2 font-mono uppercase text-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            style={{
                boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                transform: 'translateZ(0)',
            }}
        >
            {children}
            {/* Isometric side panels */}
            <div
                className="absolute top-0 right-[-4px] w-[4px] h-full bg-black/40"
                style={{
                    transform: 'skewY(-45deg)',
                    transformOrigin: 'top right',
                }}
            />
            <div
                className="absolute bottom-[-4px] left-0 w-full h-[4px] bg-black/40"
                style={{
                    transform: 'skewX(-45deg)',
                    transformOrigin: 'bottom left',
                }}
            />
        </button>
    );
}
