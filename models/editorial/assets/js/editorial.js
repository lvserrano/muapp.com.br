const STORAGE_KEY = "curriculo_editorial_v1";

/* ══════════════════ SAVE / LOAD ══════════════════ */
function saveAll() {
  try {
    localStorage.setItem(STORAGE_KEY, document.getElementById("cv").innerHTML);
  } catch (e) {
    console.warn("Erro ao salvar:", e);
  }
  showToast();
}

function loadAll() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    document.getElementById("cv").innerHTML = saved;
    bindSkillBars();
    bindPhotoArea();
  } catch (e) {
    console.warn("Erro ao carregar:", e);
  }
}

function resetAll() {
  if (confirm("Restaurar todos os campos para os dados originais?")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

function showToast() {
  const t = document.getElementById("toast");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

// Auto-save on any edit
let saveTimer;
document.addEventListener("input", () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveAll, 800);
});

/* ══════════════════ SKILL BARS ══════════════════ */
function bindSkillBars() {
  document.querySelectorAll(".skill-bar-bg").forEach((bar) => {
    bar.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      this.querySelector(".skill-bar-fill").style.width = pct + "%";
      saveAll();
    });
  });
}
bindSkillBars();

/* ══════════════════ PHOTO ══════════════════ */
function bindPhotoArea() {
  const area = document.getElementById("photo-area");
  const input = document.getElementById("photo-input");
  if (area) area.onclick = () => input && input.click();
  if (input) input.addEventListener("change", photoUpload);
}
bindPhotoArea();

function photoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    const img = document.getElementById("photo-preview");
    const ph = document.getElementById("photo-ph");
    if (img) {
      img.src = ev.target.result;
      img.style.display = "block";
    }
    if (ph) {
      ph.style.display = "none";
    }
    saveAll();
  };
  reader.readAsDataURL(file);
}

/* ══════════════════ CONTACT HOVER ══════════════════ */
const headerInfo = document.querySelector(".header-info");
const contactAddRow = document.getElementById("contact-add-row");
if (headerInfo && contactAddRow) {
  headerInfo.addEventListener("mouseenter", () => {
    contactAddRow.style.opacity = "1";
    contactAddRow.style.pointerEvents = "all";
  });
  headerInfo.addEventListener("mouseleave", () => {
    contactAddRow.style.opacity = "0";
    contactAddRow.style.pointerEvents = "none";
  });
}

/* ══════════════════ REMOVE ══════════════════ */
function removeBlock(btn) {
  btn.closest(".dyn-block").remove();
  saveAll();
}

function removeLi(btn) {
  btn.closest("li").remove();
  saveAll();
}

/* ══════════════════ ADD ══════════════════ */
function addContact() {
  const grid = document.getElementById("contact-grid");
  const div = document.createElement("div");
  div.className = "contact-item dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<span class="dot"></span>' +
    '<span contenteditable="true">Novo contato</span>';
  grid.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addSkill(groupId) {
  const group = document.getElementById(groupId);
  const div = document.createElement("div");
  div.className = "skill-item dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<span class="skill-name" contenteditable="true">Nova Habilidade</span>' +
    '<div class="skill-bar-bg" title="Clique para ajustar nível"><div class="skill-bar-fill" style="width:60%"></div></div>';
  group.appendChild(div);
  div.querySelector(".skill-bar-bg").addEventListener("click", function (e) {
    const rect = this.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    this.querySelector(".skill-bar-fill").style.width = pct + "%";
    saveAll();
  });
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addEdu() {
  const list = document.getElementById("edu-list");
  const div = document.createElement("div");
  div.className = "edu-item dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<div class="edu-degree" contenteditable="true">Grau em Seu Curso</div>' +
    '<div class="edu-inst" contenteditable="true">Nome da Instituição — Ano</div>';
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addSoft() {
  const list = document.getElementById("soft-list");
  const div = document.createElement("div");
  div.className = "soft-skill dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<span contenteditable="true">Nova característica</span>';
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addToolCard() {
  const grid = document.getElementById("tools-grid");
  const div = document.createElement("div");
  div.className = "tool-card dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<div class="tool-card-name" contenteditable="true">Ferramenta ou Área</div>' +
    '<div class="tool-card-desc" contenteditable="true">Descreva como você usa isso no dia a dia</div>';
  grid.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addCourse() {
  const list = document.getElementById("courses-list");
  const div = document.createElement("div");
  div.className = "course-item dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<span contenteditable="true">Nome do Curso — Instituição</span>';
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addLi(btn) {
  const ul = btn.closest(".job").querySelector(".job-bullets");
  const li = document.createElement("li");
  li.contentEditable = "true";
  li.innerHTML =
    'Nova responsabilidade ou conquista.<button class="li-remove" onclick="removeLi(this)">×</button>';
  ul.appendChild(li);
  li.focus();
  saveAll();
}

function addExp() {
  const list = document.getElementById("exp-list");
  const div = document.createElement("div");
  div.className = "job dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover experiência">×</button>' +
    '<div class="job-header">' +
    '<div class="job-title" contenteditable="true">Cargo</div>' +
    '<span class="job-period" contenteditable="true">Mês Ano – Mês Ano</span>' +
    "</div>" +
    '<div class="job-company" contenteditable="true">Nome da Empresa — Cidade, Estado</div>' +
    '<ul class="job-bullets">' +
    '<li contenteditable="true">Descrição da responsabilidade ou conquista.<button class="li-remove" onclick="removeLi(this)">×</button></li>' +
    "</ul>" +
    '<div class="job-inline-controls">' +
    '<button class="dyn-add-btn" onclick="addLi(this)">+ Item</button>' +
    "</div>";
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

// Load saved data on init
loadAll();
