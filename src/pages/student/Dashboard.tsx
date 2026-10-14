import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Briefcase, Users, Award, TrendingUp, Calendar, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface Stats {
  totalDrives: number;
  activeDrives: number;
  totalApplications: number;
  placementRate: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalDrives: 0,
    activeDrives: 0,
    totalApplications: 0,
    placementRate: 0,
  });
  const [upcomingDrivesList, setUpcomingDrivesList] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { count: totalDrives } = await supabase
        .from('placement_drives')
        .select('*', { count: 'exact', head: true });

      const { count: activeDrives } = await supabase
        .from('placement_drives')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'upcoming');

      let userAppsCount = 0;
      if (user) {
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id);
        userAppsCount = count || 0;
      }

      setStats({
        totalDrives: totalDrives || 0,
        activeDrives: activeDrives || 0,
        totalApplications: userAppsCount,
        placementRate: 0,
      });

      const { data: drives } = await supabase
        .from('placement_drives')
        .select(`
          id, 
          title, 
          drive_date, 
          companies ( name )
        `)
        .eq('status', 'upcoming')
        .order('drive_date', { ascending: true })
        .limit(3);
      
      setUpcomingDrivesList(drives || []);

      if (user) {
         const { data: apps } = await supabase
           .from('applications')
           .select(`
             id, 
             status, 
             application_date, 
             placement_drives ( title, companies ( name ) )
           `)
           .eq('student_id', user.id)
           .order('application_date', { ascending: false })
           .limit(3);
         
         setRecentApplications(apps || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Drives',
      value: stats.totalDrives,
      icon: Briefcase,
      gradient: 'from-primary-500 to-primary-700',
      iconBg: 'from-primary-500 to-primary-600',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Active Drives',
      value: stats.activeDrives,
      icon: TrendingUp,
      gradient: 'from-secondary-500 to-secondary-600',
      iconBg: 'from-secondary-500 to-secondary-600',
      change: '+5%',
      changeType: 'increase',
    },
    {
      title: 'Applications',
      value: stats.totalApplications,
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'from-purple-500 to-purple-600',
      change: '+23%',
      changeType: 'increase',
    },
    {
      title: 'Placement Rate',
      value: `${stats.placementRate}%`,
      icon: Award,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'from-orange-500 to-orange-600',
      change: '+8%',
      changeType: 'increase',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-xl">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="relative px-6 md:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                Welcome Back...
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Here's what's happening with your placement journey today
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-gray-50 to-transparent"></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.iconBg} p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  stat.changeType === 'increase' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                <p className="text-gray-600 text-sm mt-1 font-medium">{stat.title}</p>
              </div>
              
              {stat.title === 'Placement Rate' && stats.placementRate > 0 && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${stats.placementRate}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Drives */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100/30 px-6 py-4 border-b border-primary-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Drives</h2>
              </div>
              <button 
                onClick={() => navigate('/drives')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 transition-colors"
               >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {upcomingDrivesList.length > 0 ? (
              <div className="space-y-4">
                {upcomingDrivesList.map((drive) => (
                  <div key={drive.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-blue-100 text-blue-700`}>
                         <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{drive.title}</p>
                        <p className="text-sm text-gray-500">
                          {drive.companies?.name} &nbsp; | &nbsp; {new Date(drive.drive_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/drives/${drive.id}`)}
                      className="text-xs bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-200 font-medium transition-colors"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No upcoming drives</p>
                <p className="text-sm text-gray-500 mt-1">New drives will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 px-6 py-4 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              </div>
              <button 
                onClick={() => navigate('/my-applications')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 transition-colors"
               >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        app.status === 'selected' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                         <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.placement_drives?.title}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {app.placement_drives?.companies?.name} &nbsp; | &nbsp; {app.status}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(app.application_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No applications yet</p>
                <p className="text-sm text-gray-500 mt-1">Start applying to drives</p>
                <button 
                  onClick={() => navigate('/drives')}
                  className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                 >
                  Browse Drives
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="bg-gradient-to-r from-secondary-50 via-primary-50 to-secondary-50 rounded-xl p-6 border border-secondary-100">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-secondary-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Pro Tip</h3>
            <p className="text-gray-700 text-sm">
              Complete your profile to increase your chances of getting placed. Companies prefer candidates with detailed profiles and verified skills.
            </p>
            <button 
              onClick={() => navigate('/profile')}
              className="mt-3 text-secondary-600 hover:text-secondary-700 text-sm font-medium flex items-center gap-1 transition-colors"
             >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}