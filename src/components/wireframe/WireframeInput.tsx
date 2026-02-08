interface WireframeInputProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    type?: string;
    disabled?: boolean;
    required?: boolean;
}

export function WireframeInput({
    placeholder,
    value,
    onChange,
    className = '',
    type = 'text',
    disabled = false,
    required = false
}: WireframeInputProps) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`border-2 border-gray-400 bg-gray-50 px-4 py-2 font-mono text-sm focus:border-black focus:outline-none disabled:opacity-50 ${className}`}
            style={{
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
            }}
        />
    );
}
