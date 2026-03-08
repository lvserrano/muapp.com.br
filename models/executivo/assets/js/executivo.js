const STORAGE_KEY = "curriculo_modelo_v2";

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
    bindLangBars();
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

/* ══════════════════ LANG BARS ══════════════════ */
function bindLangBars() {
  document.querySelectorAll(".lang-bar").forEach((bar) => {
    bar.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      this.querySelector(".lang-bar-fill").style.width = pct + "%";
      saveAll();
    });
  });
}
bindLangBars();

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

/* ══════════════════ REMOVE ══════════════════ */
function removeBlock(btn) {
  btn.closest(".dyn-block").remove();
  saveAll();
}

function removeTag(btn) {
  btn.closest(".tag").remove();
  saveAll();
}

function removeLi(btn) {
  btn.closest("li").remove();
  saveAll();
}

function removeBadge(btn) {
  btn.closest(".badge-wrap").remove();
  saveAll();
}

/* ══════════════════ ADD ══════════════════ */
function addEdu() {
  const list = document.getElementById("edu-list");
  const div = document.createElement("div");
  div.className = "edu dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<div class="edu-deg" contenteditable="true">Grau em Seu Curso</div>' +
    '<div class="edu-school" contenteditable="true">Nome da Instituição</div>' +
    '<div class="edu-year" contenteditable="true">Concluído Mês. Ano</div>';
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addTag(containerId) {
  const container = document.getElementById(containerId);
  const span = document.createElement("span");
  span.className = "tag";
  span.contentEditable = "true";
  span.innerHTML =
    'Nova tag<button class="tag-remove" onclick="removeTag(this)">×</button>';
  container.appendChild(span);
  span.focus();
  saveAll();
}

function addLang() {
  const list = document.getElementById("lang-list");
  const div = document.createElement("div");
  div.className = "lang-item dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<div class="lang-row">' +
    '<span class="lang-name" contenteditable="true">Idioma</span>' +
    '<span class="lang-lvl" contenteditable="true">Nível</span>' +
    "</div>" +
    '<div class="lang-bar" title="Clique para ajustar nível"><div class="lang-bar-fill" style="width:50%"></div></div>';
  list.appendChild(div);
  div.querySelector(".lang-bar").addEventListener("click", function (e) {
    const rect = this.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    this.querySelector(".lang-bar-fill").style.width = pct + "%";
    saveAll();
  });
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addCourse() {
  const list = document.getElementById("courses-list");
  const div = document.createElement("div");
  div.className = "course dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    '<span contenteditable="true">Nome do Curso - Ano</span>';
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addLi(btn) {
  const ul = btn.closest(".exp").querySelector(".exp-list");
  const li = document.createElement("li");
  li.contentEditable = "true";
  li.innerHTML =
    'Nova responsabilidade ou conquista.<button class="li-remove" onclick="removeLi(this)">×</button>';
  ul.appendChild(li);
  li.focus();
  saveAll();
}

function addBadge(btn) {
  const exp = btn.closest(".exp");
  // Only one badge per exp
  if (exp.querySelector(".badge-wrap")) return;
  const wrap = document.createElement("div");
  wrap.className = "badge-wrap";
  wrap.innerHTML =
    '<span class="badge" contenteditable="true">Conquista ou reconhecimento relevante</span>' +
    '<button class="badge-remove" onclick="removeBadge(this)">×</button>';
  const controls = exp.querySelector(".exp-inline-controls");
  controls.insertAdjacentElement("afterend", wrap);
  wrap.querySelector("[contenteditable]").focus();
  saveAll();
}

function addExp() {
  const list = document.getElementById("exp-list");
  const div = document.createElement("div");
  div.className = "exp dyn-block";
  div.innerHTML =
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover experiência">×</button>' +
    '<div class="exp-role" contenteditable="true">Cargo</div>' +
    '<div class="exp-co" contenteditable="true">Nome da Empresa</div>' +
    '<div class="exp-period" contenteditable="true">Mês Ano - Mês Ano</div>' +
    '<ul class="exp-list">' +
    '<li contenteditable="true">Descrição da responsabilidade ou conquista.<button class="li-remove" onclick="removeLi(this)">×</button></li>' +
    "</ul>" +
    '<div class="exp-inline-controls">' +
    '<button class="dyn-add-btn" onclick="addLi(this)">+ Item</button>' +
    '<button class="dyn-add-btn" onclick="addBadge(this)">+ Destaque</button>' +
    "</div>";
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

/* ══════════════════ INIT ══════════════════ */
loadAll();
