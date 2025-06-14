import React from 'react'

interface ButtonProps {
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    children?: React.ReactNode
    textColor?: string
    bgColor?: string
    borderColor?: string
    disabled?: boolean
    onClick?: () => void
    className?: string
}

const Button: React.FC<ButtonProps> = ({
    leftIcon,
    rightIcon,
    children,
    textColor = 'text-white',
    bgColor = 'bg-gray-800',
    borderColor = '',
    disabled = false,
    onClick,
    className = '',
}) => {
    const icon = leftIcon || rightIcon
    const hasText = children && React.Children.count(children) > 0

    const borderClasses = borderColor ? `border ${borderColor}` : ''

    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`
        inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium
        transition-all duration-200 ease-in-out cursor-pointer
        ${bgColor} ${textColor} ${borderClasses}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}
        ${!hasText && icon ? 'aspect-square p-2' : ''}
        ${className}
      `
                .trim()
                .replace(/\s+/g, ' ')}
        >
            {leftIcon && leftIcon}
            {hasText && <span>{children}</span>}
            {rightIcon && rightIcon}
        </button>
    )
}

export default Button
