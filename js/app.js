let db = [];
let names = []; // for suggestions

async function init() {
  db = await loadData();
  names = db.flatMap(item => [item.name, ...(item.aliases||[])]);
  names = Array.from(new Set(names)).filter(Boolean);
  // hook events
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchBox').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  document.getElementById('searchBox').addEventListener('input', showSuggestions);
  renderTopSuggestions();
}

function doSearch() {
  const q = document.getElementById('searchBox').value.trim();
  if (!q) return;
  const res = searchDrug(q);
  if (res) renderResult(res);
  else showNotFound(q);
}

function searchDrug(query) {
  const q = query.toLowerCase();
  // exact or alias
  let found = db.find(item => item.name.toLowerCase() === q || (item.aliases||[]).some(a => a.toLowerCase() === q));
  if (found) return found;
  // contains
  found = db.find(item => item.name.toLowerCase().includes(q) || (item.aliases||[]).some(a => a.toLowerCase().includes(q)));
  return found || null;
}

function renderResult(obj) {
  document.getElementById('notfound').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('drugTitle').textContent = obj.name;
  document.getElementById('badge').textContent = obj.id || '';
  // lists
  const avoid = document.getElementById('avoidList'); avoid.innerHTML = '';
  (obj.avoid_foods||[]).forEach(x => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${x.item}</strong> — ${x.why}${x.timing? ' ('+x.timing+')':''}`;
    avoid.appendChild(li);
  });
  const withList = document.getElementById('withList'); withList.innerHTML = '';
  (obj.recommended_with||[]).forEach(x=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${x.item}</strong> — ${x.why}${x.timing? ' ('+x.timing+')':''}`;
    withList.appendChild(li);
  });
  document.getElementById('timing').textContent = obj.timing || '';
  const warn = document.getElementById('warnList'); warn.innerHTML = '';
  (obj.warnings||[]).forEach(w=>{
    const li = document.createElement('li'); li.textContent = w; warn.appendChild(li);
  });
  document.getElementById('sources').textContent = 'Sources: ' + (obj.sources||[]).join('; ');
}

function showNotFound(q) {
  document.getElementById('result').classList.add('hidden');
  document.getElementById('notfound').classList.remove('hidden');
  document.getElementById('nfText').textContent = `No entry for "${q}"`;
}

function renderTopSuggestions() {
  const wrap = document.getElementById('suggestions');
  wrap.innerHTML = '';
  // show first 8 names
  names.slice(0,8).forEach(n => {
    const b = document.createElement('button');
    b.className = 'suggestion';
    b.textContent = n;
    b.onclick = () => { document.getElementById('searchBox').value = n; doSearch(); };
    wrap.appendChild(b);
  });
}

function showSuggestions() {
  const q = document.getElementById('searchBox').value.toLowerCase();
  const wrap = document.getElementById('suggestions');
  if (!q) { renderTopSuggestions(); return; }
  const filtered = names.filter(n => n.toLowerCase().includes(q)).slice(0,8);
  wrap.innerHTML = '';
  filtered.forEach(n=>{
    const b = document.createElement('button');
    b.className = 'suggestion';
    b.textContent = n;
    b.onclick = () => { document.getElementById('searchBox').value = n; doSearch(); };
    wrap.appendChild(b);
  });
}

window.addEventListener('DOMContentLoaded', init);
