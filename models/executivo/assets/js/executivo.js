const STORAGE_KEY = "curriculo_modelo_v2"; // edições manuais no template
const FORM_DATA_KEY = "muapp_cv_data"; // dados vindos do formulário
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

  /* ── Nome completo ── */
  if (d.nome) {
    const el = document.querySelector("h1[data-key='name']");
    if (el) el.textContent = d.nome;
  }

  /* ── Cargo / tagline ── */
  if (d.cargo) {
    const el = document.querySelector(".tagline");
    if (el) el.textContent = d.cargo;
  }

  /* ── Contatos ── */
  if (d.cidade) {
    const el = document.querySelector("[data-key='contact-address']");
    if (el) el.textContent = d.cidade;
  }
  if (d.telefone) {
    const el = document.querySelector("[data-key='contact-phone']");
    if (el) el.textContent = d.telefone;
  }
  if (d.email) {
    const el = document.querySelector("[data-key='contact-email']");
    if (el) el.textContent = d.email;
  }
  if (d.linkedin) {
    const el = document.querySelector("[data-key='contact-linkedin']");
    if (el) el.textContent = d.linkedin.replace(/^https?:\/\//, "");
  }

  /* ── Foto ── */
  const foto = d.foto || localStorage.getItem(FOTO_KEY);
  if (foto) {
    const img = document.getElementById("photo-preview");
    const ph = document.getElementById("photo-ph");
    if (img) {
      img.src = foto;
      img.style.display = "block";
    }
    if (ph) ph.style.display = "none";
  }

  /* ── Objetivo profissional ── */
  if (d.objetivo) {
    const el = document.querySelector(".obj");
    if (el) el.textContent = d.objetivo;
  }

  /* ── Hard Skills → #tags-tech (Competências Técnicas) ── */
  if (d.hardSkills && d.hardSkills.length) {
    const container = document.getElementById("tags-tech");
    if (container) {
      // Limpa TODOS os itens existentes (padrão do template)
      container.querySelectorAll(".tag").forEach((el) => el.remove());
      d.hardSkills.forEach((skill) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.contentEditable = "true";
        span.innerHTML = `${skill}<button class="tag-remove" onclick="removeTag(this)">×</button>`;
        container.appendChild(span);
      });
    }
  }

  /* ── Soft Skills → #tags-soft (Perfil Comportamental) ── */
  if (d.softSkills && d.softSkills.length) {
    const container = document.getElementById("tags-soft");
    if (container) {
      // Limpa TODOS os itens existentes (padrão do template)
      container.querySelectorAll(".tag").forEach((el) => el.remove());
      d.softSkills.forEach((skill) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.contentEditable = "true";
        span.innerHTML = `${skill}<button class="tag-remove" onclick="removeTag(this)">×</button>`;
        container.appendChild(span);
      });
    }
  }

  /* ── Idiomas → #lang-list (barras de nível clicáveis) ── */
  if (d.idiomas && d.idiomas.length) {
    const list = document.getElementById("lang-list");
    if (list) {
      // Limpa TODOS os idiomas existentes (padrão do template)
      list.querySelectorAll(".lang-item").forEach((el) => el.remove());

      const nivelPct = {
        Nativo: 100,
        Fluente: 95,
        Avançado: 80,
        "Intermediário avançado": 65,
        Intermediário: 55,
        Elementar: 35,
        Básico: 25,
      };

      d.idiomas.forEach((item) => {
        if (!item.idioma) return;
        const pct = nivelPct[item.nivel] || 50;
        const div = document.createElement("div");
        div.className = "lang-item dyn-block";
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<div class="lang-row">` +
          `<span class="lang-name" contenteditable="true">${item.idioma}</span>` +
          `<span class="lang-lvl" contenteditable="true">${item.nivel || "Básico"}</span>` +
          `</div>` +
          `<div class="lang-bar" title="Clique para ajustar nível">` +
          `<div class="lang-bar-fill" style="width:${pct}%"></div>` +
          `</div>`;
        list.appendChild(div);
      });
      bindLangBars();
    }
  }

  /* ── Formações → #edu-list ── */
  if (d.formacoes && d.formacoes.length) {
    const list = document.getElementById("edu-list");
    if (list) {
      // Limpa TODOS os blocos existentes (padrão do template)
      list.querySelectorAll(".edu").forEach((el) => el.remove());

      d.formacoes.forEach((edu) => {
        if (!edu.curso && !edu.instituicao) return;
        const ano =
          [edu.periodo, edu.status].filter(Boolean).join(" — ") || "Concluído";
        const div = document.createElement("div");
        div.className = "edu dyn-block";
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<div class="edu-deg" contenteditable="true">${edu.curso || "Curso"}</div>` +
          `<div class="edu-school" contenteditable="true">${edu.instituicao || "Instituição"}</div>` +
          `<div class="edu-year" contenteditable="true">${ano}</div>`;
        list.appendChild(div);
      });
    }
  }

  /* ── Cursos complementares → #courses-list ── */
  if (d.cursos && d.cursos.length) {
    const list = document.getElementById("courses-list");
    if (list) {
      // Limpa TODOS os cursos existentes (padrão do template)
      list.querySelectorAll(".course").forEach((el) => el.remove());

      d.cursos.forEach((curso) => {
        if (!curso.nome) return;
        const label = [curso.nome, curso.instituicao, curso.ano]
          .filter(Boolean)
          .join(" — ");
        const div = document.createElement("div");
        div.className = "course dyn-block";
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<span contenteditable="true">${label}</span>`;
        list.appendChild(div);
      });
    }
  }

  /* ── Experiências → #exp-list ── */
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
      // Limpa TODOS os blocos existentes (padrão do template)
      list.querySelectorAll(".exp").forEach((el) => el.remove());

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
            ? exp.periodo.split(/[–-]/)[0].trim() + " - Atual"
            : "Atual"
          : (exp.periodo || "").replace(/\s*[–-]\s*/, " - ");

        const div = document.createElement("div");
        div.className = "exp dyn-block";
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover experiência">×</button>` +
          `<div class="exp-role" contenteditable="true">${exp.cargo || "Cargo"}</div>` +
          `<div class="exp-co" contenteditable="true">${exp.empresa || "Empresa"}${exp.local ? " · " + exp.local : ""}</div>` +
          `<div class="exp-period" contenteditable="true">${periodo || "Período"}</div>` +
          `<ul class="exp-list">${bulletsHTML}</ul>` +
          `<div class="exp-inline-controls">` +
          `<button class="dyn-add-btn" onclick="addLi(this)">+ Item</button>` +
          `<button class="dyn-add-btn" onclick="addBadge(this)">+ Destaque</button>` +
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
    if (ph) ph.style.display = "none";
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

/* ══════════════════ INIT ══════════════════
   1. Edições manuais salvas → carrega elas
   2. Dados do formulário → popula automaticamente
   3. Nada → template padrão
   ════════════════════════════════════════ */
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
