# Meme Generator

A web app to create, share, and remix memes with drag-and-drop text, stickers, and community features.

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd meme-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Replace `YOUR_IMGUR_CLIENT_ID` in `server.js` with your Imgur API Client ID (get from https://api.imgur.com).

4. Add template images to `public/assets/templates/` and stickers to `public/assets/stickers/`.

5. Run the server:
   ```bash
   npm start
   ```

6. Open `http://localhost:3000` in your browser.

## Deployment

- Deploy on **Render**:
  - Push code to a GitHub repository.
  - Create a new Web Service on Render, link to your repository.
  - Set `npm start` as the start command.
  - Add environment variable `PORT` if needed.

## Features

- Select or upload meme templates.
- Add and drag text layers with customizable font, size, color, stroke, and shadow.
- Add stickers/emoji.
- Download memes as PNG.
- Share memes to Imgur.
- View and like community memes.

## Future Enhancements

- Add AI caption suggestions (e.g., Hugging Face).
- Support GIF creation with gif.js.
- Add meme battle/voting system.