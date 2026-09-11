const STORAGE_KEY = 'meucurriculo_v1';
const THEME_KEY = 'meucurriculo_theme';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const state = {
  template: 'modern',
  compact: false,
  font: 'Inter, Arial, sans-serif',
  accent: '#2563eb',
  personal: { name:'', role:'', phone:'', email:'', city:'', state:'', linkedin:'', portfolio:'' },
  summary: '', skills: '', courses: '', projects: '', additional: '',
  experiences: [], education: [], languages: []
};

function esc(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function safeUrl(v='') {
  const raw = v.trim(); if (!raw) return '';
  try { const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
}
function linesToHtml(v='') { return esc(v).replace(/\n/g,'<br>'); }

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const el = $('#autosaveStatus');
  el.textContent = 'Salvo agora neste dispositivo.';
  clearTimeout(save.t); save.t = setTimeout(()=> el.textContent='Salvo automaticamente neste dispositivo.', 1500);
}

function load(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') Object.assign(state, saved);
  } catch {}
}

function addExperience(data={position:'',company:'',start:'',end:'',description:''}){
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random());
  state.experiences.push({id,...data}); renderDynamicEditors(); updateAll();
}
function addEducation(data={course:'',institution:'',start:'',end:''}){
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random());
  state.education.push({id,...data}); renderDynamicEditors(); updateAll();
}
function addLanguage(data={name:'',level:'Básico'}){
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random());
  state.languages.push({id,...data}); renderDynamicEditors(); updateAll();
}

function renderDynamicEditors(){
  const expList = $('#experienceList'); expList.innerHTML='';
  state.experiences.forEach(item => {
    const node = $('#experienceTemplate').content.firstElementChild.cloneNode(true); node.dataset.id=item.id;
    $$('[data-field]',node).forEach(inp=>{ inp.value=item[inp.dataset.field]||''; inp.addEventListener('input',()=>{ item[inp.dataset.field]=inp.value; updateAll(); }); });
    $('.remove-entry',node).addEventListener('click',()=>{ state.experiences=state.experiences.filter(x=>x.id!==item.id); renderDynamicEditors(); updateAll(); });
    expList.append(node);
  });
  const eduList = $('#educationList'); eduList.innerHTML='';
  state.education.forEach(item => {
    const node = $('#educationTemplate').content.firstElementChild.cloneNode(true); node.dataset.id=item.id;
    $$('[data-field]',node).forEach(inp=>{ inp.value=item[inp.dataset.field]||''; inp.addEventListener('input',()=>{ item[inp.dataset.field]=inp.value; updateAll(); }); });
    $('.remove-entry',node).addEventListener('click',()=>{ state.education=state.education.filter(x=>x.id!==item.id); renderDynamicEditors(); updateAll(); });
    eduList.append(node);
  });
  const langList = $('#languageList'); langList.innerHTML='';
  state.languages.forEach(item => {
    const node = $('#languageTemplate').content.firstElementChild.cloneNode(true); node.dataset.id=item.id;
    $$('[data-field]',node).forEach(inp=>{ inp.value=item[inp.dataset.field]||''; inp.addEventListener('input',()=>{ item[inp.dataset.field]=inp.value; updateAll(); }); });
    $('.remove-entry',node).addEventListener('click',()=>{ state.languages=state.languages.filter(x=>x.id!==item.id); renderDynamicEditors(); updateAll(); });
    langList.append(node);
  });
}

function renderPreview(){
  const p = state.personal;
  $('#pName').textContent = p.name || 'Seu Nome';
  $('#pRole').textContent = p.role || 'Cargo desejado';
  const contact=[];
  if(p.phone) contact.push(`<div>${esc(p.phone)}</div>`);
  if(p.email) contact.push(`<div>${esc(p.email)}</div>`);
  const place=[p.city,p.state].filter(Boolean).join(' - '); if(place) contact.push(`<div>${esc(place)}</div>`);
  const li=safeUrl(p.linkedin); if(li) contact.push(`<div><a href="${esc(li)}" target="_blank" rel="noopener">LinkedIn</a></div>`);
  const po=safeUrl(p.portfolio); if(po) contact.push(`<div><a href="${esc(po)}" target="_blank" rel="noopener">Portfólio / GitHub</a></div>`);
  $('#pContact').innerHTML=contact.join('');

  $('#pSummary').textContent = state.summary || 'Adicione um resumo profissional para apresentar rapidamente seu perfil.';
  $('#summarySection').classList.toggle('hidden', !state.summary.trim());

  const expHtml=state.experiences.filter(x=>Object.values(x).some(v=>String(v).trim() && v!==x.id)).map(x=>`<div class="resume-item"><h3>${esc(x.position || 'Cargo')}${x.company?` — ${esc(x.company)}`:''}</h3><div class="meta">${esc([x.start,x.end].filter(Boolean).join(' — '))}</div>${x.description?`<div class="desc">${linesToHtml(x.description)}</div>`:''}</div>`).join('');
  $('#pExperiences').innerHTML=expHtml; $('#experienceSection').classList.toggle('hidden',!expHtml);

  const eduHtml=state.education.filter(x=>x.course||x.institution).map(x=>`<div class="resume-item"><h3>${esc(x.course || 'Formação')}</h3><div class="meta">${esc([x.institution,[x.start,x.end].filter(Boolean).join(' — ')].filter(Boolean).join(' • '))}</div></div>`).join('');
  $('#pEducation').innerHTML=eduHtml; $('#educationSection').classList.toggle('hidden',!eduHtml);

  const skills=state.skills.split(',').map(s=>s.trim()).filter(Boolean).slice(0,40);
  $('#pSkills').innerHTML=skills.map(s=>`<span class="chip">${esc(s)}</span>`).join(''); $('#skillsSection').classList.toggle('hidden',!skills.length);

  const langHtml=state.languages.filter(x=>x.name).map(x=>`<div class="resume-item"><strong>${esc(x.name)}</strong> — ${esc(x.level)}</div>`).join('');
  $('#pLanguages').innerHTML=langHtml; $('#languagesSection').classList.toggle('hidden',!langHtml);

  $('#pCourses').innerHTML=`<div class="plain-lines">${linesToHtml(state.courses)}</div>`; $('#coursesSection').classList.toggle('hidden',!state.courses.trim());
  $('#pProjects').innerHTML=`<div class="plain-lines">${linesToHtml(state.projects)}</div>`; $('#projectsSection').classList.toggle('hidden',!state.projects.trim());
  $('#pAdditional').innerHTML=`<div class="plain-lines">${linesToHtml(state.additional)}</div>`; $('#additionalSection').classList.toggle('hidden',!state.additional.trim());

  const preview=$('#resumePreview'); preview.className=`resume ${state.template}${state.compact?' compact':''}`; preview.style.fontFamily=state.font; preview.style.setProperty('--accent',state.accent);
  $('#atsBadge').classList.toggle('hidden',state.template!=='ats');
}

function score(){
  const p=state.personal; let total=0; const tips=[];
  const checks=[
    [p.name.trim(),12,'Adicione seu nome completo.'],[p.role.trim(),10,'Informe o cargo ou objetivo profissional.'],
    [/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email),10,'Use um e-mail válido.'],[p.phone.trim().length>=8,8,'Adicione um telefone de contato.'],
    [state.summary.trim().length>=80,12,'Escreva um resumo com pelo menos 2 ou 3 linhas.'],
    [state.experiences.some(x=>x.position||x.company),16,'Adicione ao menos uma experiência — ou use projetos/cursos se for primeiro emprego.'],
    [state.education.some(x=>x.course||x.institution),12,'Adicione sua formação acadêmica.'],
    [state.skills.split(',').filter(s=>s.trim()).length>=4,10,'Liste pelo menos 4 competências relevantes.'],
    [state.courses.trim()||state.projects.trim(),5,'Cursos ou projetos podem fortalecer o currículo.'],
    [[p.city,p.state].filter(Boolean).length>0,5,'Informe cidade ou estado.']
  ];
  checks.forEach(([ok,pts,msg])=>{if(ok) total+=pts; else tips.push(msg)});
  return {total:Math.min(100,total),tips};
}

function renderReview(){
  const {total,tips}=score(); $('#scoreValue').textContent=`${total}/100`; $('#scoreBar').style.width=`${total}%`;
  const holder=$('#reviewTips'); holder.innerHTML='';
  if(!tips.length) holder.innerHTML='<div class="tip ok">Ótimo: os principais campos estão preenchidos. Revise ortografia e adapte o currículo para cada vaga.</div>';
  else tips.forEach(t=>holder.insertAdjacentHTML('beforeend',`<div class="tip">${esc(t)}</div>`));
}

function updateProgress(){
  const filled=[state.personal.name,state.personal.role,state.personal.email,state.summary,state.experiences.length,state.education.length,state.skills,state.courses||state.projects].filter(Boolean).length;
  const pct=Math.round((filled/8)*100); $('#progressText').textContent=`${pct}%`; $('#progressBar').style.width=`${pct}%`;
}

function updateAll(){ renderPreview(); renderReview(); updateProgress(); $('#summaryCount').textContent=`${state.summary.length}/850`; save(); }

function hydrateInputs(){
  const mapping={name:'name',role:'role',phone:'phone',email:'email',city:'city',state:'state',linkedin:'linkedin',portfolio:'portfolio'};
  for(const [id,key] of Object.entries(mapping)){ const el=$(`#${id}`); el.value=state.personal[key]||''; el.addEventListener('input',()=>{state.personal[key]=el.value;updateAll();}); }
  const simple={summaryText:'summary',skillsText:'skills',courses:'courses',projects:'projects',additional:'additional'};
  for(const [id,key] of Object.entries(simple)){ const el=$(`#${id}`); el.value=state[key]||''; el.addEventListener('input',()=>{state[key]=el.value;updateAll();}); }
  $('#fontSelect').value=state.font; $('#accentColor').value=state.accent; $('#compactToggle').checked=!!state.compact;
}

function bindUi(){
  $$('.step').forEach(btn=>btn.addEventListener('click',()=>{ $$('.step').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); $$('.panel').forEach(x=>x.classList.remove('active')); $(`#${btn.dataset.target}`).classList.add('active'); }));
  $('#addExperienceBtn').addEventListener('click',()=>addExperience()); $('#addEducationBtn').addEventListener('click',()=>addEducation()); $('#addLanguageBtn').addEventListener('click',()=>addLanguage());
  $$('.template-card').forEach(btn=>btn.addEventListener('click',()=>{state.template=btn.dataset.template;$$('.template-card').forEach(x=>x.classList.toggle('active',x.dataset.template===state.template));updateAll();}));
  $('#fontSelect').addEventListener('change',e=>{state.font=e.target.value;updateAll();}); $('#accentColor').addEventListener('input',e=>{state.accent=e.target.value;updateAll();}); $('#compactToggle').addEventListener('change',e=>{state.compact=e.target.checked;updateAll();});
  $('#summaryExampleBtn').addEventListener('click',()=>{ if(state.summary.trim() && !confirm('Substituir o resumo atual por um exemplo?')) return; state.summary='Profissional organizado, comunicativo e comprometido com resultados, com facilidade para aprender novas ferramentas e trabalhar em equipe. Busco uma oportunidade para aplicar minhas habilidades, desenvolver novas competências e contribuir de forma consistente com a empresa.'; $('#summaryText').value=state.summary; updateAll(); });
  $('#printBtn').addEventListener('click',()=>window.print());
  $('#newBtn').addEventListener('click',()=>{ if(!confirm('Criar um novo currículo e apagar os dados salvos neste dispositivo?'))return; localStorage.removeItem(STORAGE_KEY); location.reload(); });
  $('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem(THEME_KEY,document.body.classList.contains('dark')?'dark':'light');});
  $('#matchBtn').addEventListener('click',matchJob);
}

function matchJob(){
  const raw=$('#jobDescription').value.toLowerCase(); const out=$('#matchResult'); if(raw.trim().length<40){out.textContent='Cole uma descrição de vaga mais completa para analisar.';return;}
  const skillList=state.skills.split(',').map(s=>s.trim()).filter(s=>s.length>=2); const found=skillList.filter(s=>raw.includes(s.toLowerCase())); const missingCandidates=[];
  const keywords=['excel','word','power bi','python','javascript','html','css','sql','atendimento','vendas','liderança','comunicação','organização','inglês','git','react','node','marketing','financeiro'];
  keywords.forEach(k=>{if(raw.includes(k)&&!skillList.some(s=>s.toLowerCase().includes(k)))missingCandidates.push(k)});
  const pct=skillList.length?Math.round((found.length/skillList.length)*100):0;
  out.innerHTML=`<strong>Correspondência entre suas competências e a vaga: ${pct}%</strong><br>${found.length?`Encontradas: ${esc(found.join(', '))}.`:'Nenhuma competência cadastrada foi localizada literalmente na descrição.'}${missingCandidates.length?`<br>Palavras que aparecem na vaga e podem merecer atenção <em>se você realmente possuir essas habilidades</em>: ${esc([...new Set(missingCandidates)].join(', '))}.`:''}`;
}

function init(){
  load(); if(!state.experiences.length) state.experiences=[]; if(!state.education.length) state.education=[]; if(!state.languages.length) state.languages=[];
  if(localStorage.getItem(THEME_KEY)==='dark') document.body.classList.add('dark');
  hydrateInputs(); renderDynamicEditors(); bindUi(); $$('.template-card').forEach(x=>x.classList.toggle('active',x.dataset.template===state.template)); updateAll();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
init();
