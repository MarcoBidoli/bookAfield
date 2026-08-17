// currently fetching /api/users and filtering locally
// TODO: decide if use /api/users?q=query instead
export async function fetchUsers() {
  const response = await fetch('/api/users')

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
