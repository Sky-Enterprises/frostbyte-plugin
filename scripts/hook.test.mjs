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

const wrapUp=new URL('../hooks/frostbyte-wrap-up.sh',import.meta.url).pathname;
const use=(name,input={})=>JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',name,input}]}});
function stop(lines,{link='{"projectId":"demo"}',active=false,runs=1,path}={}) {
  const dir=mkdtempSync(join(tmpdir(),'frostbyte-stop-')), root=join(dir,'repo');
  try {
    mkdirSync(root);writeFileSync(join(root,'.git'),'gitdir: fixture');
    if(link!==null)writeFileSync(join(root,'.frostbyte.json'),link);
    writeFileSync(join(dir,'t.jsonl'),lines.join('\n')+'\n{"truncated":');
    const input=JSON.stringify({session_id:'s1',transcript_path:join(dir,'t.jsonl'),cwd:root,hook_event_name:'Stop',stop_hook_active:active});
    let out='';
    for(let i=0;i<runs;i++){
      if(path){const bin=join(dir,'bin');mkdirSync(bin,{recursive:true});for(const name of path)try{symlinkSync(execFileSync('/usr/bin/which',[name],{encoding:'utf8'}).trim(),join(bin,name));}catch{}}
      out=execFileSync('/bin/sh',[wrapUp],{input,cwd:root,env:{PATH:path?join(dir,'bin'):process.env.PATH,TMPDIR:dir},encoding:'utf8'});
    }
    return out;
  } finally {rmSync(dir,{recursive:true,force:true});}
}
const blocks=out=>JSON.parse(out).decision==='block';
test('stop: edits with no Frostbyte writes ask for the wrap-up offer',()=>{assert.ok(blocks(stop([use('Edit')])));assert.ok(blocks(stop([use('Bash',{command:'git add . && git commit -m x'})])));});
test('stop: a Frostbyte write from any server name skips it',()=>{for(const name of ['mcp__plugin_frostbyte_frostbyte__task_complete','mcp__045cb9c5__session_end'])assert.equal(stop([use('Edit'),use(name)]),'');});
test('stop: no edits, a read-only Frostbyte call or a git read skips it',()=>{assert.equal(stop([use('Read'),use('mcp__x__get_task'),use('Bash',{command:'git log'})]),'');});
test('stop: stop_hook_active, a second stop, an unlinked repo or grounding false skips it',()=>{
  assert.equal(stop([use('Edit')],{active:true}),'');
  assert.equal(stop([use('Edit')],{runs:2}),'');
  assert.equal(stop([use('Edit')],{link:null}),'');
  assert.equal(stop([use('Edit')],{link:'{"projectId":"demo","grounding":false}'}),'');
});
test('stop: without jq it is a no-op',()=>assert.equal(stop([use('Write')],{path:['cat','sed','grep','dirname','python3']}),''));
