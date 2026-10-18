import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'taskflow_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  const saveToken = useCallback((t) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, saveToken, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
