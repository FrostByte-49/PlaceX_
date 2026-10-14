import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../../../src/components/auth/ProtectedRoute'
import * as useAuthHook from '../../../src/hooks/useAuth'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: (props: any) => {
      mockNavigate(props)
      return null
    }
  }
})

describe('ProtectedRoute', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={ui} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders loading state when loading is true', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      loading: true,
      user: null,
      userRole: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to /login when user is unauthenticated', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      loading: false,
      user: null,
      userRole: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login', replace: true })
  })

  it('renders children when authenticated and no allowedRoles are specified', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      loading: false,
      user: { id: '123' } as any,
      userRole: 'student',
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /dashboard if user lacks required allowedRoles', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      loading: false,
      user: { id: '123' } as any,
      userRole: 'student',
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    
    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard', replace: true })
  })

  it('renders children if user has required allowedRoles', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      loading: false,
      user: { id: '123' } as any,
      userRole: 'admin',
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    
    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
