import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journeyReducer, states } from '../src/interactions/machine.ts';
import { references } from '../src/data/references.ts';
import { stages } from '../src/data/content.ts';
test('journey follows every stage and cannot advance past completion',()=>{let state:typeof states[number]='intro';for(const next of states.slice(1)){state=journeyReducer(state,{type:'NEXT'});assert.equal(state,next)}assert.equal(journeyReducer(state,{type:'NEXT'}),'complete')});
test('delivery requires collection, treatment, and verification',()=>{let state:typeof states[number]='intro';let count=0;while(state!=='delivery'){assert.notEqual(state,'complete');state=journeyReducer(state,{type:'NEXT'});count++}assert.equal(count,4);assert.equal(states[states.indexOf('delivery')-1],'testing')});
test('restart works from every state',()=>{for(const state of states)assert.equal(journeyReducer(state,{type:'RESET'}),'intro')});
test('all eight sources retain numbering and valid HTTPS links',()=>{assert.deepEqual(references.slice(0,8).map(r=>r.id),[1,2,3,4,5,6,7,8]);for(const r of references){assert.equal(new URL(r.url).protocol,'https:');assert.ok(r.author&&r.title);for(const e of r.extra??[])assert.equal(new URL(e.url).protocol,'https:')}});
test('every state has complete interaction copy',()=>{assert.equal(stages.length,states.length);for(const stage of stages)assert.ok(stage.title&&stage.description&&stage.button)});

import { storyReducer, chapters } from '../src/interactions/machine.ts';
import { stableBottle } from '../src/media/detectionPolicy.ts';
test('chapter navigation clamps at ends and supports back/reset',()=>{
 let chapter:typeof chapters[number]='glass';
 assert.equal(storyReducer(chapter,{type:'BACK'}),'glass');
 for(const next of chapters.slice(1)){chapter=storyReducer(chapter,{type:'NEXT'});assert.equal(chapter,next)}
 assert.equal(storyReducer(chapter,{type:'NEXT'}),'system');
 assert.equal(storyReducer(chapter,{type:'BACK'}),'river');
 assert.equal(storyReducer(chapter,{type:'RESET'}),'glass');
 assert.equal(storyReducer(chapter,{type:'GO',chapter:'bottle'}),'bottle');
});
test('bottle recognition requires confidence, size and three spatially stable frames',()=>{
 const bottle = {class:'bottle',score:.8,bbox:[20,20,60,120] as [number,number,number,number]};
 assert.equal(stableBottle([{...bottle,score:.64}],null,0).streak,0);
 assert.equal(stableBottle([{...bottle,class:'person'}],null,0).streak,0);
 assert.equal(stableBottle([{...bottle,bbox:[20,20,5,10]}],null,0).streak,0);
 let result=stableBottle([bottle],null,0);assert.equal(result.recognized,false);
 result=stableBottle([bottle],result.previous,result.streak);assert.equal(result.recognized,false);
 result=stableBottle([bottle],result.previous,result.streak);assert.equal(result.recognized,true);
 assert.equal(stableBottle([{...bottle,bbox:[250,200,60,120]}],bottle,2).streak,1);
 assert.equal(stableBottle([],bottle,2).streak,0);
});
