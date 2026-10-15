const http=require('http'),fs=require('fs'),path=require('path');
const f=path.join(__dirname,'index.html');
const IGC=process.env.IGC_URL||'https://sismosgeociencias.up.ac.pa/';
let cache={t:0,body:null,ok:0};
async function igc(){
  const now=Date.now();
  if(cache.body&&now-cache.t<15000) return cache; /* como máximo una consulta al Instituto cada 15 s */
  const c=new AbortController(),to=setTimeout(()=>c.abort(),15000);
  try{
    const r=await fetch(IGC+(IGC.includes('?')?'&':'?')+'_='+now,{signal:c.signal,headers:{'user-agent':'Mozilla/5.0 terremotopanama','accept':'text/html'}});
    if(!r.ok) throw new Error('http '+r.status);
    const body=await r.text();
    if(!/<tr/i.test(body)) throw new Error('sin tabla');
    cache={t:now,body,ok:now};
  }catch(e){ console.error('igc:',e.message); if(!cache.body) throw e; }
  finally{clearTimeout(to)}
  return cache;
}
http.createServer(async(req,res)=>{
  const u=(req.url||'/').split('?')[0];
  if(u==='/api/igc'){
    try{
      const c=await igc();
      res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-igc-checked':new Date(cache.ok).toISOString()});
      return res.end(c.body);
    }catch(e){res.writeHead(502,{'cache-control':'no-store'});return res.end('igc no disponible')}
  }
  if(u==='/api/sismos'||u==='/api/stream'){res.writeHead(404,{'cache-control':'no-store'});return res.end('no')}
  if(u==='/health'){res.writeHead(200);return res.end('ok')}
  fs.readFile(f,(e,b)=>{
    if(e){res.writeHead(500);return res.end('error')}
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache, must-revalidate'});
    res.end(b);
  });
}).listen(process.env.PORT||3000,'0.0.0.0');
