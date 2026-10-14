import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Building, Globe, Mail, Award, ChevronRight, ExternalLink, Briefcase, TrendingUp } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  contact_email: string;
  description: string;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase.from('companies').select('*').order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique industries for filter
  const industries = ['all', ...new Set(companies.map(c => c.industry).filter(Boolean))];

  // Filter companies based on search and industry
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-100 text-blue-700',
      'IT': 'bg-cyan-100 text-cyan-700',
      'Finance': 'bg-green-100 text-green-700',
      'Banking': 'bg-emerald-100 text-emerald-700',
      'Consulting': 'bg-purple-100 text-purple-700',
      'Manufacturing': 'bg-orange-100 text-orange-700',
      'Healthcare': 'bg-red-100 text-red-700',
      'Education': 'bg-yellow-100 text-yellow-700',
      'Retail': 'bg-pink-100 text-pink-700',
    };
    return colors[industry] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Partner Companies...</p>
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
                Partner Companies
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Companies that have partnered with us for placement opportunities
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Building className="w-4 h-4 text-primary-200" />
              <span className="text-white text-sm font-medium">{companies.length} Total Partners</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search companies by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-11 pr-4 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {industries.length > 1 && (
          <div className="flex flex-wrap gap-4">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                  selectedIndustry === industry
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{industry === 'all' ? 'All Industries' : industry}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  selectedIndustry === industry 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {industry === 'all' 
                    ? companies.length 
                    : companies.filter(c => c.industry === industry).length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">No Companies Found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
          {(searchTerm || selectedIndustry !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedIndustry('all');
              }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> out of <span className="font-semibold text-gray-900">{companies.length}</span> companies
            </p>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <div
                key={company.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header gradient bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Building className="w-7 h-7 text-white" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getIndustryColor(company.industry)}`}>
                      {company.industry || 'General'}
                    </span>
                  </div>

                  {/* Company Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {company.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 min-h-[60px]">
                    {company.description || 'No description available'}
                  </p>

                  {/* Contact & Links */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span className="font-medium">Visit Website</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-all group-hover/link:translate-x-0.5" />
                      </a>
                    )}
                    {company.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{company.contact_email}</span>
                      </div>
                    )}
                  </div>

                  {/* View Drives Button */}
                  <button
                    onClick={() => window.location.href = `/drives?company=${company.id}`}
                    className="w-full mt-6 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 group/btn"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>View Placement Drives</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Statistics Section */}
      {companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
                <p className="text-sm text-gray-600">Partner Companies</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{industries.length - 1}</p>
                <p className="text-sm text-gray-600">Industries</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-sm text-gray-600">Placement Assistance</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}