import React from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  onSelect: (id: string) => void;
  brandName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, onSelect, brandName = 'JARVIS-X' }) => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full text-slate-300 select-none">
      <div className="p-5 border-b border-slate-800 font-bold text-xl tracking-wider text-indigo-400">
        {brandName}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              item.active
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
