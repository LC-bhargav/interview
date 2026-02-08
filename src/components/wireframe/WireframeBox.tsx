interface WireframeBoxProps {
    children?: React.ReactNode;
    className?: string;
    dashed?: boolean;
    onClick?: () => void;
}

export function WireframeBox({ children, className = '', dashed = false, onClick }: WireframeBoxProps) {
    return (
        <div
            className={`border-2 ${dashed ? 'border-dashed' : 'border-solid'} border-gray-400 bg-white ${className}`}
            style={{
                boxShadow: '3px 3px 0px rgba(0,0,0,0.1)'
            }}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
