async function test() {
  const res = await fetch('https://ncbds-vlu.onrender.com/api/properties');
  const data = await res.json();
  data.forEach(p => console.log(p.location));
}
test();
