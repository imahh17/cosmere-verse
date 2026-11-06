// Content for the home journey. Titles are the Spanish editions; years are
// the original (English) publication years. No spoilers beyond each premise.

export type WorldId =
  'scadrial' | 'sel' | 'nalthis' | 'roshar' | 'taldain' | 'lumar' | 'komashi' | 'canticle';

export interface Book {
  title: string;
  year: number;
}

export interface World {
  id: WorldId;
  name: string;
  saga: string;
  premise: string;
  magic?: string;
  books: Book[];
  /** Title of the book to start this world with. */
  startWith: string;
}

export interface RouteStep {
  title: string;
  /** Worlds of this step; the first one sets its colour. */
  worldIds: WorldId[];
  reason: string;
  href: string;
}

// Ordered as the journey visits them, which follows the reading route.
export const worlds: World[] = [
  {
    id: 'scadrial',
    name: 'Scadrial',
    saga: 'Nacidos de la bruma',
    premise:
      'Un mundo cubierto de ceniza, bajo un sol rojo y con niebla cada noche. Algunas personas ingieren metales y los «queman» para obtener poderes.',
    magic: 'Alomancia, feruquimia y hemalurgia: tres artes basadas en metales.',
    books: [
      { title: 'El imperio final', year: 2006 },
      { title: 'El Pozo de la Ascensión', year: 2007 },
      { title: 'El Héroe de las Eras', year: 2008 },
      { title: 'Aleación de ley', year: 2011 },
      { title: 'Sombras de identidad', year: 2015 },
      { title: 'Brazales de duelo', year: 2016 },
      { title: 'El metal perdido', year: 2022 },
    ],
    startWith: 'El imperio final',
  },
  {
    id: 'sel',
    name: 'Sel',
    saga: 'Elantris',
    premise:
      'Elantris fue la ciudad de los dioses hasta que su magia se apagó y quienes la habitaban quedaron malditos.',
    magic: 'AonDor: un poder que se dibuja con símbolos llamados aones.',
    books: [
      { title: 'Elantris', year: 2005 },
      { title: 'El alma del emperador', year: 2012 },
    ],
    startWith: 'Elantris',
  },
  {
    id: 'nalthis',
    name: 'Nalthis',
    saga: 'El aliento de los dioses',
    premise:
      'Cada persona nace con un Aliento. Quien reúne muchos percibe el color con más intensidad y puede dar vida a los objetos.',
    magic: 'BioCroma: el Aliento y el color como combustible.',
    books: [{ title: 'El aliento de los dioses', year: 2009 }],
    startWith: 'El aliento de los dioses',
  },
  {
    id: 'roshar',
    name: 'Roshar',
    saga: 'El archivo de las tormentas',
    premise:
      'Un mundo de roca azotado por altas tormentas. La luz que dejan a su paso alimenta la magia y a unas criaturas llamadas spren.',
    magic: 'Potenciación: la luz tormentosa y los vínculos con los spren.',
    books: [
      { title: 'El camino de los reyes', year: 2010 },
      { title: 'Palabras radiantes', year: 2014 },
      { title: 'Juramentada', year: 2017 },
      { title: 'El ritmo de la guerra', year: 2020 },
      { title: 'Viento y verdad', year: 2024 },
    ],
    startWith: 'El camino de los reyes',
  },
  {
    id: 'taldain',
    name: 'Taldain',
    saga: 'Arena blanca',
    premise:
      'Un planeta con una cara siempre de día y otra siempre de noche. En su desierto, quienes dominan la arena la mueven a voluntad.',
    magic: 'Maestría de la arena.',
    books: [
      { title: 'Arena blanca. Volumen 1 (novela gráfica)', year: 2016 },
      { title: 'Arena blanca. Volumen 2 (novela gráfica)', year: 2018 },
      { title: 'Arena blanca. Volumen 3 (novela gráfica)', year: 2019 },
    ],
    startWith: 'Arena blanca. Volumen 1',
  },
  {
    id: 'lumar',
    name: 'Lumar',
    saga: 'Trenza del mar Esmeralda',
    premise:
      'Mares de esporas caídas de doce lunas que se navegan como si fueran agua. Al mojarse, las esporas estallan.',
    magic: 'Las esporas: cada mar tiene las suyas y cada una reacciona de forma distinta.',
    books: [{ title: 'Trenza del mar Esmeralda', year: 2023 }],
    startWith: 'Trenza del mar Esmeralda',
  },
  {
    id: 'komashi',
    name: 'Komashi',
    saga: 'Yumi y el pintor de pesadillas',
    premise:
      'Una joven que apila piedras para invocar a los espíritus y un pintor que caza pesadillas quedan unidos por un misterio.',
    books: [{ title: 'Yumi y el pintor de pesadillas', year: 2023 }],
    startWith: 'Yumi y el pintor de pesadillas',
  },
  {
    id: 'canticle',
    name: 'Canticle',
    saga: 'El hombre iluminado',
    premise:
      'Un planeta tan cerca de su sol que el amanecer lo abrasa todo: para sobrevivir hay que huir del día sin descanso.',
    books: [{ title: 'El hombre iluminado', year: 2023 }],
    startWith: 'El hombre iluminado',
  },
];

export const readingRoute: RouteStep[] = [
  {
    title: 'El imperio final',
    worldIds: ['scadrial'],
    reason: 'Una trilogía cerrada con la magia más fácil de entender. La puerta clásica.',
    href: '#scadrial',
  },
  {
    title: 'Elantris o El aliento de los dioses',
    worldIds: ['sel', 'nalthis'],
    reason: 'Novelas independientes: un mundo, una historia y ningún compromiso.',
    href: '#nalthis',
  },
  {
    title: 'El camino de los reyes',
    worldIds: ['roshar'],
    reason: 'La gran saga del Cosmere. Se disfruta más después de El aliento de los dioses.',
    href: '#roshar',
  },
  {
    title: 'Trenza del mar Esmeralda',
    worldIds: ['lumar'],
    reason: 'Una aventura luminosa y breve para respirar entre libros largos.',
    href: '#lumar',
  },
];

/** Display name of each world, for labels outside its own section. */
export function worldName(id: WorldId): string {
  return worlds.find((world) => world.id === id)?.name ?? id;
}
