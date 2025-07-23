const correctSoundEl = document.getElementById('correct-sound');
const wrongSoundEl   = document.getElementById('wrong-sound');
correctSoundEl.load();
wrongSoundEl.load();

const params   = new URLSearchParams(location.search);
const testName = params.get('test') || 'test1';

const titleEl     = document.getElementById('quiz-title');
const containerEl = document.getElementById('quiz-container');
const resultBox   = document.getElementById('result-box');
const scoreEl     = document.getElementById('score');

let finalScore = 0; // لتخزين الدرجة النهائية

function celebrate() {
  const colors = ['#e91e63', '#ffeb3b', '#4caf50', '#2196f3', '#ff9800', '#9c27b0'];
  const count = 50;
  for (let i = 0; i < count; i++) {
    const sq = document.createElement('div');
    sq.classList.add('confetti');
    const bg = colors[Math.floor(Math.random() * colors.length)];
    sq.style.setProperty('--bg', bg);
    sq.style.setProperty('--o', (0.7 + Math.random() * 0.3));
    sq.style.setProperty('--w', (6 + Math.random() * 6) + 'px');
    sq.style.setProperty('--h', (4 + Math.random() * 8) + 'px');
    sq.style.setProperty('--dx', (Math.random() * 100 - 50) + 'vw');
    sq.style.setProperty('--dy', window.innerHeight + 200 + 'px');
    sq.style.setProperty('--r', Math.random() * 720);
    sq.style.setProperty('--dur', (3 + Math.random() * 2) + 's');
    sq.style.animationDelay = Math.random() * 2 + 's';
    sq.style.top = '-10px';
    sq.style.left = Math.random() * window.innerWidth + 'px';
    document.body.appendChild(sq);
    sq.addEventListener('animationend', () => sq.remove());
  }
}

fetch(`tests/${testName}.html`)
  .then(r => r.ok ? r.text() : Promise.reject(`HTTP ${r.status}`))
  .then(html => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const h1 = temp.querySelector('h1');
    if (h1) {
      titleEl.textContent = h1.textContent;
      document.title = h1.textContent;
      h1.remove();
    }
    containerEl.innerHTML = temp.innerHTML;
    initQuiz();
  })
  .catch(err => {
    console.error('فشل تحميل الاختبار:', err);
    containerEl.innerHTML = '<p>عذرًا، لم أتمكن من تحميل هذا الاختبار.</p>';
  });

function initQuiz() {
  let score = 0;
  let answered = 0;
  const options = containerEl.querySelectorAll('.option');

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      if (opt.parentElement.querySelector('.selected')) return;
      const isCorrect = opt.dataset.correct === 'true';
      if (isCorrect) {
        correctSoundEl.currentTime = 0;
        correctSoundEl.play();
        opt.classList.add('correct');
        score += 2;
        celebrate();
      } else {
        wrongSoundEl.currentTime = 0;
        wrongSoundEl.play();
        if (navigator.vibrate) navigator.vibrate(80);
        opt.classList.add('wrong');
        const hint = opt.parentElement.querySelector('.hint');
        if (hint) hint.style.display = 'block';
      }

      opt.parentElement.querySelectorAll('.option').forEach(o => {
        if (o.dataset.correct === 'true') o.classList.add('correct');
      });

      opt.classList.add('selected');
      answered++;

      if (answered === containerEl.querySelectorAll('.question-container').length) {
        finalScore = score;
        showScoreButton();
      }
    });
  });
}

function showScoreButton() {
  if (document.getElementById('show-score-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'show-score-btn';
  btn.classList.add('toggle-btn');
  btn.textContent = 'عرض الدرجة';
  btn.style.display = 'block';
  btn.style.margin = '20px auto';
  containerEl.parentElement.appendChild(btn);

  btn.addEventListener('click', () => {
    containerEl.style.display = 'none';
    btn.remove();
    scoreEl.textContent = finalScore;
    resultBox.style.display = 'block';

    const solBtn = document.createElement('button');
    solBtn.id = 'show-solution-btn';
    solBtn.classList.add('toggle-btn');
    solBtn.textContent = 'عرض الحل';
    solBtn.style.display = 'block';
    solBtn.style.margin = '20px auto';
    resultBox.appendChild(solBtn);

    solBtn.addEventListener('click', () => {
      containerEl.style.display = 'block';
      resultBox.style.display = 'none';
      solBtn.remove();
      // إعادة زر عرض الدرجة
      showScoreButton();
    });
  });
}