const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });
let selectedVideo;

document.getElementById('videoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedVideo = file;
    const video = document.getElementById('video');
    video.src = URL.createObjectURL(file);
  }
});

function trimVideo() {
  const video = document.getElementById('video');
  const start = parseFloat(document.getElementById('startTime').value);
  const end = parseFloat(document.getElementById('endTime').value);
  video.currentTime = start;
  video.ontimeupdate = () => {
    if (video.currentTime >= end) {
      video.pause();
      video.ontimeupdate = null;
    }
  };
  video.play();
}

async function downloadTrimmed() {
  if (!selectedVideo) return;

  const start = parseFloat(document.getElementById('startTime').value);
  const duration = parseFloat(document.getElementById('endTime').value) - start;

  await ffmpeg.load();
  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(selectedVideo));

  await ffmpeg.run('-i', 'input.mp4', '-ss', String(start), '-t', String(duration), '-c', 'copy', 'output.mp4');
  const data = ffmpeg.FS('readFile', 'output.mp4');

  const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trimmed.mp4';
  a.click();
}