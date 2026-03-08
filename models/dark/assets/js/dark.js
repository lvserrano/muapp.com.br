const STORAGE_KEY = "curriculo_moderno_v1";

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
    bindLangDots();
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

let saveTimer;
document.addEventListener("input", () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveAll, 800);
});

/* ══════════════════ SKILL BARS ══════════════════ */
function bindSkillBars() {
  document.querySelectorAll(".skill-track").forEach((track) => {
    track.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      this.querySelector(".skill-fill").style.width = pct + "%";
      saveAll();
    });
  });
}
bindSkillBars();

/* ══════════════════ LANG DOTS ══════════════════ */
function renderDots(container, level) {
  container.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("filled", i < level);
  });
}

function bindLangDots() {
  document.querySelectorAll(".lang-dots").forEach((dots) => {
    dots.addEventListener("click", function (e) {
      const allDots = Array.from(this.querySelectorAll(".dot"));
      const clicked = allDots.indexOf(e.target);
      if (clicked === -1) return;
      const currentLevel = parseInt(this.getAttribute("data-level") || 0);
      const newLevel = clicked + 1 === currentLevel ? clicked : clicked + 1;
      this.setAttribute("data-level", newLevel);
      renderDots(this, newLevel);
      saveAll();
    });
  });
}
bindLangDots();

/* ══════════════════ PHOTO ══════════════════ */
function bindPhotoArea() {
  const input = document.getElementById("photo-input");
  if (input) input.addEventListener("change", photoUpload);
}
bindPhotoArea();

function photoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    const img = document.getElementById("photo-img");
    const ph = document.getElementById("photo-placeholder");
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
  const list = document.getElementById("contact-list");
  const div = document.createElement("div");
  div.className = "contact-item dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<span class="contact-icon">🔗</span>' +
    '<span class="contact-text" contenteditable="true">Novo contato</span>';
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addSoftware() {
  const grid = document.getElementById("software-grid");
  const span = document.createElement("span");
  span.className = "sw-badge dyn-block";
  span.contentEditable = "true";
  span.innerHTML =
    '<button class="sw-badge-remove" onclick="removeBlock(this)" title="Remover">×</button>Nova ferramenta';
  grid.appendChild(span);
  span.focus();
  saveAll();
}

function addSkill() {
  const list = document.getElementById("skills-list");
  const div = document.createElement("div");
  div.className = "skill-row dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<div class="skill-name">' +
    '<span contenteditable="true">Nova Habilidade</span>' +
    '<span class="skill-level-text" contenteditable="true">Nível</span>' +
    "</div>" +
    '<div class="skill-track" title="Clique para ajustar nível"><div class="skill-fill" style="width:60%"></div></div>';
  list.appendChild(div);
  div.querySelector(".skill-track").addEventListener("click", function (e) {
    const rect = this.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    this.querySelector(".skill-fill").style.width = pct + "%";
    saveAll();
  });
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addLang() {
  const list = document.getElementById("lang-list");
  const div = document.createElement("div");
  div.className = "lang-item dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<span class="lang-name" contenteditable="true">Idioma</span>' +
    '<div class="lang-dots" data-level="1">' +
    '<div class="dot filled"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div>' +
    "</div>";
  list.appendChild(div);
  div.querySelector(".lang-dots").addEventListener("click", function (e) {
    const allDots = Array.from(this.querySelectorAll(".dot"));
    const clicked = allDots.indexOf(e.target);
    if (clicked === -1) return;
    const currentLevel = parseInt(this.getAttribute("data-level") || 0);
    const newLevel = clicked + 1 === currentLevel ? clicked : clicked + 1;
    this.setAttribute("data-level", newLevel);
    renderDots(this, newLevel);
    saveAll();
  });
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addLi(btn) {
  const ul = btn.closest(".exp-item").querySelector(".exp-bullets");
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
  div.className = "exp-item dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    "<div>" +
    '<div class="exp-company" contenteditable="true">Nome da Empresa</div>' +
    '<div class="exp-role" contenteditable="true">Cargo ou Função</div>' +
    "</div>" +
    '<div class="exp-date" contenteditable="true">Mês/Ano<br>Mês/Ano</div>' +
    '<ul class="exp-bullets">' +
    '<li contenteditable="true">Descrição da responsabilidade ou conquista.<button class="li-remove" onclick="removeLi(this)">×</button></li>' +
    "</ul>" +
    '<div class="exp-inline-controls">' +
    '<button class="dyn-add-btn" onclick="addLi(this)">+ Item</button>' +
    "</div>";
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addEdu() {
  const list = document.getElementById("edu-list");
  const div = document.createElement("div");
  div.className = "edu-row dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    "<div>" +
    '<div class="edu-name" contenteditable="true">Grau em Seu Curso</div>' +
    '<div class="edu-detail" contenteditable="true">Nome da Instituição — Ano</div>' +
    "</div>" +
    '<span class="edu-tag orange" contenteditable="true">Concluído</span>';
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

// Load on init
loadAll();
