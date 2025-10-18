"use client";

import { useState, useEffect } from "react";
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
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'settings' | 'analytics'>('overview');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
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

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetch('/api/analytics/stats')
        .then(res => res.json())
        .then(data => setAnalyticsData(data))
        .catch(() => {});
    }
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-purple-50/20 to-blue-50/20 dark:from-zinc-900 dark:via-purple-950/10 dark:to-blue-950/10">
      {/* Header */}
      <div className="glass border-b border-zinc-200/50 dark:border-zinc-800/50 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage your FileTools platform</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all"
            >
              <HomeIcon className="h-4 w-4" />
              View Site
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            { id: 'tools', label: 'Tools', icon: WrenchScrewdriverIcon },
            { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'glass shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'glass text-zinc-700 dark:text-zinc-300 hover:shadow-md'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Tools', value: totalTools, color: 'from-blue-500 to-blue-600', icon: '🛠️' },
                { label: 'Working', value: workingTools, color: 'from-green-500 to-green-600', icon: '✅' },
                { label: 'Conversions', value: history.length, color: 'from-purple-500 to-purple-600', icon: '📊' },
                { label: 'Favorites', value: favorites.length, color: 'from-yellow-500 to-yellow-600', icon: '⭐' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl rounded-full -mr-12 -mt-12`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{stat.label}</p>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Quick Actions
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    maintenanceMode
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  }`}
                >
                  <ShieldCheckIcon className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold">{maintenanceMode ? 'Disable' : 'Enable'} Maintenance</p>
                    <p className="text-xs opacity-75">Site {maintenanceMode ? 'is down' : 'is live'}</p>
                  </div>
                </button>
                
                <button
                  onClick={clearHistory}
                  className="p-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-3"
                >
                  <ArrowPathIcon className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold">Clear History</p>
                    <p className="text-xs text-zinc-500">Remove all records</p>
                  </div>
                </button>
                
                <button
                  onClick={resetSettings}
                  className="p-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-3"
                >
                  <Cog6ToothIcon className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold">Reset Settings</p>
                    <p className="text-xs text-zinc-500">Restore defaults</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Recent Activity
              </h2>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.fileName}</p>
                        <p className="text-xs text-zinc-500">{item.toolName}</p>
                      </div>
                      <span className="text-xs text-zinc-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 py-8">No recent activity</p>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsData ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="glass rounded-2xl p-6 shadow-lg">
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Total Events</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                      {analyticsData.totalEvents}
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-6 shadow-lg">
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Tool Views</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                      {analyticsData.actions?.view || 0}
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-6 shadow-lg">
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Processed</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                      {analyticsData.actions?.process || 0}
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-6 shadow-lg">
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Errors</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                      {analyticsData.actions?.error || 0}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="glass rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span>🔥</span> Popular Tools
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.tools || {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10).map(([tool, count]: any) => (
                        <div key={tool} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <span className="font-medium text-sm">{tool}</span>
                          <span className="text-sm text-zinc-500">{count} uses</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span>🌐</span> Browser Distribution
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.browsers || {}).map(([browser, count]: any) => (
                        <div key={browser} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <span className="font-medium text-sm">{browser}</span>
                          <span className="text-sm text-zinc-500">{count} users</span>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-bold mb-4 mt-6 flex items-center gap-2">
                      <span>📱</span> Device Distribution
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.devices || {}).map(([device, count]: any) => (
                        <div key={device} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <span className="font-medium text-sm">{device}</span>
                          <span className="text-sm text-zinc-500">{count} users</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass rounded-2xl p-12 shadow-lg text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400 font-medium">Loading analytics...</p>
              </div>
            )}
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="glass rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">🛠️</span>
              Tools Management
            </h2>
            <div className="space-y-6">
              {fileCategories.map((category) => (
                <div key={category.name}>
                  <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wide mb-3">{category.name}</h3>
                  <div className="space-y-2">
                    {category.types.flatMap((type) =>
                      type.tools.map((tool) => {
                        const toolId = `${type.extension}-${tool.name}`;
                        const isEnabled = enabledTools[toolId] !== false;
                        return (
                          <div
                            key={toolId}
                            className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                                  .{type.extension}
                                </span>
                                <p className="font-medium">{tool.name}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  tool.status === 'working'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                }`}>
                                  {tool.status}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-1">{tool.description}</p>
                            </div>
                            <button
                              onClick={() => toggleTool(toolId)}
                              className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isEnabled
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              {isEnabled ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Site Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Title</label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Site Description</label>
                  <textarea
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Max File Size (MB)</label>
                  <input
                    type="number"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Settings are auto-saved via Zustand store
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideInRight';
                    toast.textContent = '✓ Settings saved successfully!';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                  }}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Save Configuration
                </motion.button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🚧</span>
                Maintenance Mode
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div>
                    <p className="font-medium">Enable Maintenance Mode</p>
                    <p className="text-sm text-zinc-500">Disable site access for maintenance</p>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      maintenanceMode ? 'bg-red-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Maintenance Message</label>
                    <button
                      onClick={() => setMaintenanceMessage("We're currently performing scheduled maintenance. We'll be back soon!")}
                      className="text-xs px-3 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
                    >
                      Reset to Default
                    </button>
                  </div>
                  <textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    rows={3}
                    placeholder="We're currently performing scheduled maintenance. We'll be back soon!"
                    className="w-full px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-zinc-500 mt-2">This message will be displayed to users when maintenance mode is enabled.</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideInRight';
                    toast.textContent = '✓ Maintenance settings saved!';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                  }}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Save Maintenance Settings
                </motion.button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Features
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-zinc-500">Track site usage and statistics</p>
                  </div>
                  <button
                    onClick={() => setEnableAnalytics(!enableAnalytics)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      enableAnalytics ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      enableAnalytics ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-zinc-500">Show success/error notifications</p>
                  </div>
                  <button
                    onClick={() => setEnableNotifications(!enableNotifications)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      enableNotifications ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      enableNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideInRight';
                    toast.textContent = '✓ Feature settings saved!';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                  }}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Save Feature Settings
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
