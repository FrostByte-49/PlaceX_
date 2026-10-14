import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, DollarSign, Building, Clock, Briefcase, TrendingUp, Filter, ChevronRight } from 'lucide-react';

interface Drive {
  id: string;
  title: string;
  company_id: string;
  drive_date: string;
  application_deadline: string;
  package_lpa: number;
  role: string;
  location: string;
  status: string;
  companies: {
    name: string;
    industry: string;
  };
}

export default function Drives() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const { data, error } = await supabase
        .from('placement_drives')
        .select(
          `
          *,
          companies (
            name,
            industry
          )
        `
        )
        .order('drive_date', { ascending: true });

      if (error) throw error;
      setDrives(data || []);
    } catch (error) {
      console.error('Error fetching drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrives = drives.filter((drive) => {
    if (filter === 'all') return true;
    return drive.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: 'bg-primary-50 text-primary-700 border-primary-200',
      ongoing: 'bg-secondary-50 text-secondary-700 border-secondary-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'upcoming': return <Clock className="w-3 h-3" />;
      case 'ongoing': return <TrendingUp className="w-3 h-3" />;
      default: return null;
    }
  };

  // Get count for each status
  const getStatusCount = (status: string) => {
    if (status === 'all') return drives.length;
    return drives.filter(d => d.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Placement Drives...</p>
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
                Placement Drives
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Browse & apply for upcoming placement opportunities
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Briefcase className="w-4 h-4 text-primary-200" />
              <span className="text-white text-sm font-medium">{drives.length} Total Drives</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-2">
        <div className="flex justify-between gap-3 flex-wrap">
          {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-lg capitalize transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                filter === status
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <span>{status === 'all' ? 'All Drives' : status}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === status 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-300 text-gray-700'
              }`}>
                {getStatusCount(status)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">No placement drives found</p>
          <p className="text-gray-500 text-sm mt-1">Check back later for new opportunities</p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredDrives.length}</span> out of <span className="font-semibold text-gray-900">{drives.length}</span> drives
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>Sorted by drive date</span>
            </div>
          </div>

          {/* Drives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive, index) => (
              <div
                key={drive.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Company header banner */}
                <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {drive.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm font-medium">{drive.companies?.name}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusBadge(drive.status)}`}>
                      {getStatusIcon(drive.status)}
                      <span>{drive.status}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="p-1 bg-primary-50 rounded-md">
                        <DollarSign className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm">
                        <span className="font-semibold">₹{drive.package_lpa} LPA</span>
                        <span className="text-gray-500 text-xs ml-1">package</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="p-1 bg-primary-50 rounded-md">
                        <MapPin className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm">{drive.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="p-1 bg-primary-50 rounded-md">
                        <Calendar className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm">
                        <span className="font-medium">Drive Date:</span> {new Date(drive.drive_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-orange-50 rounded-md">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm text-orange-700 font-medium">
                        Apply by: {new Date(drive.application_deadline).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => (window.location.href = `/drives/${drive.id}`)}
                    className="w-full group/btn relative overflow-hidden px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}