(function (root) {
  const NORMAL_MONOS = [
    {
      id: 'level-1',
      level: 1,
      sizeX: 32,
      sizeY: 32,
      shape: 'circle',
      score: 1,
      dropCandidate: true,
      emoji: '🍎'
    },
    {
      id: 'level-2',
      level: 2,
      sizeX: 32 * 1.25,
      sizeY: 32 * 1.25,
      shape: 'circle',
      score: 2,
      dropCandidate: true,
      emoji: '🍊'
    },
    {
      id: 'level-3',
      level: 3,
      sizeX: 32 * Math.pow(1.25, 2),
      sizeY: 32 * Math.pow(1.25, 2),
      shape: 'circle',
      score: 4,
      dropCandidate: true,
      emoji: '🍋'
    },
    {
      id: 'level-4',
      level: 4,
      sizeX: 32 * Math.pow(1.25, 3),
      sizeY: 32 * Math.pow(1.25, 3),
      shape: 'circle',
      score: 8,
      dropCandidate: true,
      emoji: '🍌'
    },
    {
      id: 'level-5',
      level: 5,
      sizeX: 32 * Math.pow(1.25, 4),
      sizeY: 32 * Math.pow(1.25, 4),
      shape: 'circle',
      score: 16,
      dropCandidate: true,
      emoji: '🍉'
    },
    {
      id: 'level-6',
      level: 6,
      sizeX: 32 * Math.pow(1.25, 5),
      sizeY: 32 * Math.pow(1.25, 5),
      shape: 'circle',
      score: 32,
      dropCandidate: false,
      emoji: '🍇'
    },
    {
      id: 'level-7',
      level: 7,
      sizeX: 32 * Math.pow(1.25, 6),
      sizeY: 32 * Math.pow(1.25, 6),
      shape: 'circle',
      score: 64,
      dropCandidate: false,
      emoji: '🍓'
    },
    {
      id: 'level-8',
      level: 8,
      sizeX: 32 * Math.pow(1.25, 7),
      sizeY: 32 * Math.pow(1.25, 7),
      shape: 'circle',
      score: 128,
      dropCandidate: false,
      emoji: '🍒'
    },
    {
      id: 'level-9',
      level: 9,
      sizeX: 32 * Math.pow(1.25, 8),
      sizeY: 32 * Math.pow(1.25, 8),
      shape: 'circle',
      score: 256,
      dropCandidate: false,
      emoji: '🥝'
    },
    {
      id: 'level-10',
      level: 10,
      sizeX: 32 * Math.pow(1.25, 9),
      sizeY: 32 * Math.pow(1.25, 9),
      shape: 'circle',
      score: 512,
      dropCandidate: false,
      emoji: '🍑'
    }
  ];

  root.NORMAL_MONOS = NORMAL_MONOS;
})(typeof window !== 'undefined' ? window : globalThis);
