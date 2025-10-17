"use client";

import { motion } from "framer-motion";
import { fileCategories } from "@/lib/utils/file-types";
import Link from "next/link";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">FileTools</h1>
      <p className="mb-12 text-center text-lg text-zinc-600 dark:text-zinc-400">
        Your one-stop solution for all file processing needs
      </p>

      {/* Convert Files Card - Always First */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Link
          href="/convert"
          className="group mx-auto block max-w-2xl rounded-xl p-[2px] transition-all duration-300 hover:scale-[1.02] relative
            before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-blue-500 before:to-purple-600 before:transition-all before:duration-300
            after:absolute after:inset-[2px] after:rounded-lg after:bg-gradient-to-br after:from-background after:to-background after:transition-all after:duration-300
            hover:before:opacity-90 hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25"
        >
          <div className="glass relative z-10 flex items-center gap-4 rounded-lg p-4">
            <DocumentArrowUpIcon className="h-8 w-8 text-purple-500" />
            <div>
              <h2 className="text-xl font-semibold">Convert Files</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Convert any file to another format quickly and easily
              </p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Categories */}
      <div className="space-y-12">
        {fileCategories.map((category, index) => (
          <section key={category.name} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="file-category-title">{category.name}</h2>
              <span className="badge rounded-full px-3 py-1 text-sm">
                {category.types.length} File Types
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              {category.description}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.types.map((type) => (
                <motion.div
                  key={type.extension}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Link
                    href={`/tools/${type.extension}`}
                    className="glass hover-card group block rounded-2xl p-6 transition-all h-full flex flex-col relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 ${type.color} opacity-10 blur-3xl rounded-full -mr-16 -mt-16`}
                    />
                    <div className="relative z-10 flex-1 flex flex-col">
                      <h3 className="file-type-title mb-2 text-xl font-bold">
                        {type.name}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          (.{type.extension})
                        </span>
                      </h3>
                      <p className="file-type-description mb-4 flex-1">
                        {type.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {type.tools.slice(0, 3).map((tool) => (
                          <span
                            key={tool.name}
                            className="tool-tag rounded-full px-3 py-1 text-xs"
                          >
                            {tool.name}
                          </span>
                        ))}
                        {type.tools.length > 3 && (
                          <span className="tool-tag rounded-full px-3 py-1 text-xs font-semibold">
                            +{type.tools.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Coming Soon Section */}
      <section className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">Coming Soon</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "AI-Powered Tools",
              description:
                "Enhance images, remove noise, and extract text with AI",
              color: "bg-yellow-500",
            },
            {
              title: "Cloud Sync",
              description: "Sync with Google Drive and Dropbox",
              color: "bg-blue-500",
            },
            {
              title: "Mobile App",
              description: "Process files on the go with our mobile app",
              color: "bg-green-500",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl bg-white/50 p-6 opacity-50 dark:bg-zinc-800/30"
            >
              <div className="mb-4">
                <span
                  className={`inline-block rounded-lg ${feature.color} p-3`}
                />
              </div>
              <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Admin Button */}
      <footer className="mt-16 text-center">
        <Link
          href="/admin"
          className="text-sm text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          I&apos;m Admin
        </Link>
      </footer>
    </main>
  );
}
