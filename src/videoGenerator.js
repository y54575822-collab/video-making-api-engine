const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

class VideoGenerator {
  // Generate video from text prompt (with effects and watermark)
  static generateFromPrompt(options) {
    return new Promise(async (resolve, reject) => {
      try {
        const { prompt, duration, fps, resolution, outputPath, jobId } = options;
        console.log(`🎬 Generating video: ${jobId}`);
        console.log(`📝 Prompt: ${prompt}`);

        // Generate frames using Canvas-like rendering
        const frames = this.generateFrames({
          prompt,
          duration,
          fps,
          resolution,
          jobId
        });

        // Create video from frames
        setTimeout(() => {
          this.createVideoFromFrames({
            frames,
            fps,
            resolution,
            outputPath,
            jobId
          }).then(resolve).catch(reject);
        }, 1000);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate video with uploaded media files
  static generateWithMedia(options) {
    return new Promise((resolve, reject) => {
      try {
        const { prompt, mediaFiles, duration, fps, textColor, outputPath, jobId } = options;
        console.log(`🎬 Generating video with ${mediaFiles.length} media files: ${jobId}`);

        // Process media files and create video
        this.createVideoWithMedia({
          mediaFiles,
          prompt,
          duration,
          fps,
          textColor,
          outputPath,
          jobId
        }).then(resolve).catch(reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate frames (placeholder implementation)
  static generateFrames(options) {
    const { prompt, duration, fps, resolution, jobId } = options;
    const totalFrames = duration * fps;
    const frames = [];

    console.log(`📊 Creating ${totalFrames} frames...`);

    for (let i = 0; i < totalFrames; i++) {
      frames.push({
        index: i,
        prompt: prompt,
        progress: i / totalFrames
      });
    }

    return frames;
  }

  // Create video from frames
  static createVideoFromFrames(options) {
    return new Promise((resolve, reject) => {
      const { fps, resolution, outputPath, jobId } = options;
      const tempDir = path.join('temp', jobId);

      // Create temp directory for frames
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // For demo: create a simple MP4 with color and text
      console.log(`🎨 Creating video file...`);

      // Create a simple test video
      ffmpeg()
        .input('color=c=blue:s=1280x720:d=10')
        .inputOptions('-f', 'lavfi')
        .outputOptions('-pix_fmt', 'yuv420p')
        .outputOptions('-vf', `drawtext=text='Generated Video':fontsize=60:x=w/2-tw/2:y=h/2-th/2:fontcolor=white`)
        .on('end', () => {
          console.log(`✅ Video created: ${outputPath}`);
          // Cleanup temp files
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
          }
          resolve();
        })
        .on('error', (err) => {
          reject(new Error(`FFmpeg Error: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  // Create video with media files
  static createVideoWithMedia(options) {
    return new Promise((resolve, reject) => {
      const { mediaFiles, prompt, duration, fps, textColor, outputPath, jobId } = options;

      try {
        console.log(`🎞️ Processing ${mediaFiles.length} media files...`);
        console.log(`📝 Text Overlay: ${prompt}`);

        // Create concat demuxer file
        const concatFile = path.join('temp', `concat-${jobId}.txt`);
        let concatContent = '';

        mediaFiles.forEach(file => {
          const duration = Math.max(1, Math.floor(10 / mediaFiles.length));
          concatContent += `file '${path.resolve(file)}'\nduration ${duration}\n`;
        });

        if (!fs.existsSync('temp')) {
          fs.mkdirSync('temp', { recursive: true });
        }
        fs.writeFileSync(concatFile, concatContent);

        // Create video from media files
        ffmpeg()
          .input(concatFile)
          .inputOptions('-f', 'concat', '-safe', '0')
          .outputOptions('-c:v', 'libx264')
          .outputOptions('-c:a', 'aac')
          .outputOptions('-pix_fmt', 'yuv420p')
          .outputOptions('-vf', `drawtext=text='${prompt}':fontsize=30:fontcolor=${textColor}:x=50:y=50`)
          .outputOptions('-vf', `drawtext=text='AK EDITZ':fontsize=24:fontcolor=white:x=w-150:y=h-40`)
          .on('end', () => {
            console.log(`✅ Video created: ${outputPath}`);
            // Cleanup
            fs.unlinkSync(concatFile);
            mediaFiles.forEach(f => {
              try { fs.unlinkSync(f); } catch (e) { }
            });
            resolve();
          })
          .on('error', (err) => {
            reject(new Error(`FFmpeg Error: ${err.message}`));
          })
          .save(outputPath);

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = VideoGenerator;
