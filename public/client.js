const $=id=>document.getElementById(id);
const canvas=$('map'),ctx=canvas.getContext('2d'),S=40;
let ws,state,player=-1,ready=[false,false],started=false;
function connect(){
 ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host);
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='state'){state=m.state;player=m.player;ready=m.ready;started=m.started;render()}else if(m.type==='error')$('status').textContent=m.message;else if(m.type==='closed'){$('status').textContent=m.message;started=false;render()}};
 ws.onclose=()=>{$('status').textContent='Connection closed. Refresh to reconnect.'};
}
connect();
function send(m){if(ws?.readyState===1)ws.send(JSON.stringify(m));else $('status').textContent='Server disconnected'}
$('create').onclick=()=>send({type:'create'});
$('join').onclick=()=>send({type:'join',code:$('code').value});
$('ready').onclick=()=>send({type:'ready'});
$('end').onclick=()=>send({type:'end'});
canvas.onclick=e=>{
 if(!state||!started||state.turn!==player||state.winner!==null)return;
 const r=canvas.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)*canvas.width/r.width/S),y=Math.floor((e.clientY-r.top)*canvas.height/r.height/S);
 send({type:'move',x,y});
};
const COLORS={plain:'#547c50',forest:'#234f3f',mountain:'#66747c'};
function draw(){
 ctx.clearRect(0,0,800,560);
 if(!state){ctx.fillStyle='#eacb87';ctx.font='25px Georgia';ctx.textAlign='center';ctx.fillText('Create or join a room to begin',400,280);return}
 state.tiles.forEach((row,y)=>row.forEach((tile,x)=>{
  const px=x*S,py=y*S;
  ctx.fillStyle=COLORS[tile];ctx.fillRect(px,py,S,S);
  ctx.fillStyle='rgba(255,255,255,.035)';if((x+y)%3===0)ctx.fillRect(px+6,py+6,4,4);
  ctx.strokeStyle='rgba(5,15,15,.21)';ctx.strokeRect(px+.5,py+.5,S,S);
 }));
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='25px serif';
 for(const [k,obj] of Object.entries(state.objects)){const [x,y]=k.split(',').map(Number);ctx.fillStyle=obj.owner===0?'#9bd2ff':obj.owner===1?'#ffac95':'#f5d285';ctx.fillText(obj.type==='castle'?'🏰':obj.type==='mine'?'⛏️':'✦',x*S+20,y*S+20)}
 state.heroes.forEach((h,i)=>{ctx.beginPath();ctx.fillStyle=i===0?'#52b8ff':'#e97659';ctx.arc(h.x*S+20,h.y*S+20,16,0,2*Math.PI);ctx.fill();ctx.strokeStyle='#fff3d2';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='white';ctx.font='23px serif';ctx.fillText('♞',h.x*S+20,h.y*S+20)});
 if(started&&state.turn===player&&state.winner===null){const h=state.heroes[player];ctx.strokeStyle='#ffe07a';ctx.lineWidth=3;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=h.x+dx,y=h.y+dy;if(x>=0&&y>=0&&x<20&&y<14&&state.tiles[y][x]==='plain')ctx.strokeRect(x*S+3,y*S+3,S-6,S-6)}}
}
function render(){
 $('lobby').hidden=!!state;$('ready').hidden=!state||started||ready[player];$('stats').hidden=!state||!started;
 if(!state){draw();return}
 $('status').textContent=state.winner!==null?'🏆 Player '+(state.winner+1)+' wins!':started?(state.turn===player?'Your turn — command your hero.':'Opponent is taking a turn.'):'Room '+state.code+' — '+state.players.length+'/2 slots; ready '+ready.filter(Boolean).length+'/2. Share code with a friend.';
 if(!started)$('status').textContent='Room '+state.code+' · '+ready.filter(Boolean).length+'/2 ready. Share the code with a friend.';
 $('day').textContent='Day: '+state.day;
 $('player').textContent='You are Player '+(player+1)+' ('+(player===0?'Azure':'Crimson')+')';
 $('gold').textContent='Gold: '+state.players[player].gold;
 $('moves').textContent='Movement: '+state.heroes[player].moves+'/5';
 $('end').disabled=state.turn!==player||state.winner!==null;
 $('log').replaceChildren(...state.log.slice(0,9).map(t=>{const p=document.createElement('p');p.textContent=t;return p}));
 draw();
}
draw();