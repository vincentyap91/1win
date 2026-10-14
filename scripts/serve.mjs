import http from 'http';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import './build-components.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.avif':'image/avif','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ico':'image/x-icon'};
http.createServer((req,res)=>{
 let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
 const p=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(p!==root&&!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(p,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
}).listen(port,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:'+port));
