# Music Library

A small full-stack app: Express + SQLite backend, plain HTML/CSS/JS frontend.

```
music-app/
├── backend/
│   ├── server.js        # Express app, registers routes, starts on :5000
│   ├── db.js             # Opens/creates data/app.db, runs model.sql once
│   ├── model.sql          # Schema (artists, albums, songs) + seed data
│   ├── package.json
│   ├── routes/            # /artists, /albums, /songs routers
│   ├── controllers/        # CRUD logic per resource
│   └── data/               # app.db is created here on first run
└── frontend/
    ├── index.html          # Home page with live stats
    ├── artists.html
    ├── albums.html
    ├── songs.html
    ├── css/style.css
    └── js/                 # api.js (fetch helper) + one file per page
```
