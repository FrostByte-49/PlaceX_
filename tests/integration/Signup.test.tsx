import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Signup from '../../src/pages/Signup'
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

const mockSignUp = vi.fn()

describe('Signup Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      loading: false,
      user: null,
      userRole: null,
      signIn: vi.fn(),
      signUp: mockSignUp,
      signOut: vi.fn(),
    })
  })

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )
    expect(screen.getByText('Create an Account')).toBeInTheDocument()
  })

  it('handles successful signup and redirects to /login', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValueOnce({ user: { id: '123' } })
    
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Roll Number'), 'CS123')
    await user.type(screen.getByLabelText('Email'), 'john@college.edu')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.selectOptions(screen.getByLabelText('Branch'), 'CS')
    await user.selectOptions(screen.getByLabelText('Current Year'), '2')
    
    const submitBtn = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitBtn)

    expect(mockSignUp).toHaveBeenCalledWith('john@college.edu', 'password123', {
      name: 'John Doe',
      roll_number: 'CS123',
      branch: 'CS',
      current_year: 2,
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Account created! Please check your email for confirmation.')
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('shows error toast on signup failure', async () => {
    const user = userEvent.setup()
    mockSignUp.mockRejectedValueOnce(new Error('Email already taken'))
    
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Roll Number'), 'CS123')
    await user.type(screen.getByLabelText('Email'), 'john@college.edu')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.selectOptions(screen.getByLabelText('Branch'), 'CS')
    await user.selectOptions(screen.getByLabelText('Current Year'), '2')
    
    const submitBtn = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already taken')
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
