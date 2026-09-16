// js/api.js
// Small helper functions used by every page to talk to the backend.

var API_URL = 'http://localhost:5000';

async function apiGet(path) {
  var response = await fetch(API_URL + path);
  var data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

async function apiPost(path, body) {
  var response = await fetch(API_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  var data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

async function apiPut(path, body) {
  var response = await fetch(API_URL + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  var data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

async function apiDelete(path) {
  var response = await fetch(API_URL + path, { method: 'DELETE' });
  var data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

// Shows a message under a form (green for success, red for error)
function showStatus(element, message, isError) {
  element.textContent = message;
  element.hidden = false;
  if (isError) {
    element.classList.add('status--error');
  } else {
    element.classList.remove('status--error');
  }
}

// Turns text into safe HTML so a song/album/artist name can never
// break the page or inject HTML tags.
function escapeHtml(text) {
  if (text === null || text === undefined) {
    return '';
  }
  var tempDiv = document.createElement('div');
  tempDiv.textContent = text;
  return tempDiv.innerHTML;
}
