// scripts/release.mjs

import { readFileSync, writeFileSync, readdirSync, lstatSync, mkdirSync, mkdtempSync, rmSync, utimesSync, chmodSync } from 'node:fs';
import { resolve, relative, dirname, join, isAbsolute } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const run = (command, args, cwd = repo) => execFileSync(command, args, { cwd, encoding: 'utf8', env: {...process.env, TZ: 'UTC'}, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sha256 = data => createHash('sha256').update(data).digest('hex');
const categories = ['Business & Operations', 'Communication', 'Creativity', 'Data & Analytics', 'Developer Tools', 'Education & Research', 'Entertainment', 'Finance', 'Healthcare', 'Other', 'Productivity', 'Scientific Research', 'Security', 'Travel'];

export function filesIn(root, prefix = '') {
  return readdirSync(join(root, prefix)).sort().filter(name => prefix || !['node_modules','.git','.execution','dist'].includes(name)).flatMap(name => {
    const path = join(prefix, name), stat = lstatSync(join(root, path));
    assert(!stat.isSymbolicLink(), `Symlink forbidden: ${path}`);
    return stat.isDirectory() ? filesIn(root, path) : [path];
  });
}

function contained(root, path) {
  assert(typeof path === 'string' && path.startsWith('./') && !path.includes('\\'), `Invalid relative asset path: ${path}`);
  const rel = relative(root, resolve(root, path));
  assert(rel && !rel.startsWith('..') && !isAbsolute(rel), `Escaping path: ${path}`);
  assert(lstatSync(resolve(root, path)).isFile(), `Missing referenced file: ${path}`);
}

function icon(root, path, minimum) {
  contained(root, path);
  const bytes = readFileSync(resolve(root, path));
  assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'Icon must be PNG');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert(width === height && width >= minimum && width <= 2048 && bytes.length < 2 * 1024 * 1024, 'Invalid icon dimensions or size');
}

export function check(root = repo, host = 'source') {
  const files = filesIn(root).filter(f => !/^(?:node_modules|\.git|\.execution|dist)\//.test(f) && f !== '.git');
  for (const f of files.filter(f => f.endsWith('.json'))) json(join(root, f));
  for (const f of files.filter(f => /^skills\/[^/]+\/SKILL\.md$/.test(f))) {
    const text = readFileSync(join(root, f), 'utf8'), match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    assert(match && Buffer.byteLength(text) <= 1024 * 1024, `Invalid frontmatter: ${f}`);
    const front = yaml.load(match[1]);
    assert(front?.name === f.split('/')[1] && typeof front.description === 'string' && front.description.trim(), `Invalid skill: ${f}`);
  }
  assert(files.some(f => f === 'skills/tasks/SKILL.md'), 'Tasks skill missing');
  const manifest = json(join(root, host === 'claude' ? '.claude-plugin/plugin.json' : 'plugin.json'));
  assert(manifest.name === 'frostbyte' && /^\d+\.\d+\.\d+$/.test(manifest.version), 'Invalid identity/version');
  if (host === 'claude') {
    icon(root, manifest.icon, 512);
    assert(manifest.userConfig.api_token.sensitive && manifest.mcpServers === './.mcp.json', 'Claude user configuration missing');
    assert(json(join(root, '.mcp.json')).mcpServers.frostbyte.headers.Authorization === 'Bearer ${user_config.api_token}', 'Unexpected Claude authentication');
    run('bash', ['-n', join(root, 'hooks/frostbyte-grounding.sh')]);
    assert(lstatSync(join(root,'hooks/frostbyte-grounding.sh')).mode & 0o111, 'Hook must be executable');
    assert(json(join(root, 'hooks/hooks.json')).hooks.SessionStart.length > 0, 'Local hook missing');
  } else {
    const ajv = new Ajv2020({allErrors: true}); addFormats(ajv);
    const validate = ajv.compile(json(join(repo, 'scripts/schemas/plugin.schema.json')));
    assert(validate(manifest), JSON.stringify(validate.errors));
    const mcp = json(join(root, 'mcp.json'));
    // OpenAI documents server extensions beyond the portable 1.0 schema.
    const portable = structuredClone(mcp);
    for (const server of Object.values(portable.mcpServers)) delete server.extensions;
    const validateMcp = ajv.compile(json(join(repo, 'scripts/schemas/mcp.schema.json')));
    assert(validateMcp(portable), JSON.stringify(validateMcp.errors));
    assert(mcp.mcpServers.frostbyte.url === 'https://getfrostbyte.dev/mcp' && mcp.mcpServers.frostbyte.extensions?.['com.openai']?.auth?.type === 'oauth', 'Public MCP must use hosted OAuth');
    const ext = manifest.extensions['com.openai'], ui = ext.interface;
    assert(ui.displayName.length <= 30 && ui.shortDescription.length <= 30 && ui.longDescription.length <= 4000, 'Listing text exceeds limits');
    assert(categories.includes(ui.category), 'Unsupported category');
    for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) assert(/^https:\/\//.test(ui[key]), `Missing listing URL: ${key}`);
    icon(root, ui.logo, 256); icon(root, ui.composerIcon, 48); contained(root, ext.onboardingSkill);
    const cases = ext.review.test_cases;
    assert(cases?.positive.length === 5 && cases?.negative.length === 3, 'Five positive and three negative review cases required');
    for (const [kind, list] of Object.entries(cases)) for (const c of list) for (const key of kind === 'positive' ? ['description','prompt','tools_triggered','expected_behavior'] : ['description','prompt']) assert(typeof c[key] === 'string' && c[key].trim(), `Invalid review case ${key}`);
    if (host === 'openai') {
      assert(!files.some(f => /(^|\/)(hooks?|\.app\.json)(\/|$)/i.test(f)), 'Public archive contains hook/app files');
      for (const f of files.filter(f => f.endsWith('.json'))) {
        const text = readFileSync(join(root, f), 'utf8');
        assert(!/"(?:hooks|apps|userConfig|bearer_token_env_var)"\s*:/.test(text) && !/\$\{(?:user_config|FROSTBYTE_)/.test(text), `Unsupported public declaration: ${f}`);
      }
    } else {
      for (const f of ['.claude-plugin/plugin.json','.codex-plugin/plugin.json']) assert(json(join(root,f)).version === manifest.version, `Version mismatch: ${f}`);
      const marketplace = json(join(root,'.claude-plugin/marketplace.json'));
      assert(marketplace.metadata.version === manifest.version && marketplace.plugins[0].version === manifest.version, 'Marketplace version mismatch');
      assert(readFileSync(join(root,'CHANGELOG.md'),'utf8').includes(`## [${manifest.version}]`), 'Missing release notes');
    }
  }
  return {version: manifest.version, files};
}

const allowed = (file, host) => /^(?:skills\/|assets\/)/.test(file) || file === 'LICENSE' || (host === 'openai'
  ? ['plugin.json','mcp.json'].includes(file)
  : ['.claude-plugin/plugin.json','.claude-plugin/icon.png','.mcp.json','hooks/hooks.json','hooks/frostbyte-grounding.sh','README.md','docs/setup.md'].includes(file));

export function prepare(ref, output) {
  assert(ref, 'Pass --ref with an immutable commit');
  const sha = run('git',['rev-parse',`${ref}^{commit}`]);
  assert(/^[0-9a-f]{40}$/.test(sha), 'Invalid commit');
  output = resolve(output); assert(!output.startsWith(repo + '/') || (output === repo + '/dist' || output.startsWith(repo + '/dist/')), 'Use dist/ or an external output directory');
  mkdirSync(output,{recursive:true});
  const source = mkdtempSync(join(tmpdir(),'frostbyte-source-'));
  try {
    const modes=new Map();
    const tracked = run('git',['ls-tree','-r','--full-tree',sha]).split('\n').map(line => {
      const [meta,path] = line.split('\t'); assert(!meta.startsWith('120000'), `Symlink in commit: ${path}`); modes.set(path,meta.startsWith('100755')?0o755:0o644); return path;
    });
    for (const file of tracked.filter(f => !f.startsWith('.execution/'))) {
      const dest=join(source,file); mkdirSync(dirname(dest),{recursive:true});
      writeFileSync(dest,execFileSync('git',['show',`${sha}:${file}`],{cwd:repo,maxBuffer:8*1024*1024})); chmodSync(dest,modes.get(file));
    }
    const {version} = check(source);
    const notes = readFileSync(join(source,'CHANGELOG.md'),'utf8').split(`## [${version}]`)[1]?.split(/\n## /)[0];
    assert(notes?.trim(), 'Missing version notes');
    const receipt={version,sha,assets:[]};
    for (const host of ['openai','claude']) {
      const stage=mkdtempSync(join(tmpdir(),`frostbyte-${host}-`));
      try {
        const inventory=tracked.filter(f=>allowed(f,host)).sort();
        for(const file of inventory){const dest=join(stage,file);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,readFileSync(join(source,file)));chmodSync(dest,modes.get(file));utimesSync(dest,new Date('2000-01-01T00:00:00Z'),new Date('2000-01-01T00:00:00Z'));}
        check(stage,host);
        const name=`frostbyte-${version}-${host}.zip`, path=join(output,name);
        rmSync(path,{force:true});run('zip',['-q','-X',path,...inventory],stage);
        const actual=run('unzip',['-Z1',path]).split('\n');assert(JSON.stringify(actual)===JSON.stringify(inventory),'Archive inventory mismatch');
        const extracted=mkdtempSync(join(tmpdir(),'frostbyte-inspect-'));
        try {run('unzip',['-q',path,'-d',extracted]);check(extracted,host);for(const f of inventory)assert(sha256(readFileSync(join(extracted,f)))===sha256(readFileSync(join(stage,f))),`Archive content mismatch: ${f}`);} finally {rmSync(extracted,{recursive:true,force:true});}
        receipt.assets.push({name,sha256:sha256(readFileSync(path)),files:inventory});
      } finally {rmSync(stage,{recursive:true,force:true});}
    }
    writeFileSync(join(output,'release-notes.md'),`# Frostbyte plugin ${version}\n\n${notes.trim()}\n`);
    writeFileSync(join(output,'candidate.json'),JSON.stringify(receipt,null,2)+'\n');
    return receipt;
  } finally {rmSync(source,{recursive:true,force:true});}
}

// Publication is manual and requires approval of this exact receipt and main SHA.
function publish(output, approvedSha, approvedDigest) {
  output=resolve(output);const receiptPath=join(output,'candidate.json'), receipt=json(receiptPath);
  assert(approvedSha===receipt.sha && approvedDigest===sha256(readFileSync(receiptPath)), 'Pass the approved SHA and receipt checksum');
  assert(run('git',['ls-remote','origin','refs/heads/main']).split(/\s/)[0]===receipt.sha,'Candidate must be the current remote main commit; prepare and approve its exact SHA');
  const fresh=mkdtempSync(join(tmpdir(),'frostbyte-publication-'));
  try {
    const rebuilt=prepare(receipt.sha,fresh);
    assert(JSON.stringify(rebuilt)===JSON.stringify(receipt),'Receipt differs from rebuilt commit');
    assert(sha256(readFileSync(join(output,'release-notes.md')))===sha256(readFileSync(join(fresh,'release-notes.md'))),'Release notes changed since preparation');
    for(const asset of receipt.assets) assert(sha256(readFileSync(join(output,asset.name)))===asset.sha256,'Asset checksum changed');
    const tag=`v${receipt.version}`, remote=run('git',['ls-remote','origin',`refs/tags/${tag}`,`refs/tags/${tag}^{}`]);
    if(remote){const lines=remote.split('\n');assert(lines.some(l=>l.startsWith(receipt.sha+'\t')),'Existing tag points elsewhere');}
    else {
      let local; try { local=run('git',['rev-parse',`refs/tags/${tag}^{commit}`]); } catch {}
      assert(!local || local===receipt.sha,'Local tag conflicts with approved SHA');
      if(!local) run('git',['tag','-a',tag,receipt.sha,'-m',`Frostbyte plugin ${receipt.version}`]);
      run('git',['push','origin',`refs/tags/${tag}`]);
    }
    let existing;try{existing=JSON.parse(run('gh',['release','view',tag,'--json','isDraft,assets,targetCommitish']));}catch(error){if(!String(error.stderr).includes('release not found'))throw error;}
    if(existing){assert(!existing.isDraft,'Existing draft needs deliberate reconciliation');throw new Error('Release already exists; preserve it and inspect its assets rather than overwriting');}
    run('gh',['release','create',tag,'--verify-tag','--title',`Frostbyte plugin ${receipt.version}`,'--notes-file',join(output,'release-notes.md'),...receipt.assets.map(a=>join(output,a.name)),receiptPath]);
  } finally {rmSync(fresh,{recursive:true,force:true});}
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2), flag=name=>args[args.indexOf(name)+1];
    if(args[0]==='check') console.log(JSON.stringify(check()));
    else if(args[0]==='prepare') console.log(JSON.stringify(prepare(args.includes('--ref')?flag('--ref'):null,args.includes('--out')?flag('--out'):join(repo,'dist'))));
    else if(args[0]==='publish') {assert(args.includes('--out')&&args.includes('--approved-sha')&&args.includes('--approved-receipt'),'Publication needs explicit approval arguments');publish(flag('--out'),flag('--approved-sha'),flag('--approved-receipt'));}
    else throw new Error('Usage: release.mjs check | prepare --ref SHA [--out DIR] | publish --out DIR --approved-sha SHA --approved-receipt CHECKSUM');
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
