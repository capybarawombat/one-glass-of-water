import { test, expect, type Page } from '@playwright/test';
const chapters=['glass','people','field','river','system'];
async function open(page:Page,id='glass'){
 await page.goto(`./#${id}`);await expect(page.locator(`#${id}-title`)).toBeVisible();
}
test('pouring drains volume, keeps it upright at rest, and transitions symbolically',async({page})=>{
 await open(page);const canvas=page.locator('.liquid-glass');
 await expect(canvas).toHaveAttribute('data-volume','0.820');await page.waitForTimeout(350);
 await expect(canvas).toHaveAttribute('data-volume','0.820');
 await page.getByRole('button',{name:'Pour without tilting'}).click();
 await expect.poll(async()=>Number(await canvas.getAttribute('data-volume'))).toBeLessThan(.7);
 await expect(page.locator('#people-title')).toBeVisible({timeout:12000});
 await expect(page.locator('.water-wipe')).not.toHaveClass(/is-flowing/,{timeout:3000});
 await expect(page.getByText('Your gesture did not deliver water to these children.')).toBeVisible();
});
test('mouse drag and keyboard slider control liquid tilt',async({page})=>{
 await open(page);const touch=page.locator('.glass-touch');const box=await touch.boundingBox();
 if(!box)throw Error('No glass interaction area');
 await page.mouse.move(box.x+box.width*.35,box.y+box.height*.55);await page.mouse.down();
 await page.mouse.move(box.x+box.width*.6,box.y+box.height*.55,{steps:8});await page.mouse.up();
 await expect.poll(async()=>Number(await page.locator('.liquid-glass').getAttribute('data-angle'))).toBeGreaterThan(.25);
 const slider=page.getByRole('slider',{name:'Glass tilt'});await slider.focus();await page.keyboard.press('Home');
 await expect(slider).toHaveValue('-88');
});
test('motion denial leaves the manual fallback available',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:class extends Event {static requestPermission(){return Promise.resolve('denied')}}})});
 await open(page);await page.getByRole('button',{name:'Enable phone motion'}).click();
 await expect(page.getByRole('status')).toHaveText(/permission declined/);await expect(page.getByRole('slider',{name:'Glass tilt'})).toBeEnabled();
});
test('motion calibrates the first sample and smooths later samples',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:class extends Event {static requestPermission(){return Promise.resolve('granted')}}})});
 await open(page);await page.getByRole('button',{name:'Enable phone motion'}).click();
 async function sample(gamma:number){await page.evaluate(g=>{const event=new Event('deviceorientation');Object.defineProperties(event,{gamma:{value:g},beta:{value:10}});window.dispatchEvent(event)},gamma)}
 await sample(12);await page.waitForTimeout(100);await sample(40);
 await expect.poll(async()=>Number(await page.getByRole('slider',{name:'Glass tilt'}).inputValue())).toBeGreaterThan(20);
 await page.getByRole('button',{name:'Recenter'}).click();
 await expect.poll(async()=>Math.abs(Number(await page.getByRole('slider',{name:'Glass tilt'}).inputValue()))).toBeLessThan(3);
});
test('replay cancels late motion permission',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:class extends Event {static requestPermission(){return new Promise(resolve=>Object.assign(window,{resolveMotion:()=>resolve('granted')}))}}})});
 await open(page);await page.getByRole('button',{name:'Enable phone motion'}).click();await page.getByRole('button',{name:'Replay current chapter'}).click();
 await page.evaluate(()=>(window as Window & {resolveMotion:()=>void}).resolveMotion());
 await expect(page.getByRole('button',{name:'Enable phone motion'})).toBeEnabled();await expect(page.getByRole('button',{name:'Motion enabled'})).toHaveCount(0);
});
test('the visitor can guide the field without motion',async({page})=>{
 await open(page,'field');await page.getByRole('button',{name:'Guide without gestures'}).click();
 await expect(page.getByRole('button',{name:'Follow it downstream'})).toBeVisible({timeout:12000});
 await expect(page.getByText('Digital water; no crop was restored by this gesture.')).toBeVisible();
 await page.getByRole('button',{name:'Follow it downstream'}).click();await expect(page.locator('#river-title')).toBeFocused();
});
test('river cleanup is keyboard accessible and does not claim drinkability',async({page})=>{
 await open(page,'river');await page.getByRole('button',{name:/Remove the visible layer|Continue without image interaction/}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('#river-title')).toContainText('isn’t always safe water.');await expect(page.getByText('No gesture makes this water drinkable.')).toBeVisible();
 await page.getByRole('button',{name:'See what safety takes'}).click();await expect(page.locator('#system-title')).toBeVisible();
});
test('reduced motion provides the same story without sensor access',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await open(page,'field');
 await expect(page.getByRole('button',{name:'Enable phone motion'})).toHaveCount(0);
 await page.getByRole('button',{name:'Guide without gestures'}).click();await expect(page.getByRole('button',{name:'Follow it downstream'})).toBeVisible();
 await expect(page.locator('.field-video')).toHaveCount(0);
});
test('sources are accessible independently and preserve scientific and media credits',async({page})=>{
 await open(page);await page.getByRole('link',{name:'Sources ↗',exact:true}).click();
 await expect(page.locator('#references-heading')).toBeInViewport();await expect(page.locator('.reference-list>li')).toHaveCount(11);
 await expect(page.locator('.media-credits li')).toHaveCount(7);
 for(const link of await page.locator('.reference-list a,.media-credits a[target="_blank"]').all()){
  await expect(link).toHaveAttribute('rel','noopener noreferrer');await expect(link).toHaveAttribute('target','_blank');
 }
});
test('ending returns to the glass and replay starts a fresh volume',async({page})=>{
 await open(page,'system');await page.getByRole('button',{name:'One last glass'}).click();
 await expect(page.getByText('Every glass has a story.')).toBeVisible();await page.getByRole('button',{name:'Replay the experience'}).click();
 await expect(page.locator('#glass-title')).toBeVisible();await expect(page.locator('.liquid-glass')).toHaveAttribute('data-volume','0.820');
});
for(const width of [320,360,390,430,768,1280])test(`chapters fit ${width}px without horizontal overflow`,async({page})=>{
 await page.setViewportSize({width,height:844});for(const id of chapters){await open(page,id);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
test('the film makes no external requests and starts muted',async({page,baseURL})=>{
 const allowedOrigin=new URL(baseURL!).origin;
 const requests:string[]=[];page.on('request',request=>{const url=new URL(request.url());if(['http:','https:'].includes(url.protocol)&&url.origin!==allowedOrigin)requests.push(url.href)});
 await open(page);await expect(page.getByRole('button',{name:'Sound off'})).toHaveAttribute('aria-pressed','false');
 for(const id of chapters.slice(1))await open(page,id);
 expect(requests).toEqual([]);
});
test('production documentary photographs decode successfully',async({page})=>{
 for(const id of ['people','field','river','system']){
  await open(page,id);await expect(page.locator('.scene-backdrop').first().locator('img')).toBeVisible();
  await expect.poll(async()=>page.locator('.scene-backdrop').first().locator('img').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>=1000)).toBe(true);
 }
});
