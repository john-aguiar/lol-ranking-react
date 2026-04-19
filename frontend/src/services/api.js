
const API = "http://localhost:3000"

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.error || data.message || `HTTP ${res.status}`
    throw new Error(message)
  }
  return data
}

export async function apiGet(url) {
  const res = await fetch(API + url)
  return handleResponse(res)
}

export async function apiPost(url, data) {
  const res = await fetch(API + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function apiPut(url, data) {
  const res = await fetch(API + url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function apiDelete(url) {
  const res = await fetch(API + url, {
    method: 'DELETE'
  })
  return handleResponse(res)
}

console.log("Chamando API...");