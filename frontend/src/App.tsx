import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { TokenInput } from './components/TokenInput'
import { RepositoryList } from './components/RepositoryList'
import { clearAuthToken } from './services/githubApi'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleTokenValidated = (token: string) => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    clearAuthToken()
    setIsAuthenticated(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isAuthenticated ? (
        <TokenInput onTokenValidated={handleTokenValidated} />
      ) : (
        <RepositoryList onLogout={handleLogout} />
      )}
    </ThemeProvider>
  )
}

export default App
