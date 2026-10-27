// scripts/hook.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const hook=new URL('../hooks/frostbyte-grounding.sh',import.meta.url).pathname;
function fixture(link, scenario) {
  const dir=mkdtempSync(join(tmpdir(),'frostbyte-hook-')), root=join(dir,'repo'), nested=join(root,'src/deep');
  try {
    mkdirSync(nested,{recursive:true});writeFileSync(join(root,'.git'),'gitdir: fixture');
    writeFileSync(join(dir,'.frostbyte.json'),'{"projectId":"WRONG_PARENT"}');
    if(link!==null)writeFileSync(join(root,'.frostbyte.json'),link);
    return scenario({root,nested,run:(cwd=nested)=>execFileSync('/bin/sh',[hook],{cwd,env:{...process.env,CLAUDE_PROJECT_DIR:cwd},encoding:'utf8'})});
  } finally {rmSync(dir,{recursive:true,force:true});}
}
test('nested repository uses linked root and returns valid hook context',()=>fixture('{"projectId":"demo_123"}',({run})=>assert.match(JSON.parse(run()).hookSpecificOutput.additionalContext,/demo_123/)));
test('nearest link wins',()=>fixture('{"projectId":"root"}',({nested,run})=>{writeFileSync(join(nested,'.frostbyte.json'),'{"projectId":"nearest"}');assert.match(run(),/nearest/);}));
test('repository boundary blocks unrelated parent link',()=>fixture(null,({run})=>assert.equal(run(),'')));
test('explicit opt-out skips grounding',()=>fixture('{"projectId":"demo","grounding":false}',({run})=>assert.equal(run(),'')));
test('malformed and wrong-type JSON never grounds',()=>{for(const link of ['{"projectId":"demo",','{"projectId":123}','[]','{"projectId":"unsafe id"}'])fixture(link,({run})=>assert.equal(run(),''));});
