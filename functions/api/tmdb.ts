export async function tmdbFetch(path: string, env: any) {
  const response = await fetch(`https://api.themoviedb.org/3${path}`, {
    headers: {
      Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    return new Response(
      JSON.stringify({ error: "TMDB error", status: response.status, text }),
      { status: 500 }
    );
  }

  return response.json();
}
