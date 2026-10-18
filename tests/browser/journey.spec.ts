import { test, expect, type Page } from '@playwright/test';
const chapters = ['glass','field','bottle','river','system'];
async function go(page:Page, n:number) { await page.getByRole('button',{name:new RegExp(`^Chapter ${n}:`)}).click(); await expect(page.locator(`#${chapters[n-1]}-title`)).toBeFocused(); await page.waitForTimeout(350); }
async function mockCamera(page:Page, delayed=false) {
 await page.addInitScript(({delayed})=>{
  const state={stops:0,requests:0,constraints:null as unknown, resolve:null as null | (()=>void)};
  Object.assign(window,{cameraMock:state});
  const stream=()=>{const track={stop(){state.stops++}};return {getTracks:()=>[track]}};
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async (constraints:unknown)=>{state.requests++;state.constraints=constraints;if(delayed)await new Promise<void>(resolve=>{state.resolve=resolve});return stream()}}});
  Object.defineProperty(HTMLMediaElement.prototype,'srcObject',{configurable:true,get(){return null},set(_value){}});
  HTMLMediaElement.prototype.play=async()=>{};
 },{delayed});
}
async function state(page:Page,expression:string){return page.evaluate(expression)}

test('hold fills progressively, pauses on release and completes a visual transition',async({page})=>{
 await page.goto('./'); const hold=page.getByRole('button',{name:'Press and hold to fill the glass'}); await hold.focus();
 await page.keyboard.down('Space');await page.waitForTimeout(700);await page.keyboard.up('Space');
 const partial=+(await page.getByRole('progressbar',{name:'Glass fill progress'}).getAttribute('value'))!;
 expect(partial).toBeGreaterThan(.08);expect(partial).toBeLessThan(.3);
 await page.waitForTimeout(350);expect(+(await page.getByRole('progressbar').getAttribute('value'))!).toBeCloseTo(partial,2);
 await page.keyboard.down('Space');await expect(hold).toBeDisabled({timeout:6500});await page.keyboard.up('Space');
 await expect(page.locator('#glass')).toContainText('2.1');
 await expect(page.locator('#field-title')).toBeFocused({timeout:5500});
});
test('pointer hold cancellation and leaving the chapter pause progression',async({page})=>{
 await page.goto('./');const button=page.getByRole('button',{name:'Press and hold to fill the glass'});const box=(await button.boundingBox())!;
 await page.mouse.move(box.x+20,box.y+20);await page.mouse.down();await page.waitForTimeout(350);await page.mouse.up();
 const partial=+(await page.getByRole('progressbar').getAttribute('value'))!;expect(partial).toBeGreaterThan(0);
 await go(page,2);await page.waitForTimeout(350);expect(+(await page.getByRole('progressbar').getAttribute('value'))!).toBeCloseTo(partial,2);
});
test('full journey through manual alternatives, system activation, references and restart',async({page})=>{
 await page.goto('./');await go(page,2);
 for(const name of ['left','middle','right'])await page.getByRole('button',{name:`Water ${name} crops`}).click();
 await expect(page.locator('#field')).toContainText('A field in recovery');await go(page,3);
 await page.getByRole('button',{name:'Continue without camera'}).click();await expect(page.locator('#bottle')).toContainText('No water was donated or delivered.');await go(page,4);
 while(await page.locator('.litter').count())await page.locator('.litter').first().click();await expect(page.getByRole('heading',{name:'Clear water is not necessarily safe water.'})).toBeVisible();
 await go(page,5);
 for(let i=0;i<5;i++)await page.locator('.system-steps button').nth(i).click();
 await expect(page.locator('.final-message')).toContainText('All five system components explored');
 await page.getByRole('link',{name:'Explore the evidence'}).click();await expect(page.locator('.reference-list > li')).toHaveCount(11);
 for(const link of await page.locator('.reference-list a').all()){await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noopener noreferrer')}
 await page.getByRole('button',{name:'Restart all chapters'}).click();await expect(page.getByRole('progressbar')).toHaveAttribute('value','0');
 await go(page,4);await expect(page.locator('.litter')).toHaveCount(5);
});
test('tilt unavailable and denied use manual watering',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:class {static requestPermission(){return Promise.resolve('denied')}}})});
 await page.goto('./');await go(page,2);await page.getByRole('button',{name:'Enable phone tilt'}).click();
 await expect(page.locator('#field')).toContainText('Motion permission was declined');
 await page.getByLabel('Water direction',{exact:true}).fill('80');await page.getByRole('button',{name:'Water right crops'}).click();await expect(page.getByRole('button',{name:'Water right crops'})).toHaveAttribute('aria-pressed','true');
});
test('tilt sensor smooths input, calibrates and removes listener on navigation',async({page})=>{
 await page.addInitScript(()=>{
  let listeners=0;const add=window.addEventListener.bind(window),remove=window.removeEventListener.bind(window);
  window.addEventListener=((type:string,...args:unknown[])=>{if(type==='deviceorientation')listeners++;return (add as Function)(type,...args)}) as typeof window.addEventListener;
  window.removeEventListener=((type:string,...args:unknown[])=>{if(type==='deviceorientation')listeners--;return (remove as Function)(type,...args)}) as typeof window.removeEventListener;
  Object.assign(window,{motionListeners:()=>listeners});
  Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:class {static requestPermission(){return Promise.resolve('granted')}}});
 });
 await page.goto('./');await go(page,2);await page.getByRole('button',{name:'Enable phone tilt'}).click();
 await page.evaluate(()=>{const event=new Event('deviceorientation');Object.assign(event,{gamma:20});window.dispatchEvent(event)});
 await expect.poll(async()=>+(await page.getByLabel('Water direction',{exact:true}).inputValue())).toBeGreaterThan(65);
 await page.getByRole('button',{name:'Calibrate',exact:true}).click();
 await page.evaluate(()=>{const event=new Event('deviceorientation');Object.assign(event,{gamma:20});window.dispatchEvent(event)});
 await expect.poll(async()=>+(await page.getByLabel('Water direction',{exact:true}).inputValue())).toBeLessThan(60);
 await go(page,3);expect(await state(page,'window.motionListeners()')).toBe(0);
});
test('camera permission denial never blocks the story',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>Promise.reject(new DOMException('Declined','NotAllowedError'))}}));
 await page.goto('./');await go(page,3);await page.getByRole('button',{name:'Enable camera',exact:true}).click();await expect(page.locator('.camera-status')).toContainText('permission declined');
 await page.getByRole('button',{name:'Continue without camera'}).click();await expect(page.locator('.symbolic-reveal')).toBeVisible();
});
test('camera is explicit, requests no audio, stops on navigation and late permission resolution',async({page})=>{
 await mockCamera(page,true);await page.goto('./');expect(await state(page,'window.cameraMock.requests')).toBe(0);await go(page,3);
 await page.getByRole('button',{name:'Enable camera',exact:true}).click();await expect.poll(()=>state(page,'window.cameraMock.requests')).toBe(1);
 await go(page,4);await page.evaluate('window.cameraMock.resolve()');await expect.poll(()=>state(page,'window.cameraMock.stops')).toBe(1);
 expect(await state(page,'window.cameraMock.constraints.audio')).toBe(false);expect(await state(page,'window.cameraMock.constraints.video.facingMode.ideal')).toBe('environment');
});
test('active camera stops on chapter navigation, replay and restart',async({page})=>{
 await mockCamera(page);await page.goto('./');await go(page,3);await page.getByRole('button',{name:'Enable camera',exact:true}).click();await expect(page.locator('.camera-status')).toContainText('Camera ready');
 await go(page,4);await expect.poll(()=>state(page,'window.cameraMock.stops')).toBe(1);
 await go(page,3);await page.getByRole('button',{name:'Enable camera',exact:true}).click();await expect(page.locator('.camera-status')).toContainText('Camera ready');
 await page.getByRole('button',{name:'Replay current chapter'}).click();await expect.poll(()=>state(page,'window.cameraMock.stops')).toBe(2);
 await page.getByRole('button',{name:'Enable camera',exact:true}).click();await expect(page.locator('.camera-status')).toContainText('Camera ready');await page.getByRole('button',{name:'Restart all chapters'}).click();await expect.poll(()=>state(page,'window.cameraMock.stops')).toBe(3);
});
test('recognition model failure offers manual continuation',async({page})=>{
 await mockCamera(page);await page.route('**/assets/bottleDetector-*.js',route=>route.fulfill({contentType:'text/javascript',body:'export async function loadBottleDetector(){throw new Error("offline")}' }));
 await page.goto('./');await go(page,3);await page.getByRole('button',{name:'Enable camera',exact:true}).click();await page.getByRole('button',{name:'Enable local recognition'}).click();
 await expect(page.locator('.camera-status')).toContainText('Recognition could not load');await page.getByRole('button',{name:'Continue without camera'}).click();await expect(page.locator('.symbolic-reveal')).toBeVisible();
});
test('stable mocked detection connects symbolically and disposes resources',async({page})=>{
 await mockCamera(page);await page.addInitScript(()=>{CanvasRenderingContext2D.prototype.drawImage=()=>{};Object.assign(window,{inferences:0,disposals:0})});
 await page.route('**/assets/bottleDetector-*.js',route=>route.fulfill({contentType:'text/javascript',body:'export async function loadBottleDetector(){return {async detect(){window.inferences++;return [{class:"bottle",score:.9,bbox:[20,20,60,120]}]},dispose(){window.disposals++}}}' }));
 await page.goto('./');await go(page,3);await page.getByRole('button',{name:'Enable camera',exact:true}).click();await page.getByRole('button',{name:'Enable local recognition'}).click();
 await expect(page.locator('.camera-status')).toContainText('was recognized',{timeout:6000});expect(await state(page,'window.inferences')).toBe(3);expect(await state(page,'window.cameraMock.stops')).toBe(1);expect(await state(page,'window.disposals')).toBe(1);
 await expect(page.locator('.symbolic-reveal')).toContainText('No water was donated or delivered.');
});
test('river drag into collection and keyboard removal',async({page})=>{
 await page.goto('./');await go(page,4);await page.locator('.river-window').scrollIntoViewIfNeeded();const first=page.locator('.litter').first(), from=(await first.boundingBox())!,to=(await page.getByTestId('collection-area').boundingBox())!;
 await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12});await page.mouse.up();await expect(page.locator('.litter')).toHaveCount(4);
 const keyboard=page.locator('.litter').first();await keyboard.focus();await page.keyboard.press('Enter');await expect(page.locator('.litter')).toHaveCount(3);
});
test('back, replay and restart work without gating content',async({page})=>{
 await page.goto('./');await go(page,5);await expect(page.locator('.system-steps li')).toHaveCount(5);await expect(page.locator('.vietnam-stories')).toContainText('projected outcome');
 await page.getByRole('button',{name:'Previous chapter'}).click();await expect(page.locator('#river-title')).toBeFocused();await page.locator('.litter').first().click();await page.getByRole('button',{name:'Replay current chapter'}).click();await expect(page.locator('.litter')).toHaveCount(5);
});
test('reduced motion and keyboard provide a complete alternative',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./');await go(page,2);await expect(page.getByRole('button',{name:'Enable phone tilt'})).toHaveCount(0);
 const crop=page.getByRole('button',{name:'Water left crops'});await crop.focus();await page.keyboard.press('Space');await expect(crop).toHaveAttribute('aria-pressed','true');
 expect(await page.locator('.stream-line').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await go(page,3);await page.getByRole('button',{name:'Continue without camera'}).focus();await page.keyboard.press('Enter');await expect(page.locator('.symbolic-reveal')).toBeVisible();
});
for(const width of [320,360,375,390,430,768,1280])test(`all chapters fit ${width}px with no overflow`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.goto('./');
 for(let n=1;n<=5;n++){await go(page,n);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
test('repository subpath loads with no errors and detection stays lazy',async({page})=>{
 const errors:string[]=[],requests:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});page.on('request',r=>requests.push(r.url()));
 await page.goto('./');await expect(page.locator('#glass-title')).toBeVisible();expect(page.url()).toContain('/one-glass-of-water/');expect(errors).toEqual([]);expect(requests.some(url=>url.includes('bottleDetector')||url.includes('/models/'))).toBe(false);
});

test('real self-hosted model loads and infers on CPU without WebGL',async({page})=>{
 test.setTimeout(60000);await mockCamera(page);
 await page.addInitScript(()=>{
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){if(type.includes('webgl'))return null;return (getContext as Function).call(this,type,...args)} as typeof getContext;
  CanvasRenderingContext2D.prototype.drawImage=function(){this.fillStyle='#c4c8b9';this.fillRect(0,0,320,240)};
 });
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');await go(page,3);await page.getByRole('button',{name:'Enable camera',exact:true}).click();await page.getByRole('button',{name:'Enable local recognition'}).click();
 await expect(page.locator('.camera-status')).toContainText('Keep a bottle in view',{timeout:45000});
 await page.waitForTimeout(1500);await expect(page.locator('.camera-status')).not.toContainText('could not run');
 await page.getByRole('button',{name:'Stop camera',exact:true}).click();await expect.poll(()=>state(page,'window.cameraMock.stops')).toBe(1);expect(errors).toEqual([]);
});
test('camera stops on tab hiding',async({page})=>{
 await mockCamera(page);await page.goto('./');await go(page,3);await page.getByRole('button',{name:'Enable camera',exact:true}).click();await expect(page.locator('.camera-status')).toContainText('Camera ready');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
 await expect.poll(()=>state(page,'window.cameraMock.stops')).toBe(1);await expect(page.locator('.camera-status')).toContainText('tab was hidden');
});
test('unsupported motion sensors preserve manual controls',async({page})=>{
 await page.addInitScript(()=>{Reflect.deleteProperty(window,'DeviceOrientationEvent')});await page.goto('./');await go(page,2);await page.getByRole('button',{name:'Enable phone tilt'}).click();
 await expect(page.locator('#field')).toContainText('Motion is unavailable here');await page.getByRole('button',{name:'Water left crops'}).click();await expect(page.getByRole('button',{name:'Water left crops'})).toHaveAttribute('aria-pressed','true');
});
test('late model loading is disposed after leaving the camera chapter',async({page})=>{
 await mockCamera(page);await page.addInitScript(()=>Object.assign(window,{modelDisposals:0,releaseModel:null}));
 await page.route('**/assets/bottleDetector-*.js',route=>route.fulfill({contentType:'text/javascript',body:'export async function loadBottleDetector(){await new Promise(resolve=>window.releaseModel=resolve);return {async detect(){throw new Error("must not infer")},dispose(){window.modelDisposals++}}}'}));
 await page.goto('./');await go(page,3);await page.getByRole('button',{name:'Enable camera',exact:true}).click();await page.getByRole('button',{name:'Enable local recognition'}).click();
 await expect.poll(()=>state(page,'typeof window.releaseModel')).toBe('function');await go(page,4);await page.evaluate('window.releaseModel()');
 await expect.poll(()=>state(page,'window.modelDisposals')).toBe(1);expect(await state(page,'window.cameraMock.stops')).toBe(1);await expect(page.locator('.symbolic-reveal')).toHaveCount(0);
});
