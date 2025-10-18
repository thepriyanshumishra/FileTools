"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  DocumentIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  MusicalNoteIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { name: "PDF Tools", href: "/tools/pdf", icon: DocumentIcon, color: "from-red-500 to-orange-500" },
    { name: "Image Tools", href: "/tools/jpg", icon: PhotoIcon, color: "from-pink-500 to-rose-500" },
    { name: "Video Tools", href: "/tools/mp4", icon: VideoCameraIcon, color: "from-purple-500 to-indigo-500" },
    { name: "Audio Tools", href: "/tools/mp3", icon: MusicalNoteIcon, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="fixed bottom-24 right-8 z-40">
      {/* Action buttons */}
      <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <Link
            key={action.name}
            href={action.href}
            className={`group flex items-center gap-3 transition-all duration-300`}
            style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
            onClick={() => setIsOpen(false)}
          >
            <span className="hidden group-hover:block text-sm font-medium bg-white dark:bg-zinc-800 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-slideInRight">
              {action.name}
            </span>
            <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${action.color} text-white shadow-lg transition-all hover:scale-110 active:scale-95`}>
              <action.icon className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:shadow-purple-500/50 active:scale-95 ${isOpen ? 'rotate-45' : ''}`}
        aria-label="Quick actions"
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}
