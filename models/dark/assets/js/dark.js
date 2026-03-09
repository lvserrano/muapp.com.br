/* ══════════════════════════════════════════════════════════
   dark.js — Modelo Dark | MuApp
   
   Prioridade de dados:
   1. localStorage "muapp_cv_data"  → dados do formulário (preferencial)
   2. localStorage "curriculo_moderno_v1" → edições manuais diretas no template
   ══════════════════════════════════════════════════════════ */

const STORAGE_KEY = "curriculo_moderno_v1"; // edições manuais no template
const FORM_DATA_KEY = "muapp_cv_data"; // dados vindos do formulário
const FOTO_KEY = "muapp_foto";

/* ══════════════════ POPULATE FROM FORM ══════════════════ */

/**
 * Lê os dados salvos pelo formulário (muapp_cv_data) e preenche
 * os elementos do modelo dark com contenteditable.
 * Só é chamado na primeira carga, se não existir edição manual salva.
 */
function populateFromForm() {
  const raw = localStorage.getItem(FORM_DATA_KEY);
  if (!raw) return false;

  let d;
  try {
    d = JSON.parse(raw);
  } catch (e) {
    return false;
  }

  /* ── Cabeçalho: nome ── */
  if (d.nome) {
    // Estrutura do nome no Dark:
    //   .name-first          → nomes do meio (pequeno, cinza, ex: "LEVI MEIRA DE OLIVEIRA")
    //   .name-last span      → penúltimo sobrenome grande em preto (ex: "SERRANO")
    //   .name-last .accent-word → último sobrenome grande em laranja (ex: "SOBRENOME")
    //
    // Divisão: "Levi Meira de Oliveira Serrano Silva"
    //   → name-first:   "Levi Meira de Oliveira"  (tudo exceto os 2 últimos tokens)
    //   → span preto:   "Serrano"                  (penúltimo token)
    //   → accent-word:  "Silva"                    (último token)
    //
    // Se o nome tiver apenas 2 palavras: name-first fica vazio, preto = primeira, laranja = segunda
    // Se tiver apenas 1 palavra: tudo vai para o span preto

    const parts = d.nome.trim().split(/\s+/);
    let nameFirst = "",
      nameMid = "",
      nameLast = "";

    if (parts.length >= 3) {
      nameFirst = parts.slice(0, -2).join(" "); // todos exceto os 2 últimos
      nameMid = parts[parts.length - 2]; // penúltimo → preto
      nameLast = parts[parts.length - 1]; // último    → laranja
    } else if (parts.length === 2) {
      nameMid = parts[0];
      nameLast = parts[1];
    } else {
      nameMid = parts[0];
    }

    const elFirst = document.querySelector(".name-first");
    const elMid = document.querySelector(".name-last span[contenteditable]");
    const elAccent = document.querySelector(".name-last .accent-word");

    if (elFirst) elFirst.textContent = nameFirst;
    if (elMid) elMid.textContent = nameMid;
    if (elAccent) elAccent.textContent = nameLast;
  }

  /* ── Cargo / subtítulo ── */
  if (d.cargo) {
    const elCargo = document.querySelector(".job-title");
    if (elCargo) elCargo.textContent = d.cargo;
  }

  /* ── Foto ── */
  const foto = d.foto || localStorage.getItem(FOTO_KEY);
  if (foto) {
    const img = document.getElementById("photo-img");
    const ph = document.getElementById("photo-placeholder");
    if (img) {
      img.src = foto;
      img.style.display = "block";
    }
    if (ph) ph.style.display = "none";
  }

  /* ── Objetivo / Resumo ── */
  if (d.objetivo) {
    const elObj = document.querySelector(".profile-summary");
    if (elObj) elObj.textContent = d.objetivo;
  }

  /* ── Contatos (sidebar) ──
     O modelo dark tem itens de contato na lista #contact-list.
     Mapeamos os campos do formulário para ícones + texto.       */
  const contactMap = [
    { icon: "📍", value: d.cidade, label: d.cidade },
    { icon: "📞", value: d.telefone, label: d.telefone },
    { icon: "✉️", value: d.email, label: d.email },
    {
      icon: "💼",
      value: d.linkedin,
      label: d.linkedin ? d.linkedin.replace(/^https?:\/\//, "") : null,
    },
    {
      icon: "🔗",
      value: d.portfolio,
      label: d.portfolio ? d.portfolio.replace(/^https?:\/\//, "") : null,
    },
  ];

  const contactList = document.getElementById("contact-list");
  if (contactList) {
    // Remove apenas os itens que foram gerados automaticamente (não os originais fixos do template)
    // Limpa TODOS os contatos existentes (padrão do template)
    contactList.querySelectorAll(".contact-item").forEach((el) => el.remove());

    // Cria novos itens com dados do formulário
    contactMap.forEach(({ icon, value, label }) => {
      if (!value) return;
      const div = document.createElement("div");
      div.className = "contact-item dyn-block";
      div.innerHTML =
        `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
        `<span class="contact-icon">${icon}</span>` +
        `<span class="contact-text" contenteditable="true">${label}</span>`;
      contactList.appendChild(div);
    });
  }

  /* ── Portfolio links ── */
  if (d.portfolio) {
    const portfolioList = document.getElementById("portfolio-list");
    if (portfolioList) {
      // Limpa itens existentes e cria com dado do formulário
      portfolioList
        .querySelectorAll(".portfolio-item")
        .forEach((el) => el.remove());
      const div = document.createElement("div");
      div.className = "portfolio-item dyn-block";
      div.innerHTML =
        `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
        `<span class="portfolio-icon">🔗</span>` +
        `<span class="portfolio-url" contenteditable="true">${d.portfolio.replace(/^https?:\/\//, "")}</span>`;
      portfolioList.appendChild(div);
    }
  }

  /* ── Hard Skills → #software-grid (badges de ferramenta/técnica) ──
     Ex: React, Figma, Python, Photoshop                              */
  const softGrid = document.getElementById("software-grid");
  if (softGrid && d.hardSkills && d.hardSkills.length) {
    // Limpa TODOS os badges existentes (padrão do template + anteriores)
    softGrid.querySelectorAll(".sw-badge").forEach((el) => el.remove());
    d.hardSkills.forEach((skill) => {
      const span = document.createElement("span");
      span.className = "sw-badge dyn-block";
      span.contentEditable = "true";
      span.innerHTML = `<button class="sw-badge-remove" onclick="removeBlock(this)" title="Remover">×</button>${skill}`;
      softGrid.appendChild(span);
    });
  }

  /* ── Soft Skills → #skills-list (barras de habilidade com nível) ──
     Ex: Liderança, Comunicação, Trabalho em equipe                   */
  const skillsList = document.getElementById("skills-list");
  if (skillsList && d.softSkills && d.softSkills.length) {
    // Limpa TODOS os itens existentes (padrão do template + anteriores)
    skillsList.querySelectorAll(".skill-row").forEach((el) => el.remove());
    d.softSkills.forEach((skill) => {
      const div = document.createElement("div");
      div.className = "skill-row dyn-block";
      div.innerHTML =
        `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
        `<div class="skill-name">` +
        `<span contenteditable="true">${skill}</span>` +
        `<span class="skill-level-text" contenteditable="true">Avançado</span>` +
        `</div>` +
        `<div class="skill-track" title="Clique para ajustar nível">` +
        `<div class="skill-fill" style="width:75%"></div>` +
        `</div>`;
      skillsList.appendChild(div);
    });
    bindSkillBars();
  }

  /* ── Idiomas ── */
  if (d.idiomas && d.idiomas.length) {
    const langList = document.getElementById("lang-list");
    if (langList) {
      // Limpa itens auto anteriores
      // Limpa TODOS os idiomas existentes (padrão do template)
      langList.querySelectorAll(".lang-item").forEach((el) => el.remove());

      // Mapa de nível para número de dots (1–5)
      const nivelDots = {
        Nativo: 5,
        Fluente: 5,
        Avançado: 4,
        "Intermediário avançado": 3,
        Intermediário: 3,
        Elementar: 2,
        Básico: 1,
      };

      d.idiomas.forEach((item) => {
        if (!item.idioma) return;
        const level = nivelDots[item.nivel] || 3;
        const dots = Array.from(
          { length: 5 },
          (_, i) => `<div class="dot${i < level ? " filled" : ""}"></div>`,
        ).join("");

        const div = document.createElement("div");
        div.className = "lang-item dyn-block";
        div.setAttribute("data-auto", "1");
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<span class="lang-name" contenteditable="true">${item.idioma}</span>` +
          `<div class="lang-dots" data-level="${level}">${dots}</div>`;
        langList.appendChild(div);
      });
      bindLangDots();
    }
  }

  /* ── Experiências ── */
  if (d.experiencias && d.experiencias.length) {
    const expList = document.getElementById("exp-list");
    if (expList) {
      // Limpa TODOS os blocos de experiência existentes (padrão do template)
      expList.querySelectorAll(".exp-item").forEach((el) => el.remove());

      d.experiencias.forEach((exp) => {
        if (!exp.empresa && !exp.cargo) return;

        // Converte descricao em bullets: linhas que começam com "—" ou "-"
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

        // Data: usa "Atual" se emprego atual, senão usa periodo
        const dataTexto = exp.atual
          ? exp.periodo
            ? exp.periodo.split("–")[0].trim() + "<br>Atual"
            : "Atual"
          : (exp.periodo || "").replace("–", "<br>").replace(" - ", "<br>");

        const div = document.createElement("div");
        div.className = "exp-item dyn-block";
        div.setAttribute("data-auto", "1");
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<div>` +
          `<div class="exp-company" contenteditable="true">${exp.empresa || "Empresa"}</div>` +
          `<div class="exp-role" contenteditable="true">${exp.cargo || "Cargo"}${exp.local ? " · " + exp.local : ""}</div>` +
          `</div>` +
          `<div class="exp-date" contenteditable="true">${dataTexto || "Período"}</div>` +
          `<ul class="exp-bullets">${bulletsHTML}</ul>` +
          `<div class="exp-inline-controls">` +
          `<button class="dyn-add-btn" onclick="addLi(this)">+ Item</button>` +
          `</div>`;
        expList.appendChild(div);
      });
    }
  } else if (d.projetos && d.projetos.length) {
    /* ── Projetos (quando expType = 'projetos') ── */
    const expList = document.getElementById("exp-list");
    if (expList) {
      // Limpa TODOS os blocos de projeto existentes (padrão do template)
      expList.querySelectorAll(".exp-item").forEach((el) => el.remove());

      d.projetos.forEach((proj) => {
        if (!proj.nome) return;

        const bullets = (proj.descricao || "")
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
          : `<li contenteditable="true">Descrição do projeto.<button class="li-remove" onclick="removeLi(this)">×</button></li>`;

        const div = document.createElement("div");
        div.className = "exp-item dyn-block";
        div.setAttribute("data-auto", "1");
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<div>` +
          `<div class="exp-company" contenteditable="true">${proj.nome}</div>` +
          `<div class="exp-role" contenteditable="true">${proj.papel || "Desenvolvedor"}${proj.link ? " · " + proj.link : ""}</div>` +
          `</div>` +
          `<div class="exp-date" contenteditable="true">${(proj.periodo || "").replace("–", "<br>") || "Período"}</div>` +
          `<ul class="exp-bullets">${bulletsHTML}</ul>` +
          `<div class="exp-inline-controls">` +
          `<button class="dyn-add-btn" onclick="addLi(this)">+ Item</button>` +
          `</div>`;
        expList.appendChild(div);
      });
    }
  }

  /* ── Formações ── */
  if (d.formacoes && d.formacoes.length) {
    const eduList = document.getElementById("edu-list");
    if (eduList) {
      // Limpa TODOS os blocos de formação existentes (padrão do template)
      eduList.querySelectorAll(".edu-row").forEach((el) => el.remove());

      d.formacoes.forEach((edu) => {
        if (!edu.curso && !edu.instituicao) return;

        const statusClass = (edu.status || "").includes("andamento")
          ? "blue"
          : "orange";
        const detail = [edu.instituicao, edu.periodo]
          .filter(Boolean)
          .join(" — ");

        const div = document.createElement("div");
        div.className = "edu-row dyn-block";
        div.setAttribute("data-auto", "1");
        div.innerHTML =
          `<button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>` +
          `<div>` +
          `<div class="edu-name" contenteditable="true">${edu.curso || "Curso"}</div>` +
          `<div class="edu-detail" contenteditable="true">${detail || "Instituição — Ano"}</div>` +
          `</div>` +
          `<span class="edu-tag ${statusClass}" contenteditable="true">${edu.status || "Concluído"}</span>`;
        eduList.appendChild(div);
      });
    }
  }

  /* ── Info strip (cidade / localização) ── */
  if (d.cidade) {
    const infoStrip = document.getElementById("info-strip");
    if (infoStrip) {
      const existing = infoStrip.querySelector(".info-text");
      if (existing) {
        existing.textContent = d.cidade;
      }
    }
  }

  return true; // populado com sucesso
}

/* ══════════════════ SAVE / LOAD (edições manuais) ══════════════════ */

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

/**
 * Limpa apenas os dados do formulário e recarrega o template puro.
 * Útil se o usuário quiser preencher manualmente.
 */
function clearFormData() {
  if (confirm("Remover dados importados do formulário e editar manualmente?")) {
    localStorage.removeItem(FORM_DATA_KEY);
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

function addInfo() {
  const strip = document.getElementById("info-strip");
  const div = document.createElement("div");
  div.className = "info-item dyn-block";
  div.innerHTML = `
    <button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>
    <span class="info-icon" contenteditable="true">📌</span>
    <span class="info-text" contenteditable="true">Nova informação</span>
  `;
  strip.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

function addPortfolio() {
  const list = document.getElementById("portfolio-list");
  const div = document.createElement("div");
  div.className = "portfolio-item dyn-block";
  div.innerHTML = `
    <button class="dyn-remove" onclick="removeBlock(this)" title="Remover">×</button>
    <span class="portfolio-icon" contenteditable="true">🔗</span>
    <span class="portfolio-url" contenteditable="true">novo-link.com</span>
  `;
  list.appendChild(div);
  div.querySelector("[contenteditable]").focus();
  saveAll();
}

/* ══════════════════ INIT ══════════════════
   Lógica de inicialização:
   1. Se existem edições manuais salvas → carrega elas (mantém estado do usuário)
   2. Se não existem edições mas existe dado do formulário → popula do formulário
   3. Se nada existe → template fica com os valores padrão
   ════════════════════════════════════════ */
(function init() {
  const hasManualEdits = !!localStorage.getItem(STORAGE_KEY);
  const hasFormData = !!localStorage.getItem(FORM_DATA_KEY);

  if (hasManualEdits) {
    // Usuário já editou manualmente — respeita as edições
    loadAll();
  } else if (hasFormData) {
    // Primeira visita com dados do formulário — popula automaticamente
    const populated = populateFromForm();
    if (populated) {
      // Salva o estado inicial populado para preservar nas próximas visitas
      setTimeout(saveAll, 300);
    }
  }
  // Se nenhum dado → template fica como está (valores placeholder do HTML)
})();
