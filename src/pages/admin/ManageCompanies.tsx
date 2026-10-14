import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Building2, Plus, Globe, Mail, Phone, ExternalLink, 
  Edit, Trash2, Search, Filter, Briefcase,
  Award, X,
  Save, Info, TrendingUp, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  description: string;
  logo_url: string | null;
}

export default function ManageCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
    contact_email: '',
    contact_phone: ''
  });

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCompanies(data as Company[]);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update(formData)
          .eq('id', editingCompany.id);

        if (error) throw error;
        toast.success('Company updated successfully');
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([formData]);

        if (error) throw error;
        toast.success('Company added successfully');
      }
      
      setShowAddForm(false);
      setEditingCompany(null);
      setFormData({ name: '', industry: '', website: '', description: '', contact_email: '', contact_phone: '' });
      fetchCompanies();
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast.error(error.message || 'Failed to save company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete ${company.name}? This will also remove all associated placement drives.`)) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);

      if (error) throw error;
      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry || '',
      website: company.website || '',
      description: company.description || '',
      contact_email: company.contact_email || '',
      contact_phone: company.contact_phone || ''
    });
    setShowAddForm(true);
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <p className="text-gray-600 font-medium animate-pulse">Loading Companies...</p>
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
                Manage Companies
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Add & manage your recruiting partners
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3">
                <Building2 className="w-4 h-4 text-primary-200" />
                <span className="text-white text-sm font-medium">{companies.length} Total Partners</span>
              </div>
              <button
                onClick={() => {
                  setEditingCompany(null);
                  setFormData({ name: '', industry: '', website: '', description: '', contact_email: '', contact_phone: '' });
                  setShowAddForm(!showAddForm);
                }}
                className="flex items-center gap-2 px-5 py-2.25 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg"
              >
                {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAddForm ? 'Cancel' : 'Add New Company'}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
      </div>

      {/* Search Section */}
      {companies.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name, industry, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 pr-4 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
                </h2>
              </div>
              <button 
                onClick={() => { setShowAddForm(false); setEditingCompany(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-500" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Google, Microsoft, Amazon"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary-500" />
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Finance, Healthcare"
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary-500" />
                    Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary-500" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="hr@company.com"
                    value={formData.contact_email}
                    onChange={e => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary-500" />
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.contact_phone}
                    onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary-500" />
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Company description, mission, values, etc."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setEditingCompany(null); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving...' : (editingCompany ? 'Update Company' : 'Add Company')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {companies.length === 0 ? (
              <Building2 className="w-12 h-12 text-gray-400" />
            ) : (
              <Search className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <p className="text-gray-600 text-lg font-medium">
            {companies.length === 0 ? 'No companies added yet' : 'No matching companies found'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {companies.length === 0 
              ? 'Click the "Add New Company" button to get started'
              : 'Try adjusting your search query'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          {searchTerm && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> out of <span className="font-semibold text-gray-900">{companies.length}</span> companies
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter className="w-4 h-4" />
                <span>Sorted by name</span>
              </div>
            </div>
          )}

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
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <Building2 className="w-7 h-7 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {company.name}
                        </h3>
                        {company.industry && (
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${getIndustryColor(company.industry)}`}>
                            {company.industry}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                        title="Edit Company"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(company)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        title="Delete Company"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 min-h-[60px]">
                    {company.description || 'No description provided.'}
                  </p>

                  {/* Contact Info */}
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
                    {company.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{company.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick Stats Section */}
      {companies.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">Total Partners</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{companies.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Active Recruiters</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{companies.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-600">Industries</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {new Set(companies.map(c => c.industry).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-gray-600">Placement Drives</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
          </div>
        </div>
      )}
    </div>
  );
}