export async function fetchTournaments() {
  const response = await fetch('/api/tournaments');
  if (!response.ok) {
    throw new Error("Failed to fetch tournaments");
  }
  return response.json();
}

