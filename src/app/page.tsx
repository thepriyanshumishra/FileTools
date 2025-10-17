"use client";

import { motion } from "framer-motion";
import { fileCategories } from "@/lib/utils/file-types";
import Link from "next/link";
import { useFavoritesStore } from "@/lib/store/favorites";
import { StarIcon } from "@heroicons/react/24/solid";
import { 
  DocumentArrowUpIcon, 
  BoltIcon, 
  ShieldCheckIcon, 
  CloudArrowUpIcon,
  SparklesIcon,
  RocketLaunchIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";

export default function HomePage() {
  const { favorites } = useFavoritesStore();
  
  // Get favorite tools
  const favoriteTools = favorites.map(fav => {
    const [extension, toolName] = fav.split('-');
    const fileType = fileCategories
      .flatMap(cat => cat.types)
      .find(t => t.extension === extension);
    const tool = fileType?.tools.find(t => t.name === toolName);
    return { extension, toolName, fileType, tool };
  }).filter(f => f.fileType && f.tool);

  const stats = [
    { label: "File Types", value: "44+" },
    { label: "Tools Available", value: "150+" },
    { label: "100% Free", value: "Always" },
  ];

  const features = [
    {
      icon: BoltIcon,
      title: "Lightning Fast",
      description: "Process files instantly in your browser",
    },
    {
      icon: ShieldCheckIcon,
      title: "100% Secure",
      description: "Files never leave your device",
    },
    {
      icon: CloudArrowUpIcon,
      title: "No Upload Needed",
      description: "Everything runs locally",
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative mb-20 overflow-hidden rounded-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient" />
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>
        <div className="relative z-10 py-16 text-center backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium">
              <SparklesIcon className="h-4 w-4 text-purple-500" />
              <span>Free Forever • No Sign Up Required</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold md:text-6xl lg:text-7xl">
              Process Files
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"> Instantly</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 md:text-xl">
              Convert, compress, and edit your files right in your browser. Fast, secure, and completely free.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="#tools"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <RocketLaunchIcon className="h-5 w-5 relative z-10" />
                <span className="relative z-10">Get Started</span>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-300 px-8 py-4 font-semibold transition-all hover:border-purple-500 hover:bg-purple-50 dark:border-zinc-700 dark:hover:border-purple-500 dark:hover:bg-purple-950/30"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="mb-2 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent break-words">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 break-words">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose FileTools?</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Everything you need to work with files, right in your browser
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-8"
            >
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-3">
                <feature.icon className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold break-words">{feature.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 break-words">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Favorites Section */}
      {favoriteTools.length > 0 && (
        <section className="mb-20">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold md:text-4xl">Your Favorites</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Quick access to your most used tools
              </p>
            </div>
            <StarIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteTools.map(({ extension, toolName, fileType, tool }, index) => (
              <motion.div
                key={`${extension}-${toolName}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/tools/${extension}`}
                  className="glass hover-card group block rounded-2xl p-6 transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${fileType?.color} opacity-10 blur-2xl rounded-full -mr-12 -mt-12`} />
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        {fileType?.name}
                      </span>
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{toolName}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {tool?.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Tools Section */}
      <section id="tools" className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">All Tools</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Choose from our collection of powerful file processing tools
          </p>
        </div>

        {/* Convert Files Card - Featured */}
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
            <div className="glass relative z-10 flex items-center gap-4 rounded-lg p-6">
              <DocumentArrowUpIcon className="h-10 w-10 text-purple-500" />
              <div>
                <h3 className="text-2xl font-semibold">Universal File Converter</h3>
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
      </section>

      {/* Testimonials Section */}
      <section className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Trusted by Users Worldwide</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Join thousands who process files securely every day
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Sarah Chen",
              role: "Designer",
              text: "Perfect for quick image conversions. No upload wait times!",
              rating: 5,
            },
            {
              name: "Mike Johnson",
              role: "Developer",
              text: "Love that everything runs locally. Privacy-first approach.",
              rating: 5,
            },
            {
              name: "Emma Davis",
              role: "Content Creator",
              text: "Fast, free, and easy to use. My go-to tool for file processing.",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400 break-words">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold break-words">{testimonial.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 break-words">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="mb-20">
        <h2 className="mb-8 text-center text-2xl font-semibold">Coming Soon</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "AI-Powered Tools",
              description: "Enhance images, remove noise, and extract text with AI",
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
                <span className={`inline-block rounded-lg ${feature.color} p-3`} />
              </div>
              <h3 className="mb-2 text-lg font-medium break-words">{feature.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 break-words">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
