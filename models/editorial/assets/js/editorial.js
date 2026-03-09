const STORAGE_KEY = "curriculo_editorial_v1";
const FORM_KEY = "muapp_cv_data";
const PHOTO_KEY = "muapp_foto";

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
  if (!saved) return false;
  try {
    document.getElementById("cv").innerHTML = saved;
    bindSkillBars();
    bindPhotoArea();
    return true;
  } catch (e) {
    console.warn("Erro ao carregar:", e);
    return false;
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

/* ══════════════════ HELPERS DE NÍVEL ══════════════════ */

/**
 * Converte o texto de nível de idioma em percentual para a barra de habilidade.
 * Nativo/Fluente → 100%, Avançado → 80%, Intermediário avançado/Intermediário → 60%,
 * Elementar → 40%, Básico → 20%
 */
function nivelToPercent(nivel) {
  const n = (nivel || "").toLowerCase();
  if (n.includes("nativo") || n.includes("fluente")) return 100;
  if (n.includes("avançado") && !n.includes("intermediário")) return 80;
  if (n.includes("intermediário")) return 60;
  if (n.includes("elementar")) return 40;
  return 20; // Básico ou desconhecido
}

/**
 * Cria o HTML de um skill-item com barra de progresso.
 * @param {string} name  - Nome da habilidade/idioma
 * @param {number} pct   - Percentual de preenchimento (0–100)
 */
function buildSkillItemHTML(name, pct) {
  return (
    '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
    `<span class="skill-name" contenteditable="true">${name}</span>` +
    `<div class="skill-bar-bg" title="Clique para ajustar nível"><div class="skill-bar-fill" style="width:${pct}%"></div></div>`
  );
}

/* ══════════════════ POPULATE FROM FORM ══════════════════ */

/**
 * Lê o JSON salvo pelo formulário (chave FORM_KEY) e preenche
 * todos os campos do template editorial, substituindo os valores padrão.
 */
function populateFromForm() {
  let raw;
  try {
    raw = localStorage.getItem(FORM_KEY);
  } catch (e) {
    console.warn("Não foi possível ler os dados do formulário:", e);
    return;
  }
  if (!raw) return;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.warn("JSON do formulário inválido:", e);
    return;
  }

  /* ── CABEÇALHO ─────────────────────────────────────── */

  // Nome
  const nameEl = document.querySelector(".name");
  if (nameEl && data.nome) nameEl.textContent = data.nome;

  // Cargo / área de atuação
  const roleEl = document.querySelector(".role-tag");
  if (roleEl && data.cargo) roleEl.textContent = data.cargo;

  // Foto: preferência pelo campo `foto` dentro do JSON; fallback para chave separada
  const photoSrc = data.foto || localStorage.getItem(PHOTO_KEY);
  if (photoSrc) {
    const img = document.getElementById("photo-preview");
    const ph = document.getElementById("photo-ph");
    if (img) {
      img.src = photoSrc;
      img.style.display = "block";
    }
    if (ph) ph.style.display = "none";
  }

  /* ── CONTATOS ───────────────────────────────────────── */
  const contactGrid = document.getElementById("contact-grid");
  if (contactGrid) {
    contactGrid.innerHTML = ""; // Limpa todos os itens existentes (inclusive os hardcoded)

    const addContactItem = (text) => {
      if (!text) return;
      const div = document.createElement("div");
      div.className = "contact-item dyn-block";
      div.innerHTML =
        '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
        '<span class="dot"></span>' +
        `<span contenteditable="true">${text}</span>`;
      contactGrid.appendChild(div);
    };

    if (data.cidade) addContactItem(data.cidade);
    if (data.telefone) addContactItem(data.telefone);
    if (data.email) addContactItem(data.email);
    if (data.linkedin) addContactItem(data.linkedin);
    if (data.portfolio) addContactItem(data.portfolio);
  }

  /* ── OBJETIVO ───────────────────────────────────────── */
  const objetivoEl = document.querySelector(".objetivo-text");
  if (objetivoEl && data.objetivo) objetivoEl.textContent = data.objetivo;

  /* ── SOFT SKILLS (Perfil Comportamental) ────────────── */
  const softList = document.getElementById("soft-list");
  if (softList && Array.isArray(data.softSkills) && data.softSkills.length) {
    softList.innerHTML = "";
    data.softSkills.forEach((skill) => {
      const div = document.createElement("div");
      div.className = "soft-skill dyn-block";
      div.innerHTML =
        '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
        `<span contenteditable="true">${skill}</span>`;
      softList.appendChild(div);
    });
  }

  /* ── HARD SKILLS → skills-group-1 (Habilidades) ────── */
  const skillsGroup1 = document.getElementById("skills-group-1");
  if (
    skillsGroup1 &&
    Array.isArray(data.hardSkills) &&
    data.hardSkills.length
  ) {
    skillsGroup1.innerHTML = "";
    data.hardSkills.forEach((skill, i) => {
      // Distribui percentuais decrescentes: 90, 82, 74, 66, ... mínimo 50
      const pct = Math.max(50, 90 - i * 8);
      const div = document.createElement("div");
      div.className = "skill-item dyn-block";
      div.innerHTML = buildSkillItemHTML(skill, pct);
      skillsGroup1.appendChild(div);
    });
    // Rebind dos cliques nas barras recém-criadas
    bindSkillBars();
  }

  /* ── IDIOMAS → skills-group-2 (Competências) ───────── */
  const skillsGroup2 = document.getElementById("skills-group-2");
  if (skillsGroup2 && Array.isArray(data.idiomas) && data.idiomas.length) {
    skillsGroup2.innerHTML = "";
    data.idiomas.forEach(({ idioma, nivel }) => {
      if (!idioma) return;
      const label = nivel ? `${idioma} — ${nivel}` : idioma;
      const pct = nivelToPercent(nivel);
      const div = document.createElement("div");
      div.className = "skill-item dyn-block";
      div.innerHTML = buildSkillItemHTML(label, pct);
      skillsGroup2.appendChild(div);
    });
    bindSkillBars();
  }

  /* ── HARD SKILLS como tool-cards (Ferramentas & Especialidades) ── */
  const toolsGrid = document.getElementById("tools-grid");
  if (toolsGrid && Array.isArray(data.hardSkills) && data.hardSkills.length) {
    toolsGrid.innerHTML = "";
    data.hardSkills.forEach((skill) => {
      const div = document.createElement("div");
      div.className = "tool-card dyn-block";
      div.innerHTML =
        '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
        `<div class="tool-card-name" contenteditable="true">${skill}</div>` +
        '<div class="tool-card-desc" contenteditable="true">Descreva como você usa isso no dia a dia</div>';
      toolsGrid.appendChild(div);
    });
  }

  /* ── EXPERIÊNCIAS / PROJETOS ────────────────────────── */
  const expList = document.getElementById("exp-list");
  if (expList) {
    expList.innerHTML = "";

    const buildBulletsHTML = (descricao) => {
      if (!descricao)
        return '<li contenteditable="true">Descreva suas responsabilidades.<button class="li-remove" onclick="removeLi(this)">×</button></li>';
      const lines = descricao
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      return lines
        .map((line) => {
          // Remove o marcador "—" do início se existir
          const text = line.replace(/^—\s*/, "");
          return `<li contenteditable="true">${text}<button class="li-remove" onclick="removeLi(this)">×</button></li>`;
        })
        .join("");
    };

    if (
      data.expType === "emprego" &&
      Array.isArray(data.experiencias) &&
      data.experiencias.length &&
      !data.neverWorked
    ) {
      data.experiencias.forEach((exp) => {
        const periodoTexto = exp.atual
          ? `${exp.periodo || "Mês Ano"} – Atual`
          : exp.periodo || "Mês Ano – Mês Ano";
        const localStr = exp.local ? ` — ${exp.local}` : "";
        const div = document.createElement("div");
        div.className = "job dyn-block";
        div.innerHTML =
          '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover experiência">×</button>' +
          '<div class="job-header">' +
          `<div class="job-title" contenteditable="true">${exp.cargo || "Cargo"}</div>` +
          `<span class="job-period" contenteditable="true">${periodoTexto}</span>` +
          "</div>" +
          `<div class="job-company" contenteditable="true">${exp.empresa || "Empresa"}${localStr}</div>` +
          `<ul class="job-bullets">${buildBulletsHTML(exp.descricao)}</ul>` +
          '<div class="job-inline-controls"><button class="dyn-add-btn" onclick="addLi(this)">+ Item</button></div>';
        expList.appendChild(div);
      });
    } else if (
      data.expType === "projetos" &&
      Array.isArray(data.projetos) &&
      data.projetos.length
    ) {
      data.projetos.forEach((proj) => {
        const linkHTML = proj.link
          ? ` — <a href="${proj.link}" target="_blank" rel="noopener">${proj.link}</a>`
          : "";
        const div = document.createElement("div");
        div.className = "job dyn-block";
        div.innerHTML =
          '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover projeto">×</button>' +
          '<div class="job-header">' +
          `<div class="job-title" contenteditable="true">${proj.nome || "Projeto"}</div>` +
          `<span class="job-period" contenteditable="true">${proj.periodo || ""}</span>` +
          "</div>" +
          `<div class="job-company" contenteditable="true">${proj.papel || "Função"}${linkHTML}</div>` +
          `<ul class="job-bullets">${buildBulletsHTML(proj.descricao)}</ul>` +
          '<div class="job-inline-controls"><button class="dyn-add-btn" onclick="addLi(this)">+ Item</button></div>';
        expList.appendChild(div);
      });
    } else if (data.neverWorked) {
      // Sem experiência profissional — exibe bloco informativo neutro
      const div = document.createElement("div");
      div.className = "job dyn-block";
      div.innerHTML =
        '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
        '<div class="job-header">' +
        '<div class="job-title" contenteditable="true">Em busca da primeira oportunidade</div>' +
        '<span class="job-period" contenteditable="true"></span>' +
        "</div>" +
        '<div class="job-company" contenteditable="true">Aberto a estágio, trainee e oportunidades de entrada</div>' +
        '<ul class="job-bullets">' +
        '<li contenteditable="true">Descreva projetos acadêmicos, voluntariado ou outras experiências relevantes.<button class="li-remove" onclick="removeLi(this)">×</button></li>' +
        "</ul>" +
        '<div class="job-inline-controls"><button class="dyn-add-btn" onclick="addLi(this)">+ Item</button></div>';
      expList.appendChild(div);
    }
  }

  /* ── FORMAÇÃO ────────────────────────────────────────── */
  const eduList = document.getElementById("edu-list");
  if (eduList && Array.isArray(data.formacoes) && data.formacoes.length) {
    eduList.innerHTML = "";
    data.formacoes.forEach((f) => {
      const statusStr = f.status ? ` (${f.status})` : "";
      const instStr = [f.instituicao, f.periodo].filter(Boolean).join(" — ");
      const div = document.createElement("div");
      div.className = "edu-item dyn-block";
      div.innerHTML =
        '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
        `<div class="edu-degree" contenteditable="true">${f.curso || "Curso"}${statusStr}</div>` +
        `<div class="edu-inst" contenteditable="true">${instStr || "Instituição"}</div>`;
      eduList.appendChild(div);
    });
  }

  /* ── CURSOS COMPLEMENTARES ──────────────────────────── */
  const coursesList = document.getElementById("courses-list");
  if (coursesList && Array.isArray(data.cursos) && data.cursos.length) {
    coursesList.innerHTML = "";
    data.cursos.forEach((c) => {
      const parts = [c.nome, c.instituicao, c.ano].filter(Boolean).join(" — ");
      const div = document.createElement("div");
      div.className = "course-item dyn-block";
      div.innerHTML =
        '<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>' +
        `<span contenteditable="true">${parts}</span>`;
      coursesList.appendChild(div);
    });
  }

  // Persiste o template já populado como edição manual base
  saveAll();
}

/* ══════════════════ INICIALIZAÇÃO (3 prioridades) ══════════════════
 *
 * 1. curriculo_editorial_v1 existe  → usuário já editou o template diretamente
 *    → carrega as edições manuais e para.
 *
 * 2. muapp_cv_data existe mas curriculo_editorial_v1 não existe
 *    → popula do formulário e salva o resultado como edição manual.
 *
 * 3. Nenhum dos dois existe
 *    → mantém os valores padrão do HTML (não faz nada).
 *
 * ════════════════════════════════════════════════════════════════════ */
(function init() {
  const hasManualEdit = !!localStorage.getItem(STORAGE_KEY);
  const hasFormData = !!localStorage.getItem(FORM_KEY);

  if (hasManualEdit) {
    // Prioridade 1: carrega edições manuais
    loadAll();
  } else if (hasFormData) {
    // Prioridade 2: popula a partir dos dados do formulário
    populateFromForm();
  }
  // Prioridade 3: não faz nada — template padrão do HTML já está visível
})();
