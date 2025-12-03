async function loadData() {
  try {
    const resp = await fetch('/data/drug_food.json');
    const j = await resp.json();
    return j;
  } catch (e) {
    console.error('Failed to load data', e);
    return [];
  }
}
