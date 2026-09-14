const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const videoGenerator = require('./src/videoGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/videos', express.static('videos'));

// Create required directories
const dirs = ['uploads', 'videos', 'temp'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ============ API ENDPOINTS ============

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    message: '🎬 Video Making API Engine Running',
    endpoints: {
      'POST /api/generate': 'Generate video from text prompt',
      'POST /api/generate-with-media': 'Generate video with media files',
      'GET /api/video/:id': 'Get video by ID',
      'GET /api/status/:id': 'Check video generation status'
    }
  });
});

// ============ 1. GENERATE VIDEO FROM PROMPT ============
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, duration = 10, fps = 24, resolution = '1280x720' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '❌ Prompt required' });
    }

    const jobId = uuidv4();
    const videoPath = path.join('videos', `${jobId}.mp4`);

    // Store job info
    const jobInfo = {
      id: jobId,
      prompt,
      duration,
      fps,
      resolution,
      status: 'PROCESSING',
      createdAt: new Date(),
      videoUrl: `/videos/${jobId}.mp4`
    };

    // Start video generation (async)
    videoGenerator.generateFromPrompt({
      prompt,
      duration,
      fps,
      resolution,
      outputPath: videoPath,
      jobId
    }).then(() => {
      jobInfo.status = 'COMPLETED';
      console.log(`✅ Video ${jobId} completed`);
    }).catch(err => {
      jobInfo.status = 'FAILED';
      jobInfo.error = err.message;
      console.error(`❌ Video ${jobId} failed:`, err);
    });

    res.json({
      status: 'ACCEPTED',
      jobId,
      message: '🎬 Video generation started',
      videoUrl: `http://localhost:${PORT}/videos/${jobId}.mp4`,
      checkStatusUrl: `http://localhost:${PORT}/api/status/${jobId}`,
      estimatedTime: `${duration * 2} seconds`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 2. GENERATE VIDEO WITH MEDIA FILES ============
app.post('/api/generate-with-media', upload.array('media', 10), async (req, res) => {
  try {
    const { prompt, duration = 10, fps = 24, textColor = '#ffffff' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '❌ Prompt required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '❌ Media files required' });
    }

    const jobId = uuidv4();
    const videoPath = path.join('videos', `${jobId}.mp4`);
    const mediaFiles = req.files.map(f => f.path);

    const jobInfo = {
      id: jobId,
      prompt,
      duration,
      fps,
      textColor,
      mediaFiles: mediaFiles.length,
      status: 'PROCESSING',
      createdAt: new Date()
    };

    // Start video generation
    videoGenerator.generateWithMedia({
      prompt,
      mediaFiles,
      duration,
      fps,
      textColor,
      outputPath: videoPath,
      jobId
    }).then(() => {
      jobInfo.status = 'COMPLETED';
    }).catch(err => {
      jobInfo.status = 'FAILED';
      jobInfo.error = err.message;
    });

    res.json({
      status: 'ACCEPTED',
      jobId,
      message: '🎬 Video generation started with media',
      mediaFilesReceived: mediaFiles.length,
      checkStatusUrl: `http://localhost:${PORT}/api/status/${jobId}`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 3. GET VIDEO STATUS ============
app.get('/api/status/:id', (req, res) => {
  try {
    const { id } = req.params;
    const videoPath = path.join('videos', `${id}.mp4`);

    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      res.json({
        status: 'COMPLETED',
        jobId: id,
        videoUrl: `http://localhost:${PORT}/videos/${id}.mp4`,
        fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        downloadUrl: `http://localhost:${PORT}/api/download/${id}`
      });
    } else {
      res.json({
        status: 'PROCESSING',
        jobId: id,
        message: '⏳ Video is still being generated. Check again in a few seconds.'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 4. DOWNLOAD VIDEO ============
app.get('/api/download/:id', (req, res) => {
  try {
    const { id } = req.params;
    const videoPath = path.join('videos', `${id}.mp4`);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: '❌ Video not found' });
    }

    res.download(videoPath, `video-${id}.mp4`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 5. GET VIDEO BY ID ============
app.get('/api/video/:id', (req, res) => {
  try {
    const { id } = req.params;
    const videoPath = path.join('videos', `${id}.mp4`);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: '❌ Video not found' });
    }

    res.sendFile(path.resolve(videoPath));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Start Server ============
app.listen(PORT, () => {
  console.log(`\n🎬 Video Making API Engine Running on http://localhost:${PORT}`);
  console.log('📡 Ready to accept video generation requests!\n');
});
