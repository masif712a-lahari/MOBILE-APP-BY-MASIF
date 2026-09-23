export interface PresetBackground {
  id: string;
  name: string;
  category: 'nature' | 'minimal' | 'night' | 'abstract' | 'gradient';
  url: string;
  thumbnail: string;
  defaultOverlayColor?: string;
  defaultRingColor?: string;
  defaultTextColor?: string;
}

export const PRESET_BACKGROUNDS: PresetBackground[] = [
  {
    id: 'nordic-forest',
    name: 'Misty Nordic Pines',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=300&q=60',
    defaultOverlayColor: '#0a120c',
    defaultRingColor: '#34d399',
    defaultTextColor: '#f0fdf4',
  },
  {
    id: 'aurora-borealis',
    name: 'Arctic Aurora',
    category: 'night',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=300&q=60',
    defaultOverlayColor: '#020b14',
    defaultRingColor: '#38bdf8',
    defaultTextColor: '#f0f9ff',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Neo Shinjuku Lights',
    category: 'night',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=60',
    defaultOverlayColor: '#120719',
    defaultRingColor: '#f43f5e',
    defaultTextColor: '#fff1f2',
  },
  {
    id: 'zen-stones',
    name: 'Zen Water & Slate',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=300&q=60',
    defaultOverlayColor: '#0f172a',
    defaultRingColor: '#e2e8f0',
    defaultTextColor: '#ffffff',
  },
  {
    id: 'deep-space',
    name: 'Cosmic Nebula',
    category: 'night',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=60',
    defaultOverlayColor: '#080816',
    defaultRingColor: '#818cf8',
    defaultTextColor: '#ffffff',
  },
  {
    id: 'golden-mountains',
    name: 'Dolomites Sunset Glow',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=60',
    defaultOverlayColor: '#1c1007',
    defaultRingColor: '#fb923c',
    defaultTextColor: '#fff7ed',
  },
  {
    id: 'minimal-architecture',
    name: 'Monolithic Concrete',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=60',
    defaultOverlayColor: '#18181b',
    defaultRingColor: '#d4d4d8',
    defaultTextColor: '#fafafa',
  },
  {
    id: 'emerald-ocean',
    name: 'Deep Pacific Waves',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=60',
    defaultOverlayColor: '#04171a',
    defaultRingColor: '#2dd4bf',
    defaultTextColor: '#f0fdfa',
  },
  {
    id: 'gradient-aurora',
    name: 'Twilight Velvet Gradient',
    category: 'gradient',
    url: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
    thumbnail: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
    defaultOverlayColor: '#0a0a14',
    defaultRingColor: '#c084fc',
    defaultTextColor: '#faf5ff',
  },
  {
    id: 'gradient-sunset',
    name: 'Ember Blaze Gradient',
    category: 'gradient',
    url: 'linear-gradient(135deg, #180904 0%, #450a0a 50%, #78350f 100%)',
    thumbnail: 'linear-gradient(135deg, #180904 0%, #450a0a 50%, #78350f 100%)',
    defaultOverlayColor: '#0f0502',
    defaultRingColor: '#f97316',
    defaultTextColor: '#fff7ed',
  },
  {
    id: 'amoled-black',
    name: 'Pure AMOLED Black',
    category: 'minimal',
    url: '#000000',
    thumbnail: '#000000',
    defaultOverlayColor: '#0a0a0a',
    defaultRingColor: '#10b981',
    defaultTextColor: '#ffffff',
  }
];

export const DEFAULT_PRESETS = [
  { id: 'p1', name: 'Quick Sprint', seconds: 60, category: 'Productivity' },
  { id: 'p2', name: 'Micro Focus', seconds: 300, category: 'Productivity' },
  { id: 'p3', name: 'Zen Breath', seconds: 600, category: 'Mindfulness' },
  { id: 'p4', name: 'Power Nap', seconds: 1200, category: 'Rest' },
  { id: 'p5', name: 'Pomodoro', seconds: 1500, category: 'Focus' },
  { id: 'p6', name: 'Deep Work', seconds: 2700, category: 'Productivity' },
  { id: 'p7', name: 'Hour Sprint', seconds: 3600, category: 'Work' }
];
