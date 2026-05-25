export const CATEGORIES = [
  { id: 'browser', name: '浏览器/AI Agent', slug: 'browser' },
  { id: 'image', name: '图像/设计', slug: 'image' },
  { id: 'code', name: '编程开发', slug: 'code' },
  { id: 'voice', name: '语音/音频', slug: 'voice' },
  { id: 'video', name: '视频制作', slug: 'video' },
  { id: 'model', name: 'AI大模型', slug: 'model' },
  { id: 'office', name: '办公效率', slug: 'office' },
  { id: 'ecommerce', name: '电商工具', slug: 'ecommerce' },
  { id: 'design', name: '设计创意', slug: 'design' },
  { id: 'other', name: '其他', slug: 'other' },
];

export const PRICING_TIERS = [
  { id: 'completely_free', name: '完全免费', slug: 'free' },
  { id: 'freemium', name: '免费+付费', slug: 'freemium' },
  { id: 'paid', name: '付费', slug: 'paid' },
  { id: 'open_source', name: '开源', slug: 'open-source' },
  { id: 'unknown', name: '未知', slug: 'unknown' },
];

export const INDUSTRIES = [
  { id: 'ecommerce', name: '电商', slug: 'ecommerce', description: '选品、产品图、比价、客服等电商场景AI工具' },
  { id: 'content', name: '内容创作', slug: 'content', description: '文案、视频、音频等自媒体内容创作工具' },
  { id: 'programming', name: '编程开发', slug: 'programming', description: 'AI编程、代码生成、全栈开发工具' },
  { id: 'design', name: '设计创意', slug: 'design', description: 'AI设计、出图、UI生成工具' },
  { id: 'office', name: '办公效率', slug: 'office', description: 'PPT、填表、自动化办公工具' },
  { id: 'audio-video', name: '音频视频', slug: 'audio-video', description: '配音、音乐、视频生成工具' },
  { id: 'ai-models', name: 'AI大模型', slug: 'ai-models', description: '底层大语言模型和多模态模型' },
  { id: 'local-offline', name: '本地/离线', slug: 'local-offline', description: '不需联网、本地运行的AI工具' },
];

export const gradientColors = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-sky-500 to-indigo-500',
  'from-lime-500 to-green-500',
  'from-fuchsia-500 to-rose-500',
] as const;

export const catNames: Record<string, string> = {
  browser: '浏览器', image: '图像', code: '编程', voice: '语音',
  video: '视频', model: '大模型', office: '办公', ecommerce: '电商',
  design: '设计', other: '其他',
};

export const priceLabel: Record<string, string> = {
  completely_free: '免费', open_source: '开源',
  freemium: '部分免费', paid: '付费', unknown: '未知',
};

export const priceLabelFull: Record<string, string> = {
  completely_free: '完全免费', open_source: '开源免费',
  freemium: '免费+付费', paid: '付费', unknown: '未知',
};
