
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

const labeledDescriptors = [];
async function captureFace() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("يرجى إدخال الاسم");

  const video = document.getElementById("videoRegister");
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
  if (!detection) return alert("لم يتم التعرف على الوجه. حاول مرة أخرى.");

  labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(name, [detection.descriptor]));
  alert("تم حفظ الوجه بنجاح!");
}

async function startVideo(id) {
  const video = document.getElementById(id);
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;
}

async function initFaceAPI() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("models");
  startVideo("videoRegister");
  startVideo("videoRecognize");

  document.getElementById("videoRecognize").addEventListener("play", async () => {
    const displaySize = { width: 720, height: 560 };
    const video = document.getElementById("videoRecognize");
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        const resized = faceapi.resizeResults(detection, displaySize);
        faceapi.draw.drawDetections(canvas, resized);

        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
        const match = faceMatcher.findBestMatch(detection.descriptor);
        document.getElementById("result").innerText = "تم التعرف على: " + match.toString();
      }
    }, 1500);
  });
}

window.addEventListener("DOMContentLoaded", initFaceAPI);
