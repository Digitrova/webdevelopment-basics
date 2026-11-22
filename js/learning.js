/* ============================================================
   LEARNING PAGE — js/learning.js
   2 kaam: (1) type filter, (2) progress checklist (localStorage)
   ============================================================ */

/* ---------- 1) TYPE FILTER ---------- */
const filterRow = document.getElementById('typeFilter');
const typeCards = document.querySelectorAll('#typeGrid .type-card');

if (filterRow) {
  filterRow.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    // Active button badlein
    filterRow.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const level = btn.getAttribute('data-f');

    // Sirf us level ke cards dikhayein
    typeCards.forEach((card) => {
      const show = level === 'all' || card.getAttribute('data-lvl') === level;
      card.classList.toggle('hide', !show);
    });
  });
}

/* ---------- 2) PROGRESS CHECKLIST ---------- */
const KEY = 'learning-progress-v1';
const boxes = document.querySelectorAll('#checkGrid input[type="checkbox"]');
const bar = document.getElementById('bar');
const pct = document.getElementById('pct');
const count = document.getElementById('count');
const resetBtn = document.getElementById('resetBtn');

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    boxes.forEach((box) => {
      if (saved[box.getAttribute('data-k')]) box.checked = true;
    });
  } catch (e) {
    // localStorage band ho to chalta rahe — koi crash nahi hona chahiye
  }
}

function updateProgress() {
  const total = boxes.length;
  const done = Array.from(boxes).filter((b) => b.checked).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  if (bar) bar.style.width = percent + '%';
  if (pct) pct.textContent = percent + '%';
  if (count) count.textContent = done + ' / ' + total + ' cheezen ho gayi';

  // Progress browser mein save karein
  const data = {};
  boxes.forEach((b) => { data[b.getAttribute('data-k')] = b.checked; });
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

boxes.forEach((box) => {
  box.addEventListener('change', updateProgress);
});

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    boxes.forEach((b) => { b.checked = false; });
    updateProgress();
  });
}

loadProgress();
updateProgress();
