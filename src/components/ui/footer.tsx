import Link from "next/link";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/50 bg-white/50 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2 font-bold text-xl">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                FileTools
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
              Free online file processing tools. Convert, compress, and edit your files instantly in your browser.
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 font-semibold">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#tools" className="text-zinc-600 hover:text-purple-600 dark:text-zinc-400">All Tools</Link></li>
              <li><Link href="/convert" className="text-zinc-600 hover:text-purple-600 dark:text-zinc-400">File Converter</Link></li>
              <li><Link href="/#features" className="text-zinc-600 hover:text-purple-600 dark:text-zinc-400">Features</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 font-semibold">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin" className="text-zinc-600 hover:text-purple-600 dark:text-zinc-400">Admin</Link></li>
              <li><a href="https://github.com/thepriyanshumishra/FileTools" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-purple-600 dark:text-zinc-400">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} FileTools. All files processed locally in your browser.</p>
        </div>
      </div>
    </footer>
  );
}
