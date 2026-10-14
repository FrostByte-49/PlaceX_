import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, GraduationCap, TrendingUp, Award, PieChart as PieChartIcon, BarChart as BarChartIcon, Sparkles } from 'lucide-react';

interface BranchStats {
  branch: string;
  count: number;
}

export default function Stats() {
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('branch')
        .eq('role', 'student');

      const branchCount: { [key: string]: number } = {};
      let total = 0;
      
      profiles?.forEach((profile) => {
        if (profile.branch) {
          branchCount[profile.branch] = (branchCount[profile.branch] || 0) + 1;
          total++;
        }
      });

      const stats = Object.entries(branchCount).map(([branch, count]) => ({
        branch,
        count,
      }));

      setBranchStats(stats);
      setTotalStudents(total);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-primary-600">
            Students: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-xl">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="relative px-6 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                Statistics & Analytics
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Placement insights & Student Distribution Analytics
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <TrendingUp className="w-4 h-4 text-primary-200" />
              <span className="text-white text-sm font-medium">Live Analytics</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
          <p className="text-sm text-gray-600 mt-1">Total Students</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{branchStats.length}</p>
          <p className="text-sm text-gray-600 mt-1">Branches</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <Sparkles className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-600 mt-1">Average Package (LPA)</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100/30 px-6 py-4 border-b border-primary-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-100 rounded-lg">
                <PieChartIcon className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Branch-wise Distribution</h2>
            </div>
          </div>
          <div className="p-6">
            {branchStats.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No data available</p>
                <p className="text-sm text-gray-500 mt-1">Student data will appear here</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={branchStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="branch"
                  >
                    {branchStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => (
                      <span className="text-sm text-gray-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 px-6 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <BarChartIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Branch Statistics</h2>
            </div>
          </div>
          <div className="p-6">
            {branchStats.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChartIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No data available</p>
                <p className="text-sm text-gray-500 mt-1">Student data will appear here</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={branchStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="branch" 
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    axisLine={{ stroke: '#9ca3af' }}
                  />
                  <YAxis 
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    axisLine={{ stroke: '#9ca3af' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={() => <span className="text-sm text-gray-700">Number of Students</span>}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    name="Number of Students"
                    radius={[8, 8, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Additional Insights Section */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-secondary-50 to-secondary-100/30 px-6 py-4 border-b border-secondary-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-secondary-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-secondary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Placement Insights</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 text-center hover:shadow-md transition-all duration-300">
              <div className="inline-flex p-2 bg-blue-50 rounded-lg mb-3">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Average Package</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">10 LPA</p>
              <p className="text-xs text-gray-500 mt-2">Across All Branches</p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 text-center hover:shadow-md transition-all duration-300">
              <div className="inline-flex p-2 bg-green-50 rounded-lg mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Highest Package</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">32 LPA</p>
              <p className="text-xs text-gray-500 mt-2">Top Performer</p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 text-center hover:shadow-md transition-all duration-300">
              <div className="inline-flex p-2 bg-purple-50 rounded-lg mb-3">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Placement Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">100%</p>
              <p className="text-xs text-gray-500 mt-2">Students Placed</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-800 text-center flex items-center justify-center gap-2">
              <BarChartIcon className="w-4 h-4" />
              <span>Detailed placement statistics will be available once drives are completed and data is collected.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}