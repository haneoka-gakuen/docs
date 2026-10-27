import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { REFERENCE_PAGES, REGISTRY } from '../src/data/api/index.mjs';
import { LOCALES, tr, localizeHref } from '../src/data/api/i18n.mjs';
import { mdxText } from '../src/data/api/render.mjs';
import examples from '../src/data/api/image-examples.json' with { type: 'json' };
import extension from '../src/data/api/openapi-extension.json' with { type: 'json' };
const aliases = { 'reference/releases':'servers/releases', 'reference/catalog':'servers/catalog', 'reference/media':'servers/media', 'reference/team-builder':'servers/client', 'reference/announcements':'servers/announcements', 'reference/game-records':'servers/records', 'reference/garupa':'providers/bestdori', 'reference/auth':'auth', 'reference/account':'auth', 'reference/account-sync':'auth', 'reference/community-posts':'community/posts', 'reference/community-social':'community/profiles', 'reference/community-forums':'community', 'reference/community-uploads':'community/uploads', 'reference/error-codes':'errors', 'concepts/authentication':'auth' };
const patchLinks = text => text.replace(/\]\(\/(?!\/)([^)\s]*)(\/?)(?=\))/gu, (all, target) => {
 const value=target.replace(/\/$/u,''); return aliases[value] ? `](/${aliases[value]}/` : all;
});
const localeDir = locale => path.join('src/content/docs', locale==='en'?'':locale);
for (const locale of LOCALES) for (const page of REFERENCE_PAGES) {
 const file=path.join(localeDir(locale),page.slug+'.mdx'); await mkdir(path.dirname(file),{recursive:true});
 const component=path.relative(path.dirname(file),'src/components/Endpoint.astro').replaceAll('\\','/');
 const text=[`---\ntitle: ${JSON.stringify(tr(page.title,locale))}\ndescription: ${JSON.stringify(tr(page.description,locale))}\n---\n`, `import Endpoint from ${JSON.stringify(component)};\n`, mdxText(patchLinks(tr(page.intro,locale)),locale,REGISTRY),''];
 for(const section of page.sections){text.push(`## ${tr(section.title,locale)}`,'');for(const endpoint of section.endpoints)text.push(`### ${tr(endpoint.title,locale)}`,'',`<Endpoint id="${endpoint.id}" />`,'');}
 await writeFile(file,text.join('\n'));
}
for(const name of ['game-api','local-computation','image-exports']) {
 const input=await readFile(`content-src/${name}.mdx`,'utf8'); const slug=/^slug:\s*(\S+)/mu.exec(input)[1];
 for(const section of input.split(/^@@ /mu).slice(1)){
  const line=section.indexOf('\n'),locale=section.slice(0,line).trim();let body=patchLinks(section.slice(line+1));
  body=body.replace(/\]\((\/(?!\/)[^)\s]*)\)/gu,(_,href)=>`](${/^\/(openapi\.json|examples\/)/u.test(href)?href:localizeHref(href,locale)})`);
  const file=path.join(localeDir(locale),slug+'.mdx'); await mkdir(path.dirname(file),{recursive:true});await writeFile(file,body.trimEnd()+'\n');
 }
}
await mkdir('public/examples',{recursive:true});for(const[k,v]of Object.entries(examples))await writeFile(`public/examples/${k}-image.json`,JSON.stringify(v,null,2)+'\n');
const base=JSON.parse(await readFile('public/openapi.json','utf8'));
base.paths={...base.paths,...extension.paths};
base.components.schemas={...base.components.schemas,...extension.components.schemas};
base.components.securitySchemes={...base.components.securitySchemes,...extension.components.securitySchemes};
await writeFile('public/openapi.json',JSON.stringify(base,null,2)+'\n');
const redirects=[];for(const[from,to]of Object.entries(aliases))for(const locale of LOCALES){const prefix=locale==='en'?'':`/${locale}`;redirects.push(`${prefix}/${from}/ ${prefix}/${to}/ 301`);}
await writeFile('public/_redirects',redirects.join('\n')+'\n');
