/* ============================================================
   BIRTHDAY COLOR PALETTES
   Easily customize or switch themes here!
   Change CURRENT_THEME to: 'friend', 'sunset', 'ocean', or 'romantic'
   ============================================================ */

export const CURRENT_THEME = 'ocean'; // <-- Ocean Breeze is the default palette

export const PALETTES = {
  // 1. FRIENDLY CELEBRATION (Default): Joyful, warm, sunny gold, amber, apricot & teal
  friend: {
    id: 'friend',
    name: 'Friends Celebration 🎉',
    // Paper / background tones
    paper0: '#fffbf4',
    paper1: '#fcf0dc',
    paper2: '#f5dec0',
    bodyBg: '#1a1005',
    // Sky / Dawn gradient on Canvas
    skyGrad: ['#fffbf4', '#f8eedc', '#ecd4b2', '#deb886'],
    // Act 1 Target gradients
    targetGlow: 'rgba(245, 158, 11, 0.45)',
    targetAura: 'rgba(245, 158, 11, 0.35)',
    targetFill: ['#fffbeb', '#fde047', '#f59e0b', '#b45309'],
    // Act 2 Rose/Gold Flood
    floodCircle: ['#fde047', '#f59e0b', '#d97706', '#9a3412'],
    floodField: ['#f59e0b', '#d97706', '#9a3412', '#451a03'],
    // Text colors
    ink: '#451a03',
    inkSub: '#78350f',
    gold1: '#fde047',
    gold2: '#f59e0b',
    heroGrad: 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #d97706 100%)',
    // Canopy blossom petal colors (festive, bright, sunny)
    blossoms: [
      { c0: '#fffbeb', c1: '#fde047' }, // Sunny radiant gold
      { c0: '#fef3c7', c1: '#f59e0b' }, // Warm amber
      { c0: '#ffedd5', c1: '#fb923c' }, // Joyful apricot
      { c0: '#fef08a', c1: '#eab308' }, // Golden yellow
      { c0: '#fed7aa', c1: '#f97316' }, // Cheerful tangerine
      { c0: '#ccfbf1', c1: '#2dd4bf' }, // Fresh mint celebration accent
    ],
    moteColor: 'rgba(255, 235, 175, 0.95)',
    bokehRgb: ['255,230,160', '255,190,120', '210,245,230']
  },

  // 2. SUNSET FESTIVAL: Warm sunset saffron, coral & golden amber
  sunset: {
    id: 'sunset',
    name: 'Sunset Festival 🌅',
    paper0: '#fff7ed',
    paper1: '#ffedd5',
    paper2: '#fed7aa',
    bodyBg: '#1f0c05',
    skyGrad: ['#fff7ed', '#ffedd5', '#fed7aa', '#f97316'],
    targetGlow: 'rgba(249, 115, 22, 0.45)',
    targetAura: 'rgba(234, 88, 12, 0.35)',
    targetFill: ['#fef08a', '#fb923c', '#ea580c', '#9a3412'],
    floodCircle: ['#fdba74', '#f97316', '#ea580c', '#7c2d12'],
    floodField: ['#ea580c', '#c2410c', '#9a3412', '#431407'],
    ink: '#431407',
    inkSub: '#9a3412',
    gold1: '#fde047',
    gold2: '#f97316',
    heroGrad: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)',
    blossoms: [
      { c0: '#fef08a', c1: '#f59e0b' },
      { c0: '#fed7aa', c1: '#ea580c' },
      { c0: '#ffedd5', c1: '#f97316' },
      { c0: '#fee2e2', c1: '#ef4444' },
      { c0: '#fef3c7', c1: '#d97706' },
    ],
    moteColor: 'rgba(255, 215, 170, 0.95)',
    bokehRgb: ['255,210,140', '255,160,110', '255,230,180']
  },

  // 3. OCEAN BREEZE: Crisp, cool cyan & navy for modern birthday vibes
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze 🌊',
    paper0: '#f0f9ff',
    paper1: '#e0f2fe',
    paper2: '#bae6fd',
    bodyBg: '#05131f',
    skyGrad: ['#f0fdfa', '#e0f2fe', '#bae6fd', '#38bdf8'],
    targetGlow: 'rgba(14, 165, 233, 0.45)',
    targetAura: 'rgba(2, 132, 199, 0.35)',
    targetFill: ['#e0f2fe', '#38bdf8', '#0284c7', '#0369a1'],
    floodCircle: ['#7dd3fc', '#0284c7', '#0369a1', '#082f49'],
    floodField: ['#0284c7', '#0369a1', '#075985', '#082f49'],
    ink: '#082f49',
    inkSub: '#0369a1',
    gold1: '#38bdf8',
    gold2: '#0284c7',
    heroGrad: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #38bdf8 100%)',
    blossoms: [
      { c0: '#e0f2fe', c1: '#38bdf8' },
      { c0: '#ccfbf1', c1: '#14b8a6' },
      { c0: '#e0e7ff', c1: '#6366f1' },
      { c0: '#fef08a', c1: '#eab308' },
      { c0: '#bae6fd', c1: '#0284c7' },
    ],
    moteColor: 'rgba(186, 230, 253, 0.95)',
    bokehRgb: ['180,230,255', '160,245,230', '190,210,255']
  },

  // 4. ROSE ROMANCE: Traditional soft romantic roses
  romantic: {
    id: 'romantic',
    name: 'Rose Romance 🌹',
    paper0: '#fff8f2',
    paper1: '#fae5d6',
    paper2: '#f5cfbf',
    bodyBg: '#14050d',
    skyGrad: ['#fbebe1', '#f7dbcb', '#f0c0ab', '#e39d88'],
    targetGlow: 'rgba(255, 105, 145, 0.62)',
    targetAura: 'rgba(255, 130, 160, 0.4)',
    targetFill: ['#ffd9e4', '#ff6f97', '#d81e57', '#9d0f3e'],
    floodCircle: ['#ff8fae', '#d4235c', '#a80f43', '#6e0a31'],
    floodField: ['#d4235c', '#a80f43', '#830833', '#4a051d'],
    ink: '#6b3644',
    inkSub: '#9c6472',
    gold1: '#ffd276',
    gold2: '#e8a23d',
    heroGrad: 'linear-gradient(135deg, #a80f43 0%, #d4235c 50%, #ff5f86 100%)',
    blossoms: [
      { c0: '#ffe1ec', c1: '#ff80aa' },
      { c0: '#ffd0e0', c1: '#f4577f' },
      { c0: '#ffc4d2', c1: '#e23b67' },
      { c0: '#ffd9c4', c1: '#ff8a5b' },
      { c0: '#ffeec2', c1: '#f6b13e' },
      { c0: '#ffd2e6', c1: '#e84d9a' },
    ],
    moteColor: 'rgba(255, 245, 225, 0.95)',
    bokehRgb: ['255,224,188', '255,196,214', '255,238,210']
  }
};
