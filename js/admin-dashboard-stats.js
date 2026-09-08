(function () {
  // Inject the icon size/color fix directly here so this single file is
  // self-contained — no separate css/style.css edit is required.
  // Scoped strictly to .admin-stat-icon so no other page/element is touched.
  const style = document.createElement('style');
  style.textContent = `
    .admin-stat-icon svg{
      width:20px !important;
      height:20px !important;
      display:block;
      color:#fff;
      opacity:1 !important;
      filter:none !important;
    }
  `;
  document.head.appendChild(style);

  const ICONS = {
    students: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Z" fill="currentColor"/><path d="M5 10.18v4.7c0 .5.24.97.66 1.25C7.05 17.05 9.4 18 12 18s4.95-.95 6.34-1.87c.42-.28.66-.75.66-1.25v-4.7l-7 3.18-7-3.18Z" fill="currentColor"/></svg>',
    teachers: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3V4Z" fill="currentColor"/><path d="M8.5 9.5h7M8.5 12.5h4.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><circle cx="19" cy="16.5" r="3.5" fill="currentColor"/><path d="M19 15v1.6l1.1.9" stroke="#fff" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    quizzes: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="3" width="14" height="18" rx="2.5" fill="currentColor"/><rect x="8.5" y="1.5" width="7" height="3.5" rx="1.2" fill="currentColor"/><path d="M8 10.2h8M8 13.4h8M8 16.6h5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>',
    submissions: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor"/><rect x="10" y="7" width="4" height="13" rx="1" fill="currentColor"/><rect x="16" y="3" width="4" height="17" rx="1" fill="currentColor"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5" fill="currentColor"/><path d="M3.5 9h17" stroke="#fff" stroke-width="1.4"/><path d="M8 3v3M16 3v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 14.5l2.4 2.4L17 9.3" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  const stats = [
    { id: 'totalStudents', label: 'Total Students', icon: ICONS.students, color: 'c-blue' },
    { id: 'totalTeachers', label: 'Total Teachers', icon: ICONS.teachers, color: 'c-purple' },
    { id: 'totalQuizzes', label: 'Total Quizzes', icon: ICONS.quizzes, color: 'c-amber' },
    { id: 'totalSubmissions', label: 'Total Submissions', icon: ICONS.submissions, color: 'c-green' },
    { id: 'todayActivity', label: "Today's Activity", icon: ICONS.activity, color: 'c-teal' }
  ];

  function setLoading() {
    stats.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.textContent = '';
        el.classList.add('is-loading');
      }
    });
  }

  function renderCards() {
    const anchor = document.getElementById('adminStats');
    if (!anchor) return;
    anchor.innerHTML = stats.map((item, index) => `
      <div class="admin-stat-card ${item.color}" style="animation-delay:${index * 60}ms">
        <div class="admin-stat-icon">${item.icon}</div>
        <div class="admin-stat-info">
          <div class="admin-stat-value is-loading" id="${item.id}"></div>
          <div class="admin-stat-label">${item.label}</div>
        </div>
      </div>
    `).join('');
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-loading');
    el.textContent = value;
  }

  function showError() {
    stats.forEach(item => setValue(item.id, '—'));
  }

  async function loadStats() {
    setLoading();
    try {
      const [usersSnapshot, quizzesSnapshot, attemptsSnapshot] = await Promise.all([
        db.collection('users').get(),
        db.collection('quizzes').get(),
        db.collection('quizAttempts').get()
      ]);

      let students = 0;
      let teachers = 0;
      usersSnapshot.forEach(doc => {
        const role = String(doc.data().role || '').toLowerCase();
        if (role === 'student') students++;
        if (role === 'teacher') teachers++;
      });

      let today = 0;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const startMs = start.getTime();
      attemptsSnapshot.forEach(doc => {
        const value = doc.data().submittedAt;
        if (!value) return;
        const date = value.toDate ? value.toDate() : new Date(value);
        if (!Number.isNaN(date.getTime()) && date.getTime() >= startMs) today++;
      });

      setValue('totalStudents', students.toLocaleString());
      setValue('totalTeachers', teachers.toLocaleString());
      setValue('totalQuizzes', quizzesSnapshot.size.toLocaleString());
      setValue('totalSubmissions', attemptsSnapshot.size.toLocaleString());
      setValue('todayActivity', today.toLocaleString());
    } catch (error) {
      showError();
      console.error('Admin statistics load failed:', error);
    }
  }

  function init() {
    renderCards();
    const waitForFirebase = setInterval(() => {
      if (window.db && window.auth) {
        clearInterval(waitForFirebase);
        auth.onAuthStateChanged(user => {
          if (user) loadStats();
        });
      }
    }, 50);
    setTimeout(() => clearInterval(waitForFirebase), 10000);
  }

  init();
})();
