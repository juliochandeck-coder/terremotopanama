const http=require('http'),fs=require('fs'),path=require('path');
const f=path.join(__dirname,'index.html');
http.createServer((req,res)=>{
  fs.readFile(f,(e,b)=>{
    if(e){res.writeHead(500);return res.end('error')}
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache, must-revalidate'});
    res.end(b);
  });
}).listen(process.env.PORT||3000,'0.0.0.0');
