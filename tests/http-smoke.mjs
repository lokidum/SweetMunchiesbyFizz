import assert from 'node:assert/strict';
const base=process.argv[2]||'http://localhost:4173';const routes=['/','/this-week','/desserts','/desserts/kheer','/about','/contact','/locations','/faq','/privacy','/terms','/admin'];
for(const path of routes){const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,path+' has one H1');assert.ok(!html.includes('Starter Project'));console.log('PASS',path)}
for(const p of ['/does-not-exist','/desserts/does-not-exist'])assert.equal((await fetch(base+p)).status,404,p);
const auth=await fetch(base+'/api/admin/customers');assert.equal(auth.status,401);
const checkout=await fetch(base+'/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"items":[{"slug":"kheer","quantity":1}]}'});assert.equal(checkout.status,503);
const notify=await fetch(base+'/api/notify',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"dessert_slug":"kheer","email":"test@example.com"}'});assert.equal(notify.status,503);
console.log('PASS real 404s, protected admin, closed checkout, truthful form failure');
