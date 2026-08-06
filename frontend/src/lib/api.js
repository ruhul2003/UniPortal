const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchNotices() {
  try {
    const res = await fetch(`${API_BASE}/notices`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch notices');
    const data = await res.json();
    return data.notices || [];
  } catch (err) {
    console.warn('[API Client] Notice fetch error, using fallback state:', err.message);
    return [];
  }
}

export async function createNotice(noticeData) {
  const res = await fetch(`${API_BASE}/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticeData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create notice');
  }
  return await res.json();
}

export async function deleteNotice(id) {
  const res = await fetch(`${API_BASE}/notices/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete notice');
  return await res.json();
}

export async function fetchRoutines() {
  try {
    const res = await fetch(`${API_BASE}/routines`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch routines');
    const data = await res.json();
    return data.routines || [];
  } catch (err) {
    console.warn('[API Client] Routine fetch error:', err.message);
    return [];
  }
}

export async function createRoutine(routineData) {
  const res = await fetch(`${API_BASE}/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routineData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add routine slot');
  }
  return await res.json();
}

export async function deleteRoutine(id) {
  const res = await fetch(`${API_BASE}/routines/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete routine');
  return await res.json();
}

export async function fetchAnnouncements() {
  try {
    const res = await fetch(`${API_BASE}/announcements`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch announcements');
    const data = await res.json();
    return data.announcements || [];
  } catch (err) {
    console.warn('[API Client] Announcement fetch error:', err.message);
    return [];
  }
}

export async function createAnnouncement(announcementData) {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(announcementData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to post announcement');
  }
  return await res.json();
}

export async function deleteAnnouncement(id) {
  const res = await fetch(`${API_BASE}/announcements/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete announcement');
  return await res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Invalid credentials');
  }
  return data.user;
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Registration failed');
  }
  return data.user;
}

export async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    console.warn('[API Client] User fetch error:', err.message);
    return [];
  }
}

export async function toggleUserCR(userId, isCR) {
  const res = await fetch(`${API_BASE}/users/${userId}/cr`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCR }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update CR status');
  }
  return await res.json();
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${API_BASE}/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update user role');
  }
  return await res.json();
}

export async function deleteUser(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
  return await res.json();
}

export async function updateUserProfile(userId, updateData) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update profile');
  }
  return await res.json();
}
