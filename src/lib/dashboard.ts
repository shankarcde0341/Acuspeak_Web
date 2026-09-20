export interface StatsData {
  dayStreak: number;
  totalXp: number;
  dailyGoal: {
    minutesDone: number;
    targetMinutes: number;
  };
}

export interface ContinueLessonData {
  id: string;
  title: string;
  category: string;
  progressPercent: number;
  totalSteps: number;
  completedSteps: number;
}

export interface LearningTrackData {
  id: string;
  title: string;
  lessonCount: number;
  iconEmoji: string;
  description: string;
}

export interface WordOfTheDayData {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

export interface LiveRoomData {
  id: string;
  title: string;
  topic: string;
  participantCount: number;
  maxParticipants: number;
  isLive: boolean;
}

export interface DashboardData {
  stats: StatsData;
  continueLesson: ContinueLessonData;
  learningTracks: LearningTrackData[];
  wordOfTheDay: WordOfTheDayData;
  liveRooms: LiveRoomData[];
}

export async function getDashboardData(): Promise<DashboardData> {
  return {
    stats: {
      dayStreak: 5,
      totalXp: 1240,
      dailyGoal: {
        minutesDone: 12,
        targetMinutes: 20,
      },
    },
    continueLesson: {
      id: 'lesson_b1_strengths',
      title: 'Answering Strengths & Weaknesses',
      category: 'Interview English',
      progressPercent: 65,
      totalSteps: 8,
      completedSteps: 5,
    },
    learningTracks: [
      {
        id: 'track_daily',
        title: 'Daily English',
        lessonCount: 12,
        iconEmoji: '🗣️',
        description: 'Everyday conversations, casual banter, and social communication.',
      },
      {
        id: 'track_business',
        title: 'Business English',
        lessonCount: 10,
        iconEmoji: '💼',
        description: 'Professional email etiquette, meetings, and team presentations.',
      },
      {
        id: 'track_interview',
        title: 'Interview English',
        lessonCount: 8,
        iconEmoji: '🎯',
        description: 'Job interview practice, behavioral questions, and impactful responses.',
      },
      {
        id: 'track_travel',
        title: 'Travel English',
        lessonCount: 10,
        iconEmoji: '✈️',
        description: 'Airport navigation, hotel check-ins, dining out, and asking directions.',
      },
    ],
    wordOfTheDay: {
      word: 'Articulate',
      phonetic: '/ɑːrˈtɪk.jə.leɪt/',
      partOfSpeech: 'adjective',
      meaning: 'Expressing oneself readily, clearly, and effectively in speech.',
      example: 'She gave an articulate presentation that convinced the entire audience.',
    },
    liveRooms: [
      {
        id: 'room_interview_prep',
        title: 'Interview Prep Discussion',
        topic: 'Behavioral Questions & Past Experiences',
        participantCount: 4,
        maxParticipants: 6,
        isLive: true,
      },
      {
        id: 'room_casual_evening',
        title: 'Casual Evening Chat',
        topic: 'Hobbies, Movies & Favorite Foods',
        participantCount: 3,
        maxParticipants: 5,
        isLive: true,
      },
      {
        id: 'room_business_vocab',
        title: 'Business Vocabulary Practice',
        topic: 'Negotiations, Pitching & Client Calls',
        participantCount: 5,
        maxParticipants: 8,
        isLive: true,
      },
    ],
  };
}
