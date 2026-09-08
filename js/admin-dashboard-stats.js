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
