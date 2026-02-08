interface WireframeInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
}

export function WireframeInput({ 
  placeholder, 
  value, 
  onChange, 
  className = '',
  type = 'text'
}: WireframeInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border-2 border-gray-400 bg-gray-50 px-4 py-2 font-mono text-sm focus:border-black focus:outline-none ${className}`}
      style={{
        boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
      }}
    />
  );
}
