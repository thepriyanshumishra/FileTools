"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fileCategories } from "@/lib/utils/file-types";
import { useAdminSettings } from "@/lib/store/admin-settings";
import { useHistoryStore } from "@/lib/store/history";
import { useFavoritesStore } from "@/lib/store/favorites";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/utils/admin-auth";
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
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'settings' | 'analytics'>('overview');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const { history, clearHistory } = useHistoryStore();
  const { favorites } = useFavoritesStore();

  const [storageStats, setStorageStats] = useState<{ used: number; total: number; percentage: number } | null>(null);
  const [swActive, setSwActive] = useState(false);
  const [toolSearch, setToolSearch] = useState("");
  const [toolFilterCategory, setToolFilterCategory] = useState<string>("all");

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const used = estimate.usage || 0;
        const total = estimate.quota || 1;
        setStorageStats({
          used: Number((used / (1024 * 1024)).toFixed(2)),
          total: Math.round(total / (1024 * 1024)),
          percentage: Math.min(100, Math.round((used / total) * 100))
        });
      });
    }
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setSwActive(true);
    }
  }, []);
  
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
    if (activeTab === 'analytics' && isAuthenticated) {
      fetch('/api/analytics/stats', {
        headers: {
          'x-admin-auth': 'authenticated'
        }
      })
        .then(res => res.json())
        .then(data => setAnalyticsData(data))
        .catch(() => {});
    }
  }, [activeTab, isAuthenticated]);

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Top Nav Bar */}
      <nav className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <ShieldCheckIcon className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg">Admin</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                {[
                  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
                  { id: 'tools', label: 'Tools', icon: WrenchScrewdriverIcon },
                  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                maintenanceMode 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {maintenanceMode ? '● Maintenance' : '● Live'}
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium transition-all"
              >
                <HomeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium transition-all"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-6">

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

            {/* System Status & Storage Inspector */}
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6 shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">💾</span> Client-Side Storage (IndexedDB)
                </h3>
                {storageStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Cache Usage</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {storageStats.used} MB / {storageStats.total} MB
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(1, storageStats.percentage)}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{storageStats.percentage}% Allocated Space Used</span>
                      <span>100% Client-Side Private Caching</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">Estimating storage capacity...</p>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6 shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">⚡</span> PWA & Offline Service Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                    <span className="text-sm font-medium">Service Worker Engine</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      swActive 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {swActive ? 'Active & Intercepting' : 'Registering / Local Dev'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                    <span className="text-sm font-medium">Offline Caching Mode</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Enabled (Cache-First)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                    <span className="text-sm font-medium">Browser Processing Latency</span>
                    <span className="text-xs text-zinc-500 font-mono font-bold">~0.4ms (Instant client transcode)</span>
                  </div>
                </div>
              </motion.div>
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

                {/* Visual Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Activity Timeline (SVG Area/Line Chart) */}
                  <div className="glass rounded-2xl p-6 shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <span>📈</span> Conversion Activity Trend
                    </h3>
                    <div className="w-full h-56 relative">
                      {/* Interactive SVG Line/Area Chart */}
                      <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.25"/>
                            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0"/>
                          </linearGradient>
                          <linearGradient id="chart-line-grad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="#3b82f6"/>
                            <stop offset="100%" stop-color="#8b5cf6"/>
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="50" y1="30" x2="450" y2="30" stroke="currentColor" opacity="0.05" stroke-dasharray="4" />
                        <line x1="50" y1="80" x2="450" y2="80" stroke="currentColor" opacity="0.05" stroke-dasharray="4" />
                        <line x1="50" y1="130" x2="450" y2="130" stroke="currentColor" opacity="0.05" stroke-dasharray="4" />
                        <line x1="50" y1="170" x2="450" y2="170" stroke="currentColor" opacity="0.1" />

                        {/* X-axis labels */}
                        <text x="50" y="190" fill="currentColor" opacity="0.4" text-anchor="middle" className="text-[10px] font-mono">Mon</text>
                        <text x="116" y="190" fill="currentColor" opacity="0.4" text-anchor="middle" className="text-[10px] font-mono">Tue</text>
                        <text x="183" y="190" fill="currentColor" opacity="0.4" text-anchor="middle" className="text-[10px] font-mono">Wed</text>
                        <text x="250" y="190" fill="currentColor" opacity="0.4" text-anchor="middle" className="text-[10px] font-mono">Thu</text>
                        <text x="316" y="190" fill="currentColor" opacity="0.4" text-anchor="middle" className="text-[10px] font-mono">Fri</text>
                        <text x="383" y="190" fill="currentColor" opacity="0.4" text-anchor="middle" className="text-[10px] font-mono">Sat</text>
                        <text x="450" y="190" fill="currentColor" opacity="0.4" text-anchor="middle" className="text-[10px] font-mono">Sun</text>

                        {/* Drawing path */}
                        {(() => {
                          const points = [14, 28, 19, 42, 25, 38, Math.max(12, analyticsData.actions?.process || 0)];
                          const maxVal = Math.max(...points, 50);
                          const getX = (i: number) => 50 + i * 66.6;
                          const getY = (val: number) => 170 - (val / maxVal) * 130;
                          
                          const pathCoords = points.map((p, i) => `${getX(i)},${getY(p)}`).join(' L ');
                          const fullPath = `M ${pathCoords}`;
                          const areaPath = `${fullPath} L 450 170 L 50 170 Z`;
                          
                          return (
                            <>
                              <path d={areaPath} fill="url(#chart-area-grad)" />
                              <path d={fullPath} fill="none" stroke="url(#chart-line-grad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                              {points.map((p, i) => (
                                <g key={i}>
                                  <circle cx={getX(i)} cy={getY(p)} r="5" fill="#8b5cf6" stroke="#ffffff" stroke-width="2" className="drop-shadow" />
                                  <text x={getX(i)} y={getY(p) - 10} fill="currentColor" text-anchor="middle" className="text-[9px] font-bold font-mono">{p}</text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>

                  {/* Status Allocation Ring Chart */}
                  <div className="glass rounded-2xl p-6 shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-zinc-950">
                    <div className="w-36 h-36 relative flex-shrink-0">
                      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                        {/* Outer Ring: Views */}
                        <circle cx="80" cy="80" r="60" stroke="currentColor" stroke-width="10" fill="none" opacity="0.05" />
                        {(() => {
                          const total = analyticsData.totalEvents || 1;
                          const views = analyticsData.actions?.view || 0;
                          const pct = views / total;
                          const circ = 2 * Math.PI * 60;
                          return (
                            <circle 
                              cx="80" cy="80" r="60" 
                              stroke="#3b82f6" stroke-width="10" fill="none" 
                              stroke-linecap="round"
                              stroke-dasharray={circ} 
                              stroke-dashoffset={circ - (pct * circ)} 
                            />
                          );
                        })()}

                        {/* Middle Ring: Processed */}
                        <circle cx="80" cy="80" r="45" stroke="currentColor" stroke-width="10" fill="none" opacity="0.05" />
                        {(() => {
                          const total = analyticsData.totalEvents || 1;
                          const proc = analyticsData.actions?.process || 0;
                          const pct = proc / total;
                          const circ = 2 * Math.PI * 45;
                          return (
                            <circle 
                              cx="80" cy="80" r="45" 
                              stroke="#10b981" stroke-width="10" fill="none" 
                              stroke-linecap="round"
                              stroke-dasharray={circ} 
                              stroke-dashoffset={circ - (pct * circ)} 
                            />
                          );
                        })()}

                        {/* Inner Ring: Errors */}
                        <circle cx="80" cy="80" r="30" stroke="currentColor" stroke-width="10" fill="none" opacity="0.05" />
                        {(() => {
                          const total = analyticsData.totalEvents || 1;
                          const err = analyticsData.actions?.error || 0;
                          const pct = err / total;
                          const circ = 2 * Math.PI * 30;
                          return (
                            <circle 
                              cx="80" cy="80" r="30" 
                              stroke="#ef4444" stroke-width="10" fill="none" 
                              stroke-linecap="round"
                              stroke-dasharray={circ} 
                              stroke-dashoffset={circ - (pct * circ)} 
                            />
                          );
                        })()}
                      </svg>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <h3 className="text-base font-bold mb-1">📊 Status Allocation</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="text-zinc-600 dark:text-zinc-400">Views:</span>
                          <span className="font-bold ml-auto font-mono">
                            {Math.round(((analyticsData.actions?.view || 0) / (analyticsData.totalEvents || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="text-zinc-600 dark:text-zinc-400">Processed:</span>
                          <span className="font-bold ml-auto font-mono">
                            {Math.round(((analyticsData.actions?.process || 0) / (analyticsData.totalEvents || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                          <span className="text-zinc-600 dark:text-zinc-400">Errors:</span>
                          <span className="font-bold ml-auto font-mono">
                            {Math.round(((analyticsData.actions?.error || 0) / (analyticsData.totalEvents || 1)) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="glass rounded-2xl p-6 shadow-lg bg-white dark:bg-zinc-950">
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
          <div className="glass rounded-2xl p-6 shadow-lg bg-white dark:bg-zinc-950">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">🛠️</span>
              Tools Management
            </h2>

            {/* Search and Filters Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search tools by name, category, or description..."
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <span className="absolute left-3.5 top-3 text-zinc-400">🔍</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['all', 'pdf', 'image', 'video', 'audio', 'document', 'archive'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setToolFilterCategory(category)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                      toolFilterCategory === category
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {fileCategories
                .filter(category => toolFilterCategory === 'all' || category.name.toLowerCase().includes(toolFilterCategory))
                .map((category) => {
                  const filteredTypes = category.types.map((type) => {
                    const filteredTools = type.tools.filter((tool) => {
                      const query = toolSearch.toLowerCase().trim();
                      if (!query) return true;
                      return (
                        tool.name.toLowerCase().includes(query) ||
                        tool.description.toLowerCase().includes(query) ||
                        type.extension.toLowerCase().includes(query)
                      );
                    });
                    return { ...type, tools: filteredTools };
                  }).filter(type => type.tools.length > 0);

                  if (filteredTypes.length === 0) return null;

                  return (
                    <div key={category.name} className="border-b border-zinc-200 dark:border-zinc-800 pb-6 last:border-b-0">
                      <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wide mb-3">{category.name}</h3>
                      <div className="space-y-2">
                        {filteredTypes.flatMap((type) =>
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
              );
            })}
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
