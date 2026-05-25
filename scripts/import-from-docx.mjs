// Parse AI Tools Daily Report DOCX -> Markdown + JSON
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCX_PATH = 'D:/ai工具日报/AI工具日报汇总-0513至0525.md.docx';
const DATA_DIR = join(ROOT, 'data');
const CONTENT_DIR = join(ROOT, 'content');

[join(CONTENT_DIR, 'tools'), join(CONTENT_DIR, 'combinations'),
 join(CONTENT_DIR, 'articles'), DATA_DIR].forEach(d => {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
});

// ── Extract text from DOCX ──
function extractText(docxPath) {
  const zip = new AdmZip(docxPath);
  const xml = zip.readAsText('word/document.xml');
  const texts = [];
  const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    if (m[1]) texts.push(m[1]);
  }
  return texts.join('');
}

// ── Helpers ──
function guessCat(name, desc) {
  const t = name + desc;
  if (/视频/i.test(t)) return 'video';
  if (/图|照片|修图|画|设计|ppt|头像/i.test(t)) return 'design';
  if (/编程|代码|开发|cursor|qoder/i.test(t)) return 'code';
  if (/语音|声音|配音|克隆|tts|音乐|歌曲|bgm|音频/i.test(t)) return 'voice';
  if (/模型|大模型|llm|参数|token/i.test(t)) return 'model';
  if (/浏览器|填表|搜索|agent|智能体|自动化|办公|笔记|操作系统/i.test(t)) return 'office';
  if (/电商|选品|产品图|购物|比价|淘宝|1688/i.test(t)) return 'ecommerce';
  return 'other';
}

function guessPrice(desc) {
  if (/完全免费|免费开源|开源免费/.test(desc)) return 'completely_free';
  if (/开源/.test(desc)) return 'open_source';
  if (/基础免费|免费版|新用户.*免费|送\d|积分|点数|免费额度/.test(desc)) return 'freemium';
  if (/免费/.test(desc)) return 'completely_free';
  return 'freemium';
}

function toSlug(name) {
  return name
    .replace(/[（()）]/g, ' ')
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
}

// ── Parse tools from section 一 ──
function parseTools(text) {
  const secMatch = text.match(/一、工具清单[\s\S]*?(?=二、免费工具)/);
  if (!secMatch) return [];
  let sec = secMatch[0];

  // Fix: insert space when digits run into date patterns (e.g. "1/105月24日" -> "1/10 5月24日")
  sec = sec.replace(/(\d+)(\d+月\d+日)/g, '$1 $2');

  // Find dates: all in May 2026
  const dateRegex = /5月(\d{1,2})日/g;
  const dates = [];
  let dm;
  while ((dm = dateRegex.exec(sec)) !== null) {
    dates.push({ idx: dm.index, date: '2026-05-' + dm[1].padStart(2, '0') });
  }

  // Find tool entries: 'N. ' where N is enumeration number
  const entryRegex = /\d+\.\s+/g;
  const entries = [];
  let em;
  while ((em = entryRegex.exec(sec)) !== null) {
    if (em.index > 0 && /\d/.test(sec[em.index - 1])) continue;
    if (parseInt(em[0]) > 100) continue;
    entries.push({ idx: em.index, prefix: em[0] });
  }

  // Parse each entry
  const tools = [];
  for (let i = 0; i < entries.length; i++) {
    const start = entries[i].idx + entries[i].prefix.length;
    const end = i + 1 < entries.length ? entries[i + 1].idx : sec.length;
    let content = sec.substring(start, end).trim();
    if (content.startsWith('有更新')) continue;

    const sepIdx = content.indexOf(' - ') >= 0 ? content.indexOf(' - ') : content.indexOf(' — ');
    if (sepIdx < 0) continue;

    const name = content.substring(0, sepIdx).trim();
    let desc = content.substring(sepIdx + 3).trim();
    desc = desc.replace(/\s*\d+\.\s*$/, '').trim();

    let date = '2026-05-13';
    for (let j = dates.length - 1; j >= 0; j--) {
      if (dates[j].idx < entries[i].idx) { date = dates[j].date; break; }
    }

    if (name.includes('有更新')) continue;
    if (tools.find(t => t.name === name)) continue;

    const features = desc.split(/[，,、；;]/).map(s => s.trim()).filter(s => s.length > 3 && s.length < 80).slice(0, 6);
    const tags = [];
    const fullText = name + desc;
    if (/开源/i.test(fullText)) tags.push('开源');
    if (/免费/i.test(fullText)) tags.push('免费');
    if (/国内|中文|国产/i.test(fullText)) tags.push('国产');
    if (/手机|本地|离线/i.test(fullText)) tags.push('本地运行');
    if (/浏览器/i.test(fullText)) tags.push('浏览器');
    if (/github/i.test(fullText)) tags.push('GitHub');

    tools.push({
      id: 'tool-' + toSlug(name).substring(0, 30),
      slug: toSlug(name),
      name,
      category: guessCat(name, desc),
      description: desc,
      description_short: desc.substring(0, 140),
      features,
      shortcomings: '',
      pricing_tier: guessPrice(desc),
      pricing_detail: '',
      china_accessible: !desc.includes('需梯子'),
      beginner_friendly: !desc.includes('需显卡') && !desc.includes('偏开发'),
      ecommerce_relevant: /电商|产品图|选品|主图/i.test(desc),
      url: '',
      tags,
      complementary_tools: [],
      related_combinations: [],
      date_added: date,
      date_updated: date,
    });
  }
  return tools;
}

// ── Parse combinations (section 三) ──
function parseCombinations(text) {
  const secMatch = text.match(/三、最佳搭配方案[\s\S]*?(?=四、公众号)/);
  if (!secMatch) return [];
  const section = secMatch[0];

  const combos = [];
  const parts = section.split(/\d+\.\s+/).filter(b => b.trim() && !b.startsWith('三'));

  for (const part of parts) {
    const lines = part.trim().split(/\n/);
    const first = lines[0].trim();
    const colon = first.indexOf('：');
    if (colon < 0) continue;

    const name = first.substring(0, colon).trim();
    const chain = first.substring(colon + 1).trim();
    const desc = lines.slice(1).map(l => l.trim()).filter(l => l).join('\n');

    const id = 'combo-' + toSlug(name).substring(0, 30);
    combos.push({
      id, title: name, description: desc || chain,
      tool_chain: chain,
      use_case: guessCat(name, chain),
      time_saved: (desc + chain).match(/(\d+小时|\d+分钟)/)?.[0] || '',
      cost_summary: (desc + chain).includes('免费') ? '免费' : '',
      date_updated: '2026-05-25',
    });
  }
  return combos;
}

// ── Parse articles (section 四) ──
function parseArticles(text) {
  const secMatch = text.match(/四、公众号选题[\s\S]*?(?=五、)/);
  if (!secMatch) return [];
  const section = secMatch[0];

  const articles = [];
  let priority = 'backup';
  const lines = section.split(/\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.includes('强推')) priority = 'strong';
    else if (t.includes('推荐选题')) priority = 'recommend';
    else if (t.includes('备选')) priority = 'backup';

    const m = t.match(/^\d+\.\s*《(.+?)》/);
    if (m) {
      articles.push({
        id: 'article-' + toSlug(m[1]).substring(0, 40),
        title: m[1],
        priority,
        category: '',
        date_updated: '2026-05-25',
      });
    }
  }
  return articles;
}

// ── MAIN ──
console.log('Extracting DOCX...');
const raw = extractText(DOCX_PATH);
console.log(`Extracted ${raw.length} chars`);

const tools = parseTools(raw);
console.log(`Tools: ${tools.length}`);

const combos = parseCombinations(raw);
console.log(`Combinations: ${combos.length}`);

const articles = parseArticles(raw);
console.log(`Articles: ${articles.length}`);

// ── Write JSON ──
const stripTools = tools.map(t => ({
  id: t.id, slug: t.slug, name: t.name,
  category: t.category, description: t.description,
  description_short: t.description_short,
  features: t.features, shortcomings: t.shortcomings,
  pricing_tier: t.pricing_tier, pricing_detail: t.pricing_detail,
  china_accessible: t.china_accessible, beginner_friendly: t.beginner_friendly,
  ecommerce_relevant: t.ecommerce_relevant, url: t.url,
  tags: t.tags, complementary_tools: t.complementary_tools,
  related_combinations: t.related_combinations,
  date_added: t.date_added, date_updated: t.date_updated,
}));
writeFileSync(join(DATA_DIR, 'tools.json'), JSON.stringify(stripTools, null, 2), 'utf-8');
writeFileSync(join(DATA_DIR, 'combinations.json'), JSON.stringify(combos, null, 2), 'utf-8');
writeFileSync(join(DATA_DIR, 'articles.json'), JSON.stringify(articles, null, 2), 'utf-8');

const industries = [
  { id: 'ecommerce', name: '电商', slug: 'ecommerce', description: '选品、产品图、比价、客服等电商场景AI工具', recommended_tool_ids: [] },
  { id: 'content', name: '内容创作', slug: 'content', description: '文案、视频、音频等自媒体内容创作工具', recommended_tool_ids: [] },
  { id: 'programming', name: '编程开发', slug: 'programming', description: 'AI编程、代码生成、全栈开发工具', recommended_tool_ids: [] },
  { id: 'design', name: '设计创意', slug: 'design', description: 'AI设计、出图、UI生成工具', recommended_tool_ids: [] },
  { id: 'office', name: '办公效率', slug: 'office', description: 'PPT、填表、自动化办公工具', recommended_tool_ids: [] },
  { id: 'audio-video', name: '音频视频', slug: 'audio-video', description: '配音、音乐、视频生成工具', recommended_tool_ids: [] },
  { id: 'ai-models', name: 'AI大模型', slug: 'ai-models', description: '底层大语言模型和多模态模型', recommended_tool_ids: [] },
  { id: 'local-offline', name: '本地/离线', slug: 'local-offline', description: '不需联网、本地运行的AI工具', recommended_tool_ids: [] },
];
writeFileSync(join(DATA_DIR, 'industries.json'), JSON.stringify(industries, null, 2), 'utf-8');

const changelog = tools.map((t, i) => ({
  id: i + 1, entity_type: 'tool', entity_id: t.id,
  change_desc: `收录工具：${t.name}`,
  changed_at: t.date_added,
}));
writeFileSync(join(DATA_DIR, 'changelog.json'), JSON.stringify(changelog, null, 2), 'utf-8');

// ── Write Markdown files ──
for (const t of tools) {
  const md = `---
id: ${t.id}
name: "${t.name}"
category: ${t.category}
pricing_tier: ${t.pricing_tier}
china_accessible: ${t.china_accessible}
beginner_friendly: ${t.beginner_friendly}
ecommerce_relevant: ${t.ecommerce_relevant}
date_added: ${t.date_added}
date_updated: ${t.date_updated}
tags: [${t.tags.join(', ')}]
feature_list: [${t.features.map(f => `"${f.replace(/"/g, '\\"')}"`).join(', ')}]
---

# ${t.name}

${t.description}

## 功能特点

${t.features.map(f => `- ${f}`).join('\n')}

## 不足之处

> 待分析

## 推荐搭配

> 待分析
`;
  writeFileSync(join(CONTENT_DIR, 'tools', `${t.slug}.md`), md, 'utf-8');
}
console.log(`Wrote ${tools.length} tool .md files`);

for (const c of combos) {
  const md = `---
id: ${c.id}
title: "${c.title}"
use_case: ${c.use_case}
date_updated: ${c.date_updated}
---

# ${c.title}

**工具链：** ${c.tool_chain || ''}

${c.description}
`;
  writeFileSync(join(CONTENT_DIR, 'combinations', `${c.id}.md`), md, 'utf-8');
}
console.log(`Wrote ${combos.length} combo .md files`);

console.log(`\n=== Import Complete ===`);
console.log(`Tools: ${tools.length} | Combos: ${combos.length} | Articles: ${articles.length}`);
console.log(`Data: ${DATA_DIR}`);
console.log(`Content: ${CONTENT_DIR}`);
