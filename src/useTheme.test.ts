import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from './useTheme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.unstubAllGlobals()
})

describe('useTheme persistence', () => {
  it('restores dark mode when localStorage contains "dark"', () => {
    localStorage.setItem('theme', 'dark')

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('restores light mode when localStorage contains "light"', () => {
    localStorage.setItem('theme', 'light')

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('persists the chosen mode to localStorage after toggling', () => {
    localStorage.setItem('theme', 'light')
    const { result } = renderHook(() => useTheme())

    act(() => { result.current.toggle() })

    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
