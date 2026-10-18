import { test, expect } from '@playwright/test';
test('complete journey through touch buttons, restart, and read sources',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('./');
 const journey=page.locator('#journey');
 await expect(page.getByRole('button',{name:'Deliver the glass',exact:true})).toHaveCount(0);
 await page.getByRole('link',{name:'Help deliver water'}).click();
 for(const name of ['Start with the source','Collect water','Begin treatment','Check water quality','Deliver the glass']){
  await journey.getByRole('button',{name,exact:true}).click();
  await expect(journey.getByRole('button').first()).toBeEnabled({timeout:5000});
 }
 await expect(journey.getByText('You delivered one glass.')).toBeVisible();
 await journey.getByRole('button',{name:'Restart',exact:true}).click();
 await expect(journey.getByRole('button',{name:'Start with the source'})).toBeVisible();
 await page.getByRole('link',{name:'The evidence',exact:true}).click();
 await expect(page.locator('.reference-list > li')).toHaveCount(8);
 for(const link of await page.locator('.reference-list a').all()){
  await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noopener noreferrer');
 }
});
test('keyboard input and reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./');
 const start=page.getByRole('button',{name:'Start with the source'});await start.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Collect water',exact:true})).toBeVisible();
 await expect(page.locator('.falling-drop').first()).toHaveCSS('animation-name','none');
});
for(const width of [320,360,375,390,430,768,1280])test(`no horizontal overflow at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.goto('./');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('restart cancels an in-progress stage',async({page})=>{
 await page.goto('./');await page.getByRole('button',{name:'Start with the source'}).click();
 await page.getByRole('button',{name:'Collect water',exact:true}).click();await page.getByRole('button',{name:'Restart',exact:true}).click();
 await page.waitForTimeout(1800);await expect(page.getByRole('button',{name:'Start with the source'})).toBeVisible();
});
