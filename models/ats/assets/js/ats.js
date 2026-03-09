const STORAGE_KEY = "curriculo_ats_v1";
const FORM_DATA_KEY = "muapp_cv_data";
const FOTO_KEY = "muapp_foto";

/* ══════════════════ POPULATE FROM FORM ══════════════════ */

function populateFromForm() {
  const raw = localStorage.getItem(FORM_DATA_KEY);
  if (!raw) return false;

  let d;
  try {
    d = JSON.parse(raw);
  } catch (e) {
    return false;
  }

  /* ── Nome ── */
  if (d.nome) {
    const el = document.querySelector(".cv-name");
    if (el) el.textContent = d.nome;
  }

  /* ── Cargo / título ── */
  if (d.cargo) {
    const el = document.querySelector(".cv-title");
    if (el) el.textContent = d.cargo;
  }

  /* ── Contatos: limpa todos e reconstrói ── */
  const contactList = document.getElementById("contact-list");
  if (contactList) {
    contactList
      .querySelectorAll(".cv-contact, .cv-contact-sep")
      .forEach((el) => el.remove());

    const contacts = [
      d.cidade,
      d.telefone,
      d.email,
      d.linkedin ? d.linkedin.replace(/^https?:\/\//, "") : null,
      d.portfolio ? d.portfolio.replace(/^https?:\/\//, "") : null,
    ].filter(Boolean);

    contacts.forEach((value, i) => {
      if (i > 0) {
        const sep = document.createElement("span");
        sep.className = "cv-contact-sep";
        sep.textContent = "|";
        contactList.insertBefore(
          sep,
          contactList.querySelector(".cv-header-add-row"),
        );
      }
      const span = document.createElement("span");
      span.className = "cv-contact dyn-block";
      span.innerHTML =
        `<button class="dyn-remove" onclick="removeContact(this)" title="Remover">×</button>` +
        `<span contenteditable="true">${value}</span>`;
      contactList.insertBefore(
        span,
        contactList.querySelector(".cv-header-add-row"),
      );
    });
  }

  /* ── Objetivo ── */
  if (d.objetivo) {
    const el = document.querySelector(".cv-objective");
    if (el) el.textContent = d.objetivo;
  }

  /* ── Habilidades:
     hardSkills → grupo "Técnicas / Ferramentas"
     softSkills → grupo "Comportamentais"               ── */
  const skillsGrid = document.getElementById("skills-grid");
  if (skillsGrid) {
    skillsGrid.querySelectorAll(".cv-skill-group").forEach((el) => el.remove());

    const addGroup = (label, items) => {
      if (!items || !items.length) return;
      const div = document.createElement("div");
      div.className = "cv-skill-group dyn-block";
      div.innerHTML =
        `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
        `<span class="cv-skill-label" contenteditable="true">${label}</span>` +
        `<span class="cv-skill-items" contenteditable="true">${items.join(", ")}</span>`;
      skillsGrid.appendChild(div);
    };

    addGroup("Técnicas", d.hardSkills);
    addGroup("Comportamentais", d.softSkills);
  }

  /* ── Idiomas ── */
  if (d.idiomas && d.idiomas.length) {
    const list = document.getElementById("lang-list");
    if (list) {
      list.querySelectorAll(".cv-lang").forEach((el) => el.remove());

      d.idiomas.forEach((item) => {
        if (!item.idioma) return;
        const div = document.createElement("div");
        div.className = "cv-lang dyn-block";
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<span class="cv-lang-name" contenteditable="true">${item.idioma}</span>` +
          `<span class="cv-lang-sep">–</span>` +
          `<span class="cv-lang-level" contenteditable="true">${item.nivel || "Básico"}</span>`;
        list.appendChild(div);
      });
    }
  }

  /* ── Formações ── */
  if (d.formacoes && d.formacoes.length) {
    const list = document.getElementById("edu-list");
    if (list) {
      list.querySelectorAll(".cv-edu").forEach((el) => el.remove());

      d.formacoes.forEach((edu) => {
        if (!edu.curso && !edu.instituicao) return;
        const escola = [edu.instituicao, edu.status]
          .filter(Boolean)
          .join(" · ");
        const div = document.createElement("div");
        div.className = "cv-edu dyn-block";
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<div class="cv-edu-header">` +
          `<div class="cv-edu-left">` +
          `<div class="cv-edu-degree" contenteditable="true">${edu.curso || "Curso"}</div>` +
          `<div class="cv-edu-school" contenteditable="true">${escola || "Instituição"}</div>` +
          `</div>` +
          `<div class="cv-edu-year" contenteditable="true">${edu.periodo || ""}</div>` +
          `</div>`;
        list.appendChild(div);
      });
    }
  }

  /* ── Cursos complementares ── */
  if (d.cursos && d.cursos.length) {
    const list = document.getElementById("courses-list");
    if (list) {
      list.querySelectorAll(".cv-course").forEach((el) => el.remove());

      d.cursos.forEach((curso) => {
        if (!curso.nome) return;
        const div = document.createElement("div");
        div.className = "cv-course dyn-block";
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<div class="cv-course-header">` +
          `<div class="cv-course-left">` +
          `<span class="cv-course-name" contenteditable="true">${curso.nome}</span>` +
          `<span class="cv-course-inst" contenteditable="true">${curso.instituicao || ""}</span>` +
          `</div>` +
          `<span class="cv-course-year" contenteditable="true">${curso.ano || ""}</span>` +
          `</div>`;
        list.appendChild(div);
      });
    }
  }

  /* ── Experiências (ou projetos como fallback) ── */
  const exps =
    d.experiencias && d.experiencias.length
      ? d.experiencias
      : d.projetos && d.projetos.length
        ? d.projetos.map((p) => ({
            empresa: p.nome,
            cargo: p.papel || "Desenvolvedor",
            periodo: p.periodo,
            local: p.link || "",
            atual: false,
            descricao: p.descricao,
          }))
        : null;

  if (exps && exps.length) {
    const list = document.getElementById("exp-list");
    if (list) {
      list.querySelectorAll(".cv-exp").forEach((el) => el.remove());

      exps.forEach((exp) => {
        if (!exp.empresa && !exp.cargo) return;

        const bullets = (exp.descricao || "")
          .split("\n")
          .map((l) => l.replace(/^[\-—]\s*/, "").trim())
          .filter(Boolean);

        const bulletsHTML = bullets.length
          ? bullets
              .map(
                (b) =>
                  `<li contenteditable="true">${b}<button class="li-remove" onclick="removeLi(this)">×</button></li>`,
              )
              .join("")
          : `<li contenteditable="true">Descrição da responsabilidade ou conquista.<button class="li-remove" onclick="removeLi(this)">×</button></li>`;

        const periodo = exp.atual
          ? exp.periodo
            ? exp.periodo.split(/[–\-]/)[0].trim() + " – Atual"
            : "Atual"
          : (exp.periodo || "").replace(/\s*[–\-]\s*/, " – ");

        const empresa = [exp.empresa, exp.local].filter(Boolean).join(" · ");

        const div = document.createElement("div");
        div.className = "cv-exp dyn-block";
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<div class="cv-exp-header">` +
          `<div class="cv-exp-left">` +
          `<div class="cv-exp-role" contenteditable="true">${exp.cargo || "Cargo"}</div>` +
          `<div class="cv-exp-company" contenteditable="true">${empresa || "Empresa"}</div>` +
          `</div>` +
          `<div class="cv-exp-period" contenteditable="true">${periodo || "Período"}</div>` +
          `</div>` +
          `<ul class="cv-bullets">${bulletsHTML}</ul>` +
          `<div class="exp-inline-controls">` +
          `<button class="dyn-add-btn" onclick="addLi(this)">+ Item</button>` +
          `</div>`;
        list.appendChild(div);
      });
    }
  }

  return true;
}

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

/* ══════════════════ REMOVE ══════════════════ */

function removeBlock(btn) {
  btn.closest(".dyn-block").remove();
  saveAll();
}

function removeLi(btn) {
  btn.closest("li").remove();
  saveAll();
}

/* Remove contato junto com o separador adjacente */
function removeContact(btn) {
  const block = btn.closest(".cv-contact");
  const parent = block.parentElement;
  // Remove o separador anterior ou seguinte
  const prev = block.previousElementSibling;
  const next = block.nextElementSibling;
  if (next && next.classList.contains("cv-contact-sep")) next.remove();
  else if (prev && prev.classList.contains("cv-contact-sep")) prev.remove();
  block.remove();
  saveAll();
}

/* ══════════════════ ADD ══════════════════ */

function addContact() {
  const list = document.getElementById("contact-list");
  const addRow = list.querySelector(".cv-header-add-row");

  // Adiciona separador se já houver contatos
  const existing = list.querySelectorAll(".cv-contact");
  if (existing.length > 0) {
    const sep = document.createElement("span");
    sep.className = "cv-contact-sep";
    sep.textContent = "|";
    list.insertBefore(sep, addRow);
  }

  const span = document.createElement("span");
  span.className = "cv-contact dyn-block";
  span.innerHTML =
    `<button class="dyn-remove" onclick="removeContact(this)" title="Remover">×</button>` +
    `<span contenteditable="true">Novo contato</span>`;
  list.insertBefore(span, addRow);
  span.querySelector("[contenteditable]").focus();
  saveAll();
}

function addExp() {
  const list = document.getElementById("exp-list");
  const div = document.createElement("div");
  div.className = "cv-exp dyn-block";
  div.innerHTML =
    `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
    `<div class="cv-exp-header">` +
    `<div class="cv-exp-left">` +
    `<div class="cv-exp-role" contenteditable="true">Cargo</div>` +
    `<div class="cv-exp-company" contenteditable="true">Empresa · Cidade, UF</div>` +
    `</div>` +
    `<div class="cv-exp-period" contenteditable="true">Mês Ano – Mês Ano</div>` +
    `</div>` +
    `<ul class="cv-bullets">` +
    `<li contenteditable="true">Descrição da responsabilidade ou conquista.<button class="li-remove" onclick="removeLi(this)">×</button></li>` +
    `</ul>` +
    `<div class="exp-inline-controls">` +
    `<button class="dyn-add-btn" onclick="addLi(this)">+ Item</button>` +
    `</div>`;
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addLi(btn) {
  const ul = btn.closest(".cv-exp").querySelector(".cv-bullets");
  const li = document.createElement("li");
  li.contentEditable = "true";
  li.innerHTML = `Nova responsabilidade ou conquista.<button class="li-remove" onclick="removeLi(this)">×</button>`;
  ul.appendChild(li);
  li.focus();
  saveAll();
}

function addEdu() {
  const list = document.getElementById("edu-list");
  const div = document.createElement("div");
  div.className = "cv-edu dyn-block";
  div.innerHTML =
    `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
    `<div class="cv-edu-header">` +
    `<div class="cv-edu-left">` +
    `<div class="cv-edu-degree" contenteditable="true">Grau em Seu Curso</div>` +
    `<div class="cv-edu-school" contenteditable="true">Nome da Universidade · Cidade, UF</div>` +
    `</div>` +
    `<div class="cv-edu-year" contenteditable="true">Ano – Ano</div>` +
    `</div>`;
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addSkillGroup() {
  const grid = document.getElementById("skills-grid");
  const div = document.createElement("div");
  div.className = "cv-skill-group dyn-block";
  div.innerHTML =
    `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
    `<span class="cv-skill-label" contenteditable="true">Categoria</span>` +
    `<span class="cv-skill-items" contenteditable="true">Item 1, Item 2, Item 3</span>`;
  grid.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addLang() {
  const list = document.getElementById("lang-list");
  const div = document.createElement("div");
  div.className = "cv-lang dyn-block";
  div.innerHTML =
    `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
    `<span class="cv-lang-name" contenteditable="true">Idioma</span>` +
    `<span class="cv-lang-sep">–</span>` +
    `<span class="cv-lang-level" contenteditable="true">Nível</span>`;
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addCourse() {
  const list = document.getElementById("courses-list");
  const div = document.createElement("div");
  div.className = "cv-course dyn-block";
  div.innerHTML =
    `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
    `<div class="cv-course-header">` +
    `<div class="cv-course-left">` +
    `<span class="cv-course-name" contenteditable="true">Nome do Curso</span>` +
    `<span class="cv-course-inst" contenteditable="true">Instituição</span>` +
    `</div>` +
    `<span class="cv-course-year" contenteditable="true">Ano</span>` +
    `</div>`;
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

/* ══════════════════ INIT ══════════════════ */
(function init() {
  const hasManualEdits = !!localStorage.getItem(STORAGE_KEY);
  const hasFormData = !!localStorage.getItem(FORM_DATA_KEY);

  if (hasManualEdits) {
    loadAll();
  } else if (hasFormData) {
    const populated = populateFromForm();
    if (populated) setTimeout(saveAll, 300);
  }
})();
