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
 assert.equal(storyReducer(chapter,{type:'GO',chapter:'people'}),'people');
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

import { advanceVolume, area, chamber, freeSurface, retainedCapacity, screenTilt } from '../src/liquid/physics.ts';
import fs from 'node:fs';
test('liquid area preserves volume at every tested angle',()=>{
 for(const degrees of [-88,-65,-30,0,30,65,88])for(const volume of [.01,.2,.5,.82,1]){
  const surface=freeSurface(volume,degrees*Math.PI/180);
  assert.ok(Math.abs(area(surface.polygon)/area(chamber)-volume)<.00001,`${degrees} degrees, ${volume} volume`);
 }
});
test('lower-rim drainage is symmetric, never adds water, and respects upright capacity',()=>{
 assert.ok(Math.abs(retainedCapacity(0)-1)<1e-9);
 for(const angle of [.1,.4,.9,1.4]){
  assert.ok(Math.abs(retainedCapacity(angle)-retainedCapacity(-angle))<1e-9);
  assert.ok(advanceVolume(.82,angle,.016)<=.82);
 }
 assert.equal(advanceVolume(.82,0,.1),.82);
 assert.ok(retainedCapacity(88*Math.PI/180)<.025);
});
test('fixed-angle drainage is independent of frame rate',()=>{
 function simulate(fps:number){let volume=.82;for(let i=0;i<fps*3;i++)volume=advanceVolume(volume,1.4,1/fps);return volume}
 assert.ok(Math.abs(simulate(30)-simulate(120))<1e-8);
 assert.ok(simulate(60)>0);assert.ok(simulate(60)<.1);
});
test('orientation projects onto the current screen axis',()=>{
 assert.equal(screenTilt(25,10,0),10);
 assert.ok(Math.abs(screenTilt(25,10,90)-25)<1e-9);
 assert.ok(Math.abs(screenTilt(25,10,-90)+25)<1e-9);
 assert.ok(Math.abs(screenTilt(25,10,180)+10)<1e-9);
});
test('documentary selections have traceable licenses and local filenames',()=>{
 const assets=JSON.parse(fs.readFileSync(new URL('../public/media/manifest.json',import.meta.url),'utf8'));
 assert.equal(assets.length,7);assert.equal(new Set(assets.map((a:{id:string})=>a.id)).size,7);
 for(const asset of assets){
  assert.ok(asset.creator&&asset.source&&asset.licenseUrl&&asset.context&&asset.changes);
  assert.ok(!asset.filename.includes('/'));assert.match(asset.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.match(asset.license,/Public domain|CC BY/);
 }
});
