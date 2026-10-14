import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage helper functions with proper typing
export const storage = {
  // Upload resume for a student
  uploadResume: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/resume.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { upsert: true })
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)
    
    return { data, publicUrl }
  },
  
  // Upload company logo (admin only)
  uploadCompanyLogo: async (companyId: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${companyId}/logo.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, { upsert: true })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName)
    
    return { data, publicUrl }
  },
  
  // Upload offer letter (admin only)
  uploadOfferLetter: async (userId: string, companyName: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${companyName}/offer-letter.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('offer-letters')
      .upload(fileName, file, { upsert: true })
    
    if (error) throw error
    
    // For private bucket, get signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('offer-letters')
      .createSignedUrl(fileName, 60 * 60 * 24) // 24 hours expiry
    
    if (signedUrlError) throw signedUrlError
    
    return { data, signedUrl: signedUrlData?.signedUrl }
  },
  
  // Delete resume
  deleteResume: async (userId: string) => {
    // First, list files to find the resume
    const { data: files, error: listError } = await supabase.storage
      .from('resumes')
      .list(userId)
    
    if (listError) throw listError
    
    if (files && files.length > 0) {
      const filePath = `${userId}/${files[0].name}`
      const { error } = await supabase.storage
        .from('resumes')
        .remove([filePath])
      
      if (error) throw error
    }
    
    return true
  },
  
  // Get resume URL
  getResumeUrl: (userId: string, fileName: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(`${userId}/${fileName}`)
    
    return publicUrl
  },
  
  // Get company logo URL
  getCompanyLogoUrl: (companyId: string, fileName: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(`${companyId}/${fileName}`)
    
    return publicUrl
  }
}