import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAuth } from '../../../src/hooks/useAuth'
import * as AuthContextModule from '../../../src/context/AuthContext'

describe('useAuth hook', () => {
  it('returns AuthContext value if within AuthProvider', () => {
    const mockContextValue = {
      loading: false,
      user: { id: 'testUser' } as any,
      userRole: 'admin',
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    }
    
    vi.spyOn(AuthContextModule, 'useAuthContext').mockReturnValue(mockContextValue)
    
    const { result } = renderHook(() => useAuth())
    expect(result.current).toBe(mockContextValue)
    expect(result.current.userRole).toBe('admin')
    expect(result.current.user?.id).toBe('testUser')
  })
})
