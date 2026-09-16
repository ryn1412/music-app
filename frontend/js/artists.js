// js/artists.js
// Handles the Artists page: loading the table and the create/edit form.

var tbody = document.getElementById('artists-tbody');
var form = document.getElementById('artist-form');
var formTitle = document.getElementById('artist-form-title');
var idField = document.getElementById('artist-id');
var nameField = document.getElementById('artist-name');
var genreField = document.getElementById('artist-genre');
var listenersField = document.getElementById('artist-listeners');
var submitBtn = document.getElementById('artist-submit');
var cancelBtn = document.getElementById('artist-cancel');
var statusEl = document.getElementById('artist-status');

// Get all artists from the server and draw them in the table
async function loadArtists() {
  try {
    var artists = await apiGet('/artists');
    renderArtists(artists);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">' + err.message + '</td></tr>';
  }
}

function renderArtists(artists) {
  if (artists.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No artists yet. Add one above.</td></tr>';
    return;
  }

  var rowsHtml = '';
  for (var i = 0; i < artists.length; i++) {
    var artist = artists[i];
    var listeners = artist.monthly_listeners || 0;
    var genre = artist.genre || '-';

    rowsHtml += '<tr>';
    rowsHtml += '<td>' + artist.artist_id + '</td>';
    rowsHtml += '<td>' + escapeHtml(artist.artist_name) + '</td>';
    rowsHtml += '<td>' + escapeHtml(genre) + '</td>';
    rowsHtml += '<td>' + listeners.toLocaleString() + '</td>';
    rowsHtml += '<td class="row-actions">';
    rowsHtml += '<button type="button" class="btn-link" data-action="edit" data-id="' + artist.artist_id + '">Edit</button>';
    rowsHtml += '<button type="button" class="btn-link btn-link--danger" data-action="delete" data-id="' + artist.artist_id + '">Delete</button>';
    rowsHtml += '</td>';
    rowsHtml += '</tr>';
  }

  tbody.innerHTML = rowsHtml;
}

// Puts the form back to "add new" mode
function resetForm() {
  form.reset();
  idField.value = '';
  formTitle.textContent = 'Add an artist';
  submitBtn.textContent = 'Add artist';
  cancelBtn.hidden = true;
}

// Handle the form being submitted (works for both add and edit)
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  var name = nameField.value.trim();
  if (name === '') {
    showStatus(statusEl, 'Name is required.', true);
    return;
  }

  var payload = {
    artist_name: name,
    genre: genreField.value.trim(),
    monthly_listeners: Number(listenersField.value) || 0
  };

  try {
    if (idField.value) {
      // idField has a value, so we are updating an existing artist
      await apiPut('/artists/' + idField.value, payload);
      showStatus(statusEl, 'Artist updated.', false);
    } else {
      // idField is empty, so this is a brand new artist
      await apiPost('/artists', payload);
      showStatus(statusEl, 'Artist added.', false);
    }
    resetForm();
    loadArtists();
  } catch (err) {
    showStatus(statusEl, err.message, true);
  }
});

cancelBtn.addEventListener('click', resetForm);

// Listen for clicks on the Edit/Delete buttons inside the table.
// We put one listener on the whole table instead of one per row.
tbody.addEventListener('click', async function (event) {
  var button = event.target.closest('button');
  if (!button) {
    return;
  }

  var action = button.dataset.action;
  var id = button.dataset.id;

  if (action === 'edit') {
    try {
      var artist = await apiGet('/artists/' + id);
      idField.value = artist.artist_id;
      nameField.value = artist.artist_name;
      genreField.value = artist.genre || '';
      listenersField.value = artist.monthly_listeners || 0;
      formTitle.textContent = 'Editing ' + artist.artist_name;
      submitBtn.textContent = 'Update artist';
      cancelBtn.hidden = false;
      nameField.focus();
    } catch (err) {
      showStatus(statusEl, err.message, true);
    }
  }

  if (action === 'delete') {
    var confirmed = confirm('Delete this artist? Their albums and songs will be deleted too.');
    if (!confirmed) {
      return;
    }
    try {
      await apiDelete('/artists/' + id);
      showStatus(statusEl, 'Artist deleted.', false);
      loadArtists();
    } catch (err) {
      showStatus(statusEl, err.message, true);
    }
  }
});

// Load the table as soon as the page opens
loadArtists();
