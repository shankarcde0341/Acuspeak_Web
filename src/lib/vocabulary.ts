export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: 'adjective' | 'verb' | 'noun' | 'adverb';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Fluent';
  levelCode: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  track: 'Daily' | 'Business' | 'Interview' | 'Travel';
  meaning: string;
  example: string;
  synonyms: string[];
}

export const VOCABULARY_WORDS: VocabularyWord[] = [
  {
    id: 'vocab-1',
    word: 'Articulate',
    phonetic: '/ɑːrˈtɪk.jə.leɪt/',
    partOfSpeech: 'adjective',
    level: 'Advanced',
    levelCode: 'C1',
    track: 'Interview',
    meaning: 'Expressing ideas clearly, fluidly, and effectively in spoken communication.',
    example: 'She gave an articulate response explaining how she resolved the cross-functional conflict under tight deadlines.',
    synonyms: ['Eloquent', 'Expressive', 'Lucid', 'Fluent'],
  },
  {
    id: 'vocab-2',
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    level: 'Intermediate',
    levelCode: 'B2',
    track: 'Interview',
    meaning: 'Able to recover quickly from difficult situations, setbacks, or high-pressure challenges.',
    example: 'Our engineering team was resilient when the deployment failed, patching the bugs within two hours.',
    synonyms: ['Adaptable', 'Tough', 'Buoyant', 'Steadfast'],
  },
  {
    id: 'vocab-3',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    level: 'Advanced',
    levelCode: 'C1',
    track: 'Business',
    meaning: 'Dealing with matters sensibly and realistically based on practical rather than theoretical considerations.',
    example: 'We took a pragmatic approach to the budget cuts by prioritizing core platform reliability first.',
    synonyms: ['Practical', 'Realistic', 'Sensible', 'Hard-headed'],
  },
  {
    id: 'vocab-4',
    word: 'Collaborative',
    phonetic: '/kəˈlæb.ə.reɪ.tɪv/',
    partOfSpeech: 'adjective',
    level: 'Intermediate',
    levelCode: 'B1',
    track: 'Business',
    meaning: 'Produced by or involving two or more parties working together toward a shared objective.',
    example: 'Creating our new quarterly roadmap was a collaborative effort between design, product, and sales.',
    synonyms: ['Cooperative', 'Joint', 'Collective', 'Shared'],
  },
  {
    id: 'vocab-5',
    word: 'Persuasive',
    phonetic: '/pərˈsweɪ.sɪv/',
    partOfSpeech: 'adjective',
    level: 'Intermediate',
    levelCode: 'B2',
    track: 'Interview',
    meaning: 'Good at convincing someone to do or believe something through clear reasoning or temptation.',
    example: 'He presented a persuasive pitch that convinced the executive stakeholders to greenlight the venture.',
    synonyms: ['Compelling', 'Convincing', 'Influential', 'Cogent'],
  },
  {
    id: 'vocab-6',
    word: 'Spontaneous',
    phonetic: '/spɑːnˈteɪ.ni.əs/',
    partOfSpeech: 'adjective',
    level: 'Intermediate',
    levelCode: 'B2',
    track: 'Daily',
    meaning: 'Happening naturally or without prior planning or premeditation; impulsive and organic.',
    example: 'We had a spontaneous coffee chat that ended up generating our best product feature concept of the month.',
    synonyms: ['Unplanned', 'Impromptu', 'Natural', 'Instinctive'],
  },
  {
    id: 'vocab-7',
    word: 'Itinerary',
    phonetic: '/aɪˈtɪn.ə.rer.i/',
    partOfSpeech: 'noun',
    level: 'Beginner',
    levelCode: 'A2',
    track: 'Travel',
    meaning: 'A planned route, schedule, or list of places to visit on a trip or journey.',
    example: 'Our flight was delayed, so the tour guide adjusted our afternoon sightseeing itinerary accordingly.',
    synonyms: ['Schedule', 'Tour plan', 'Route', 'Timetable'],
  },
  {
    id: 'vocab-8',
    word: 'Coherent',
    phonetic: '/koʊˈhɪr.ənt/',
    partOfSpeech: 'adjective',
    level: 'Advanced',
    levelCode: 'C1',
    track: 'Business',
    meaning: 'Logical, consistent, and clear in thought or expression; holding together well.',
    example: 'Despite the complex technical architecture, the presenter conveyed a completely coherent strategy.',
    synonyms: ['Logical', 'Consistent', 'Clear', 'Rational'],
  },
  {
    id: 'vocab-9',
    word: 'Nuanced',
    phonetic: '/ˈnjuː.ɑːnst/',
    partOfSpeech: 'adjective',
    level: 'Fluent',
    levelCode: 'C2',
    track: 'Interview',
    meaning: 'Characterized by subtle distinctions, delicate variations in meaning, tone, or perspective.',
    example: 'His understanding of the international regulatory landscape was remarkably nuanced and thoughtful.',
    synonyms: ['Subtle', 'Refined', 'Detailed', 'Sophisticated'],
  },
  {
    id: 'vocab-10',
    word: 'Empathetic',
    phonetic: '/ˌem.pəˈθet̬.ɪk/',
    partOfSpeech: 'adjective',
    level: 'Intermediate',
    levelCode: 'B2',
    track: 'Daily',
    meaning: 'Showing an ability to understand and share the feelings, difficulties, and emotions of others.',
    example: 'An empathetic leader listens actively to team frustrations before suggesting immediate solutions.',
    synonyms: ['Compassionate', 'Understanding', 'Caring', 'Supportive'],
  },
  {
    id: 'vocab-11',
    word: 'Consensus',
    phonetic: '/kənˈsen.səs/',
    partOfSpeech: 'noun',
    level: 'Intermediate',
    levelCode: 'B2',
    track: 'Business',
    meaning: 'General agreement reached by a collective group of people following discussion.',
    example: 'After debating for an hour, the committee reached a general consensus on the revised hiring policy.',
    synonyms: ['Agreement', 'Harmony', 'Concurrence', 'Unanimity'],
  },
  {
    id: 'vocab-12',
    word: 'Navigate',
    phonetic: '/ˈnæv.ə.ɡeɪt/',
    partOfSpeech: 'verb',
    level: 'Beginner',
    levelCode: 'B1',
    track: 'Travel',
    meaning: 'To plan, direct, or find one\'s course through an unfamiliar city, venue, or situation.',
    example: 'Even without speaking the local dialect, we managed to navigate the subway system with ease.',
    synonyms: ['Steer', 'Direct', 'Guide', 'Traverse'],
  },
  {
    id: 'vocab-13',
    word: 'Inquisitive',
    phonetic: '/ɪnˈkwɪz.ə.t̬ɪv/',
    partOfSpeech: 'adjective',
    level: 'Advanced',
    levelCode: 'C1',
    track: 'Daily',
    meaning: 'Curious or inquiring; eager for knowledge and actively asking thoughtful questions.',
    example: 'Her inquisitive mindset helped uncover a major operational bottleneck that others overlooked.',
    synonyms: ['Curious', 'Probing', 'Investigative', 'Interested'],
  },
  {
    id: 'vocab-14',
    word: 'Facilitate',
    phonetic: '/fəˈsɪl.ə.teɪt/',
    partOfSpeech: 'verb',
    level: 'Intermediate',
    levelCode: 'B2',
    track: 'Business',
    meaning: 'To make an action, process, or discussion easier or run more smoothly.',
    example: 'She volunteered to facilitate the weekly retrospective to ensure every voice was heard.',
    synonyms: ['Enable', 'Ease', 'Assist', 'Expedite'],
  },
  {
    id: 'vocab-15',
    word: 'Diligent',
    phonetic: '/ˈdɪl.ə.dʒənt/',
    partOfSpeech: 'adjective',
    level: 'Intermediate',
    levelCode: 'B2',
    track: 'Interview',
    meaning: 'Having or showing persistent care, conscientiousness, and effort in one\'s work or duties.',
    example: 'Through diligent daily speaking practice on Acuspeak, he passed his interview with flying colors.',
    synonyms: ['Conscientious', 'Dedicated', 'Thorough', 'Attentive'],
  },
  {
    id: 'vocab-16',
    word: 'Accommodate',
    phonetic: '/əˈkɑː.mə.deɪt/',
    partOfSpeech: 'verb',
    level: 'Intermediate',
    levelCode: 'B1',
    track: 'Travel',
    meaning: 'To provide lodging or sufficient space for; also to adapt to or fulfill someone\'s needs or wishes.',
    example: 'The hotel manager was kind enough to accommodate our request for a late checkout without extra charge.',
    synonyms: ['House', 'Host', 'Oblige', 'Assist'],
  },
  {
    id: 'vocab-17',
    word: 'Comprehensive',
    phonetic: '/ˌkɑːm.prəˈhen.sɪv/',
    partOfSpeech: 'adjective',
    level: 'Advanced',
    levelCode: 'C1',
    track: 'Business',
    meaning: 'Including or dealing with all or nearly all elements or aspects of something; thorough.',
    example: 'The consultant drafted a comprehensive audit report detailing both vulnerabilities and opportunities.',
    synonyms: ['Complete', 'Thorough', 'Exhaustive', 'All-inclusive'],
  },
  {
    id: 'vocab-18',
    word: 'Candid',
    phonetic: '/ˈkæn.dɪd/',
    partOfSpeech: 'adjective',
    level: 'Intermediate',
    levelCode: 'B2',
    track: 'Daily',
    meaning: 'Truthful and straightforward; frank and honest in conversation without sugarcoating.',
    example: 'I appreciate your candid feedback about my pronunciation—it shows me exactly what to improve.',
    synonyms: ['Frank', 'Direct', 'Honest', 'Sincere'],
  },
  {
    id: 'vocab-19',
    word: 'Milestone',
    phonetic: '/ˈmaɪl.stoʊn/',
    partOfSpeech: 'noun',
    level: 'Beginner',
    levelCode: 'A2',
    track: 'Interview',
    meaning: 'A significant stage, event, or turning point in the development of something or in one\'s career.',
    example: 'Completing my first 30-day English speaking streak on Acuspeak felt like a tremendous personal milestone.',
    synonyms: ['Landmark', 'Breakthrough', 'Achievement', 'Benchmark'],
  },
  {
    id: 'vocab-20',
    word: 'Pivotal',
    phonetic: '/ˈpɪv.ə.t̬əl/',
    partOfSpeech: 'adjective',
    level: 'Advanced',
    levelCode: 'C1',
    track: 'Interview',
    meaning: 'Of crucial importance in relation to the development or success of something else.',
    example: 'Mentoring junior teammates was a pivotal experience that inspired my transition into engineering management.',
    synonyms: ['Crucial', 'Vital', 'Decisive', 'Critical'],
  },
];

const STORAGE_SAVED_WORDS_KEY = 'acuspeak_saved_vocabulary_ids';

/**
 * Retrieves the array of saved word IDs from localStorage.
 */
export function getSavedWordIds(): string[] {
  if (typeof window === 'undefined') return ['vocab-1', 'vocab-2', 'vocab-5'];
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_WORDS_KEY);
    if (!raw) {
      // Default initial saved seeds for an engaging first-time user experience
      const defaultSeeds = ['vocab-1', 'vocab-2', 'vocab-5'];
      localStorage.setItem(STORAGE_SAVED_WORDS_KEY, JSON.stringify(defaultSeeds));
      return defaultSeeds;
    }
    return JSON.parse(raw);
  } catch {
    return ['vocab-1', 'vocab-2', 'vocab-5'];
  }
}

/**
 * Saves or removes a word ID from localStorage, returning whether it is now saved.
 */
export function toggleSaveWordId(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getSavedWordIds();
    let updated: string[];
    let isNowSaved: boolean;

    if (current.includes(id)) {
      updated = current.filter((wordId) => wordId !== id);
      isNowSaved = false;
    } else {
      updated = [...current, id];
      isNowSaved = true;
    }

    localStorage.setItem(STORAGE_SAVED_WORDS_KEY, JSON.stringify(updated));
    return isNowSaved;
  } catch {
    return false;
  }
}
