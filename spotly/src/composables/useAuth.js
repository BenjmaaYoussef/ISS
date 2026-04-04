import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('spotly_session') || 'null')
    } catch {
      return null
    }
  }

  function logout() {
    localStorage.removeItem('spotly_session')
    router.push('/auth')
  }

  return { getSession, logout }
}
