"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fileCategories } from "@/lib/utils/file-types";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [maintenanceMode, setMaintenanceMode] = useState<
    Record<string, boolean>
  >({});
  const [categoryOrder, setCategoryOrder] = useState<string[]>(
    fileCategories.map((cat) => cat.name)
  );

  const toggleMaintenance = (toolId: string) => {
    setMaintenanceMode((prev) => ({
      ...prev,
      [toolId]: !prev[toolId],
    }));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link
          href="/"
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          View Site
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Tool Management */}
        <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800">
          <h2 className="mb-4 text-xl font-semibold">Tool Management</h2>
          <div className="space-y-6">
            {fileCategories.map((category) => (
              <div key={category.name} className="space-y-4">
                <h3 className="font-medium">{category.name}</h3>
                <div className="space-y-2">
                  {category.types.map((type) =>
                    type.tools.map((tool) => {
                      const toolId = `${type.extension}-${tool.name}`;
                      return (
                        <div
                          key={toolId}
                          className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900"
                        >
                          <div>
                            <p className="font-medium">
                              {type.extension.toUpperCase()} - {tool.name}
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {tool.description}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleMaintenance(toolId)}
                            className={`rounded-full px-3 py-1 text-sm ${
                              maintenanceMode[toolId]
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {maintenanceMode[toolId] ? "Maintenance" : "Active"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Order */}
        <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800">
          <h2 className="mb-4 text-xl font-semibold">Category Order</h2>
          <div className="space-y-2">
            {categoryOrder.map((categoryName, index) => (
              <motion.div
                key={categoryName}
                layout
                className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900"
              >
                <span>{categoryName}</span>
                <div className="flex gap-2">
                  {index > 0 && (
                    <button
                      onClick={() => {
                        const newOrder = [...categoryOrder];
                        [newOrder[index], newOrder[index - 1]] = [
                          newOrder[index - 1],
                          newOrder[index],
                        ];
                        setCategoryOrder(newOrder);
                      }}
                      className="rounded-lg bg-zinc-200 p-1 text-sm dark:bg-zinc-700"
                    >
                      ↑
                    </button>
                  )}
                  {index < categoryOrder.length - 1 && (
                    <button
                      onClick={() => {
                        const newOrder = [...categoryOrder];
                        [newOrder[index], newOrder[index + 1]] = [
                          newOrder[index + 1],
                          newOrder[index],
                        ];
                        setCategoryOrder(newOrder);
                      }}
                      className="rounded-lg bg-zinc-200 p-1 text-sm dark:bg-zinc-700"
                    >
                      ↓
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section className="col-span-full rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800">
          <h2 className="mb-4 text-xl font-semibold">Statistics</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total Conversions", value: "0" },
              { label: "Active Tools", value: "15" },
              {
                label: "Tools in Maintenance",
                value: Object.values(maintenanceMode)
                  .filter(Boolean)
                  .length.toString(),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
