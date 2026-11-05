class Student {
  constructor(id, name, grades, attendance) {
    this.id = id;
    this.name = name;
    this.grades = grades;
    this.attendance = attendance;
  }

  calculateAverage() {
    const total = this.grades.reduce((sum, grade) => sum + grade, 0);
    return total / this.grades.length;
  }

  getGrade(average) {
    if (average >= 90) return "A";
    else if (average >= 80) return "B";
    else if (average >= 70) return "C";
    else if (average >= 60) return "D";
    else if (average >= 50) return "E";
    else return "F";
  }

  getFinalResult(average) {
    if (average >= 50 && this.attendance >= 75) {
      return "ناجح";
    } else {
      return "يحتاج مراجعة";
    }
  }
}

const studentsList = [
  new Student(1, "أحمد محمد", [92, 88, 95], 96),
  new Student(2, "سارة علي", [45, 48, 44], 82),
  new Student(3, "محمد خالد", [72, 68, 75], 78),
  new Student(4, "نور حسن", [40, 46, 49], 90),
];

const studentsTable = document.getElementById("studentsTable");
const mercyList = document.getElementById("mercyList");
const studentForm = document.getElementById("studentForm");
const formMessage = document.getElementById("formMessage");
const studentIdInput = document.getElementById("studentId");
const demoButton = document.getElementById("demoButton");

const confirmDialog = document.getElementById("confirmDialog");
const dialogMessage = document.getElementById("dialogMessage");
const confirmDeleteButton = document.getElementById("confirmDelete");
const cancelDeleteButton = document.getElementById("cancelDelete");
const toast = document.getElementById("toast");

let pendingDeleteId = null;
let toastTimer = null;

function getNextStudentId() {
  return (
    studentsList.reduce(
      (highestId, student) => Math.max(highestId, student.id),
      0
    ) + 1
  );
}

function escapeHTML(value) {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return value.replace(/[&<>"']/g, (character) => characters[character]);
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", isError);
}

function showToast(message, isError = false) {
  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function openDeleteDialog(student) {
  pendingDeleteId = student.id;
  dialogMessage.textContent =
    `هل أنت متأكد إنك عاوز تحذف الطالب ${student.name}؟`;

  confirmDialog.classList.add("open");
  confirmDialog.setAttribute("aria-hidden", "false");
  confirmDeleteButton.focus();
}

function closeDeleteDialog() {
  pendingDeleteId = null;
  confirmDialog.classList.remove("open");
  confirmDialog.setAttribute("aria-hidden", "true");
}

function renderDashboard() {
  const studentsData = studentsList.map((student) => {
    const average = student.calculateAverage();

    return {
      student,
      average,
      grade: student.getGrade(average),
      result: student.getFinalResult(average),
    };
  });

  const mercyResults = studentsList
    .filter((student) => {
      const average = student.calculateAverage();
      return average >= 40 && average <= 49;
    })
    .map((student) => {
      const originalAverage = student.calculateAverage();

      return {
        id: student.id,
        name: student.name,
        originalAverage,
        adjustedAverage: originalAverage + 5,
      };
    });

  const adjustedTotal = mercyResults.reduce(
    (total, student) => total + student.adjustedAverage,
    0
  );

  const mercyAverage =
    mercyResults.length > 0 ? adjustedTotal / mercyResults.length : 0;

  studentsTable.innerHTML = studentsData
    .map(({ student, average, grade, result }) => {
      const passed = result === "ناجح";

      return `
        <tr>
          <td data-label="الطالب">
            <div class="student-cell">
              <span class="student-avatar">
                ${escapeHTML(student.name.charAt(0))}
              </span>
              <span class="student-name">${escapeHTML(student.name)}</span>
            </div>
          </td>
          <td data-label="رقم الجلوس" class="student-id">${student.id}</td>
          <td data-label="الدرجات" class="grade-list">
            ${student.grades.join(" · ")}
          </td>
          <td data-label="الحضور" class="attendance">${student.attendance}%</td>
          <td data-label="المتوسط" class="average-cell">${average.toFixed(1)}</td>
          <td data-label="التقدير">
            <span class="grade-badge">${grade}</span>
          </td>
          <td data-label="النتيجة">
            <span class="result-badge ${passed ? "passed" : "review"}">
              ${result}
            </span>
          </td>
          <td data-label="إجراء">
            <button
              class="delete-button"
              type="button"
              data-delete-id="${student.id}"
              aria-label="حذف الطالب ${escapeHTML(student.name)}"
            >
              🗑️ حذف
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  if (mercyResults.length > 0) {
    mercyList.innerHTML = mercyResults
      .map(
        (student) => `
          <div class="mercy-student">
            <div class="mercy-student-info">
              <span class="student-avatar">
                ${escapeHTML(student.name.charAt(0))}
              </span>
              <div>
                <span class="mercy-student-name">
                  ${escapeHTML(student.name)}
                </span>
                <span class="mercy-student-meta">رقم ${student.id}</span>
              </div>
            </div>
            <div class="mercy-scores">
              <span class="mercy-before">
                ${student.originalAverage.toFixed(1)}
              </span>
              <span class="mercy-after">
                ${student.adjustedAverage.toFixed(1)} ↑
              </span>
            </div>
          </div>
        `
      )
      .join("");
  } else {
    mercyList.innerHTML =
      '<div class="empty-state">لا يوجد طلاب مستحقون للرأفة حاليًا.</div>';
  }

  const passedCount = studentsData.filter(
    ({ result }) => result === "ناجح"
  ).length;

  document.getElementById("totalStudents").textContent = studentsList.length;
  document.getElementById("passedStudents").textContent = passedCount;
  document.getElementById("reviewStudents").textContent =
    studentsList.length - passedCount;
  document.getElementById("mercyStudents").textContent = mercyResults.length;
  document.getElementById("mercyAverage").textContent =
    mercyAverage.toFixed(1);
  document.getElementById("mercyCount").textContent = mercyResults.length;
  document.getElementById("tableCount").textContent =
    `عرض ${studentsList.length} طلاب`;

  console.clear();
  console.log("===== تقرير نتائج الطلاب =====");

  studentsData.forEach(({ student, average, grade, result }) => {
    console.log({
      الاسم: student.name,
      المتوسط: Number(average.toFixed(2)),
      التقدير: grade,
      النتيجة: result,
    });
  });

  console.log("===== الطلاب الذين شملتهم الرأفة =====");
  console.table(mercyResults);

  console.log(
    "متوسط درجات الطلاب المتعثرين بعد الرأفة:",
    Number(mercyAverage.toFixed(2))
  );
}

demoButton.addEventListener("click", () => {
  document.getElementById("studentName").value = "طالب تجريبي";
  studentIdInput.value = getNextStudentId();
  document.getElementById("grade1").value = 45;
  document.getElementById("grade2").value = 48;
  document.getElementById("grade3").value = 44;
  document.getElementById("attendance").value = 85;

  showMessage("تم ملء البيانات التجريبية. راجعها ثم اضغط إضافة الطالب.");
});

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("studentName").value.trim();
  const id = Number(studentIdInput.value);

  const grades = [
    Number(document.getElementById("grade1").value),
    Number(document.getElementById("grade2").value),
    Number(document.getElementById("grade3").value),
  ];

  const attendance = Number(
    document.getElementById("attendance").value
  );

  if (!name) {
    showMessage("اكتب اسم الطالب.", true);
    return;
  }

  if (!Number.isInteger(id) || id < 1) {
    showMessage("رقم الجلوس لازم يكون رقمًا صحيحًا يبدأ من 1.", true);
    return;
  }

  if (studentsList.some((student) => student.id === id)) {
    showMessage("رقم الجلوس ده مستخدم بالفعل. اختار رقمًا تانيًا.", true);
    studentIdInput.focus();
    return;
  }

  const scoresAreValid = [...grades, attendance].every(
    (score) => Number.isFinite(score) && score >= 0 && score <= 100
  );

  if (!scoresAreValid) {
    showMessage("الدرجات والحضور لازم تكون أرقامًا من 0 إلى 100.", true);
    return;
  }

  studentsList.push(new Student(id, name, grades, attendance));

  renderDashboard();
  studentForm.reset();
  studentIdInput.value = getNextStudentId();
  showMessage(`تمت إضافة الطالب ${name} بنجاح.`);
});

studentsTable.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");

  if (!deleteButton) return;

  const studentId = Number(deleteButton.dataset.deleteId);
  const student = studentsList.find((item) => item.id === studentId);

  if (student) {
    openDeleteDialog(student);
  }
});

cancelDeleteButton.addEventListener("click", closeDeleteDialog);

confirmDialog.addEventListener("click", (event) => {
  if (event.target === confirmDialog) {
    closeDeleteDialog();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    confirmDialog.classList.contains("open")
  ) {
    closeDeleteDialog();
  }
});

confirmDeleteButton.addEventListener("click", () => {
  if (pendingDeleteId === null) return;

  const studentIndex = studentsList.findIndex(
    (student) => student.id === pendingDeleteId
  );

  if (studentIndex === -1) {
    closeDeleteDialog();
    return;
  }

  const deletedStudent = studentsList[studentIndex];
  studentsList.splice(studentIndex, 1);

  closeDeleteDialog();
  renderDashboard();

  showToast(`تم حذف الطالب ${deletedStudent.name} بنجاح.`);
});

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const savedTheme = localStorage.getItem("student-dashboard-theme");

if (savedTheme === "light") {
  document.documentElement.dataset.theme = "light";
  themeIcon.textContent = "☾";
  themeToggle.setAttribute("aria-label", "تفعيل الوضع الداكن");
} else if (savedTheme === "dark") {
  document.documentElement.dataset.theme = "dark";
  themeIcon.textContent = "☀";
  themeToggle.setAttribute("aria-label", "تفعيل الوضع الفاتح");
}

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme === "dark";

  if (isDark) {
    document.documentElement.dataset.theme = "light";
    localStorage.setItem("student-dashboard-theme", "light");
    themeIcon.textContent = "☾";
    themeToggle.setAttribute("aria-label", "تفعيل الوضع الداكن");
  } else {
    document.documentElement.dataset.theme = "dark";
    localStorage.setItem("student-dashboard-theme", "dark");
    themeIcon.textContent = "☀";
    themeToggle.setAttribute("aria-label", "تفعيل الوضع الفاتح");
  }
});

renderDashboard();