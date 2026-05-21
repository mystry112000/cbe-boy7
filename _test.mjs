const html = await fetch('https://zeno-ai-wine.vercel.app/chat').then(r => r.text())
const matches = [...html.matchAll(/src="(\/_next\/[^"]+\.js)"/g)]
matches.forEach(m => console.log(m[1]))
