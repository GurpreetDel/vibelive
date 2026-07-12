/* Real-time face tracking for AR gifts (MediaPipe BlazeFace).
   Lazy-loaded on first face gift; tracks the room's video element at ~15fps.
   keypoints: 0 right eye, 1 left eye, 2 nose tip, 3 mouth, 4 right ear, 5 left ear */

export class FaceTracker {
  constructor(video) {
    this.video = video
    this.detector = null
    this.latest = null
    this.timer = 0
    this.dead = false
    this.starting = false
  }

  async start() {
    if (this.starting || this.detector || this.dead) return
    this.starting = true
    try {
      const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      )
      this.detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.4,
      })
      if (!this.dead) this.loop()
    } catch {
      this.detector = null // AR unavailable — effects fall back to center anchor
    }
    this.starting = false
  }

  loop = () => {
    if (this.dead) return
    const v = this.video
    if (this.detector && v && v.readyState >= 2 && v.videoWidth > 0) {
      try {
        const res = this.detector.detectForVideo(v, performance.now())
        const d = res.detections && res.detections[0]
        this.latest = d && d.keypoints && d.keypoints.length >= 6 ? { kp: d.keypoints, box: d.boundingBox } : null
      } catch {
        this.latest = null
      }
    }
    this.timer = setTimeout(this.loop, 66)
  }

  stop() {
    this.dead = true
    clearTimeout(this.timer)
    try { this.detector && this.detector.close() } catch { /* noop */ }
    this.detector = null
  }
}

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/* Build a canvas-space anchor {x, y, w, cheeks, forehead, nose, found} from the
   latest detection. Video renders with object-fit: cover into the same box as
   the canvas; host preview is mirrored. */
export function faceAnchor(tracker, video, cw, ch, mirrored) {
  if (!tracker || !tracker.latest || !video || !video.videoWidth) return null
  const vw = video.videoWidth
  const vh = video.videoHeight
  const s = Math.max(cw / vw, ch / vh)
  const ox = (cw - vw * s) / 2
  const oy = (ch - vh * s) / 2
  const map = (nx, ny) => {
    let x = nx * vw * s + ox
    const y = ny * vh * s + oy
    if (mirrored) x = cw - x
    return [x, y]
  }
  const kp = tracker.latest.kp
  const P = (i) => map(kp[i].x, kp[i].y)
  const eyeR = P(0)
  const eyeL = P(1)
  const nose = P(2)
  const mouth = P(3)
  const earR = P(4)
  const earL = P(5)
  const w = Math.max(40, Math.hypot(earL[0] - earR[0], earL[1] - earR[1]))
  const eyeMid = lerp(eyeR, eyeL, 0.5)
  const cheekA = lerp(mouth, earR, 0.48)
  const cheekB = lerp(mouth, earL, 0.48)
  cheekA[1] -= w * 0.06
  cheekB[1] -= w * 0.06
  const forehead = [eyeMid[0], eyeMid[1] - (mouth[1] - eyeMid[1]) * 1.15]
  return { x: nose[0], y: nose[1], w, cheeks: [cheekA, cheekB], forehead, nose, mouth, found: true }
}
