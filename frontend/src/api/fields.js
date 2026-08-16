export async function fetchFields(searchQuery = '') {
  const url = searchQuery
    ? `/api/fields?q=${encodeURIComponent(searchQuery)}`
    : '/api/fields';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch fields');
  }
  return response.json();
}

// TODO: remove later if still unused
export async function fetchFieldById(fieldId) {
  const response = await fetch(`/api/fields/${fieldId}`);
  if (!response.ok) {
    throw new Error('Field not found');
  }
  return response.json();
}

export async function fetchFieldSlots(fieldId, date) {
  const response = await fetch(`/api/fields/${fieldId}/slots?date=${encodeURIComponent(date)}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch field slots');
  }
  return response.json();
}

export async function bookFieldSlot(
  fieldId,
  { date, slot, type = 'standard', tournamentId = null }
) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required to book a field');
  }

  const response = await fetch(`/api/fields/${fieldId}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      date,
      slot,
      type,
      tournamentId
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Booking failed');
  }

  return response.json();
}

export async function cancelBooking(fieldId, bookingId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/fields/${fieldId}/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to cancel booking');
  }

  return response.json();
}

export async function fetchUserBookings(userId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/users/${userId}/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch user bookings');
  }

  return response.json();
}
