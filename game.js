export const WIDTH=20, HEIGHT=14;
const key=(x,y)=>x+','+y;
export function createGame(code){
 const tiles=Array.from({length:HEIGHT},(_,y)=>Array.from({length:WIDTH},(_,x)=>{
  const n=(x*37+y*71+x*y*13)%29;
  return n===0?'mountain':n<4?'forest':'plain';
 }));
 const objects={};
 const put=(x,y,type,owner=null)=>{tiles[y][x]='plain';objects[key(x,y)]={type,owner}};
 put(2,2,'castle',0);put(WIDTH-3,HEIGHT-3,'castle',1);
 [[5,4],[14,9],[9,3],[10,10]].forEach(([x,y])=>put(x,y,'mine'));
 [[6,7],[13,6],[8,10],[11,3],[4,10],[15,3]].forEach(([x,y])=>put(x,y,'treasure'));
 return {code,tiles,objects,heroes:[{x:2,y:3,owner:0,moves:5},{x:WIDTH-3,y:HEIGHT-4,owner:1,moves:5}],players:[{gold:1000},{gold:1000}],turn:0,day:1,winner:null,log:['Day 1: The kingdoms rise.']};
}
export function move(game,player,x,y){
 if(game.winner!==null) return 'Game finished';
 if(player!==game.turn)return 'Not your turn';
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=WIDTH||y>=HEIGHT)return 'Invalid tile';
 const hero=game.heroes[player];
 if(hero.moves<1)return 'No movement points';
 if(Math.abs(hero.x-x)+Math.abs(hero.y-y)!==1)return 'Move one tile at a time';
 if(game.tiles[y][x]==='mountain'||game.tiles[y][x]==='forest')return 'Impassable terrain';
 if(game.heroes.some((h,i)=>i!==player&&h.x===x&&h.y===y))return 'Enemy hero blocks the path';
 hero.x=x;hero.y=y;hero.moves--;
 const obj=game.objects[key(x,y)];
 if(obj){
  if(obj.type==='treasure'){game.players[player].gold+=350;delete game.objects[key(x,y)];game.log.unshift('Player '+(player+1)+' found 350 gold.')}
  if(obj.type==='mine'&&obj.owner!==player){obj.owner=player;game.log.unshift('Player '+(player+1)+' captured a mine.')}
  if(obj.type==='castle'&&obj.owner!==player){obj.owner=player;game.winner=player;game.log.unshift('Player '+(player+1)+' conquered the enemy castle!')}
 }
 return null;
}
export function endTurn(game,player){
 if(game.winner!==null)return 'Game finished';
 if(player!==game.turn)return 'Not your turn';
 game.turn=1-player;
 if(game.turn===0){game.day++; for(const o of Object.values(game.objects))if(o.type==='mine'&&o.owner!==null)game.players[o.owner].gold+=200;game.log.unshift('Day '+game.day+' begins. Mines produce 200 gold.')}
 game.heroes[game.turn].moves=5;
 return null;
}
export function publicState(game){return game;}
