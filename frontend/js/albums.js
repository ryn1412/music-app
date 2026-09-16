// js/albums.js
// Handles the Albums page: loading the table, the artist dropdown,
// and the create/edit form.

var tbody = document.getElementById('albums-tbody');
var form = document.getElementById('album-form');
var formTitle = document.getElementById('album-form-title');
var idField = document.getElementById('album-id');
var nameField = document.getElementById('album-name');
var artistField = document.getElementById('album-artist');
var yearField = document.getElementById('album-year');
var listensField = document.getElementById('album-listens');
var submitBtn = document.getElementById('album-submit');
var cancelBtn = document.getElementById('album-cancel');
var statusEl = document.getElementById('album-status');

// We keep the list of artists around so we can show artist names
// in the table without asking the server for each one separately.
var allArtists = [];

function findArtistById(id) {
  for (var i = 0; i < allArtists.length; i++) {
    if (String(allArtists[i].artist_id) === String(id)) {
      return allArtists[i];
    }
  }
  return null;
}

// Fill the "Artist" dropdown with every artist in the database
async function loadArtistOptions() {
  allArtists = await apiGet('/artists');

  if (allArtists.length === 0) {
    artistField.innerHTML = '<option value="">Add an artist first</option>';
    return;
  }

  var optionsHtml = '';
  for (var i = 0; i < allArtists.length; i++) {
    optionsHtml += '<option value="' + allArtists[i].artist_id + '">' + escapeHtml(allArtists[i].artist_name) + '</option>';
  }
  artistField.innerHTML = optionsHtml;
}

async function loadAlbums() {
  try {
    var albums = await apiGet('/albums');
    renderAlbums(albums);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">' + err.message + '</td></tr>';
  }
}

function renderAlbums(albums) {
  if (albums.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">No albums yet. Add one above.</td></tr>';
    return;
  }

  var rowsHtml = '';
  for (var i = 0; i < albums.length; i++) {
    var album = albums[i];
    var artist = findArtistById(album.artist_id);
    var artistName = artist ? artist.artist_name : ('#' + album.artist_id);
    var listens = album.number_of_listens || 0;
    var year = album.release_year || '-';

    rowsHtml += '<tr>';
    rowsHtml += '<td>' + album.album_id + '</td>';
    rowsHtml += '<td>' + escapeHtml(album.album_name) + '</td>';
    rowsHtml += '<td>' + escapeHtml(artistName) + '</td>';
    rowsHtml += '<td>' + year + '</td>';
    rowsHtml += '<td>' + listens.toLocaleString() + '</td>';
    rowsHtml += '<td class="row-actions">';
    rowsHtml += '<button type="button" class="btn-link" data-action="edit" data-id="' + album.album_id + '">Edit</button>';
    rowsHtml += '<button type="button" class="btn-link btn-link--danger" data-action="delete" data-id="' + album.album_id + '">Delete</button>';
    rowsHtml += '</td>';
    rowsHtml += '</tr>';
  }

  tbody.innerHTML = rowsHtml;
}

function resetForm() {
  form.reset();
  idField.value = '';
  formTitle.textContent = 'Add an album';
  submitBtn.textContent = 'Add album';
  cancelBtn.hidden = true;
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  var name = nameField.value.trim();
  if (name === '') {
    showStatus(statusEl, 'Album name is required.', true);
    return;
  }
  if (!artistField.value) {
    showStatus(statusEl, 'Choose an artist first.', true);
    return;
  }

  var payload = {
    album_name: name,
    artist_id: Number(artistField.value),
    release_year: yearField.value ? Number(yearField.value) : null,
    number_of_listens: Number(listensField.value) || 0
  };

  try {
    if (idField.value) {
      await apiPut('/albums/' + idField.value, payload);
      showStatus(statusEl, 'Album updated.', false);
    } else {
      await apiPost('/albums', payload);
      showStatus(statusEl, 'Album added.', false);
    }
    resetForm();
    loadAlbums();
  } catch (err) {
    showStatus(statusEl, err.message, true);
  }
});

cancelBtn.addEventListener('click', resetForm);

tbody.addEventListener('click', async function (event) {
  var button = event.target.closest('button');
  if (!button) {
    return;
  }

  var action = button.dataset.action;
  var id = button.dataset.id;

  if (action === 'edit') {
    try {
      var album = await apiGet('/albums/' + id);
      idField.value = album.album_id;
      nameField.value = album.album_name;
      artistField.value = album.artist_id;
      yearField.value = album.release_year || '';
      listensField.value = album.number_of_listens || 0;
      formTitle.textContent = 'Editing ' + album.album_name;
      submitBtn.textContent = 'Update album';
      cancelBtn.hidden = false;
      nameField.focus();
    } catch (err) {
      showStatus(statusEl, err.message, true);
    }
  }

  if (action === 'delete') {
    var confirmed = confirm('Delete this album? Its songs will be deleted too.');
    if (!confirmed) {
      return;
    }
    try {
      await apiDelete('/albums/' + id);
      showStatus(statusEl, 'Album deleted.', false);
      loadAlbums();
    } catch (err) {
      showStatus(statusEl, err.message, true);
    }
  }
});

// Load the artist dropdown first, then the table (the table needs
// the artist list so it can show names instead of just IDs).
async function startPage() {
  try {
    await loadArtistOptions();
  } catch (err) {
    showStatus(statusEl, 'Could not load artists: ' + err.message, true);
  }
  loadAlbums();
}

startPage();
