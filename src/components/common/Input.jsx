const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  error,
  touched,
  className = '',
  ...props
}) => {
  const hasError = touched && error;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
          }`}
        {...props}
      />
      {hasError && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
