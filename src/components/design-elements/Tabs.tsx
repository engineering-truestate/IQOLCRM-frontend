import React from 'react'

interface TabsProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const Tabs = ({ children, onClick }: TabsProps) => {
  return (
    <div
      className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 cursor-pointer"
      onClick={onClick}
    >
       {children}
    </div>

  )
}

export default Tabs