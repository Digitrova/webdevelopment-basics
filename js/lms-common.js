(() => {
  const DB_KEY = 'WEB_ACADEMY_LOCAL_DB_V1';
  const SESSION_KEY = 'WEB_ACADEMY_LOCAL_SESSION';
  const clone = value => JSON.parse(JSON.stringify(value));
  const read = () => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : { users: [], progress: {}, lessonOverrides: {}, settings: { academyName: 'Web Academy' } };
    } catch { return { users: [], progress: {}, lessonOverrides: {}, settings: { academyName: 'Web Academy' } }; }
  };
  const write = db => localStorage.setItem(DB_KEY, JSON.stringify(db));
  const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
  async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const saltBytes = salt ? Uint8Array.from(atob(salt), c => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
    const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 120000, hash: 'SHA-256' }, material, 256);
    return { salt: b64(saltBytes), hash: b64(bits) };
  }
  const currentId = () => { try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; } };
  const currentUser = () => { const id = currentId(); return id ? read().users.find(u => u.id === id) || null : null; };
  const safeUser = user => user ? ({ id:user.id, name:user.name, email:user.email, role:user.role, createdAt:user.createdAt }) : null;
  const api = {
    configured: true,
    get currentUser() { return safeUser(currentUser()); },
    async register({ name, email, password }) {
      const db = read(); email = email.trim().toLowerCase();
      if (!name.trim()) throw new Error('Please enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters.');
      if (db.users.some(u => u.email === email)) throw new Error('An account with this email already exists in this browser.');
      const credential = await hashPassword(password);
      const user = { id: crypto.randomUUID(), name:name.trim(), email, role:'student', ...credential, createdAt:new Date().toISOString() };
      db.users.push(user); db.progress[user.id] = []; write(db); sessionStorage.setItem(SESSION_KEY,user.id);
      return safeUser(user);
    },
    async login(email, password) {
      const db = read(); email = email.trim().toLowerCase();
      const user = db.users.find(u => u.email === email);
      if (!user) throw new Error('Account not found in this browser. Create an account first.');
      const candidate = await hashPassword(password,user.salt);
      if (candidate.hash !== user.hash) throw new Error('Incorrect password.');
      sessionStorage.setItem(SESSION_KEY,user.id); return safeUser(user);
    },
    logout() { sessionStorage.removeItem(SESSION_KEY); },
    async requireUser() { const user = currentUser(); if (!user) { location.href='login.html'; return null; } return safeUser(user); },
    async requireAdmin() { const user = currentUser(); if (!user || user.role !== 'admin') { location.href='admin.html#admin-login'; return null; } return safeUser(user); },
    async setupFirstAdmin({ name,email,password }) {
      const db=read();
      if (db.users.some(u=>u.role==='admin')) throw new Error('An admin account already exists. Sign in instead.');
      const user=await this.register({name,email,password});
      const next=read(); const record=next.users.find(u=>u.id===user.id); record.role='admin'; write(next);
      return safeUser(record);
    },
    async getLessons() {
      const db=read();
      return (window.LMS_LESSONS||[]).map(l=>{const o=db.lessonOverrides[l.id]||{};return {...clone(l),youtubeUrl:o.youtubeUrl||'',notes:o.notes||'',isPublished:o.isPublished!==false};}).filter(l=>l.isPublished);
    },
    youtubeSearch(lesson) { return lesson.youtubeUrl || ('https://www.youtube.com/results?search_query='+encodeURIComponent((lesson.youtubeQuery||lesson.title)+' beginner')); },
    async getProgress(userId) { return new Set(read().progress[userId]||[]); },
    async setComplete(userId,lessonId,complete) {
      const db=read(); if(!db.users.some(u=>u.id===userId)) throw new Error('Student account not found.');
      const list=new Set(db.progress[userId]||[]); complete?list.add(lessonId):list.delete(lessonId);
      db.progress[userId]=[...list]; write(db);
    },
    async saveLesson(id, data) { const db=read();db.lessonOverrides[id]={youtubeUrl:data.youtubeUrl||'',notes:data.notes||'',isPublished:!!data.isPublished};write(db); },
    async getStudents() { const db=read();return db.users.map(u=>({...safeUser(u),completed:(db.progress[u.id]||[]).length})); },
    async setRole(id,role) { const db=read();const u=db.users.find(x=>x.id===id);if(!u)throw new Error('Student not found.');if(role==='admin'&&db.users.filter(x=>x.role==='admin').length===0){}u.role=role;write(db); },
    async resetStudentPassword(id,password) { if(password.length<8)throw new Error('Use at least 8 characters.');const db=read();const u=db.users.find(x=>x.id===id);if(!u)throw new Error('Student not found.');const c=await hashPassword(password);u.salt=c.salt;u.hash=c.hash;write(db); },
    async updatePassword(id,oldPassword,newPassword) { const db=read(),u=db.users.find(x=>x.id===id);if(!u)throw new Error('Account not found.');const old=await hashPassword(oldPassword,u.salt);if(old.hash!==u.hash)throw new Error('Current password is incorrect.');if(newPassword.length<8)throw new Error('New password must be at least 8 characters.');const c=await hashPassword(newPassword);u.salt=c.salt;u.hash=c.hash;write(db); },
    exportData() { return JSON.stringify(read(),null,2); },
    importData(text) { const data=JSON.parse(text);if(!data||!Array.isArray(data.users)||!data.progress||!data.lessonOverrides)throw new Error('This is not a valid Web Academy backup.');write(data); },
    clearAll() { localStorage.removeItem(DB_KEY);sessionStorage.removeItem(SESSION_KEY); },
    getStats() { const db=read();return {students:db.users.length,admins:db.users.filter(u=>u.role==='admin').length,lessons:Object.keys(db.lessonOverrides).length}; }
  };
  window.LMS=api;
})();