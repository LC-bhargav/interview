interface MacWindowProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

export function MacWindow({ children, title = 'Window', className = '' }: MacWindowProps) {
    return (
        <div className={`border-2 border-black bg-white ${className}`}
            style={{
                boxShadow: '4px 4px 0px rgba(0,0,0,1)'
            }}
        >
            {/* Mac Title Bar */}
            <div className="border-b-2 border-black bg-gray-100 px-4 py-3 flex items-center gap-2">
                {/* Traffic Lights */}
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-black bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full border-2 border-black bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full border-2 border-black bg-green-400"></div>
                </div>
                {/* Title */}
                <div className="flex-1 text-center font-mono text-sm font-bold uppercase">
                    {title}
                </div>
                <div className="w-16"></div> {/* Spacer for centering */}
            </div>
            {/* Content */}
            <div>{children}</div>
        </div>
    );
}
