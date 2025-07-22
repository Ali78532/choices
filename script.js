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
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
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
          const parent = opt.parentElement;
          if (parent.querySelector('.selected')) return;

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
            const hint = parent.querySelector('.hint');
            if (hint) hint.style.display = 'block';
          }

          parent.querySelectorAll('.option').forEach(o => {
            if (o.dataset.correct === 'true') o.classList.add('correct');
          });

          opt.classList.add('selected');
          answered++;
          scoreEl.textContent = score;

          if (answered === containerEl.querySelectorAll('.question-container').length) {
            resultBox.style.display = 'block';
            showSolutionToggle();
          }
        });
      });
    }

function showSolutionToggle() {
  resultBox.style.display = 'block';
  if (document.getElementById('solution-toggle-msg')) return;

  // 1. رسالة التنبيه
  const msg = document.createElement('p');
  msg.id = 'solution-toggle-msg';
  msg.classList.add('toggle-msg');
  msg.textContent = 'إذا كنت ترغب بأخذ لقطة شاشة يرجى إخفاء الحل لكي لا يظهر الحل لباقي الطلاب';
  resultBox.prepend(msg);

  // 2. فاصل سطر
  resultBox.appendChild(document.createElement('br'));

  // 3. زر "إخفاء الحل"
  const hideBtn = document.createElement('button');
  hideBtn.id = 'hide-btn';
  hideBtn.classList.add('toggle-btn');
  hideBtn.textContent = 'إخفاء الحل';
  hideBtn.style.display = 'block';
  hideBtn.style.margin = '10px auto';
  resultBox.appendChild(hideBtn);

  // 4. زر "عرض الحل"
  const showBtn = document.createElement('button');
  showBtn.id = 'show-btn';
  showBtn.classList.add('toggle-btn');
  showBtn.textContent = 'عرض الحل';
  showBtn.style.display = 'none';
  showBtn.style.margin = '10px auto';
  resultBox.appendChild(showBtn);

  // 5. ربط الأحداث
  hideBtn.addEventListener('click', () => {
    containerEl.style.display = 'none';
    msg.style.display = 'none';
    hideBtn.style.display = 'none';
    showBtn.style.display = 'block';
    document.body.classList.add('solutions-hidden');
  });

  showBtn.addEventListener('click', () => {
    containerEl.style.display = 'block';
    msg.style.display = 'block';
    hideBtn.style.display = 'block';
    showBtn.style.display = 'none';
    document.body.classList.remove('solutions-hidden');
  });
}
