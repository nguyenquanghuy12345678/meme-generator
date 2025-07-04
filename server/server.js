const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run('CREATE TABLE memes (link TEXT, likes INTEGER)');
});

app.post('/api/share', async (req, res) => {
  const { image } = req.body;
  try {
    const response = await axios.post('https://api.imgur.com/3/image', {
      image: image.split(',')[1],
      type: 'base64'
    }, {
      headers: { Authorization: 'Client-ID YOUR_IMGUR_CLIENT_ID' }
    });
    const link = response.data.data.link;
    db.run('INSERT INTO memes (link, likes) VALUES (?, 0)', [link]);
    res.json({ link });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload to Imgur' });
  }
});

app.get('/api/memes', (req, res) => {
  db.all('SELECT link FROM memes', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch memes' });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/memes/like', (req, res) => {
  const { link } = req.body;
  db.run('UPDATE memes SET likes = likes + 1 WHERE link = ?', [link], (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to like meme' });
      return;
    }
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});