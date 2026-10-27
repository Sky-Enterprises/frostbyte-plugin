// scripts/hook.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
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
    return scenario({root,nested,run:(cwd=nested,extraEnv={})=>execFileSync('/bin/sh',[hook],{cwd,env:{...process.env,CLAUDE_PROJECT_DIR:cwd,...extraEnv},encoding:'utf8'})});
  } finally {rmSync(dir,{recursive:true,force:true});}
}
test('nested repository uses linked root and returns valid hook context',()=>fixture('{"projectId":"demo_123"}',({run})=>assert.match(JSON.parse(run()).hookSpecificOutput.additionalContext,/demo_123/)));
test('nearest link wins',()=>fixture('{"projectId":"root"}',({nested,run})=>{writeFileSync(join(nested,'.frostbyte.json'),'{"projectId":"nearest"}');assert.match(run(),/nearest/);}));
test('repository boundary blocks unrelated parent link',()=>fixture(null,({run})=>assert.equal(run(),'')));
test('explicit opt-out skips grounding',()=>fixture('{"projectId":"demo","grounding":false}',({run})=>assert.equal(run(),'')));
test('malformed and wrong-type JSON never grounds',()=>{for(const link of ['{"projectId":"demo",','{"projectId":123}','[]','{"projectId":"unsafe id"}'])fixture(link,({run})=>assert.equal(run(),''));});

test('Python fallback rejects malformed JSON without jq',()=>fixture('{"projectId":"demo",',({root,run})=>{const bin=join(root,'bin');mkdirSync(bin);for(const name of ['dirname','grep','python3'])symlinkSync('/usr/bin/'+name,join(bin,name));assert.equal(run(root,{PATH:bin}),'');}));
test('no JSON parser is a graceful no-op',()=>fixture('{"projectId":"demo"}',({root,run})=>{const bin=join(root,'bin');mkdirSync(bin);for(const name of ['dirname','grep'])symlinkSync('/usr/bin/'+name,join(bin,name));assert.equal(run(root,{PATH:bin}),'');}));
