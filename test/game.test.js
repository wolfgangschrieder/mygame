import test from 'node:test';import assert from 'node:assert/strict';import {createGame,move,endTurn} from '../game.js';
test('enforces turn ownership',()=>{const g=createGame('ABCDEF');assert.equal(move(g,1,17,9),'Not your turn');assert.equal(endTurn(g,1),'Not your turn')});
test('moving consumes points',()=>{const g=createGame('ABCDEF');assert.equal(move(g,0,3,3),null);assert.equal(g.heroes[0].moves,4)});
test('income paid on next day',()=>{const g=createGame('ABCDEF');g.objects['5,4'].owner=0;endTurn(g,0);endTurn(g,1);assert.equal(g.players[0].gold,1200);assert.equal(g.day,2)});
test('invalid coordinate rejected',()=>{const g=createGame('ABCDEF');assert.equal(move(g,0,NaN,3),'Invalid tile')});
