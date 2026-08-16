export async function fetchTournaments(searchQuery = '') {
  const url = searchQuery
    ? `/api/tournaments?q=${encodeURIComponent(searchQuery)}`
    : '/api/tournaments';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tournaments');
  }
  return response.json();
}

export async function fetchTournamentById(id) {
  const response = await fetch(`/api/tournaments/${id}`);
  if (!response.ok) {
    throw new Error('Tournament not found');
  }
  return response.json();
}

export async function createTournament(tournamentData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/tournaments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(tournamentData)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create tournament');
  }

  return response.json();
}

export async function updateTournament(id, updateData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/tournaments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update tournament');
  }

  return response.json();
}

export async function deleteTournament(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/tournaments/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete tournament');
  }

  return response.json();
}

export async function generateTournamentSchedule(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/tournaments/${id}/matches/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate match schedule');
  }

  return response.json();
}

export async function fetchTournamentStandings(id) {
  const response = await fetch(`/api/tournaments/${id}/standings`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch standings');
  }
  return response.json();
}

export async function fetchTournamentMatches(id) {
  const response = await fetch(`/api/tournaments/${id}/matches`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch matches');
  }
  return response.json();
}

export async function fetchTournamentBookings(tournamentId) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `/api/tournaments/${tournamentId}/bookings`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error || 'Failed to load tournament bookings'
    );
  }

  return response.json();
}

export async function assignMatchBooking(matchId, bookingId) {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `/api/matches/${matchId}/bookings`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingId
      })
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error || 'Failed to assign booking'
    );
  }

  return response.json();
}

export async function recordMatchScore(matchId, { scoreA, scoreB }) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/matches/${matchId}/result`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ scoreA, scoreB })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to record match score');
  }

  return response.json();
}
