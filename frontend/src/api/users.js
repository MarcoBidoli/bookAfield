export async function fetchUsers(query = '') {
  const trimmedQuery = query.trim()
  const endpoint = trimmedQuery ? `/api/users?q=${encodeURIComponent(trimmedQuery)}` : '/api/users'

  const response = await fetch(endpoint)

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Failed to fetch users')
  }

  return response.json()
}

export async function fetchUserById(userId) {
  const response = await fetch(`/api/users/${userId}`)

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'User not found')
  }

  return response.json()
}
