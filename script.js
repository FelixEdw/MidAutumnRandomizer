/**
 * MID-AUTUMN FESTIVAL MOON RANDOM PICKER
 * Vanilla JavaScript implementation for Moon Wheel, Leaf Particles, Sparkles,
 * and Per-Spin Dynamic Winner Slots Matching the Mockup Design.
 */

// =============================================================================
// GLOBAL STATE & DOM ELEMENTS
// =============================================================================
const DOM = {
  // Canvases
  leafCanvas: document.getElementById('leafCanvas'),
  sparkleCanvas: document.getElementById('sparkleCanvas'),
  moonWheelCanvas: document.getElementById('moonWheelCanvas'),

  // Wheel Controls & Elements
  wheelWrapper: document.getElementById('wheelWrapper'),
  wheelPointer: document.getElementById('wheelPointer'),
  btnSpinCenter: document.getElementById('btnSpinCenter'),
  currentTickerName: document.getElementById('currentTickerName'),

  // Top Controls
  winnerCountInput: document.getElementById('winnerCountInput'),
  btnDecCount: document.getElementById('btnDecCount'),
  btnIncCount: document.getElementById('btnIncCount'),
  namesQuickInput: document.getElementById('namesQuickInput'),
  participantCountBadge: document.getElementById('participantCountBadge'),
  btnOpenNamesModal: document.getElementById('btnOpenNamesModal'),

  // Winner Boxes
  winnerSlotsGrid: document.getElementById('winnerSlotsGrid'),
  slotsProgressBadge: document.getElementById('slotsProgressBadge'),

  // Action Buttons
  btnRollMain: document.getElementById('btnRollMain'),
  rollMainText: document.getElementById('rollMainText'),
  btnAutoSpinToggle: document.getElementById('btnAutoSpinToggle'),
  autoSpinLabel: document.getElementById('autoSpinLabel'),
  btnResetSlots: document.getElementById('btnResetSlots'),
  btnNewRound: document.getElementById('btnNewRound'),

  // Names Modal
  namesModal: document.getElementById('namesModal'),
  modalNamesTextarea: document.getElementById('modalNamesTextarea'),
  btnCloseNamesModal: document.getElementById('btnCloseNamesModal'),
  btnSaveNamesModal: document.getElementById('btnSaveNamesModal'),
  btnSampleNamesModal: document.getElementById('btnSampleNamesModal'),
  btnShuffleNamesModal: document.getElementById('btnShuffleNamesModal'),
  btnClearNamesModal: document.getElementById('btnClearNamesModal'),

  // Grand Celebration Modal
  grandCelebrationModal: document.getElementById('grandCelebrationModal'),
  btnCelebrateNewRound: document.getElementById('btnCelebrateNewRound'),
  btnCloseCelebrationModal: document.getElementById('btnCloseCelebrationModal'),

  // Mode Switcher Elements
  tabModeWheel: document.getElementById('tabModeWheel'),
  tabModeMysteryPin: document.getElementById('tabModeMysteryPin'),
  tabModeRoller: document.getElementById('tabModeRoller'),
  boxModeIndicator: document.getElementById('boxModeIndicator'),
  btnShuffleTeaserNames: document.getElementById('btnShuffleTeaserNames'),

  // Views
  pickerView: document.getElementById('pickerView'),
  rollerView: document.getElementById('rollerView'),

  // Mode 3 Roller Elements
  rollerWinnerCountInput: document.getElementById('rollerWinnerCountInput'),
  btnRollerDecCount: document.getElementById('btnRollerDecCount'),
  btnRollerIncCount: document.getElementById('btnRollerIncCount'),
  rollerNamesQuickInput: document.getElementById('rollerNamesQuickInput'),
  rollerParticipantBadge: document.getElementById('rollerParticipantBadge'),
  btnRollerOpenNamesModal: document.getElementById('btnRollerOpenNamesModal'),
  rollerSlotsGrid: document.getElementById('rollerSlotsGrid'),
  btnRollerStartStop: document.getElementById('btnRollerStartStop'),
  rollerStartStopText: document.getElementById('rollerStartStopText'),
  btnRollerReset: document.getElementById('btnRollerReset'),
  btnRollerNewRound: document.getElementById('btnRollerNewRound'),

  // Notification Toast
  toastMessage: document.getElementById('toastMessage')
};

// Application State
const State = {
  names: [],
  winnerCount: 6,
  currentSlotIndex: 0,
  winners: [], // array of { rank: number, name: string }
  isSpinning: false,
  autoSpin: false,
  soundEnabled: true, // ON / OFF Suara di sini: ubah ke false jika ingin menonaktifkan suara
  pendingWinner: null,

  // Mystery Box State (Mode 2)
  playMode: 'roller', // 'wheel' | 'mystery-pin' | 'roller'
  boxStates: [],
  teaserInterval: null,
  isRevealingSlot: false,

  // Mode 3 Roller State
  rollerState: {
    isRolling: false,
    isStopping: false,
    rollInterval: null,
    boxes: [],
    stopTimer: null
  },

  // Wheel Physics & Geometry
  currentAngle: 0,
  targetAngle: 0,
  spinStartTime: 0,
  spinDuration: 5500,
  startAngle: 0,
  lastSectorIndex: -1,

  // Image Assets
  moonImg: new Image(),
  leafImages: [new Image(), new Image(), new Image()],
  imagesLoaded: false
};

// Default Sample Names
const SAMPLE_NAMES = [
  "Felix",
  "Felix lagi",
  "Felix lagilah",
  "Felix no 4",
  "Felix anak ke 5",
  "Felix dari utara ",
  "Felix selatan",
  "Felix timur laut geser dikit",
  "Felix gunung fuji",
  "Felix dari london",
  "Felix english man",
  "Black Felix",
  "Felix bagian kiri",
  "Felix bagian bawah",
  "Felix Kejepit pintu",
  "Felix Sakit Pinggang",
  "Felix Anak Sehat",
  "Felix Anak Cerdas",
  "Felix Anak Ganteng",
  "Felix Anak Cantik",
  "Felix Anak Baik",
  "Felix Anak Jahat",
  "Felix Anak Soleh",
  "Felix Anak Sholeha",
  "Felix Putar2",
  "Felix Penyelam Laut",
  "Felix Anak Tinggi",
  "Felix Anak Pendek",
  "Felix Anak Besar",
  "Felix Anak Kecil",
  "Felix Anak Pintar",
  "Felix Anak Kaya akan Gizi",
  "Felix Anak Gila",
  "Felix Anak Waras",
  "Felix Anak Baik-baik",
  "Felix Anak Nakal",
  "Felix Anak Sopan",
  "Felix Anak Santun",
  "Felix Anak Manis",
  "Felix Anak Pahit",
  "Felix Anak Manis Pahit",
  "Felix Anak Pahit Manis",
];

// =============================================================================
// WEB AUDIO API (SYNTHETIC SOUND EFFECTS)
// =============================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Ticker sound saat jarum melewati pembatas segmen
  playTick() {
    if (!State.soundEnabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Pitch kayu/klik oriental yang empuk
      osc.frequency.setValueAtTime(580 + Math.random() * 80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.045);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context silently handled
    }
  }

  // Melodi oriental kemenangan (Pentatonic scale Mid-Autumn Chime)
  playVictory() {
    if (!State.soundEnabled) return;
    this.init();
    try {
      // Skala nada pentatonik Guzheng: C5, D5, E5, G5, A5, C6
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      notes.forEach((freq, idx) => {
        const startTime = this.ctx.currentTime + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
    } catch (e) { }
  }

  // Ticker transisi cepat pada mode mystery box dengan deselerasi
  playSuspenseTick(pitchFactor = 1) {
    if (!State.soundEnabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime((550 + Math.random() * 50) * pitchFactor, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180 * pitchFactor, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch (e) { }
  }

  // Efek pin terpasang (Metallic Pin Lock / Golden Stamp)
  playPinStamp() {
    if (!State.soundEnabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.07);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) { }
  }
}

const soundEngine = new SoundEngine();

// =============================================================================
// ASSET PRELOADER
// =============================================================================
function preloadAssets(callback) {
  let loadedCount = 0;
  const totalAssets = 6; // Moon + 3 Leaf Particles + BunnyNewAsset + MoonCake

  function checkAllLoaded() {
    loadedCount++;
    if (loadedCount >= totalAssets) {
      State.imagesLoaded = true;
      if (callback) callback();
    }
  }

  State.moonImg.onload = checkAllLoaded;
  State.moonImg.onerror = checkAllLoaded;
  State.moonImg.src = 'MoonRandom.png';

  State.leafImages[0].onload = checkAllLoaded;
  State.leafImages[0].onerror = checkAllLoaded;
  State.leafImages[0].src = 'LeafParticle1.png';

  State.leafImages[1].onload = checkAllLoaded;
  State.leafImages[1].onerror = checkAllLoaded;
  State.leafImages[1].src = 'LeafParticle2.png';

  State.leafImages[2].onload = checkAllLoaded;
  State.leafImages[2].onerror = checkAllLoaded;
  State.leafImages[2].src = 'LeafParticle3.png';

  const bunnyNewImg = new Image();
  bunnyNewImg.onload = checkAllLoaded;
  bunnyNewImg.onerror = checkAllLoaded;
  bunnyNewImg.src = 'BunnyNewAsset.png';

  const mooncakeImg = new Image();
  mooncakeImg.onload = checkAllLoaded;
  mooncakeImg.onerror = checkAllLoaded;
  mooncakeImg.src = 'MoonCake Assets.png';
}

// =============================================================================
// LEAF PARTICLES ENGINE (CANVAS 60FPS)
// =============================================================================
class LeafParticlesEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 24; // Daun melayang lembut
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initParticles();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createParticle(initialY = null) {
    const imgIndex = Math.floor(Math.random() * State.leafImages.length);
    const size = 20 + Math.random() * 14;
    return {
      img: State.leafImages[imgIndex],
      x: Math.random() * this.width,
      y: initialY !== null ? initialY : -size - Math.random() * 40,
      size: size,
      speedY: 0.6 + Math.random() * 1.0,
      swayAmp: 25 + Math.random() * 30,
      swaySpeed: 0.012 + Math.random() * 0.016,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.75 + Math.random() * 0.25
    };
  }

  initParticles() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(Math.random() * this.height));
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.swayPhase += p.swaySpeed;
      p.rotation += p.rotSpeed;

      const currentX = p.x + Math.sin(p.swayPhase) * p.swayAmp;

      if (p.img && p.img.complete) {
        this.ctx.save();
        this.ctx.globalAlpha = p.opacity;
        this.ctx.translate(currentX, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }

      if (p.y > this.height + p.size) {
        this.particles[i] = this.createParticle();
      }
    }

    requestAnimationFrame(this.animate);
  }
}

// =============================================================================
// SPARKLE & FIREWORKS ENGINE
// =============================================================================
class SparkleCelebrationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  burst(x = this.width / 2, y = this.height / 2, count = 60) {
    const colors = ['#ffe27a', '#ffd23f', '#ffffff', '#ff9f1c', '#fff0ba', '#ffdf80'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.014 + Math.random() * 0.016,
        gravity: 0.12
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }
}

let sparkleEngine = null;

// =============================================================================
// MOON SPIN WHEEL ENGINE
// =============================================================================
class MoonWheelEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = 800;
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.center = this.size / 2;
    this.radius = 385;
  }

  draw() {
    const ctx = this.ctx;
    const center = this.center;
    const radius = this.radius;
    const names = State.names;
    const count = names.length;

    ctx.clearRect(0, 0, this.size, this.size);

    ctx.save();
    ctx.translate(center, center);

    // 1. Klip bentuk lingkaran bulan
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();

    // 2. Gambar tekstur MoonRandom.png yang berputar
    ctx.save();
    ctx.rotate(State.currentAngle);
    if (State.moonImg && State.moonImg.complete) {
      ctx.drawImage(State.moonImg, -radius, -radius, radius * 2, radius * 2);
    } else {
      const moonGrad = ctx.createRadialGradient(0, 0, 50, 0, 0, radius);
      moonGrad.addColorStop(0, '#fffae8');
      moonGrad.addColorStop(0.8, '#eed89a');
      moonGrad.addColorStop(1, '#c2a559');
      ctx.fillStyle = moonGrad;
      ctx.fill();
    }

    // 3. Gambar Segmen dan Nama
    if (count > 0) {
      const arcSize = (Math.PI * 2) / count;

      for (let i = 0; i < count; i++) {
        const segAngle = i * arcSize;

        // Overlay warna segmen lembut berselang-seling
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, segAngle, segAngle + arcSize);
        ctx.closePath();

        ctx.fillStyle = i % 2 === 0
          ? 'rgba(255, 245, 200, 0.08)'
          : 'rgba(20, 35, 60, 0.12)';
        ctx.fill();

        // Garis pemisah segmen keemasan
        ctx.strokeStyle = 'rgba(255, 225, 150, 0.45)';
        ctx.lineWidth = count > 30 ? 1 : 1.8;
        ctx.stroke();

        // Titik ornamen emas kecil di pinggir luar
        const dotAngle = segAngle + arcSize / 2;
        const dotX = Math.cos(dotAngle) * (radius - 12);
        const dotY = Math.sin(dotAngle) * (radius - 12);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffde8a';
        ctx.fill();

        // Gambar Teks Nama Peserta secara Radial
        ctx.save();
        ctx.rotate(segAngle + arcSize / 2);

        let fontSize = 21;
        let maxTextWidth = radius - 150;
        if (count > 40) fontSize = 11;
        else if (count > 25) fontSize = 13;
        else if (count > 16) fontSize = 15;
        else if (count > 8) fontSize = 18;

        ctx.font = `600 ${fontSize}px 'Outfit', 'Noto Serif SC', sans-serif`;
        ctx.fillStyle = '#fffdf5';
        ctx.shadowColor = 'rgba(10, 15, 25, 0.9)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        let nameStr = names[i];
        if (ctx.measureText(nameStr).width > maxTextWidth) {
          while (ctx.measureText(nameStr + '...').width > maxTextWidth && nameStr.length > 2) {
            nameStr = nameStr.slice(0, -1);
          }
          nameStr += '...';
        }

        ctx.fillText(nameStr, radius - 26, 0);
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.font = `500 22px 'Outfit', 'Noto Serif SC', sans-serif`;
      ctx.fillStyle = 'rgba(255, 245, 215, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Masukkan nama peserta · 请输入名单', 0, 0);
      ctx.restore();
    }

    ctx.restore(); // Tutup rotasi
    ctx.restore(); // Tutup klip bulan

    // 4. Ring Ornamen Luar Bulan
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 222, 138, 0.6)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 154, 29, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore(); // Tutup translate
  }

  getCurrentSectorIndex() {
    if (State.names.length === 0) return -1;
    const count = State.names.length;
    const arcSize = (Math.PI * 2) / count;

    // Pointer berada di atas: sudut -PI / 2
    const pointerAngle = -Math.PI / 2;

    let relativeAngle = (pointerAngle - State.currentAngle) % (Math.PI * 2);
    if (relativeAngle < 0) relativeAngle += Math.PI * 2;

    const index = Math.floor(relativeAngle / arcSize);
    return Math.min(Math.max(0, index), count - 1);
  }
}

let moonWheel = null;

// =============================================================================
// MYSTERY PIN BOX LOGIC & RENDERING
// =============================================================================

function initMysteryBoxStates() {
  const total = State.winnerCount;
  const names = State.names.length > 0 ? State.names : SAMPLE_NAMES;

  // Mapping existing winners
  const existingMap = {};
  State.winners.forEach(w => {
    existingMap[w.rank - 1] = w.name;
  });

  const wonSet = new Set(State.winners.map(w => w.name));
  let available = names.filter(n => !wonSet.has(n));
  if (available.length === 0) available = names;

  State.boxStates = [];
  for (let i = 0; i < total; i++) {
    if (existingMap[i]) {
      State.boxStates.push({
        index: i,
        rank: i + 1,
        status: 'pinned',
        teaserName: existingMap[i],
        winnerName: existingMap[i]
      });
    } else {
      State.boxStates.push({
        index: i,
        rank: i + 1,
        status: 'teaser',
        teaserName: '?',
        winnerName: null
      });
    }
  }
}

function startTeaserShuffler() {
  stopTeaserShuffler();
  // Dinonaktifkan: Preview nama peserta dihapus agar tidak mendahului hasil undian
}

function stopTeaserShuffler() {
  if (State.teaserInterval) {
    clearInterval(State.teaserInterval);
    State.teaserInterval = null;
  }
}

function shuffleTeaserNamesOnly() {
  // Dinonaktifkan: Preview nama peserta dihapus
}

function alignWheelToWinner(winnerName) {
  if (!moonWheel || State.names.length === 0) return;
  const targetIndex = State.names.indexOf(winnerName);
  if (targetIndex === -1) return;
  const arcSize = (Math.PI * 2) / State.names.length;
  const targetSectorCenter = targetIndex * arcSize + (arcSize / 2);
  const pointerAngle = -Math.PI / 2;
  const targetBase = pointerAngle - targetSectorCenter;
  let delta = (targetBase - State.currentAngle) % (Math.PI * 2);
  if (delta > 0) delta -= Math.PI * 2;
  State.currentAngle = State.currentAngle + delta;
  moonWheel.draw();
  DOM.currentTickerName.textContent = winnerName;
}

function pinMysterySlot(slotIndex) {
  if (State.isRevealingSlot) {
    showToast('Tunggu animasi pengundian kotak sebelumnya selesai...');
    return;
  }

  const box = State.boxStates[slotIndex];
  if (!box || box.status === 'pinned' || box.status === 'revealing') return;

  if (soundEngine && State.soundEnabled) soundEngine.init();

  const names = State.names.length > 0 ? State.names : SAMPLE_NAMES;
  if (!names || names.length === 0) {
    showToast('Masukkan nama peserta terlebih dahulu!');
    DOM.namesQuickInput.focus();
    return;
  }

  // Filter available winners (not yet won)
  const wonNames = new Set(State.winners.map(w => w.name));
  const availableNames = names.filter(n => !wonNames.has(n));

  if (availableNames.length === 0) {
    showToast('Semua peserta sudah menang! Tambahkan nama baru untuk melanjutkan.');
    return;
  }

  // Pilih pemenang asli
  const chosenWinner = availableNames[Math.floor(Math.random() * availableNames.length)];
  box.status = 'revealing';
  State.isRevealingSlot = true;

  // Update card UI ke status revealing
  const slotCard = document.getElementById(`winnerSlot-${slotIndex}`);
  if (slotCard) {
    slotCard.className = 'winner-slot-card revealing';
    const statusBadge = slotCard.querySelector('.slot-pin-status-badge');
    if (statusBadge) {
      statusBadge.className = 'slot-pin-status-badge revealing';
      statusBadge.innerHTML = '⚡ Mengundi...';
    }
  }

  const nameEl = document.getElementById(`boxTeaserName-${slotIndex}`);

  // Suspense Deceleration Loop
  const startTime = performance.now();
  const duration = 1500; // 1.5 detik
  let interval = 45;

  function rollStep() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);

    const tempRandom = availableNames[Math.floor(Math.random() * availableNames.length)];
    if (nameEl) {
      nameEl.className = 'revealing-name-text';
      nameEl.textContent = tempRandom;
    }

    if (soundEngine) {
      soundEngine.playSuspenseTick(0.85 + (1 - progress) * 0.45);
    }

    if (progress < 1) {
      interval = 45 + Math.pow(progress, 2.5) * 150;
      setTimeout(rollStep, interval);
    } else {
      finalizePinnedSlot(slotIndex, chosenWinner);
    }
  }

  rollStep();
}

function finalizePinnedSlot(slotIndex, winnerName) {
  const box = State.boxStates[slotIndex];
  if (!box) return;

  box.status = 'pinned';
  box.winnerName = winnerName;
  State.isRevealingSlot = false;

  // Simpan ke daftar pemenang
  State.winners.push({ rank: slotIndex + 1, name: winnerName });
  State.currentSlotIndex = State.winners.length;

  // Putar roda bulan ke posisi nama pemenang
  alignWheelToWinner(winnerName);

  // Efek suara: Pin Stamp + Victory Chime
  if (soundEngine) {
    soundEngine.playPinStamp();
    setTimeout(() => soundEngine.playVictory(), 100);
  }

  // Efek kembang api/sparkle di atas kotak yang di-pin
  const slotCard = document.getElementById(`winnerSlot-${slotIndex}`);
  if (slotCard && sparkleEngine) {
    const rect = slotCard.getBoundingClientRect();
    const burstX = rect.left + rect.width / 2;
    const burstY = rect.top + rect.height / 2;
    sparkleEngine.burst(burstX, burstY, 50);
  }

  renderWinnerSlots();

  // Cek apakah semua kotak telah selesai di-pin
  if (State.winners.length >= State.winnerCount) {
    setTimeout(() => {
      showToast('🎉 Semua pemenang telah terpilih! Selamat!');
    }, 700);
  } else if (State.autoSpin) {
    setTimeout(() => triggerAutoNext(), 900);
  }
}

function pinNextAvailableSlot() {
  if (State.isRevealingSlot) return;
  const unpinned = State.boxStates.filter(b => b.status === 'teaser');
  if (unpinned.length === 0) {
    showToast('Semua kotak sudah terisi! Silakan klik Ronde Baru atau Reset Kotak.');
    return;
  }
  pinMysterySlot(unpinned[0].index);
}

function switchPlayMode(mode) {
  if (State.isSpinning || State.isRevealingSlot || (State.rollerState && State.rollerState.isRolling)) return;
  State.playMode = mode;

  // Toggle active tab buttons
  DOM.tabModeWheel?.classList.toggle('active', mode === 'wheel');
  DOM.tabModeMysteryPin?.classList.toggle('active', mode === 'mystery-pin');
  DOM.tabModeRoller?.classList.toggle('active', mode === 'roller');

  // Hentikan shuffler atau roller loop yang sedang berjalan
  stopTeaserShuffler();
  stopRollerLoop();

  if (mode === 'roller') {
    DOM.pickerView.classList.remove('mode-mystery-pin');
    // Tampilkan View Mode 3 (Desain Baru Mockup)
    DOM.pickerView.classList.add('hidden');
    DOM.rollerView.classList.remove('hidden');

    // Sinkronisasi data ke input Mode 3
    DOM.rollerWinnerCountInput.value = State.winnerCount;
    DOM.rollerNamesQuickInput.value = State.names.join('\n');
    DOM.rollerParticipantBadge.textContent = `${State.names.length} Peserta`;

    initRollerBoxes();
    showToast('Mode 3: Roller Grid Aktif! Tekan START untuk memutar.');
  } else {
    // Tampilkan View Mode 1 / 2 (Picker View)
    DOM.rollerView.classList.add('hidden');
    DOM.pickerView.classList.remove('hidden');

    if (mode === 'mystery-pin') {
      DOM.pickerView.classList.add('mode-mystery-pin');
      DOM.boxModeIndicator.textContent = 'Mode: Kotak Interaktif';
      DOM.btnShuffleTeaserNames.classList.remove('hidden');
      const rollIcon = DOM.btnRollMain.querySelector('.roll-icon');
      if (rollIcon) {
        rollIcon.textContent = '';
        rollIcon.style.display = 'none';
      }
      DOM.autoSpinLabel.textContent = State.autoSpin ? 'Otomatis: AKTIF' : 'Pin Otomatis';
      initMysteryBoxStates();
      renderWinnerSlots();
      startTeaserShuffler();
      showToast('Mode Kotak Interaktif Aktif! Klik PIN pada kotak mana saja untuk membuka pemenang.');
    } else {
      DOM.pickerView.classList.remove('mode-mystery-pin');
      DOM.boxModeIndicator.textContent = 'Mode: 🌕 Roda Bulan';
      DOM.btnShuffleTeaserNames.classList.add('hidden');
      const rollIcon = DOM.btnRollMain.querySelector('.roll-icon');
      if (rollIcon) {
        rollIcon.style.display = 'inline-block';
        rollIcon.textContent = '🌕';
      }
      DOM.rollMainText.textContent = `PUTAR JUARA ${State.currentSlotIndex + 1} (${State.currentSlotIndex + 1}/${State.winnerCount})`;
      DOM.autoSpinLabel.textContent = State.autoSpin ? 'Putar Otomatis: AKTIF' : 'Putar Otomatis';
      renderWinnerSlots();
      showToast('Mode Roda Bulan Aktif! Tekan PUTAR untuk memutar roda.');
    }
  }
}

// =============================================================================
// MODE 3: ROLLER GRID LOGIC (SESUAI MOCKUP DESAIN TERBARU)
// =============================================================================

// =============================================================================
// PENGATURAN DURASI WAKTU (ATURAN BERAPA DETIK MUNCUL / JEDA BERHENTI)
// Anda bisa mengubah angka-angka di bawah ini kapan saja:
// - 1000 ms = 1 detik
// - 1500 ms = 1.5 detik
// - 2000 ms = 2 detik
// - 500 ms  = 0.5 detik (setengah detik)
// =============================================================================
const ROLLER_CONFIG = {
  jedaBerhentiMs: 2250,         // <-- ATURAN JEDA ANTAR KOTAK BERHENTI (1000 ms = 1 DETIK)
  kecepatanPutaranMs: 60,       // Kecepatan putaran nama roller (semakin kecil nilainya, semakin cepat)
  jedaSelebrasiAkhirMs: 800     // Jeda sebelum modal selebrasi muncul setelah kotak terakhir berhenti
};

function initRollerBoxes() {
  const total = State.winnerCount;
  const names = State.names.length > 0 ? State.names : SAMPLE_NAMES;

  // Existing winners map
  const existingMap = {};
  State.winners.forEach(w => {
    existingMap[w.rank - 1] = w.name;
  });

  const wonSet = new Set(State.winners.map(w => w.name));
  let available = names.filter(n => !wonSet.has(n));
  if (available.length === 0) available = names;

  State.rollerState.boxes = [];
  for (let i = 0; i < total; i++) {
    if (existingMap[i]) {
      State.rollerState.boxes.push({
        index: i,
        rank: i + 1,
        status: 'stopped',
        currentName: existingMap[i],
        winnerName: existingMap[i]
      });
    } else {
      State.rollerState.boxes.push({
        index: i,
        rank: i + 1,
        status: 'idle',
        currentName: '?',
        winnerName: null
      });
    }
  }

  renderRollerBoxes();
}

function renderRollerBoxes() {
  const container = DOM.rollerSlotsGrid;
  if (!container) return;
  container.innerHTML = '';

  State.rollerState.boxes.forEach((box, i) => {
    const card = document.createElement('div');
    card.id = `rollerSlot-${i}`;
    card.className = `roller-slot-card ${box.status}`;

    // 4 Sudut Takik Oriental
    card.innerHTML = `
      <div class="box-notch tl"></div>
      <div class="box-notch tr"></div>
      <div class="box-notch bl"></div>
      <div class="box-notch br"></div>
    `;

    // Left rank badge
    const rankBadge = document.createElement('div');
    rankBadge.className = 'slot-rank-badge';
    rankBadge.innerHTML = `
      <span>${i + 1}</span>
      <span class="slot-rank-cn">第${i + 1}名</span>
    `;
    card.appendChild(rankBadge);

    // 3D Drum Viewport
    const drumViewport = document.createElement('div');
    drumViewport.className = 'roller-drum-viewport';

    const nameDisplay = document.createElement('div');
    nameDisplay.className = 'roller-name-display';
    nameDisplay.textContent = box.currentName || '?';
    drumViewport.appendChild(nameDisplay);

    card.appendChild(drumViewport);

    // Trophy icon for stopped winners
    if (box.status === 'stopped') {
      const trophy = document.createElement('span');
      trophy.className = 'slot-trophy-icon';
      trophy.textContent = i === 0 ? '🥮' : '🥮';
      card.appendChild(trophy);
    }

    container.appendChild(card);
  });
}

function startRollerLoop() {
  if (State.rollerState.isRolling) return;

  const names = State.names.length > 0 ? State.names : SAMPLE_NAMES;
  if (!names || names.length === 0) {
    showToast('Masukkan nama peserta terlebih dahulu!');
    return;
  }

  if (soundEngine && State.soundEnabled) soundEngine.init();

  State.rollerState.isRolling = true;
  State.rollerState.isStopping = false;

  DOM.btnRollerStartStop.classList.add('running');
  DOM.rollerStartStopText.textContent = 'STOP';

  // Tandai kotak yang belum menang sebagai 'rolling'
  State.rollerState.boxes.forEach((box, i) => {
    if (box.status !== 'stopped') {
      box.status = 'rolling';
      const card = document.getElementById(`rollerSlot-${i}`);
      if (card) card.className = 'roller-slot-card rolling';
    }
  });

  // Ticker loop rotasi cepat layaknya roller slot machine
  let tickCounter = 0;
  State.rollerState.rollInterval = setInterval(() => {
    if (!State.rollerState.isRolling) return;

    tickCounter++;
    if (tickCounter % 2 === 0 && soundEngine) {
      soundEngine.playTick();
    }

    // Update nama secara cepat di seluruh kotak yang berputar
    State.rollerState.boxes.forEach((box, i) => {
      if (box.status === 'rolling') {
        const randName = names[Math.floor(Math.random() * names.length)];
        box.currentName = randName;
        const card = document.getElementById(`rollerSlot-${i}`);
        if (card) {
          const nameEl = card.querySelector('.roller-name-display');
          if (nameEl) nameEl.textContent = randName;
        }
      }
    });
  }, ROLLER_CONFIG.kecepatanPutaranMs);
}

function stopRollerLoop() {
  if (State.rollerState.rollInterval) {
    clearInterval(State.rollerState.rollInterval);
    State.rollerState.rollInterval = null;
  }
  if (State.rollerState.stopTimer) {
    clearTimeout(State.rollerState.stopTimer);
    State.rollerState.stopTimer = null;
  }
  State.rollerState.isRolling = false;
  State.rollerState.isStopping = false;
  if (DOM.btnRollerStartStop) {
    DOM.btnRollerStartStop.disabled = false;
    DOM.btnRollerStartStop.classList.remove('running');
    DOM.rollerStartStopText.textContent = 'START';
  }
}

function triggerRollerSequentialStop() {
  if (!State.rollerState.isRolling || State.rollerState.isStopping) return;

  State.rollerState.isStopping = true;
  DOM.btnRollerStartStop.disabled = true;
  DOM.rollerStartStopText.textContent = 'STOPPING...';

  // Saring nama yang belum menang di sesi saat ini
  const names = State.names.length > 0 ? State.names : SAMPLE_NAMES;
  const wonSet = new Set(State.winners.map(w => w.name));
  let available = names.filter(n => !wonSet.has(n));
  if (available.length < State.rollerState.boxes.length) {
    available = [...names];
  }
  // Acak pool pemenang
  available.sort(() => Math.random() - 0.5);

  const boxesToStop = State.rollerState.boxes.filter(b => b.status === 'rolling');
  if (boxesToStop.length === 0) {
    stopRollerLoop();
    return;
  }

  let queueIndex = 0;

  function stopNextBox() {
    if (queueIndex >= boxesToStop.length) {
      finishAllRollerStopped();
      return;
    }

    const box = boxesToStop[queueIndex];
    const winnerName = available[queueIndex] || `Juara #${box.rank}`;

    box.status = 'stopped';
    box.winnerName = winnerName;
    box.currentName = winnerName;

    State.winners.push({ rank: box.rank, name: winnerName });

    // Efek audio: Pin stamp + Victory Chime
    if (soundEngine) {
      soundEngine.playPinStamp();
      soundEngine.playVictory();
    }

    // Update elemen DOM kotak yang berhenti
    const card = document.getElementById(`rollerSlot-${box.index}`);
    if (card) {
      card.className = 'roller-slot-card stopped';
      const nameEl = card.querySelector('.roller-name-display');
      if (nameEl) nameEl.textContent = winnerName;

      // Tambahkan ikon piala
      if (!card.querySelector('.slot-trophy-icon')) {
        const trophy = document.createElement('span');
        trophy.className = 'slot-trophy-icon';
        trophy.textContent = box.index === 0 ? '🥮' : '🥮';
        card.appendChild(trophy);
      }

      // Sparkle burst tepat di koordinat kotak tersebut
      if (sparkleEngine) {
        const rect = card.getBoundingClientRect();
        sparkleEngine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
      }
    }

    queueIndex++;

    // Jeda berhenti antar kotak sesuai ROLLER_CONFIG.jedaBerhentiMs (default 1000ms = 1 detik)
    if (queueIndex < boxesToStop.length) {
      State.rollerState.stopTimer = setTimeout(stopNextBox, ROLLER_CONFIG.jedaBerhentiMs);
    } else {
      setTimeout(finishAllRollerStopped, ROLLER_CONFIG.jedaSelebrasiAkhirMs);
    }
  }

  stopNextBox();
}

function finishAllRollerStopped() {
  if (State.rollerState.rollInterval) {
    clearInterval(State.rollerState.rollInterval);
    State.rollerState.rollInterval = null;
  }
  State.rollerState.isRolling = false;
  State.rollerState.isStopping = false;

  DOM.btnRollerStartStop.disabled = false;
  DOM.btnRollerStartStop.classList.remove('running');
  DOM.rollerStartStopText.textContent = 'START';

  // Suara kemenangan penutup
  if (soundEngine) {
    soundEngine.playVictory();
  }

  // Kembang api besar selebrasi
  if (sparkleEngine) {
    sparkleEngine.burst(window.innerWidth / 2, window.innerHeight / 2, 100);
    setTimeout(() => sparkleEngine.burst(window.innerWidth * 0.35, window.innerHeight * 0.4, 60), 300);
    setTimeout(() => sparkleEngine.burst(window.innerWidth * 0.65, window.innerHeight * 0.4, 60), 600);
  }

  showToast('🎉 Semua pemenang telah terpilih! Silakan klik Ronde Baru atau Reset Kotak.');
}

// =============================================================================
// WINNER SLOTS RENDERING (GENERATED PER SPIN SINKRON MOCKUP)
// =============================================================================

function renderWinnerSlots() {
  const container = DOM.winnerSlotsGrid;
  container.innerHTML = '';

  const total = State.winnerCount;

  // --- MODE MYSTERY PIN BOX ---
  if (State.playMode === 'mystery-pin') {
    if (!State.boxStates || State.boxStates.length !== total) {
      initMysteryBoxStates();
    }

    for (let i = 0; i < total; i++) {
      const box = State.boxStates[i];
      const slotCard = document.createElement('div');
      slotCard.id = `winnerSlot-${i}`;

      slotCard.innerHTML = `
        <div class="box-notch tl"></div>
        <div class="box-notch tr"></div>
        <div class="box-notch bl"></div>
        <div class="box-notch br"></div>
      `;

      const slotLeftGroup = document.createElement('div');
      slotLeftGroup.className = 'slot-left-group';

      const rankBadge = document.createElement('div');
      rankBadge.className = 'slot-rank-badge';
      rankBadge.innerHTML = `
        <span>${i + 1}</span>
        <span class="slot-rank-cn">第${i + 1}名</span>
      `;
      slotLeftGroup.appendChild(rankBadge);

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'slot-content-wrapper';

      if (box.status === 'pinned') {
        slotCard.className = 'winner-slot-card pinned';
        contentWrapper.innerHTML = `
          <div class="slot-winner-name">${escapeHtml(box.winnerName)}</div>
          <div class="slot-winner-sub">✨ Juara ${i + 1} · 获奖者</div>
        `;
        slotLeftGroup.appendChild(contentWrapper);
        slotCard.appendChild(slotLeftGroup);

        const rightGroup = document.createElement('div');
        rightGroup.style.display = 'flex';
        rightGroup.style.alignItems = 'center';
        rightGroup.style.gap = '8px';
        rightGroup.innerHTML = `
          <span class="slot-pin-status-badge pinned">Terkunci</span>
          <span class="slot-trophy-icon">${i === 0 ? '🥮' : '🥮'}</span>
        `;
        slotCard.appendChild(rightGroup);
      } else if (box.status === 'revealing') {
        slotCard.className = 'winner-slot-card revealing';
        contentWrapper.innerHTML = `
          <div class="revealing-name-text" id="boxTeaserName-${i}">${escapeHtml(box.teaserName)}</div>
          <div class="slot-winner-sub">⚡ Membuka pemenang...</div>
        `;
        slotLeftGroup.appendChild(contentWrapper);
        slotCard.appendChild(slotLeftGroup);

        const badge = document.createElement('span');
        badge.className = 'slot-pin-status-badge revealing';
        badge.textContent = '⚡ Mengundi...';
        slotCard.appendChild(badge);
      } else {
        // Status: 'teaser' (Belum Terkunci, berisi nama random)
        slotCard.className = 'winner-slot-card mystery-teaser';
        slotCard.title = `Klik untuk membuka Juara ${i + 1}!`;
        contentWrapper.innerHTML = `
          <div class="teaser-name-text" id="boxTeaserName-${i}">${escapeHtml(box.teaserName)}</div>
          <div class="slot-winner-sub" style="display:flex; align-items:center; gap:6px;">
            <span class="slot-pin-status-badge teaser">Belum Terkunci</span>
            <span style="opacity: 0.65; font-size: 11.5px;">Klik kotak untuk buka</span>
          </div>
        `;
        slotLeftGroup.appendChild(contentWrapper);
        slotCard.appendChild(slotLeftGroup);

        slotCard.addEventListener('click', () => {
          pinMysterySlot(i);
        });
      }

      container.appendChild(slotCard);
    }

    DOM.slotsProgressBadge.textContent = `${State.winners.length} / ${total} Terpilih`;

    if (State.winners.length < total) {
      DOM.rollMainText.textContent = `START (${State.winners.length + 1}/${total})`;
      DOM.btnRollMain.disabled = State.isRevealingSlot;
    } else {
      DOM.rollMainText.textContent = `SEMUA ${total} KOTAK TERKUNCI · 恭喜！`;
      DOM.btnRollMain.disabled = false;
    }
    return;
  }

  // --- MODE RODA PUTAR (WHEEL) ---
  for (let i = 0; i < total; i++) {
    const slotCard = document.createElement('div');
    slotCard.className = 'winner-slot-card';
    slotCard.id = `winnerSlot-${i}`;

    // 4 Sudut Takik Oriental Sesuai Gambar
    slotCard.innerHTML = `
      <div class="box-notch tl"></div>
      <div class="box-notch tr"></div>
      <div class="box-notch bl"></div>
      <div class="box-notch br"></div>
    `;

    const isFilled = i < State.winners.length;
    const isActive = i === State.currentSlotIndex;

    const slotLeftGroup = document.createElement('div');
    slotLeftGroup.className = 'slot-left-group';

    // Badge Urutan Juara (Juara 1, Juara 2, dst)
    const rankBadge = document.createElement('div');
    rankBadge.className = 'slot-rank-badge';
    rankBadge.innerHTML = `
      <span>${i + 1}</span>
      <span class="slot-rank-cn">第${i + 1}名</span>
    `;
    slotLeftGroup.appendChild(rankBadge);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'slot-content-wrapper';

    if (isFilled) {
      // Pemenang sudah terpilih
      slotCard.classList.add('filled');
      contentWrapper.innerHTML = `
        <div class="slot-winner-name">${escapeHtml(State.winners[i].name)}</div>
        <div class="slot-winner-sub">✨ Juara ${i + 1} · 获奖者</div>
      `;
      slotLeftGroup.appendChild(contentWrapper);
      slotCard.appendChild(slotLeftGroup);

      const trophy = document.createElement('span');
      trophy.className = 'slot-trophy-icon';
      trophy.textContent = i === 0 ? '🥮' : '🥮';
      slotCard.appendChild(trophy);
    } else if (isActive && State.isSpinning) {
      // Sedang diundi saat ini
      slotCard.classList.add('active-target');
      contentWrapper.innerHTML = `
        <div class="slot-winner-name" style="color: #ffde8a; font-style: italic;">Sedang Mengundi... · 抽取中</div>
        <div class="slot-winner-sub">Memilih pemenang ke-${i + 1}</div>
      `;
      slotLeftGroup.appendChild(contentWrapper);
      slotCard.appendChild(slotLeftGroup);
    } else if (isActive) {
      // Giliran berikutnya yang akan diundi
      slotCard.classList.add('active-target');
      contentWrapper.innerHTML = `
        <div class="slot-winner-name" style="color: #ffd768;">Siap Diundi · 待抽取</div>
        <div class="slot-winner-sub">Slot Juara ${i + 1}</div>
      `;
      slotLeftGroup.appendChild(contentWrapper);
      slotCard.appendChild(slotLeftGroup);
    } else {
      // Masih kosong menunggu giliran
      slotCard.classList.add('empty');
      contentWrapper.innerHTML = `
        <div class="slot-placeholder">Kotak Pemenang #${i + 1}</div>
        <div class="slot-winner-sub" style="opacity: 0.5;">Menunggu giliran · 等待</div>
      `;
      slotLeftGroup.appendChild(contentWrapper);
      slotCard.appendChild(slotLeftGroup);
    }

    container.appendChild(slotCard);
  }

  // Update Progress Badge
  DOM.slotsProgressBadge.textContent = `${State.winners.length} / ${total} Terpilih`;

  // Update Roll Main Button Text
  if (State.currentSlotIndex < State.winnerCount) {
    DOM.rollMainText.textContent = `PUTAR JUARA ${State.currentSlotIndex + 1} (${State.currentSlotIndex + 1}/${State.winnerCount})`;
    DOM.btnRollMain.disabled = State.isSpinning;
    DOM.btnSpinCenter.disabled = State.isSpinning;
  } else {
    DOM.rollMainText.textContent = `🎉 SEMUA PEMENANG TERPILIH · 恭喜！`;
    DOM.btnRollMain.disabled = false;
  }
}

// =============================================================================
// SPIN LOGIC & PHYSICS ANIMATION (PER-SLOT WINNER GENERATION)
// =============================================================================

function easeOutQuart(x) {
  return 1 - Math.pow(1 - x, 4);
}

function startSpin() {
  if (State.isSpinning) return;

  // Inisialisasi AudioContext saat interaksi klik pengguna
  if (soundEngine && State.soundEnabled) soundEngine.init();

  const names = State.names;
  if (!names || names.length === 0) {
    showToast('Masukkan nama peserta terlebih dahulu! · 请先输入名单！');
    DOM.namesQuickInput.focus();
    return;
  }

  // Cek apakah seluruh slot sudah terisi
  if (State.currentSlotIndex >= State.winnerCount) {
    showToast(`Semua ${State.winnerCount} pemenang sudah terpilih! Klik Reset untuk mengulang atau Ronde Baru.`);
    DOM.grandCelebrationModal.classList.remove('hidden');
    return;
  }

  // Filter nama yang belum menang di sesi saat ini (mencegah nama keluar ganda)
  const wonNames = new Set(State.winners.map(w => w.name));
  const availableNames = names.filter(n => !wonNames.has(n));

  if (availableNames.length === 0) {
    showToast('Semua peserta dalam daftar sudah menang! Tambahkan nama baru.');
    return;
  }

  // Pilih 1 pemenang untuk slot saat ini
  const chosenWinner = availableNames[Math.floor(Math.random() * availableNames.length)];
  State.pendingWinner = chosenWinner;

  // Cari posisi segmen nama pemenang tersebut di roda
  let targetIndex = names.indexOf(chosenWinner);
  if (targetIndex === -1) targetIndex = 0;

  const arcSize = (Math.PI * 2) / names.length;
  const targetSectorCenter = targetIndex * arcSize + (arcSize / 2) + ((Math.random() - 0.5) * arcSize * 0.5);
  const pointerAngle = -Math.PI / 2;

  // Hitung sudut akhir roda agar targetSectorCenter tepat di pointerAngle
  const fullRotations = 6 + Math.floor(Math.random() * 3); // 6 - 8 putaran
  const targetBase = pointerAngle - targetSectorCenter;

  let delta = (targetBase - State.currentAngle) % (Math.PI * 2);
  if (delta > 0) delta -= Math.PI * 2; // Pastikan berputar searah jarum jam

  State.startAngle = State.currentAngle;
  State.targetAngle = State.currentAngle + delta + (fullRotations * Math.PI * 2);
  State.spinDuration = 5200 + Math.random() * 800; // 5.2 - 6 detik
  State.spinStartTime = performance.now();
  State.lastSectorIndex = -1;

  State.isSpinning = true;
  DOM.btnRollMain.disabled = true;
  DOM.btnSpinCenter.disabled = true;

  // Update tampilan kotak agar slot aktif menunjukkan animasi "Sedang Mengundi..."
  renderWinnerSlots();

  requestAnimationFrame(animateSpin);
}

function animateSpin(currentTime) {
  const elapsed = currentTime - State.spinStartTime;
  const progress = Math.min(1, elapsed / State.spinDuration);
  const eased = easeOutQuart(progress);

  State.currentAngle = State.startAngle + (State.targetAngle - State.startAngle) * eased;
  moonWheel.draw();

  const currentSector = moonWheel.getCurrentSectorIndex();
  if (currentSector !== -1 && currentSector !== State.lastSectorIndex) {
    State.lastSectorIndex = currentSector;
    DOM.currentTickerName.textContent = State.names[currentSector] || '...';

    // Suara Ticker saat jarum melewati pembatas segmen
    if (soundEngine) soundEngine.playTick();

    // Animasi hentakan jarum penunjuk
    DOM.wheelPointer.classList.add('tick');
    setTimeout(() => DOM.wheelPointer.classList.remove('tick'), 60);
  }

  if (progress < 1) {
    requestAnimationFrame(animateSpin);
  } else {
    finishSlotSpin();
  }
}

function finishSlotSpin() {
  State.isSpinning = false;

  const winnerName = State.pendingWinner;
  const rank = State.currentSlotIndex + 1;

  // Simpan pemenang ke array pemenang
  State.winners.push({ rank: rank, name: winnerName });

  // Suara Kemenangan (Oriental Pentatonic Chime)
  if (soundEngine) soundEngine.playVictory();

  // Efek selebrasi confetti / sparkle
  if (sparkleEngine) {
    // Ledakan di tengah layar
    sparkleEngine.burst(window.innerWidth * 0.65, window.innerHeight * 0.55, 75);
    setTimeout(() => sparkleEngine.burst(window.innerWidth * 0.45, window.innerHeight * 0.4, 50), 250);
  }

  // Tampilkan toast ucapan
  showToast(`Selamat! Juara ${rank}: ${winnerName} · 恭喜！`);

  // Majukan giliran ke slot berikutnya
  State.currentSlotIndex++;

  // Render ulang kotak pemenang (slot tadi sekarang terisi)
  renderWinnerSlots();

  // Highlight elemen kartu yang baru terisi
  const filledCard = document.getElementById(`winnerSlot-${rank - 1}`);
  if (filledCard) {
    filledCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Cek apakah masih ada slot tersisa
  if (State.currentSlotIndex < State.winnerCount) {
    // Jika mode Auto-Spin aktif, lanjut putaran berikutnya secara otomatis
    if (State.autoSpin) {
      setTimeout(() => {
        if (State.autoSpin && !State.isSpinning) {
          startSpin();
        }
      }, 1500);
    }
  } else {
    // Semua slot telah terisi!
    if (sparkleEngine) {
      setTimeout(() => sparkleEngine.burst(window.innerWidth / 2, window.innerHeight / 2, 100), 300);
      setTimeout(() => sparkleEngine.burst(window.innerWidth * 0.3, window.innerHeight * 0.4, 70), 600);
      setTimeout(() => sparkleEngine.burst(window.innerWidth * 0.7, window.innerHeight * 0.4, 70), 900);
    }

    setTimeout(() => {
      showToast('🎉 Semua pemenang telah terpilih! Silakan klik Ronde Baru atau Reset Kotak.');
    }, 800);
  }
}

// =============================================================================
// RESET & NEW ROUND ACTIONS
// =============================================================================

// Reset Kotak: Mengosongkan pemenang di kotak tanpa menghapus daftar nama peserta
function resetSlots() {
  if (State.isSpinning || State.isRevealingSlot) return;
  State.currentSlotIndex = 0;
  State.winners = [];
  initMysteryBoxStates();
  renderWinnerSlots();
  if (State.playMode === 'mystery-pin') {
    startTeaserShuffler();
  }
  showToast('Kotak pemenang telah di-reset! Siap mengundi dari Juara 1.');
}

// Ronde Baru: Menghapus para pemenang dari daftar peserta dan memulai sesi undian baru
function startNewRound() {
  if (State.isSpinning || State.isRevealingSlot) return;

  if (State.winners.length === 0) {
    resetSlots();
    return;
  }

  const winnersSet = new Set(State.winners.map(w => w.name));
  const remaining = State.names.filter(n => !winnersSet.has(n));
  const removedCount = State.names.length - remaining.length;

  State.names = remaining;
  DOM.namesQuickInput.value = State.names.join('\n');
  DOM.modalNamesTextarea.value = State.names.join('\n');
  if (DOM.rollerNamesQuickInput) {
    DOM.rollerNamesQuickInput.value = State.names.join('\n');
  }
  saveNamesToStorage();
  updateParticipantBadge();

  State.currentSlotIndex = 0;
  State.winners = [];

  // Sesuaikan winnerCount jika sisa peserta lebih sedikit
  if (State.names.length > 0 && State.winnerCount > State.names.length) {
    State.winnerCount = State.names.length;
    DOM.winnerCountInput.value = State.winnerCount;
    if (DOM.rollerWinnerCountInput) {
      DOM.rollerWinnerCountInput.value = State.winnerCount;
    }
  }

  moonWheel.draw();
  initMysteryBoxStates();
  renderWinnerSlots();
  if (State.playMode === 'mystery-pin') {
    startTeaserShuffler();
  }
  DOM.grandCelebrationModal.classList.add('hidden');

  showToast(`${removedCount} pemenang berhasil dieliminasi! Tersisa ${State.names.length} peserta untuk ronde baru.`);
}

// =============================================================================
// PARTICIPANT NAMES MANAGEMENT
// =============================================================================

function parseNames(text) {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function syncNamesFromInput() {
  const parsed = parseNames(DOM.namesQuickInput.value);
  State.names = parsed;
  DOM.modalNamesTextarea.value = State.names.join('\n');
  updateParticipantBadge();
  if (moonWheel) moonWheel.draw();
  if (State.playMode === 'mystery-pin') {
    initMysteryBoxStates();
    renderWinnerSlots();
  }
  saveNamesToStorage();
}

function updateParticipantBadge() {
  const count = State.names.length;
  DOM.participantCountBadge.textContent = `${count} Peserta`;
  if (DOM.rollerParticipantBadge) {
    DOM.rollerParticipantBadge.textContent = `${count} Peserta`;
  }
  DOM.winnerCountInput.max = Math.max(1, count);
  if (DOM.rollerWinnerCountInput) {
    DOM.rollerWinnerCountInput.max = Math.max(1, count);
  }
}

function handleWinnerCountChange(val) {
  let num = parseInt(val, 10);
  if (isNaN(num) || num < 1) num = 1;
  const max = Math.max(1, State.names.length || 50);
  if (num > max) num = max;

  State.winnerCount = num;
  DOM.winnerCountInput.value = num;
  if (DOM.rollerWinnerCountInput) {
    DOM.rollerWinnerCountInput.value = num;
  }

  initMysteryBoxStates();
  renderWinnerSlots();
  initRollerBoxes();
}

function toggleAutoSpin() {
  State.autoSpin = !State.autoSpin;
  if (State.autoSpin) {
    DOM.btnAutoSpinToggle.classList.add('active');
    const label = State.playMode === 'mystery-pin' ? 'Pin Otomatis: AKTIF' : 'Putar Otomatis: AKTIF';
    DOM.autoSpinLabel.textContent = label;
    showToast('Mode Otomatis Diaktifkan! Semua kotak akan dibuka berurutan.');
    triggerAutoNext();
  } else {
    DOM.btnAutoSpinToggle.classList.remove('active');
    const label = State.playMode === 'mystery-pin' ? 'Pin Otomatis' : 'Putar Otomatis';
    DOM.autoSpinLabel.textContent = label;
    showToast('Mode Otomatis Dinonaktifkan');
  }
}

function triggerAutoNext() {
  if (!State.autoSpin) return;
  if (State.playMode === 'mystery-pin') {
    if (!State.isRevealingSlot) {
      const unpinned = State.boxStates.filter(b => b.status === 'teaser');
      if (unpinned.length > 0) {
        pinMysterySlot(unpinned[0].index);
      } else {
        State.autoSpin = false;
        DOM.btnAutoSpinToggle.classList.remove('active');
        DOM.autoSpinLabel.textContent = 'Pin Otomatis';
      }
    }
  } else {
    if (!State.isSpinning && State.currentSlotIndex < State.winnerCount) {
      startSpin();
    }
  }
}

// =============================================================================
// STORAGE & UTILITIES
// =============================================================================

function saveNamesToStorage() {
  try {
    localStorage.setItem('mid_autumn_picker_names', JSON.stringify(State.names));
  } catch (e) { }
}

function loadNamesFromStorage() {
  try {
    const saved = localStorage.getItem('mid_autumn_picker_names');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        State.names = parsed;
        DOM.namesQuickInput.value = parsed.join('\n');
        DOM.modalNamesTextarea.value = parsed.join('\n');
        if (DOM.rollerNamesQuickInput) DOM.rollerNamesQuickInput.value = parsed.join('\n');
        return;
      }
    }
  } catch (e) { }

  State.names = [...SAMPLE_NAMES];
  DOM.namesQuickInput.value = SAMPLE_NAMES.join('\n');
  DOM.modalNamesTextarea.value = SAMPLE_NAMES.join('\n');
  if (DOM.rollerNamesQuickInput) DOM.rollerNamesQuickInput.value = SAMPLE_NAMES.join('\n');
}

function showToast(msg) {
  DOM.toastMessage.textContent = msg;
  DOM.toastMessage.classList.add('show');
  clearTimeout(DOM.toastTimeout);
  DOM.toastTimeout = setTimeout(() => {
    DOM.toastMessage.classList.remove('show');
  }, 2800);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// INITIALIZATION
// =============================================================================
window.addEventListener('DOMContentLoaded', () => {
  // 1. Partikel Daun Melayang
  new LeafParticlesEngine(DOM.leafCanvas);

  // 2. Partikel Sparkle Selebrasi
  sparkleEngine = new SparkleCelebrationEngine(DOM.sparkleCanvas);

  // 3. Roda Bulan
  moonWheel = new MoonWheelEngine(DOM.moonWheelCanvas);

  // 4. Muat Data Nama & Set Default Pemenang (6 Pemenang Sesuai Mockup Desain)
  loadNamesFromStorage();
  updateParticipantBadge();
  State.winnerCount = parseInt(DOM.winnerCountInput.value, 10) || 6;
  if (DOM.rollerWinnerCountInput) {
    DOM.rollerWinnerCountInput.value = State.winnerCount;
  }

  // 5. Preload Gambar & Gambar Awal
  preloadAssets(() => {
    moonWheel.draw();
  });

  // 6. Inisialisasi State Kotak & Render di Layar
  initMysteryBoxStates();
  renderWinnerSlots();
  initRollerBoxes();

  // 7. Event Listeners: Mode Switcher Tabs
  if (DOM.tabModeWheel) {
    DOM.tabModeWheel.addEventListener('click', () => switchPlayMode('wheel'));
  }
  if (DOM.tabModeMysteryPin) {
    DOM.tabModeMysteryPin.addEventListener('click', () => switchPlayMode('mystery-pin'));
  }
  if (DOM.tabModeRoller) {
    DOM.tabModeRoller.addEventListener('click', () => switchPlayMode('roller'));
  }
  if (DOM.btnShuffleTeaserNames) {
    DOM.btnShuffleTeaserNames.addEventListener('click', shuffleTeaserNamesOnly);
  }

  // 8. Event Listeners: Input & Jumlah Pemenang (Mode 1 & 2)
  DOM.namesQuickInput.addEventListener('input', syncNamesFromInput);

  DOM.btnIncCount.addEventListener('click', () => {
    handleWinnerCountChange(State.winnerCount + 1);
  });

  DOM.btnDecCount.addEventListener('click', () => {
    handleWinnerCountChange(State.winnerCount - 1);
  });

  DOM.winnerCountInput.addEventListener('change', (e) => {
    handleWinnerCountChange(e.target.value);
  });

  // 8b. Event Listeners: Input & Jumlah Pemenang (Mode 3 Roller)
  if (DOM.btnRollerIncCount) {
    DOM.btnRollerIncCount.addEventListener('click', () => {
      handleWinnerCountChange(State.winnerCount + 1);
    });
  }

  if (DOM.btnRollerDecCount) {
    DOM.btnRollerDecCount.addEventListener('click', () => {
      handleWinnerCountChange(State.winnerCount - 1);
    });
  }

  if (DOM.rollerWinnerCountInput) {
    DOM.rollerWinnerCountInput.addEventListener('change', (e) => {
      handleWinnerCountChange(e.target.value);
    });
  }

  if (DOM.rollerNamesQuickInput) {
    DOM.rollerNamesQuickInput.addEventListener('input', (e) => {
      const parsed = parseNames(e.target.value);
      State.names = parsed;
      DOM.namesQuickInput.value = parsed.join('\n');
      DOM.modalNamesTextarea.value = parsed.join('\n');
      updateParticipantBadge();
      saveNamesToStorage();
      initRollerBoxes();
    });
  }

  if (DOM.btnRollerOpenNamesModal) {
    DOM.btnRollerOpenNamesModal.addEventListener('click', () => {
      DOM.modalNamesTextarea.value = State.names.join('\n');
      DOM.namesModal.classList.remove('hidden');
    });
  }

  // 9. Event Listeners: Mode 3 START / STOP Tombol Utama
  if (DOM.btnRollerStartStop) {
    DOM.btnRollerStartStop.addEventListener('click', () => {
      if (State.rollerState.isRolling) {
        triggerRollerSequentialStop();
      } else {
        startRollerLoop();
      }
    });
  }

  if (DOM.btnRollerReset) {
    DOM.btnRollerReset.addEventListener('click', () => {
      stopRollerLoop();
      State.winners = [];
      initRollerBoxes();
      showToast('Kotak roller telah di-reset!');
    });
  }

  if (DOM.btnRollerNewRound) {
    DOM.btnRollerNewRound.addEventListener('click', () => {
      stopRollerLoop();
      startNewRound();
      initRollerBoxes();
    });
  }

  // 9b. Event Listeners: Putar / Pin Aksi Utama (Mode 1 & 2)
  DOM.btnRollMain.addEventListener('click', () => {
    if (State.playMode === 'mystery-pin') {
      pinNextAvailableSlot();
    } else {
      startSpin();
    }
  });

  DOM.btnSpinCenter.addEventListener('click', () => {
    if (State.playMode === 'mystery-pin') {
      pinNextAvailableSlot();
    } else {
      startSpin();
    }
  });

  // 10. Event Listeners: Tombol Aksi Sekunder
  DOM.btnAutoSpinToggle.addEventListener('click', toggleAutoSpin);
  DOM.btnResetSlots.addEventListener('click', resetSlots);
  DOM.btnNewRound.addEventListener('click', startNewRound);

  // 11. Event Listeners: Modal Kelola Nama Lengkap
  DOM.btnOpenNamesModal.addEventListener('click', () => {
    DOM.modalNamesTextarea.value = State.names.join('\n');
    DOM.namesModal.classList.remove('hidden');
  });

  DOM.btnCloseNamesModal.addEventListener('click', () => {
    DOM.namesModal.classList.add('hidden');
  });

  DOM.btnSaveNamesModal.addEventListener('click', () => {
    const parsed = parseNames(DOM.modalNamesTextarea.value);
    State.names = parsed;
    DOM.namesQuickInput.value = parsed.join('\n');
    if (DOM.rollerNamesQuickInput) DOM.rollerNamesQuickInput.value = parsed.join('\n');
    updateParticipantBadge();
    moonWheel.draw();
    saveNamesToStorage();
    initMysteryBoxStates();
    renderWinnerSlots();
    initRollerBoxes();
    DOM.namesModal.classList.add('hidden');
    showToast(`Daftar berhasil diperbarui! (${State.names.length} peserta)`);
  });

  DOM.btnSampleNamesModal.addEventListener('click', () => {
    DOM.modalNamesTextarea.value = SAMPLE_NAMES.join('\n');
  });

  DOM.btnShuffleNamesModal.addEventListener('click', () => {
    const lines = parseNames(DOM.modalNamesTextarea.value);
    lines.sort(() => Math.random() - 0.5);
    DOM.modalNamesTextarea.value = lines.join('\n');
    showToast('Urutan nama diacak!');
  });

  DOM.btnClearNamesModal.addEventListener('click', () => {
    DOM.modalNamesTextarea.value = '';
  });

  // 12. Event Listeners: Modal Selebrasi
  DOM.btnCelebrateNewRound.addEventListener('click', () => {
    DOM.grandCelebrationModal.classList.add('hidden');
    startNewRound();
  });

  DOM.btnCloseCelebrationModal.addEventListener('click', () => {
    DOM.grandCelebrationModal.classList.add('hidden');
  });

  // 13. Keyboard Shortcut: Space bar to spin, pin, or start/stop roller
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' &&
      document.activeElement !== DOM.namesQuickInput &&
      document.activeElement !== DOM.modalNamesTextarea &&
      document.activeElement !== DOM.rollerNamesQuickInput &&
      !State.isSpinning && !State.isRevealingSlot) {
      e.preventDefault();
      if (State.playMode === 'roller') {
        if (State.rollerState.isRolling) {
          triggerRollerSequentialStop();
        } else {
          startRollerLoop();
        }
      } else if (State.playMode === 'mystery-pin') {
        pinNextAvailableSlot();
      } else {
        startSpin();
      }
    }
  });
});

