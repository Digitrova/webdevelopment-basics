(() => {
  'use strict';
  const STORE_KEY = 'web-academy-progress-v1';
  const DEFAULT_CODE = document.getElementById('codeInput')?.value || '';
  const weekBoxes = [...document.querySelectorAll('[data-week]')];
  const projectBoxes = [...document.querySelectorAll('[data-project]')];
  const allBoxes = [...weekBoxes, ...projectBoxes];

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function saveState() {
    const state = {};
    allBoxes.forEach(box => { state[box.dataset.week ? `w${box.dataset.week}` : `p${box.dataset.project}`] = box.checked; });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) { /* storage may be disabled */ }
  }
  function stageForWeek(week) { return week <= 3 ? 1 : week <= 7 ? 2 : week <= 11 ? 3 : week <= 16 ? 4 : week <= 20 ? 5 : 6; }
  function renderProgress() {
    const weeks = weekBoxes.filter(box => box.checked).length;
    const projects = projectBoxes.filter(box => box.checked).length;
    const percent = Math.round((weeks / 24) * 100);
    const ring = document.getElementById('progressRing');
    ring.style.background = `conic-gradient(var(--cyan) ${percent}%, var(--line) ${percent}% 100%)`;
    ring.setAttribute('aria-label', `${percent} percent of curriculum complete`);
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('weeksDone').textContent = `${weeks} / 24`;
    document.getElementById('stagesDone').textContent = `${[1,2,3,4,5,6].filter(stage => weekBoxes.filter(box => stageForWeek(Number(box.dataset.week)) === stage && box.checked).length === weekBoxes.filter(box => stageForWeek(Number(box.dataset.week)) === stage).length && weekBoxes.some(box => stageForWeek(Number(box.dataset.week)) === stage)).length} / 6`;
    document.getElementById('projectsDone').textContent = `${projects} / 8`;
    document.getElementById('progressTitle').textContent = weeks === 24 ? 'Curriculum complete. Now keep building.' : weeks === 0 ? 'Your journey starts here.' : `${weeks} week${weeks === 1 ? '' : 's'} completed. Keep the momentum.`;
    document.getElementById('progressCaption').textContent = `${24 - weeks} curriculum weeks remaining · ${projects} portfolio projects shipped`;
    document.querySelectorAll('[data-stage-progress]').forEach(el => {
      const stage = Number(el.dataset.stageProgress);
      const boxes = weekBoxes.filter(box => stageForWeek(Number(box.dataset.week)) === stage);
      el.textContent = `${boxes.filter(box => box.checked).length} / ${boxes.length}`;
    });
  }
  const saved = readState();
  allBoxes.forEach(box => {
    const key = box.dataset.week ? `w${box.dataset.week}` : `p${box.dataset.project}`;
    box.checked = Boolean(saved[key]);
    box.addEventListener('change', () => { saveState(); renderProgress(); });
  });
  renderProgress();

  document.getElementById('resetProgress').addEventListener('click', () => {
    if (!window.confirm('Reset all saved week and project progress on this browser?')) return;
    allBoxes.forEach(box => { box.checked = false; });
    saveState(); renderProgress();
  });

  document.getElementById('stageFilter').addEventListener('change', event => {
    const value = event.target.value;
    document.querySelectorAll('.stage-card').forEach(card => { card.hidden = value !== 'all' && card.dataset.stage !== value; });
  });

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false');
  }));

  const themeToggle = document.getElementById('themeToggle');
  let theme = 'dark';
  try { theme = localStorage.getItem('web-academy-theme') || 'dark'; } catch (_) {}
  if (theme === 'light') document.body.classList.add('light');
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    theme = document.body.classList.contains('light') ? 'light' : 'dark';
    try { localStorage.setItem('web-academy-theme', theme); } catch (_) {}
  });

  const editor = document.getElementById('codeInput');
  const preview = document.getElementById('codePreview');
  document.getElementById('runCode').addEventListener('click', () => {
    // The preview iframe has sandbox="allow-scripts" without same-origin privileges.
    preview.srcdoc = editor.value;
    document.getElementById('runStatus').textContent = 'Preview updated in isolated frame';
  });
  document.getElementById('resetCode').addEventListener('click', () => {
    editor.value = DEFAULT_CODE;
    preview.srcdoc = '<!doctype html><html><body style="font-family:system-ui;padding:24px;color:#172033">Your preview will appear here.</body></html>';
    document.getElementById('runStatus').textContent = 'Editor reset';
  });

  const questions = [
    {q:'What does semantic HTML primarily improve?',a:['The website’s download speed','The meaning and structure of content','The database connection'],correct:1,why:'Semantic elements describe the purpose of content and improve accessibility and document structure.'},
    {q:'Which CSS layout tool is designed for one-dimensional layouts?',a:['Flexbox','SQL','localStorage'],correct:0,why:'Flexbox is designed primarily for arranging items along one axis; Grid handles two-dimensional layouts.'},
    {q:'What is the purpose of async/await in JavaScript?',a:['To style components','To work with promises using readable syntax','To create database tables'],correct:1,why:'async/await provides syntax for writing asynchronous promise-based code in a sequential style.'}
  ];
  let questionIndex = 0, score = 0, answered = false;
  const qText = document.getElementById('questionText');
  const answers = document.getElementById('answerList');
  const qNumber = document.getElementById('questionNumber');
  const feedback = document.getElementById('quizFeedback');
  const next = document.getElementById('nextQuestion');
  function showQuestion() {
    const item = questions[questionIndex];
    qNumber.textContent = String(questionIndex + 1).padStart(2, '0');
    qText.textContent = item.q;
    answers.replaceChildren();
    item.a.forEach((answer, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = answer; button.dataset.answer = String(index);
      button.addEventListener('click', () => chooseAnswer(index));
      answers.append(button);
    });
    feedback.textContent = 'Choose one answer to continue.';
    feedback.className = 'quiz-feedback';
    next.disabled = true;
    next.textContent = questionIndex === questions.length - 1 ? 'See result →' : 'Next question →';
    answered = false;
  }
  function chooseAnswer(index) {
    if (answered) return;
    answered = true;
    const item = questions[questionIndex];
    const correct = index === item.correct;
    if (correct) score++;
    [...answers.children].forEach((button, i) => {
      button.disabled = true;
      if (i === item.correct) button.classList.add('correct');
      else if (i === index) button.classList.add('wrong');
    });
    feedback.textContent = `${correct ? 'Correct. ' : 'Not quite. '}${item.why}`;
    feedback.classList.add(correct ? 'good' : 'bad');
    document.getElementById('quizScore').textContent = `Score: ${score}`;
    next.disabled = false;
  }
  next.addEventListener('click', () => {
    if (!answered) return;
    if (questionIndex < questions.length - 1) { questionIndex++; showQuestion(); }
    else {
      qText.textContent = `You scored ${score} out of ${questions.length}.`;
      answers.replaceChildren();
      feedback.textContent = score === questions.length ? 'Strong fundamentals. Keep applying them in projects.' : 'Review the explanations, then try again.';
      feedback.className = 'quiz-feedback';
      next.textContent = 'Try again ↺';
      next.disabled = false;
      next.onclick = () => { questionIndex = 0; score = 0; document.getElementById('quizScore').textContent = 'Score: 0'; next.onclick = null; showQuestion(); };
    }
  });
  showQuestion();
})();