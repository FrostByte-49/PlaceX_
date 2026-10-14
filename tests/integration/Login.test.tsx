import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from '../../src/pages/Login'
import * as useAuthHook from '../../src/hooks/useAuth'
import { toast } from 'react-hot-toast'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}))

const mockSignIn = vi.fn()

describe('Login Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      loading: false,
      user: null,
      userRole: null,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
  })

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByText('Welcome to PlaceX')).toBeInTheDocument()
  })

  it('handles successful login and redirects to /dashboard', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ user: { id: '123' } })
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitBtn = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@college.edu')
    await user.type(passwordInput, 'password123')
    await user.click(submitBtn)

    expect(mockSignIn).toHaveBeenCalledWith('test@college.edu', 'password123')
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error toast on invalid credentials', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValueOnce(new Error('Invalid login credentials'))
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitBtn = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'wrong@college.edu')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid login credentials')
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
