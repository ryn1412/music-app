// js/songs.js
// Handles the Songs page: loading the table, the album dropdown,
// and the create/edit form.

var tbody = document.getElementById('songs-tbody');
var form = document.getElementById('song-form');
var formTitle = document.getElementById('song-form-title');
var idField = document.getElementById('song-id');
var nameField = document.getElementById('song-name');
var albumField = document.getElementById('song-album');
var yearField = document.getElementById('song-year');
var submitBtn = document.getElementById('song-submit');
var cancelBtn = document.getElementById('song-cancel');
var statusEl = document.getElementById('song-status');

// We keep the list of albums around so we can show album names
// in the table without asking the server for each one separately.
var allAlbums = [];

function findAlbumById(id) {
  for (var i = 0; i < allAlbums.length; i++) {
    if (String(allAlbums[i].album_id) === String(id)) {
      return allAlbums[i];
    }
  }
  return null;
}

// Fill the "Album" dropdown with every album in the database
async function loadAlbumOptions() {
  allAlbums = await apiGet('/albums');

  if (allAlbums.length === 0) {
    albumField.innerHTML = '<option value="">Add an album first</option>';
    return;
  }

  var optionsHtml = '';
  for (var i = 0; i < allAlbums.length; i++) {
    optionsHtml += '<option value="' + allAlbums[i].album_id + '">' + escapeHtml(allAlbums[i].album_name) + '</option>';
  }
  albumField.innerHTML = optionsHtml;
}

async function loadSongs() {
  try {
    var songs = await apiGet('/songs');
    renderSongs(songs);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">' + err.message + '</td></tr>';
  }
}

function renderSongs(songs) {
  if (songs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No songs yet. Add one above.</td></tr>';
    return;
  }

  var rowsHtml = '';
  for (var i = 0; i < songs.length; i++) {
    var song = songs[i];
    var album = findAlbumById(song.album_id);
    var albumName = album ? album.album_name : ('#' + song.album_id);
    var year = song.release_year || '-';

    rowsHtml += '<tr>';
    rowsHtml += '<td>' + song.song_id + '</td>';
    rowsHtml += '<td>' + escapeHtml(song.song_name) + '</td>';
    rowsHtml += '<td>' + escapeHtml(albumName) + '</td>';
    rowsHtml += '<td>' + year + '</td>';
    rowsHtml += '<td class="row-actions">';
    rowsHtml += '<button type="button" class="btn-link" data-action="edit" data-id="' + song.song_id + '">Edit</button>';
    rowsHtml += '<button type="button" class="btn-link btn-link--danger" data-action="delete" data-id="' + song.song_id + '">Delete</button>';
    rowsHtml += '</td>';
    rowsHtml += '</tr>';
  }

  tbody.innerHTML = rowsHtml;
}

function resetForm() {
  form.reset();
  idField.value = '';
  formTitle.textContent = 'Add a song';
  submitBtn.textContent = 'Add song';
  cancelBtn.hidden = true;
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  var name = nameField.value.trim();
  if (name === '') {
    showStatus(statusEl, 'Song name is required.', true);
    return;
  }
  if (!albumField.value) {
    showStatus(statusEl, 'Choose an album first.', true);
    return;
  }

  var payload = {
    song_name: name,
    album_id: Number(albumField.value),
    release_year: yearField.value ? Number(yearField.value) : null
  };

  try {
    if (idField.value) {
      await apiPut('/songs/' + idField.value, payload);
      showStatus(statusEl, 'Song updated.', false);
    } else {
      await apiPost('/songs', payload);
      showStatus(statusEl, 'Song added.', false);
    }
    resetForm();
    loadSongs();
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
      var song = await apiGet('/songs/' + id);
      idField.value = song.song_id;
      nameField.value = song.song_name;
      albumField.value = song.album_id;
      yearField.value = song.release_year || '';
      formTitle.textContent = 'Editing ' + song.song_name;
      submitBtn.textContent = 'Update song';
      cancelBtn.hidden = false;
      nameField.focus();
    } catch (err) {
      showStatus(statusEl, err.message, true);
    }
  }

  if (action === 'delete') {
    var confirmed = confirm('Delete this song?');
    if (!confirmed) {
      return;
    }
    try {
      await apiDelete('/songs/' + id);
      showStatus(statusEl, 'Song deleted.', false);
      loadSongs();
    } catch (err) {
      showStatus(statusEl, err.message, true);
    }
  }
});

// Load the album dropdown first, then the table (the table needs
// the album list so it can show names instead of just IDs).
async function startPage() {
  try {
    await loadAlbumOptions();
  } catch (err) {
    showStatus(statusEl, 'Could not load albums: ' + err.message, true);
  }
  loadSongs();
}

startPage();
