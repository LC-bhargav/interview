interface WireframeTextProps {
    children: React.ReactNode;
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
    className?: string;
}

export function WireframeText({ children, variant = 'body', className = '' }: WireframeTextProps) {
    const variants = {
        h1: 'text-3xl font-bold font-mono uppercase tracking-wide',
        h2: 'text-2xl font-bold font-mono uppercase',
        h3: 'text-xl font-semibold font-mono uppercase',
        body: 'text-base font-mono',
        caption: 'text-sm font-mono text-gray-600'
    };

    return (
        <div className={`${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}
