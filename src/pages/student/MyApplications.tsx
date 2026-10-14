import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  ExternalLink,
  Award,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Application {
  id: string;
  application_date: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'selected' | 'offered';
  placement_drives: {
    id: string;
    title: string;
    role: string;
    package_lpa: number;
    companies: {
      name: string;
      logo_url?: string;
    } | null;
  } | null;
}

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          application_date,
          status,
          placement_drives (
            id,
            title,
            role,
            package_lpa,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('student_id', user.id)
        .order('application_date', { ascending: false });

      if (error) throw error;
      setApplications((data as unknown) as Application[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2, text: 'Shortlisted', bgGradient: 'from-blue-50 to-blue-100/30' };
      case 'selected':
      case 'offered':
        return { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, text: 'Selected / Offered', bgGradient: 'from-green-50 to-green-100/30' };
      case 'rejected':
        return { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, text: 'Not Proceeding', bgGradient: 'from-red-50 to-red-100/30' };
      case 'pending':
      default:
        return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, text: 'In Review', bgGradient: 'from-yellow-50 to-yellow-100/30' };
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const drive = app.placement_drives;
    const matchesSearch = searchTerm === '' || 
      drive?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive?.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Your Applications...</p>
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
                My Applications
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Track the status of your placement drive applications
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Briefcase className="w-4 h-4 text-primary-200" />
              <span className="text-white text-sm font-medium">{applications.length} Total Applications</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
      </div>

      {/* Search and Filter Section */}
      {applications.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by company, role, or drive title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 pr-4 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-4">
            {['all', 'pending', 'shortlisted', 'selected', 'rejected'].map((status) => {
              const statusConfig = status !== 'all' ? getStatusConfig(status) : null;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white shadow-md'
                      : status === 'all'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : `${statusConfig?.color} hover:opacity-80`
                  }`}
                >
                  <span>{status === 'all' ? 'All Applications' : status}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    statusFilter === status 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {getStatusCount(status)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results count */}
      {applications.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredApplications.length}</span> out of <span className="font-semibold text-gray-900">{applications.length}</span> applications
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Sorted By Latest First</span>
          </div>
        </div>
      )}

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {applications.length === 0 ? (
              <Briefcase className="w-12 h-12 text-gray-400" />
            ) : (
              <Search className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
          </h2>
          <p className="text-gray-600 mb-6">
            {applications.length === 0 
              ? "You haven't applied to any placement drives yet."
              : "No applications match your current filters."}
          </p>
          {applications.length === 0 ? (
            <Link
              to="/drives"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
            >
              Explore Placement Drives
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app, index) => {
            const drive = app.placement_drives;
            const company = drive?.companies;
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={app.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Status bar */}
                <div className={`h-1.5 bg-gradient-to-r ${statusConfig.bgGradient} from-${statusConfig.color.split(' ')[0].replace('bg-', '')}-500 to-primary-500`}></div>
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {company?.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <Building2 className="w-7 h-7 text-primary-600" />
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.text}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {drive?.role || drive?.title}
                      </h3>
                      <p className="text-gray-600 font-medium text-sm">{company?.name || 'Unknown Company'}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-gray-700 text-sm">
                        <div className="p-1 bg-primary-50 rounded-md mr-2">
                          <Briefcase className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                        <span className="font-medium">
                          {drive?.package_lpa ? `₹${drive.package_lpa} LPA` : 'Package not specified'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-700 text-sm">
                        <div className="p-1 bg-primary-50 rounded-md mr-2">
                          <CalendarDays className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                        <span className="font-medium">
                          Applied: {new Date(app.application_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/drives/${drive?.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-6 bg-gray-50 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-all duration-300 font-semibold text-sm group/btn"
                  >
                    View Drive Details
                    <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats Section */}
      {applications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-4 border border-yellow-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-xs text-gray-600">Pending</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount('pending')}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">Shortlisted</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount('shortlisted')}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Selected/Offered</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount('selected') + getStatusCount('offered')}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount('rejected')}</p>
          </div>
        </div>
      )}
    </div>
  );
}