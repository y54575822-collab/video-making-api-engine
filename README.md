# 🎬 Video Making API Engine

A powerful REST API for generating videos from text prompts and media files.

## ✨ Features

- 📝 **Text-to-Video**: Generate videos from text prompts
- 🎞️ **Media Processing**: Create videos with uploaded images/videos
- 🎨 **Text Overlay**: Add customizable text overlays
- 💧 **Watermark**: Automatic AK EDITZ watermark
- ⚙️ **Customizable Settings**: Control duration, FPS, resolution
- 📊 **Job Status Tracking**: Check video generation progress
- 📥 **Easy Download**: Direct video download links

## 🚀 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/video-making-api-engine.git
cd video-making-api-engine

# Install dependencies
npm install

# Start server
npm start
```

## 🔌 API Endpoints

### 1. Generate Video from Prompt
```http
POST /api/generate
Content-Type: application/json

{
  "prompt": "A cat dancing in neon city",
  "duration": 10,
  "fps": 24,
  "resolution": "1280x720"
}
```

**Response:**
```json
{
  "status": "ACCEPTED",
  "jobId": "uuid-here",
  "message": "🎬 Video generation started",
  "videoUrl": "http://localhost:3000/videos/uuid-here.mp4",
  "checkStatusUrl": "http://localhost:3000/api/status/uuid-here",
  "estimatedTime": "20 seconds"
}
```

### 2. Generate Video with Media Files
```http
POST /api/generate-with-media
Content-Type: multipart/form-data

Form Data:
- prompt: "Your text overlay"
- media: [image1.jpg, image2.png, video.mp4]
- duration: 10
- fps: 24
- textColor: "#ffffff"
```

**Response:**
```json
{
  "status": "ACCEPTED",
  "jobId": "uuid-here",
  "message": "🎬 Video generation started with media",
  "mediaFilesReceived": 3,
  "checkStatusUrl": "http://localhost:3000/api/status/uuid-here"
}
```

### 3. Check Video Status
```http
GET /api/status/:jobId
```

**Response (Processing):**
```json
{
  "status": "PROCESSING",
  "jobId": "uuid-here",
  "message": "⏳ Video is still being generated..."
}
```

**Response (Completed):**
```json
{
  "status": "COMPLETED",
  "jobId": "uuid-here",
  "videoUrl": "http://localhost:3000/videos/uuid-here.mp4",
  "fileSize": "45.32 MB",
  "downloadUrl": "http://localhost:3000/api/download/uuid-here"
}
```

### 4. Get Video
```http
GET /api/video/:jobId
```

### 5. Download Video
```http
GET /api/download/:jobId
```

## 💻 Usage Example

### JavaScript/Fetch
```javascript
// Generate video from prompt
const response = await fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A sunset over mountains',
    duration: 10,
    fps: 24,
    resolution: '1280x720'
  })
});

const data = await response.json();
const jobId = data.jobId;

// Check status
const statusRes = await fetch(`http://localhost:3000/api/status/${jobId}`);
const statusData = await statusRes.json();
console.log(statusData.videoUrl);
```

### cURL
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cat dancing",
    "duration": 10,
    "fps": 24
  }'
```

## 🎨 Web Client

Open `client.html` in a browser to use the web interface.

```bash
# Or serve with Python
python -m http.server 8000
# Visit: http://localhost:8000/client.html
```

## 📁 File Structure

```
video-making-api-engine/
├── server.js              # Main API server
├── client.html            # Web interface
├── package.json           # Dependencies
├── src/
│   └── videoGenerator.js  # Video generation logic
├── uploads/               # Uploaded media files
├── videos/                # Generated videos
└── temp/                  # Temporary processing files
```

## ⚙️ Requirements

- Node.js 14+
- FFmpeg (for video processing)
- 1GB+ free disk space

## 📦 Installation Requirements

```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
choco install ffmpeg
```

## 🔒 Environment Variables

Create `.env` file:
```
PORT=3000
NODE_ENV=development
```

## 📊 Video Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `prompt` | string | - | - | Video description |
| `duration` | number | 10 | 5-300 | Duration in seconds |
| `fps` | number | 24 | 24-60 | Frames per second |
| `resolution` | string | 1280x720 | 1280x720, 1920x1080 | Video resolution |
| `textColor` | string | #ffffff | Hex color | Text overlay color |

## 🚦 Status Codes

- **200**: Success
- **400**: Bad request (missing parameters)
- **404**: Video not found
- **500**: Server error

## 💡 Tips

1. **Better Prompts**: More detailed prompts produce better videos
2. **Duration**: Longer videos take more time to process
3. **Quality**: 1080p takes longer than 720p
4. **Polling**: Check status every 1-2 seconds
5. **Storage**: Clean up old videos periodically

## 📝 License

MIT

## 🤝 Support

For issues or questions, create a GitHub issue.

---

**Made with ❤️ for video creators**
