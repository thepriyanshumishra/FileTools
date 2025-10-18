import Link from "next/link";
import { HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-2xl">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            404
          </h1>
        </div>
        
        <h2 className="mb-4 text-3xl font-bold md:text-4xl animate-slideInLeft">
          Page Not Found
        </h2>
        
        <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400 animate-slideInRight">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 active:scale-95"
          >
            <HomeIcon className="h-5 w-5" />
            Go Home
          </Link>
          
          <Link
            href="/#tools"
            className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-300 px-6 py-3 font-semibold transition-all hover:border-purple-500 hover:bg-purple-50 hover:scale-105 active:scale-95 dark:border-zinc-700 dark:hover:border-purple-500 dark:hover:bg-purple-950/30"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            Browse Tools
          </Link>
        </div>
      </div>
    </main>
  );
}
