"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fileCategories } from "@/lib/utils/file-types";
import { useAdminSettings } from "@/lib/store/admin-settings";
import { useHistoryStore } from "@/lib/store/history";
import { useFavoritesStore } from "@/lib/store/favorites";
import Link from "next/link";
import { 
  Cog6ToothIcon, 
  ChartBarIcon, 
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'settings' | 'content'>('overview');
  const { history, clearHistory } = useHistoryStore();
  const { favorites } = useFavoritesStore();
  
  const {
    maintenanceMode,
    maintenanceMessage,
    maxFileSize,
    enabledTools,
    siteTitle,
    siteDescription,
    enableAnalytics,
    enableNotifications,
    setMaintenanceMode,
    setMaintenanceMessage,
    setMaxFileSize,
    toggleTool,
    setSiteTitle,
    setSiteDescription,
    setEnableAnalytics,
    setEnableNotifications,
    resetSettings,
  } = useAdminSettings();

  const totalTools = fileCategories.reduce((acc, cat) => 
    acc + cat.types.reduce((sum, type) => sum + type.tools.length, 0), 0
  );
  
  const workingTools = fileCategories.reduce((acc, cat) => 
    acc + cat.types.reduce((sum, type) => 
      sum + type.tools.filter(t => t.status === 'working').length, 0
    ), 0
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'tools', label: 'Tools', icon: WrenchScrewdriverIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
    { id: 'content', label: 'Content', icon: DocumentTextIcon },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your FileTools website</p>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all"
        >
          View Site
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Tools', value: totalTools, color: 'blue' },
              { label: 'Working Tools', value: workingTools, color: 'green' },
              { label: 'Total Conversions', value: history.length, color: 'purple' },
              { label: 'Favorite Tools', value: favorites.length, color: 'yellow' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  maintenanceMode
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                }`}
              >
                <ShieldCheckIcon className="h-6 w-6 mb-2" />
                <p className="font-semibold">{maintenanceMode ? 'Disable' : 'Enable'} Maintenance</p>
              </button>
              
              <button
                onClick={clearHistory}
                className="p-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <ArrowPathIcon className="h-6 w-6 mb-2" />
                <p className="font-semibold">Clear History</p>
              </button>
              
              <button
                onClick={resetSettings}
                className="p-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <Cog6ToothIcon className="h-6 w-6 mb-2" />
                <p className="font-semibold">Reset Settings</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div>
                    <p className="font-medium">{item.fileName}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.toolName}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-center text-zinc-500 py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {fileCategories.map((category) => (
            <div key={category.name} className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">{category.name}</h2>
              <div className="space-y-4">
                {category.types.map((type) => (
                  <div key={type.extension}>
                    <h3 className="font-semibold mb-2">{type.name} (.{type.extension})</h3>
                    <div className="space-y-2">
                      {type.tools.map((tool) => {
                        const toolId = `${type.extension}-${tool.name}`;
                        const isEnabled = enabledTools[toolId] !== false;
                        return (
                          <div
                            key={toolId}
                            className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{tool.name}</p>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                tool.status === 'working'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                              }`}>
                                {tool.status}
                              </span>
                              <button
                                onClick={() => toggleTool(toolId)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                  isEnabled
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}
                              >
                                {isEnabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Site Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Title</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Site Description</label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Max File Size (MB)</label>
                <input
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Maintenance Mode</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Maintenance Mode</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Disable site access for maintenance</p>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    maintenanceMode ? 'bg-red-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Message</label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Features</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Track site usage and statistics</p>
                </div>
                <button
                  onClick={() => setEnableAnalytics(!enableAnalytics)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableAnalytics ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableAnalytics ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Show success/error notifications</p>
                </div>
                <button
                  onClick={() => setEnableNotifications(!enableNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableNotifications ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Content Management</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Content management features coming soon. This will include homepage content, testimonials, and feature management.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
