async function test() {
  const res = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Test User",
      email: "test.register.random." + Date.now() + "@gmail.com",
      password: "password123"
    })
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}
test();
