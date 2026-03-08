// ─── STATE ───────────────────────────────────────────────
let currentStep = 0;
const TOTAL_STEPS = 8;
const STORAGE_KEY = "muapp_cv_data";

const tags = { hardSkills: [], softSkills: [] };

// ─── INIT ─────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  setProfile("primemprego");
  loadData();
  renderAllDynamic();
  updateUI();
});

// ─── VALIDATION ──────────────────────────────────────────
// Returns: 'done' | 'partial' | 'empty'
// done   = tudo obrigatório preenchido (verde)
// partial= mínimo obrigatório atendido mas sem tudo (amarelo)
// empty  = não tocado ou insuficiente (cinza) — bloqueia avanço
function getStepStatus(step) {
  // ── Step 0: Dados Pessoais ──
  // obrigatórios: nome + cargo
  // done = nome+cargo+pelo menos mais 2 campos opcionais
  if (step === 0) {
    const nome = val("nome").trim();
    const cargo = val("cargo").trim();
    const cidade = val("cidade").trim();
    const tel = val("telefone").trim();
    const email = val("email").trim();
    const li = val("linkedin").trim();
    const port = val("portfolio").trim();
    if (!nome && !cargo && !cidade && !tel && !email) return "empty";
    if (!nome || !cargo) return "partial"; // algo digitado mas req faltando
    const extras = [cidade, tel, email, li, port].filter(Boolean).length;
    if (extras >= 2) return "done";
    return "partial"; // req OK mas poucos campos opcionais
  }

  // ── Step 1: Objetivo ──
  // done = texto com mais de 60 chars; partial = algo escrito; empty = nada
  if (step === 1) {
    const obj = val("objetivo").trim();
    if (!obj) return "empty";
    if (obj.length >= 60) return "done";
    return "partial";
  }

  // ── Step 2: Experiência ──
  if (step === 2) {
    const type = blockData.expType || "emprego";
    if (blockData.neverWorked) {
      // "nunca trabalhei" selecionado — verde só se tem projetos, amarelo se não tem
      const hasProj = blockData.proj.some((e) => e.nome?.trim());
      return hasProj ? "done" : "partial";
    }
    if (type === "projetos") {
      const complete = blockData.proj.some(
        (e) => e.nome?.trim() && e.descricao?.trim(),
      );
      const partial = blockData.proj.some((e) => e.nome?.trim());
      if (complete) return "done";
      if (partial) return "partial";
      return "empty";
    }
    // emprego
    const complete = blockData.exp.some(
      (e) => e.empresa?.trim() && e.cargo?.trim() && e.descricao?.trim(),
    );
    const partial = blockData.exp.some(
      (e) => e.empresa?.trim() || e.cargo?.trim(),
    );
    if (complete) return "done";
    if (partial) return "partial";
    return "empty";
  }

  // ── Step 3: Formação ──
  // done = ao menos 1 formação com curso+instituição+status
  // partial = curso+instituição mas sem status; ou só um dos dois
  // empty = nada
  if (step === 3) {
    const complete = blockData.educ.some(
      (e) => e.curso?.trim() && e.instituicao?.trim() && e.status,
    );
    const partial = blockData.educ.some(
      (e) => e.curso?.trim() || e.instituicao?.trim(),
    );
    if (complete) return "done";
    if (partial) return "partial";
    return "empty";
  }

  // ── Step 4: Habilidades ──
  // done = 3+ tags; partial = 1-2; empty = 0 (bloqueia)
  if (step === 4) {
    const total = tags.hardSkills.length + tags.softSkills.length;
    if (total >= 3) return "done";
    if (total >= 1) return "partial";
    return "empty";
  }

  // ── Step 5: Idiomas ──
  // Obrigatório ao menos 1 idioma com nível
  // done = 2+ idiomas com nível; partial = 1 com nível; empty = nenhum
  if (step === 5) {
    const complete = blockData.idioma.filter(
      (e) => e.idioma?.trim() && e.nivel,
    );
    if (complete.length >= 2) return "done";
    if (complete.length === 1) return "partial";
    const hasAny = blockData.idioma.some((e) => e.idioma?.trim());
    if (hasAny) return "partial"; // idioma sem nível
    return "empty";
  }

  // ── Step 6: Cursos (OPCIONAL) ──
  // done = tem cursos; empty = não tem (mas NÃO bloqueia)
  // amarelo não faz sentido aqui — ou tem ou não tem
  if (step === 6) {
    const hasAny = blockData.curso.some((e) => e.nome?.trim());
    return hasAny ? "done" : "empty"; // empty mas não bloqueia
  }

  return "empty";
}

// Required fields per step — false blocks nextStep/goToStep
function validateStep(step) {
  if (step === 0) {
    if (!val("nome").trim() || !val("cargo").trim()) {
      shakeInvalid(step);
      showToast(
        "Preencha pelo menos o nome completo e o cargo para continuar.",
      );
      return false;
    }
  }
  if (step === 1) {
    if (!val("objetivo").trim()) {
      shakeInvalid(step);
      showToast("Escreva seu objetivo profissional para continuar.");
      return false;
    }
  }
  if (step === 2) {
    if (blockData.neverWorked) return true; // "nunca trabalhei" selecionado
    const hasExp = blockData.exp.some(
      (e) => e.empresa?.trim() && e.cargo?.trim(),
    );
    const hasProj = blockData.proj.some((e) => e.nome?.trim());
    if (!hasExp && !hasProj) {
      shakeInvalid(step);
      showToast(
        'Adicione uma experiência, um projeto, ou selecione "Nunca trabalhei ainda".',
      );
      return false;
    }
  }
  if (step === 3) {
    const hasEduc = blockData.educ.some(
      (e) => e.curso?.trim() && e.instituicao?.trim(),
    );
    if (!hasEduc) {
      shakeInvalid(step);
      showToast("Adicione ao menos uma formação com curso e instituição.");
      return false;
    }
  }
  if (step === 4) {
    const total = tags.hardSkills.length + tags.softSkills.length;
    if (total < 1) {
      shakeInvalid(step);
      showToast("Adicione ao menos uma habilidade para continuar.");
      return false;
    }
  }
  if (step === 5) {
    const hasIdioma = blockData.idioma.some((e) => e.idioma?.trim() && e.nivel);
    if (!hasIdioma) {
      shakeInvalid(step);
      showToast(
        "Adicione ao menos um idioma com nível (ex: Português — Nativo).",
      );
      return false;
    }
  }
  // Step 6 (cursos) é opcional — sempre deixa passar
  return true;
}

function shakeInvalid(step) {
  const section = document.getElementById("step-" + step);
  section.style.animation = "none";
  section.offsetHeight; // reflow
  section.style.animation = "shake 0.4s ease";
}

// ─── TOAST ────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = `
          position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(0.95);
          background:var(--ink); color:var(--paper); font-family:"DM Sans",sans-serif;
          font-size:0.9rem; font-weight:400; padding:1.5rem 2rem;
          border-radius:6px; z-index:10000; box-shadow:0 20px 60px rgba(0,0,0,0.4);
          border-left:4px solid var(--accent); opacity:0;
          transition:opacity 0.25s, transform 0.25s;
          pointer-events:none; max-width:380px; text-align:center; line-height:1.5;
        `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  toast.style.transform = "translate(-50%,-50%) scale(1)";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%,-50%) scale(0.95)";
  }, 3000);
}

// ─── NAVIGATION ──────────────────────────────────────────
function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < TOTAL_STEPS - 1) {
    currentStep++;
    updateUI();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    updateUI();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function goToStep(n) {
  if (n > currentStep) {
    for (let i = currentStep; i < n; i++) {
      if (!validateStep(i)) return;
    }
  }
  currentStep = n;
  updateUI();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateUI() {
  // Sections
  document.querySelectorAll(".form-section").forEach((s, i) => {
    s.classList.toggle("active", i === currentStep);
  });
  // Sidebar buttons
  document.querySelectorAll(".step-btn").forEach((btn, i) => {
    btn.classList.remove("active", "done", "partial");
    if (i === currentStep) {
      btn.classList.add("active");
    } else {
      const status = getStepStatus(i);
      if (status === "done") btn.classList.add("done");
      else if (status === "partial") btn.classList.add("partial");
      // 'empty' = no class = default gray
    }
  });
  // Progress — based on how many steps are done/partial
  const filled = [0, 1, 2, 3, 4, 5, 6].filter(
    (i) => getStepStatus(i) !== "empty",
  ).length;
  const pct = Math.round((filled / 7) * 100);
  document.getElementById("progressFill").style.width = pct + "%";
}

// ─── AUTOSAVE ─────────────────────────────────────────────
let saveTimeout;
function autosave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveData();
    showSaveIndicator();
  }, 600);
}

function showSaveIndicator() {
  const el = document.getElementById("saveIndicator");
  el.classList.add("show");
  updateUI(); // refresh sidebar step states
  setTimeout(() => el.classList.remove("show"), 2500);
}

function getData() {
  return {
    // Dados pessoais
    nome: val("nome"),
    cargo: val("cargo"),
    cidade: val("cidade"),
    telefone: val("telefone"),
    email: val("email"),
    linkedin: val("linkedin"),
    portfolio: val("portfolio"),
    foto: localStorage.getItem("muapp_foto") || "",
    // Objetivo
    objetivo: val("objetivo"),
    // Skills
    hardSkills: [...tags.hardSkills],
    softSkills: [...tags.softSkills],
    // Dynamic blocks
    expType: blockData.expType,
    neverWorked: blockData.neverWorked,
    experiencias: blockData.exp,
    projetos: blockData.proj,
    formacoes: blockData.educ,
    idiomas: blockData.idioma,
    cursos: blockData.curso,
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getData()));
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    setVal("nome", d.nome);
    setVal("cargo", d.cargo);
    setVal("cidade", d.cidade);
    setVal("telefone", d.telefone);
    setVal("email", d.email);
    setVal("linkedin", d.linkedin);
    setVal("portfolio", d.portfolio);
    setVal("objetivo", d.objetivo);
    if (d.foto) loadPhotoFromBase64(d.foto);

    // Tags
    (d.hardSkills || []).forEach((t) => addTag("hardSkills", t));
    (d.softSkills || []).forEach((t) => addTag("softSkills", t));

    // Blocks
    if (d.expType) blockData.expType = d.expType;
    if (d.neverWorked) blockData.neverWorked = d.neverWorked;
    if (d.experiencias?.length) blockData.exp = d.experiencias;
    if (d.projetos?.length) blockData.proj = d.projetos;
    if (d.formacoes?.length) blockData.educ = d.formacoes;
    if (d.idiomas?.length) blockData.idioma = d.idiomas;
    if (d.cursos?.length) blockData.curso = d.cursos;
  } catch (e) {
    console.warn("Load error", e);
  }
}

function val(id) {
  return document.getElementById(id)?.value || "";
}
function setVal(id, v) {
  const el = document.getElementById(id);
  if (el && v) el.value = v;
}

// ─── PHOTO ────────────────────────────────────────────────
function handlePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert("Foto muito grande. Máx 2MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    loadPhotoFromBase64(e.target.result);
    localStorage.setItem("muapp_foto", e.target.result);
    autosave();
  };
  reader.readAsDataURL(file);
}

function loadPhotoFromBase64(src) {
  const preview = document.getElementById("photoPreview");
  preview.innerHTML = `<img src="${src}" alt="Foto">`;
}

// ─── TAGS ─────────────────────────────────────────────────
function handleTagInput(e, type) {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    const input = e.target;
    const value = input.value.replace(",", "").trim();
    if (value) {
      addTag(type, value);
      input.value = "";
      autosave();
    }
  }
  if (e.key === "Backspace" && e.target.value === "" && tags[type].length) {
    removeTag(type, tags[type].length - 1);
    autosave();
  }
}

function addTag(type, text) {
  if (!text || tags[type].includes(text)) return;
  tags[type].push(text);
  renderTags(type);
}

function removeTag(type, idx) {
  tags[type].splice(idx, 1);
  renderTags(type);
  autosave();
}

function renderTags(type) {
  const wrapper = document.getElementById(type + "Wrapper");
  const input = document.getElementById(type + "Input");
  wrapper.querySelectorAll(".tag").forEach((t) => t.remove());
  tags[type].forEach((t, i) => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `${t}<button class="tag-remove" onclick="removeTag('${type}',${i})" title="Remover">×</button>`;
    wrapper.insertBefore(tag, input);
  });
}

// ─── DYNAMIC BLOCKS ──────────────────────────────────────
const blockData = {
  exp: [],
  proj: [],
  educ: [],
  idioma: [],
  curso: [],
  neverWorked: false,
  expType: "emprego",
};

function getBlockData(type) {
  const list = document.getElementById(type + "List");
  if (!list) return blockData[type];
  return blockData[type];
}

function renderAllDynamic() {
  renderBlocks("exp");
  renderBlocks("proj");
  renderBlocks("educ");
  renderBlocks("idioma");
  renderBlocks("curso");
  // restore exp type tab
  setExpType(blockData.expType || "emprego", true);
}

function renderBlocks(type) {
  const list = document.getElementById(type + "List");
  if (!list) return;
  list.innerHTML = "";
  if (blockData[type].length === 0) {
    // Only auto-add a blank block for exp and educ (expected to have at least one)
    if (type === "exp") addExp(true);
    if (type === "educ") addEduc(true);
    // proj, idioma, curso: start empty — user clicks "Adicionar"
  } else {
    blockData[type].forEach((_, i) => appendBlock(type, i));
  }
}

function appendBlock(type, idx) {
  const list = document.getElementById(type + "List");
  const data = blockData[type][idx] || {};
  const el = document.createElement("div");
  el.className = "block-item";
  el.id = `${type}-block-${idx}`;
  el.innerHTML = blockTemplate(type, idx, data);
  list.appendChild(el);
}

function addExp(silent) {
  const idx = blockData.exp.length;
  blockData.exp.push({});
  appendBlock("exp", idx);
  if (!silent) autosave();
}

function addEduc(silent) {
  const idx = blockData.educ.length;
  blockData.educ.push({});
  appendBlock("educ", idx);
  if (!silent) autosave();
}

function addIdioma(silent) {
  const idx = blockData.idioma.length;
  // Pre-fill first entry as Português / Nativo
  const entry = idx === 0 ? { idioma: "Português", nivel: "Nativo" } : {};
  blockData.idioma.push(entry);
  appendBlock("idioma", idx);
  if (idx === 0) saveBlock("idioma", 0); // persist the default
  if (!silent) {
    autosave();
    updateUI();
  }
}

function addCurso(silent) {
  const idx = blockData.curso.length;
  blockData.curso.push({});
  appendBlock("curso", idx);
  if (!silent) autosave();
}

function addProj(silent) {
  const idx = blockData.proj.length;
  blockData.proj.push({});
  appendBlock("proj", idx);
  if (!silent) autosave();
}

function setExpType(type, silent) {
  blockData.expType = type;
  blockData.neverWorked = type === "nunca";
  // tabs
  document
    .querySelectorAll(".exp-tab")
    .forEach((t) => t.classList.remove("active"));
  const tab = document.getElementById("tab-" + type);
  if (tab) tab.classList.add("active");
  // content panels
  ["emprego", "projetos", "nunca"].forEach((t) => {
    const el = document.getElementById("exp-content-" + t);
    if (el) el.style.display = t === type ? "" : "none";
  });
  if (!silent) autosave();
  updateUI();
}

function removeBlock(type, idx) {
  blockData[type].splice(idx, 1);
  const list = document.getElementById(type + "List");
  list.innerHTML = "";
  blockData[type].forEach((_, i) => appendBlock(type, i));
  autosave();
}

// ─── PROFILES ──────────────────────────────────────────────
const PROFILES = {
  primemprego: {
    nome: "Ex: Lucas Ferreira dos Santos",
    cargo: "Ex: Assistente Administrativo · Jovem Aprendiz",
    cidade: "Ex: São Paulo, SP",
    telefone: "(11) 98765-4321",
    email: "lucas.santos@email.com",
    linkedin: "linkedin.com/in/lucas-santos",
    portfolio: "github.com/lucas-santos",
    objetivo:
      "Busco minha primeira oportunidade profissional como Jovem Aprendiz ou Assistente, onde possa aplicar os conhecimentos adquiridos no Ensino Médio e contribuir com dedicação. Sou comunicativo, organizado e aprendo rápido.",
    exp_empresa: "Ex: Projeto voluntário na escola / Iniciação Científica",
    exp_cargo: "Ex: Monitor de Informática · Voluntário",
    exp_descricao:
      "— Apoiei colegas no laboratório de informática.\n— Participei de projeto de extensão sobre meio ambiente.\n— Desenvolvi trabalho de conclusão sobre sustentabilidade.",
    educ_curso: "Ensino Médio Completo",
    educ_inst: "E.E. Prof. João da Silva",
    proj_nome: "Ex: Projeto de Iniciação Científica — Escola",
    curso_nome: "Pacote Office Básico / Intermediário",
    curso_inst: "Senac / Microcamp",
    hardSkillsEx: "Pacote Office, Canva, Digitação Rápida, Excel Básico",
    softSkillsEx: "Proatividade, Comunicação, Trabalho em Equipe, Pontualidade",
    labelPortfolio: "GitHub / Projeto escolar",
    tipPortfolio:
      "Coloque o link de um projeto escolar ou repositório, caso tenha.",
    tipObjetivo:
      "Para primeiro emprego, foque em atitudes e disposição para aprender. Mencione o curso que faz ou o que quer seguir profissionalmente.",
  },
  programador: {
    nome: "Ex: Rafael Oliveira",
    cargo: "Ex: Desenvolvedor Full Stack · React & Node.js",
    cidade: "Ex: Belo Horizonte, MG",
    telefone: "(31) 99123-4567",
    email: "rafael.dev@gmail.com",
    linkedin: "linkedin.com/in/rafael-oliveira-dev",
    portfolio: "github.com/rafaeldev",
    objetivo:
      "Atuar como Desenvolvedor Full Stack em equipes ágeis, construindo produtos escaláveis com React, Node.js e PostgreSQL. Último emprego: Desenvolvedor Pleno na Microsoft Brasil. Graduando em Ciência da Computação pela PUC-MG.",
    exp_empresa: "Ex: Microsoft · Google · Amazon · Nubank · iFood",
    exp_cargo: "Ex: Desenvolvedor Full Stack Pleno · Software Engineer",
    exp_descricao:
      "— Desenvolvi microsserviços em Node.js servindo 1M+ req/dia.\n— Reduzi tempo de build em 40% com otimizações de CI/CD.\n— Contribuí com code reviews e onboarding de novos devs.",
    educ_curso: "Bacharelado em Ciência da Computação / Eng. de Software",
    educ_inst: "PUC-MG / UFMG / USP / UNICAMP",
    proj_nome: "Ex: API REST para e-commerce · App de gerenciamento de tarefas",
    curso_nome: "AWS Cloud Practitioner · Docker & Kubernetes",
    curso_inst: "Alura / Rocketseat / Coursera / Udemy",
    hardSkillsEx: "React, Node.js, TypeScript, PostgreSQL, Docker, Git, AWS",
    softSkillsEx:
      "Resolução de problemas, Trabalho remoto, Code review, Documentação",
    labelPortfolio: "GitHub / Portfolio de projetos",
    tipPortfolio:
      "Link do seu GitHub ou portfólio com projetos pinados e READMEs bem escritos.",
    tipObjetivo:
      "Para devs, mencione stack principal, nível (júnior/pleno/sênior), tipo de empresa/produto que busca e último emprego ou projeto relevante.",
  },
  designer: {
    nome: "Ex: Isabela Ramos",
    cargo: "Ex: UX/UI Designer · Product Design",
    cidade: "Ex: São Paulo, SP",
    telefone: "(11) 94567-8901",
    email: "isa.design@gmail.com",
    linkedin: "linkedin.com/in/isabela-ramos-ux",
    portfolio: "behance.net/isabela-ramos",
    objetivo:
      "Atuar como UX Designer criando experiências digitais centradas no usuário. Sólida experiência com Figma, Design System e pesquisa qualitativa. Último projeto: redesign do app da Vivo, aumentando a retenção em 18%. Graduanda em Design pela ESPM.",
    exp_empresa: "Ex: Vivo · Itaú · Conta Azul · Nubank · Frog Design",
    exp_cargo: "Ex: UX/UI Designer · Product Designer · Visual Designer",
    exp_descricao:
      "— Conduzi pesquisas com usuários e criou protótipos no Figma.\n— Desenvolvi e mantive Design System com 200+ componentes.\n— Colaborei com times de produto e engenharia em sprints quinzenais.",
    educ_curso: "Bacharelado em Design / Design Gráfico / Design de Produto",
    educ_inst: "ESPM / Belas Artes / UFRJ / SENAI CETIQT",
    proj_nome: "Ex: Redesign do app Vivo · Design System interno",
    curso_nome:
      "Google UX Design Certificate · Motion Design com After Effects",
    curso_inst: "Coursera / Origamid / School of Motion",
    hardSkillsEx:
      "Figma, Adobe XD, Photoshop, Illustrator, After Effects, Maze",
    softSkillsEx:
      "Empatia, Storytelling visual, Colaboração, Thinking criativo",
    labelPortfolio: "Behance / Dribbble / Portfolio pessoal",
    tipPortfolio:
      "Coloque o link do seu Behance, Dribbble ou site com seus cases. Certifique-se que os projetos estão atualizados e descritos.",
    tipObjetivo:
      "Para designers, mencione especialidade (UX, UI, motion, brand), ferramenta principal, e um resultado de projeto relevante. Evite genérico — números ajudam muito.",
  },
  cientista: {
    nome: "Ex: Dr. Pedro Almeida",
    cargo: "Ex: Pesquisador em Biologia Molecular · Pós-Doutorando",
    cidade: "Ex: Campinas, SP",
    telefone: "(19) 99876-5432",
    email: "pedro.almeida@unicamp.br",
    linkedin: "linkedin.com/in/pedro-almeida-research",
    portfolio: "lattes.cnpq.br/0000000000000000",
    objetivo:
      "Pesquisador em biologia molecular com foco em edição gênica CRISPR. Doutor pela UNICAMP, pós-doutorando no Instituto Pasteur. Publicações em Nature e Science. Busco posição em laboratório de referência ou P&D industrial em biotecnologia.",
    exp_empresa:
      "Ex: Instituto Pasteur · Fiocruz · EMBRAPA · Lab. Privado · Pfizer",
    exp_cargo:
      "Ex: Pesquisador · Pós-Doutorando · Cientista de Dados · Bolsista CNPq",
    exp_descricao:
      "— Coordenei projeto de sequenciamento genômico financiado pela FAPESP.\n— Publiquei 3 artigos em revistas indexadas (JCR Q1).\n— Orientei 2 alunos de iniciação científica e 1 mestrando.",
    educ_curso:
      "Doutorado em Bioquímica / Pós-Doutorado / MBA em Gestão da Ciência",
    educ_inst: "UNICAMP / USP / UFRJ / Fiocruz / Instituto Butantan",
    proj_nome:
      "Ex: Projeto CRISPR em células-tronco · Estudo epidemiológico COVID-19",
    curso_nome: "Bioinformática Avançada · Gestão de Laboratório",
    curso_inst: "Coursera / EMBL / FAPESP Treinamentos",
    hardSkillsEx:
      "CRISPR, PCR, Python, R, SPSS, Bioinformática, BioRender, LaTeX",
    softSkillsEx:
      "Rigor metodológico, Comunicação científica, Liderança de equipe, Captação de recursos",
    labelPortfolio: "Lattes / ORCID / ResearchGate",
    tipPortfolio:
      "Coloque o link do seu currículo Lattes, perfil ORCID ou ResearchGate. Mantenha as publicações atualizadas.",
    tipObjetivo:
      "Para cientistas, mencione área de pesquisa, grau (mestre/doutor/pós-doc), principais técnicas e tipo de oportunidade buscada (academia, P&D industrial, etc).",
  },
};

let currentProfile = "primemprego";

function setProfile(p) {
  currentProfile = p;
  // Update active button
  document
    .querySelectorAll(".profile-btn")
    .forEach((b) => b.classList.remove("active"));
  const btn = document.getElementById("pb-" + p);
  if (btn) btn.classList.add("active");

  const prof = PROFILES[p];
  if (!prof) return;

  // Update placeholders for static fields
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = val;
  };
  set("nome", prof.nome);
  set("cargo", prof.cargo);
  set("cidade", prof.cidade);
  set("telefone", prof.telefone);
  set("email", prof.email);
  set("linkedin", prof.linkedin);
  set("portfolio", prof.portfolio);
  set("objetivo", prof.objetivo);

  // Update portfolio label & tooltip
  const labelEl = document.getElementById("label-portfolio");
  if (labelEl) labelEl.textContent = prof.labelPortfolio;
  const tipEl = document.getElementById("tip-portfolio");
  if (tipEl) tipEl.textContent = prof.tipPortfolio;
  const tipObjEl = document.getElementById("tip-objetivo");
  if (tipObjEl) tipObjEl.textContent = prof.tipObjetivo;

  // Update hint for objetivo
  const hintObj = document.getElementById("hint-objetivo");
  if (hintObj) hintObj.textContent = "Dica: " + prof.tipObjetivo;

  // Update block template placeholders (rebind on next render)
  window._profilePlaceholders = prof;

  // Update skills hints
  const hintHard = document.getElementById("hint-hardskills");
  if (hintHard)
    hintHard.textContent = "Exemplos para este perfil: " + prof.hardSkillsEx;
  const hintSoft = document.getElementById("hint-softskills");
  if (hintSoft)
    hintSoft.textContent = "Exemplos para este perfil: " + prof.softSkillsEx;

  // Re-render blocks so placeholders apply
  renderBlocks("exp");
  renderBlocks("proj");
  renderBlocks("educ");
  renderBlocks("curso");
}

// ─── VALIDATION HELPERS ──────────────────────────────────
function handlePhoneInput(el) {
  const country = document.getElementById("phoneCountry")?.value;
  if (country === "br") {
    let v = el.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) {
      el.value =
        v.length === 11
          ? `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
          : `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    } else if (v.length > 2) {
      el.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      el.value = `(${v}`;
    }
  }
}

function updatePhoneMode() {
  const country = document.getElementById("phoneCountry")?.value;
  const el = document.getElementById("telefone");
  if (!el) return;
  if (country === "br") {
    el.placeholder = "(21) 99999-9999";
    el.value = "";
  } else {
    el.placeholder = "+44 20 7946 0958";
    el.value = "";
  }
}

function validateField(el, ruleFn, errMsg) {
  const v = el.value;
  const msgEl = document.getElementById("msg-" + el.id);
  if (!v) {
    el.classList.remove("field-ok", "field-error");
    if (msgEl) {
      msgEl.className = "field-msg";
      msgEl.textContent = "";
    }
    return;
  }
  const ok = ruleFn(v);
  el.classList.toggle("field-ok", ok);
  el.classList.toggle("field-error", !ok);
  if (msgEl) {
    msgEl.className = "field-msg show " + (ok ? "ok" : "err");
    msgEl.textContent = ok ? "✓ OK" : "⚠ " + errMsg;
  }
}

function formatPhone(el) {
  let v = el.value.replace(/\D/g, "").slice(0, 11);
  if (v.length >= 10) {
    const mask =
      v.length === 11
        ? `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
        : `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    if (el.value !== mask) el.value = mask;
  }
}

function updateCharCount(id, min, max) {
  const el = document.getElementById(id);
  const cc = document.getElementById("cc-" + id);
  if (!el || !cc) return;
  const len = el.value.length;
  cc.textContent = len + " car.";
  cc.className =
    "char-counter" +
    (len >= min && len <= max ? " good" : len > max ? " warn" : "");
}

// Patch blockTemplate to inject autocomplete=off + profile placeholders
const _origBlockTemplate = blockTemplate;

function saveBlock(type, idx) {
  const get = (id) =>
    document.getElementById(`${type}-${idx}-${id}`)?.value || "";
  if (type === "exp") {
    blockData.exp[idx] = {
      empresa: get("empresa"),
      cargo: get("cargo"),
      periodo: get("periodo"),
      local: get("local"),
      atual: document.getElementById(`exp-${idx}-atual`)?.checked,
      descricao: get("descricao"),
    };
  } else if (type === "proj") {
    blockData.proj[idx] = {
      nome: get("nome"),
      papel: get("papel"),
      periodo: get("periodo"),
      link: get("link"),
      descricao: get("descricao"),
    };
  } else if (type === "educ") {
    blockData.educ[idx] = {
      curso: get("curso"),
      instituicao: get("instituicao"),
      periodo: get("periodo"),
      status: get("status"),
    };
  } else if (type === "idioma") {
    blockData.idioma[idx] = { idioma: get("idioma"), nivel: get("nivel") };
  } else if (type === "curso") {
    blockData.curso[idx] = {
      nome: get("nome"),
      instituicao: get("instituicao"),
      ano: get("ano"),
    };
  }
  autosave();
  updateUI();
}

function blockTemplate(type, idx, data) {
  // idioma: 1st block = no remove; all other types: all blocks removable
  const noRemoveFirst = type === "idioma" && idx === 0;
  const label = noRemoveFirst
    ? '<span style="font-size:0.72rem;color:var(--muted)">Língua nativa</span>'
    : `<button class="btn-remove" onclick="removeBlock('${type}',${idx})">Remover</button>`;
  const onChange = `oninput="saveBlock('${type}',${idx})"`;
  const ac = `autocomplete="off" data-lpignore="true"`;
  const prof = window._profilePlaceholders || PROFILES["primemprego"];

  if (type === "exp") {
    return `
          <div class="block-header">
            <span class="block-index">Experiência ${idx + 1}</span>
            ${label}
          </div>
          <div class="fields-grid">
            <div class="field">
              <div class="label-row"><label>Empresa <span class="required">*</span></label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Nome da empresa exatamente como aparece no contrato ou CNPJ. Se for estágio, coloque o nome da contratante.</div></div>
              </div>
              <input type="text" id="exp-${idx}-empresa" ${ac} placeholder="${prof.exp_empresa || "Ex: Empresa Ltda"}" value="${data.empresa || ""}" ${onChange}>
            </div>
            <div class="field">
              <div class="label-row"><label>Cargo <span class="required">*</span></label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Título oficial do cargo. Se estagiário, escreva "Estagiário de [área]".</div></div>
              </div>
              <input type="text" id="exp-${idx}-cargo" ${ac} placeholder="${prof.exp_cargo || "Ex: Analista de Marketing"}" value="${data.cargo || ""}" ${onChange}>
            </div>
            <div class="field">
              <div class="label-row"><label>Período</label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Formato: "Mês Ano – Mês Ano" ou "Mês Ano – Atual". Ex: Jan 2022 – Dez 2023.</div></div>
              </div>
              <input type="text" id="exp-${idx}-periodo" ${ac} placeholder="Ex: Jan 2022 – Dez 2023" value="${data.periodo || ""}" ${onChange}>
            </div>
            <div class="field">
              <label>Cidade / Estado</label>
              <input type="text" id="exp-${idx}-local" ${ac} placeholder="Ex: São Paulo, SP" value="${data.local || ""}" ${onChange}>
            </div>
            <div class="field span-2">
              <div class="toggle-field">
                <input type="checkbox" id="exp-${idx}-atual" ${data.atual ? "checked" : ""} onchange="saveBlock('exp',${idx})">
                <label for="exp-${idx}-atual">Emprego atual</label>
              </div>
            </div>
            <div class="field span-2">
              <div class="label-row"><label>Principais atividades e resultados</label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Liste 3–5 entregas concretas. Use verbos de ação: "Desenvolvi", "Reduzi", "Gerenciei". Números e resultados fazem muita diferença!</div></div>
              </div>
              <textarea id="exp-${idx}-descricao" rows="4" ${ac} placeholder="${(prof.exp_descricao || "").replace(/\n/g, "&#10;")}" ${onChange}>${data.descricao || ""}</textarea>
              <span class="field-hint">Use "—" no início de cada linha para formatar como lista de tópicos no modelo.</span>
            </div>
          </div>`;
  }

  if (type === "proj") {
    return `
          <div class="block-header">
            <span class="block-index">Projeto ${idx + 1}</span>
            ${label}
          </div>
          <div class="fields-grid">
            <div class="field span-2">
              <div class="label-row"><label>Nome do projeto <span class="required">*</span></label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Dê um nome claro e objetivo ao projeto. Evite nomes muito técnicos sem contexto.</div></div>
              </div>
              <input type="text" id="proj-${idx}-nome" ${ac} placeholder="${prof.proj_nome || "Ex: App de gerenciamento de tarefas"}" value="${data.nome || ""}" ${onChange}>
            </div>
            <div class="field">
              <label>Seu papel</label>
              <input type="text" id="proj-${idx}-papel" ${ac} placeholder="Ex: Desenvolvedor principal · Designer" value="${data.papel || ""}" ${onChange}>
            </div>
            <div class="field">
              <label>Período</label>
              <input type="text" id="proj-${idx}-periodo" ${ac} placeholder="Ex: Jan 2024 – Mar 2024" value="${data.periodo || ""}" ${onChange}>
            </div>
            <div class="field span-2">
              <div class="label-row"><label>Link (GitHub, Behance, portfólio...)</label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Coloque o link do repositório ou demo. Certifique-se que está acessível publicamente.</div></div>
              </div>
              <input type="url" id="proj-${idx}-link" ${ac} placeholder="github.com/seuperfil/projeto" value="${data.link || ""}" ${onChange}>
            </div>
            <div class="field span-2">
              <label>Descrição — o que foi feito, tecnologias usadas, resultados</label>
              <textarea id="proj-${idx}-descricao" rows="4" ${ac} placeholder="— Desenvolvi a API com Node.js e PostgreSQL.&#10;— Criei a interface com React e Tailwind CSS.&#10;— O projeto foi utilizado por 200+ pessoas." ${onChange}>${data.descricao || ""}</textarea>
            </div>
          </div>`;
  }

  if (type === "educ") {
    return `
          <div class="block-header">
            <span class="block-index">Formação ${idx + 1}</span>
            ${label}
          </div>
          <div class="fields-grid">
            <div class="field span-2">
              <div class="label-row"><label>Curso / Grau <span class="required">*</span></label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Ex: Bacharelado em Design, Tecnólogo em Análise de Sistemas, MBA em Gestão de TI. Para ensino médio, escreva apenas "Ensino Médio Completo".</div></div>
              </div>
              <input type="text" id="educ-${idx}-curso" ${ac} placeholder="${prof.educ_curso || "Ex: Bacharelado em Design Gráfico"}" value="${data.curso || ""}" ${onChange}>
            </div>
            <div class="field">
              <div class="label-row"><label>Instituição <span class="required">*</span></label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Nome completo da instituição. Abreviaturas conhecidas são aceitas (USP, UFMG, PUC).</div></div>
              </div>
              <input type="text" id="educ-${idx}-instituicao" ${ac} placeholder="${prof.educ_inst || "Ex: UFRJ, PUC-RJ, SENAI"}" value="${data.instituicao || ""}" ${onChange}>
            </div>
            <div class="field">
              <label>Período / Ano</label>
              <input type="text" id="educ-${idx}-periodo" ${ac} placeholder="Ex: 2019 – 2023 ou Dez. 2021" value="${data.periodo || ""}" ${onChange}>
            </div>
            <div class="field">
              <label>Status <span class="required">*</span></label>
              <select id="educ-${idx}-status" ${onChange}>
                <option value="" ${!data.status ? "selected" : ""}>Selecione o status</option>
                <optgroup label="Graduação / Pós">
                  <option value="Concluído" ${data.status === "Concluído" ? "selected" : ""}>Concluído ✓</option>
                  <option value="Em andamento" ${data.status === "Em andamento" ? "selected" : ""}>Em andamento</option>
                  <option value="Previsto" ${data.status === "Previsto" ? "selected" : ""}>Previsão de conclusão</option>
                  <option value="Trancado" ${data.status === "Trancado" ? "selected" : ""}>Trancado</option>
                  <option value="Intercâmbio" ${data.status === "Intercâmbio" ? "selected" : ""}>Intercâmbio</option>
                </optgroup>
                <optgroup label="Técnico / Profissionalizante">
                  <option value="Técnico - Concluído" ${data.status === "Técnico - Concluído" ? "selected" : ""}>Técnico — Concluído</option>
                  <option value="Técnico - Em andamento" ${data.status === "Técnico - Em andamento" ? "selected" : ""}>Técnico — Em andamento</option>
                </optgroup>
                <optgroup label="Ensino Médio">
                  <option value="Ensino Médio Completo" ${data.status === "Ensino Médio Completo" ? "selected" : ""}>Ensino Médio Completo</option>
                  <option value="Ensino Médio Incompleto" ${data.status === "Ensino Médio Incompleto" ? "selected" : ""}>Ensino Médio Incompleto</option>
                </optgroup>
              </select>
            </div>
          </div>`;
  }

  if (type === "idioma") {
    const defaultIdioma =
      idx === 0 && !data.idioma ? "Português" : data.idioma || "";
    const defaultNivel = idx === 0 && !data.nivel ? "Nativo" : data.nivel || "";
    return `
          <div class="block-header">
            <span class="block-index">Idioma ${idx + 1}</span>
            ${idx === 0 ? '<span style="font-size:0.72rem;color:var(--muted)">Língua nativa</span>' : label}
          </div>
          <div class="fields-grid">
            <div class="field">
              <div class="label-row"><label>Idioma <span class="required">*</span></label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Escreva o idioma por extenso: Inglês, Espanhol, Francês, Mandarim. Inclua apenas idiomas que você realmente usa ou estudou formalmente.</div></div>
              </div>
              <input type="text" id="idioma-${idx}-idioma" ${ac} placeholder="Ex: Inglês" value="${defaultIdioma}" ${onChange}>
            </div>
            <div class="field">
              <div class="label-row"><label>Nível <span class="required">*</span></label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Seja honesto sobre seu nível. Recrutadores costumam testar idiomas. Básico e intermediário são válidos — não precisa inflar.</div></div>
              </div>
              <select id="idioma-${idx}-nivel" ${onChange}>
                <option value="" ${!defaultNivel ? "selected" : ""}>Selecione</option>
                <option value="Nativo" ${defaultNivel === "Nativo" ? "selected" : ""}>Nativo / Língua materna</option>
                <option value="Fluente" ${defaultNivel === "Fluente" ? "selected" : ""}>Fluente (C2)</option>
                <option value="Avançado" ${defaultNivel === "Avançado" ? "selected" : ""}>Avançado (C1)</option>
                <option value="Intermediário avançado" ${defaultNivel === "Intermediário avançado" ? "selected" : ""}>Intermediário avançado (B2)</option>
                <option value="Intermediário" ${defaultNivel === "Intermediário" ? "selected" : ""}>Intermediário (B1)</option>
                <option value="Elementar" ${defaultNivel === "Elementar" ? "selected" : ""}>Elementar (A2)</option>
                <option value="Básico" ${defaultNivel === "Básico" ? "selected" : ""}>Básico (A1)</option>
              </select>
            </div>
          </div>`;
  }

  if (type === "curso") {
    return `
          <div class="block-header">
            <span class="block-index">Curso ${idx + 1}</span>
            ${label}
          </div>
          <div class="fields-grid triple">
            <div class="field span-2">
              <div class="label-row"><label>Nome do curso / certificação <span class="required">*</span></label>
                <div class="field-tooltip-wrap"><i class="tooltip-icon" tabindex="0">?</i><div class="tooltip-bubble">Inclua apenas cursos relevantes para a vaga. Evite listar cursos muito básicos (ex: "Digitação") a menos que sejam o único diferencial.</div></div>
              </div>
              <input type="text" id="curso-${idx}-nome" ${ac} placeholder="${prof.curso_nome || "Ex: UI Design para Iniciantes"}" value="${data.nome || ""}" ${onChange}>
            </div>
            <div class="field">
              <label>Ano</label>
              <input type="text" id="curso-${idx}-ano" ${ac} placeholder="Ex: 2024" value="${data.ano || ""}" ${onChange}>
            </div>
            <div class="field span-2">
              <label>Instituição / Plataforma</label>
              <input type="text" id="curso-${idx}-instituicao" ${ac} placeholder="${prof.curso_inst || "Ex: Coursera, Alura, Senac"}" value="${data.instituicao || ""}" ${onChange}>
            </div>
          </div>`;
  }
}
