/* ============================================================
   PORTFOLIO STARTER — main.js
   3 kaam: (1) mobile menu, (2) dark mode, (3) form validation
   Har hissa guard ke saath likha hai, taake yehi file
   learning.html jaise doosre pages par bhi safe chale.
   ============================================================ */

/* ---------- 1) MOBILE MENU ---------- */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');       // menu kholein ya band karein
    menuBtn.classList.toggle('open');        // hamburger icon -> X
    const isOpen = navLinks.classList.contains('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  // Menu kholne ke baad kisi link par click karo to menu band ho jaye
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- 2) DARK / LIGHT MODE ---------- */
const themeBtn = document.getElementById('themeBtn');

if (themeBtn) {
  const savedTheme = localStorage.getItem('theme');   // pichli baar ka yaad
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }

  themeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');   // class badal do
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); // yaad rakh lo
  });
}

/* ---------- 3) FORM VALIDATION ---------- */
const form = document.getElementById('contactForm');
const statusMsg = document.getElementById('formStatus');

if (form && statusMsg) {
  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();   // form ko page reload karne se rokein

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    let isValid = true;

    if (name.length < 2) {
      setError('nameError', 'Naam kam se kam 2 harf ka ho.');
      isValid = false;
    } else {
      setError('nameError', '');
    }

    // Simple email check — @ aur . dono hona chahiye
    if (!email.includes('@') || !email.includes('.')) {
      setError('emailError', 'Sahi email address likhein.');
      isValid = false;
    } else {
      setError('emailError', '');
    }

    if (message.length < 10) {
      setError('messageError', 'Message kam se kam 10 harf ka ho.');
      isValid = false;
    } else {
      setError('messageError', '');
    }

    if (isValid) {
      statusMsg.textContent = 'Shukriya! Message mil gaya hai.';
      form.reset();
    } else {
      statusMsg.textContent = 'Pehle upar wale errors theek karein.';
    }
  });

  // Jab user kisi field mein type kare to uska error hat jaye
  ['name', 'email', 'message'].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.addEventListener('input', () => {
      const map = { name: 'nameError', email: 'emailError', message: 'messageError' };
      setError(map[fieldId], '');
      statusMsg.textContent = '';
    });
  });
}

/* ---------- 4) FOOTER KA SAAL ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- 5) NAVBAR MEIN ACTIVE LINK ---------- */
// Jaise user scroll kare, us hisse ka link highlight hota rahe
const sections = document.querySelectorAll('main section');
const navAnchors = navLinks ? navLinks.querySelectorAll('a') : [];

if (sections.length && navAnchors.length) {
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 140;
    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        navAnchors.forEach((a) => a.classList.remove('active'));
        const current = navLinks.querySelector(`a[href="#${section.id}"]`);
        if (current) current.classList.add('active');
      }
    });
  });
}
