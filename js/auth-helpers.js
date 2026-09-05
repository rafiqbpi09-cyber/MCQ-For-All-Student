function mobileToEmail(mobile) {
  const digits = mobile.replace(/[^0-9]/g, "");
  return `${digits}@mcq.eduplatform.app`;
}

const ROLE_DASHBOARD = {
  student: "student-dashboard.html",
  teacher: "teacher-dashboard.html",
  school: "school-dashboard.html",
  coaching: "coaching-dashboard.html",
  admin: "admin-dashboard.html"
};
