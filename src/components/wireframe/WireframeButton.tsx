interface WireframeButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit';
}

export function WireframeButton({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    className = '',
    disabled = false,
    type = 'button'
}: WireframeButtonProps) {
    const baseStyles = 'border-2 border-black font-mono uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-black text-white hover:bg-gray-800',
        secondary: 'bg-gray-200 text-black hover:bg-gray-300',
        outline: 'bg-white text-black hover:bg-gray-100'
    };

    const sizeStyles = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-6 py-2 text-sm',
        lg: 'px-8 py-3 text-base'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            style={{
                boxShadow: '3px 3px 0px rgba(0,0,0,1)'
            }}
        >
            {children}
        </button>
    );
}
