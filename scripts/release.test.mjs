// scripts/release.test.mjs

import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { check, filesIn } from './release.mjs';

const repo = new URL('../', import.meta.url).pathname;
function fixture(change) {
  const root=mkdtempSync(join(tmpdir(),'frostbyte-check-'));
  try {
    for(const file of filesIn(repo).filter(f=> /^(skills|assets)\//.test(f) || ['plugin.json','mcp.json','LICENSE'].includes(f))) {
      mkdirSync(dirname(join(root,file)),{recursive:true});copyFileSync(join(repo,file),join(root,file));
    }
    change(root);return check(root,'openai');
  } finally {rmSync(root,{recursive:true,force:true});}
}
const edit=(root,path,fn)=>{const p=join(root,path),v=JSON.parse(readFileSync(p));fn(v);writeFileSync(p,JSON.stringify(v));};
test('complete public package validates',()=>assert.equal(fixture(()=>{}).version,JSON.parse(readFileSync(join(repo,'plugin.json'))).version));
test('discoverable public hooks are rejected',()=>assert.throws(()=>fixture(root=>{mkdirSync(join(root,'hooks'));writeFileSync(join(root,'hooks/hooks.json'),'{}');}),/hook/));
test('escaping asset references are rejected',()=>assert.throws(()=>fixture(root=>edit(root,'plugin.json',m=>{m.extensions['com.openai'].interface.logo='../icon.png';})),/path/));
test('Claude credential substitutions cannot leak into public configuration',()=>assert.throws(()=>fixture(root=>edit(root,'mcp.json',m=>{m.mcpServers.frostbyte.headers={Authorization:'Bearer ${user_config.api_token}'};})),/Unsupported/));
test('invalid YAML is rejected as data',()=>assert.throws(()=>fixture(root=>writeFileSync(join(root,'skills/tasks/SKILL.md'),'---\nname: [invalid\n---\n')),/flow|comma|end|YAML/i));
test('symlinks are rejected',()=>assert.throws(()=>fixture(root=>symlinkSync('/etc/passwd',join(root,'assets/escape'))),/Symlink/));
test('incomplete reviewer cases are rejected',()=>assert.throws(()=>fixture(root=>edit(root,'plugin.json',m=>{delete m.extensions['com.openai'].review.test_cases.positive[0].expected_behavior;})),/review case/));

test('publication rejects a receipt without exact approval before any public action',()=>{const root=mkdtempSync(join(tmpdir(),'frostbyte-approval-'));try{writeFileSync(join(root,'candidate.json'),JSON.stringify({sha:'unapproved',version:'0.9.0',assets:[]}));const result=spawnSync(process.execPath,[join(repo,'scripts/release.mjs'),'publish','--out',root,'--approved-sha','wrong','--approved-receipt','wrong'],{encoding:'utf8'});assert.equal(result.status,1);assert.match(result.stderr,/approved SHA and receipt/);}finally{rmSync(root,{recursive:true,force:true});}});
