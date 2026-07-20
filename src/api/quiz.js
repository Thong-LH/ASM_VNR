const API_URL = 'https://vnr202-r1m8.onrender.com';

async function parseResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Đã xảy ra lỗi');
  return data;
}

export async function startQuiz(username) {
  const res = await fetch(`${API_URL}/api/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  return parseResponse(res);
}

export async function submitQuiz(username, answers) {
  const res = await fetch(`${API_URL}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, answers }),
  });
  return parseResponse(res);
}

export async function fetchScoreboard() {
  const res = await fetch(`${API_URL}/api/scoreboard`);
  return parseResponse(res);
}
