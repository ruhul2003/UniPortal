function getApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return 'https://uni-portal-server-theta.vercel.app/api';
}

async function safeFetchJson(url, options = {}, fallbackError = 'Request failed') {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  
  if (!res.ok) {
    let errorMsg = `${fallbackError} (${res.status})`;
    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        errorMsg = data.error || data.message || errorMsg;
      } catch (e) {}
    }
    throw new Error(errorMsg);
  }

  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return {};
}

export async function fetchNotices() {
  try {
    const apiBase = getApiBase();
    const data = await safeFetchJson(`${apiBase}/notices`, { cache: 'no-store' }, 'Failed to fetch notices');
    return data.notices || [];
  } catch (err) {
    console.warn('[API Client] Notice fetch error, using fallback state:', err.message);
    return [];
  }
}

export async function createNotice(noticeData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticeData),
  }, 'Failed to create notice');
}

export async function deleteNotice(id) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/notices/${id}`, { method: 'DELETE' }, 'Failed to delete notice');
}

export async function fetchRoutines() {
  try {
    const apiBase = getApiBase();
    const data = await safeFetchJson(`${apiBase}/routines`, { cache: 'no-store' }, 'Failed to fetch routines');
    return data.routines || [];
  } catch (err) {
    console.warn('[API Client] Routine fetch error:', err.message);
    return [];
  }
}

export async function createRoutine(routineData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routineData),
  }, 'Failed to add routine slot');
}

export async function updateRoutine(id, routineData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/routines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routineData),
  }, 'Failed to update routine slot');
}

export async function deleteRoutine(id) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/routines/${id}`, { method: 'DELETE' }, 'Failed to delete routine');
}

export async function fetchAnnouncements() {
  try {
    const apiBase = getApiBase();
    const data = await safeFetchJson(`${apiBase}/announcements`, { cache: 'no-store' }, 'Failed to fetch announcements');
    return data.announcements || [];
  } catch (err) {
    console.warn('[API Client] Announcement fetch error:', err.message);
    return [];
  }
}

export async function createAnnouncement(announcementData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(announcementData),
  }, 'Failed to post announcement');
}

export async function deleteAnnouncement(id) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/announcements/${id}`, { method: 'DELETE' }, 'Failed to delete announcement');
}

export async function loginUser(email, password) {
  const apiBase = getApiBase();
  const data = await safeFetchJson(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }, 'Invalid credentials');
  if (!data.success || !data.user) {
    throw new Error(data.error || 'Invalid credentials');
  }
  return data.user;
}

export async function registerUser(userData) {
  const apiBase = getApiBase();
  const data = await safeFetchJson(`${apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }, 'Registration failed');
  if (!data.success || !data.user) {
    throw new Error(data.error || 'Registration failed');
  }
  return data.user;
}

export async function fetchUsers() {
  try {
    const apiBase = getApiBase();
    const data = await safeFetchJson(`${apiBase}/users`, { cache: 'no-store' }, 'Failed to fetch users');
    return data.users || [];
  } catch (err) {
    console.warn('[API Client] User fetch error:', err.message);
    return [];
  }
}

export async function toggleUserCR(userId, isCR) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/users/${userId}/cr`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCR }),
  }, 'Failed to update CR status');
}

export async function updateUserRole(userId, role) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  }, 'Failed to update user role');
}

export async function deleteUser(userId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/users/${userId}`, { method: 'DELETE' }, 'Failed to delete user');
}

// Section Transfer Requests API
export async function fetchSectionRequests(userId) {
  try {
    const apiBase = getApiBase();
    const url = userId ? `${apiBase}/section-requests?userId=${userId}` : `${apiBase}/section-requests`;
    const data = await safeFetchJson(url, { cache: 'no-store' }, 'Failed to fetch section requests');
    return data.requests || [];
  } catch (err) {
    console.warn('[API Client] Section requests fetch error:', err.message);
    return [];
  }
}

export async function createSectionRequest(requestData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/section-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  }, 'Failed to submit section change request');
}

export async function updateSectionRequestStatus(requestId, status, adminComment) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/section-requests/${requestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, adminComment }),
  }, 'Failed to update section request status');
}

export async function cancelSectionRequest(requestId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/section-requests/${requestId}`, {
    method: 'DELETE',
  }, 'Failed to cancel section request');
}

export async function updateUserProfile(userId, updateData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  }, 'Failed to update profile');
}

// ==================== ATTENDANCE API ====================
export async function fetchAttendanceSessions(params = {}) {
  try {
    const apiBase = getApiBase();
    const query = new URLSearchParams(params).toString();
    const data = await safeFetchJson(`${apiBase}/attendance?${query}`, { cache: 'no-store' }, 'Failed to fetch attendance');
    return data.sessions || [];
  } catch (err) {
    console.warn('[API Client] Attendance fetch error:', err.message);
    return [];
  }
}

export async function fetchAttendanceSummary(params = {}) {
  try {
    const apiBase = getApiBase();
    const query = new URLSearchParams(params).toString();
    const data = await safeFetchJson(`${apiBase}/attendance/summary?${query}`, { cache: 'no-store' }, 'Failed to fetch attendance summary');
    return data.summary || [];
  } catch (err) {
    console.warn('[API Client] Attendance summary fetch error:', err.message);
    return [];
  }
}

export async function submitAttendanceSession(sessionData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  }, 'Failed to submit attendance');
}

// ==================== ASSIGNMENTS API ====================
export async function fetchAssignments(section = '') {
  try {
    const apiBase = getApiBase();
    const query = section ? `?section=${encodeURIComponent(section)}` : '';
    const data = await safeFetchJson(`${apiBase}/assignments${query}`, { cache: 'no-store' }, 'Failed to fetch assignments');
    return data.assignments || [];
  } catch (err) {
    console.warn('[API Client] Assignments fetch error:', err.message);
    return [];
  }
}

export async function createAssignment(assignmentData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignmentData),
  }, 'Failed to create assignment');
}

export async function submitAssignmentSolution(assignmentId, submissionData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submissionData),
  }, 'Failed to submit assignment');
}

export async function deleteAssignment(assignmentId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/assignments/${assignmentId}`, { method: 'DELETE' }, 'Failed to delete assignment');
}

// ==================== RESOURCES API ====================
export async function fetchResources(params = {}) {
  try {
    const apiBase = getApiBase();
    const query = new URLSearchParams(params).toString();
    const data = await safeFetchJson(`${apiBase}/resources?${query}`, { cache: 'no-store' }, 'Failed to fetch resources');
    return data.resources || [];
  } catch (err) {
    console.warn('[API Client] Resources fetch error:', err.message);
    return [];
  }
}

export async function createResource(resourceData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resourceData),
  }, 'Failed to upload resource');
}

export async function upvoteResource(resourceId, userId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/resources/${resourceId}/upvote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }, 'Failed to upvote resource');
}

export async function trackResourceDownload(resourceId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/resources/${resourceId}/download`, { method: 'POST' }, 'Failed to track download');
}

export async function deleteResource(resourceId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/resources/${resourceId}`, { method: 'DELETE' }, 'Failed to delete resource');
}

// ==================== FORUM / Q&A API ====================
export async function fetchForumPosts(params = {}) {
  try {
    const apiBase = getApiBase();
    const query = new URLSearchParams(params).toString();
    const data = await safeFetchJson(`${apiBase}/forum?${query}`, { cache: 'no-store' }, 'Failed to fetch forum posts');
    return data.posts || [];
  } catch (err) {
    console.warn('[API Client] Forum fetch error:', err.message);
    return [];
  }
}

export async function createForumPost(postData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/forum`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  }, 'Failed to create discussion post');
}

export async function upvoteForumPost(postId, userId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/forum/${postId}/upvote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }, 'Failed to upvote post');
}

export async function addForumComment(postId, commentData) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/forum/${postId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  }, 'Failed to add answer');
}

export async function verifyForumComment(postId, commentId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/forum/${postId}/comments/${commentId}/verify`, {
    method: 'PATCH',
  }, 'Failed to verify answer');
}

export async function deleteForumPost(postId) {
  const apiBase = getApiBase();
  return await safeFetchJson(`${apiBase}/forum/${postId}`, { method: 'DELETE' }, 'Failed to delete post');
}

