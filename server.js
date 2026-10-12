import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WebSocketServer,WebSocket} from 'ws';
import {createGame,move,endTurn,publicState} from './game.js';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=pathname==='/'?'index.html':pathname.slice(1);
  if(!['index.html','client.js','style.css'].includes(file)){res.writeHead(404);return res.end('Not found')}
  const body=await readFile(path.join(root,file));
  res.writeHead(200,{'content-type':mime[path.extname(file)],'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(body);
 }catch{res.writeHead(500);res.end('Server error')}
});
const wss=new WebSocketServer({server,maxPayload:4096});
const rooms=new Map();
const send=(ws,payload)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(payload))};
const broadcast=(room)=>room.sockets.forEach((ws,i)=>send(ws,{type:'state',player:i,state:room.game,ready:room.ready,started:room.started}));
const code=()=>Array.from({length:6},()=> 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
wss.on('connection',ws=>{
 let room=null,slot=-1;
 ws.on('message',raw=>{
  let m;try{m=JSON.parse(raw)}catch{return send(ws,{type:'error',message:'Invalid JSON'})}
  if(!m||typeof m!=='object')return;
  if(m.type==='create'&&!room){
   let id;do{id=code()}while(rooms.has(id));
   room={game:createGame(id),sockets:[ws],ready:[false,false],started:false};rooms.set(id,room);slot=0;broadcast(room);return;
  }
  if(m.type==='join'&&!room){
   const id=String(m.code||'').toUpperCase().trim(),target=rooms.get(id);
   if(!target||target.sockets.length>=2||target.started)return send(ws,{type:'error',message:'Room unavailable'});
   room=target;slot=1;room.sockets.push(ws);broadcast(room);return;
  }
  if(!room)return send(ws,{type:'error',message:'Join a room first'});
  if(m.type==='ready'&&!room.started){room.ready[slot]=true;if(room.sockets.length===2&&room.ready.every(Boolean))room.started=true;broadcast(room);return}
  if(!room.started)return send(ws,{type:'error',message:'Waiting for both players'});
  let err=null;
  if(m.type==='move')err=move(room.game,slot,m.x,m.y);
  else if(m.type==='end')err=endTurn(room.game,slot);
  else return;
  if(err)send(ws,{type:'error',message:err});else broadcast(room);
 });
 ws.on('close',()=>{
  if(!room)return;
  rooms.delete(room.game.code);
  for(const peer of room.sockets)if(peer!==ws)send(peer,{type:'closed',message:'Other player disconnected. Create a new room.'});
 });
});
server.listen(Number(process.env.PORT)||3000,()=>console.log('Kingdoms of Ash at http://localhost:'+(process.env.PORT||3000)));
