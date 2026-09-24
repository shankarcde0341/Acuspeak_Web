export interface ScriptLine {
  line_id: string;
  speaker: string;
  text: string;
  audio_url?: string;
}

export interface LessonProgressPayload {
  lessonId: string;
  completedLineIds: string[];
  currentLineId: string;
  isCompleted: boolean;
  xpEarned: number;
}

export const DAILY_1_SCRIPT: ScriptLine[] = [
  { line_id: 'd1-l1', speaker: 'Alex', text: 'Hello Good morning!' },
  { line_id: 'd1-l2', speaker: 'Priya', text: 'Good morning, My name is Priya. What is your name?' },
  { line_id: 'd1-l3', speaker: 'Alex', text: 'I am Alex. Nice to meet you, Priya.' },
  { line_id: 'd1-l4', speaker: 'Priya', text: 'Nice to meet you too, Alex. Where are you from?' },
  { line_id: 'd1-l5', speaker: 'Alex', text: 'I am from Delhi. And you?' },
  { line_id: 'd1-l6', speaker: 'Priya', text: 'I am from Mumbai. What do you do?' },
  { line_id: 'd1-l7', speaker: 'Alex', text: 'I am a student. What about you?' },
  { line_id: 'd1-l8', speaker: 'Priya', text: 'I work in an office. What are your hobbies?' },
  { line_id: 'd1-l9', speaker: 'Alex', text: 'I like playing cricket and reading books.' },
  { line_id: 'd1-l10', speaker: 'Priya', text: 'That is great! It was nice talking to you. Have a good day!' },
];

export const ORDERING_AT_CAFE_SCRIPT: ScriptLine[] = [
  {
    line_id: 'd2-l1',
    speaker: 'Waitress',
    text: 'Hello! Welcome to Cafe Coffee. How can I help you today?',
    audio_url: '/assets/audio/daily_english/ordering_at_cafe/Barista_L1.mp3',
  },
  { line_id: 'd2-l2', speaker: 'Customer', text: 'Hi! Can I see the menu, please?' },
  { line_id: 'd2-l3', speaker: 'Waitress', text: 'Sure! Here is the menu. What would you like to have?' },
  { line_id: 'd2-l4', speaker: 'Customer', text: 'I would like to order one Hot Coffee and a Sandwich.' },
  { line_id: 'd2-l5', speaker: 'Waitress', text: 'Small, medium, or large coffee?' },
  { line_id: 'd2-l6', speaker: 'Customer', text: 'A medium coffee, please.' },
  { line_id: 'd2-l7', speaker: 'Waitress', text: 'Would you like anything else with your order?' },
  { line_id: 'd2-l8', speaker: 'Customer', text: 'No, that’s all. How much is the total?' },
  { line_id: 'd2-l9', speaker: 'Waitress', text: 'That will be 200 rupees, please.' },
  { line_id: 'd2-l10', speaker: 'Customer', text: 'Here is the money. Thank you!' },
];

export const CASUAL_CONVERSATION_SCRIPT: ScriptLine[] = [
  { line_id: 'd3-l1', speaker: 'Aman', text: 'Excuse me, is this the bus stop for Route 10?' },
  { line_id: 'd3-l2', speaker: 'Stranger', text: "Yes, that's right. It comes here." },
  { line_id: 'd3-l3', speaker: 'Aman', text: 'Great, thank you! Has the bus arrived yet?' },
  { line_id: 'd3-l4', speaker: 'Stranger', text: 'No, not yet. I am waiting for the same bus.' },
  { line_id: 'd3-l5', speaker: 'Aman', text: "Oh, good! The weather is very nice today, isn't it?" },
  { line_id: 'd3-l6', speaker: 'Stranger', text: 'Yes, it is! A bit windy and pleasant.' },
  { line_id: 'd3-l7', speaker: 'Aman', text: 'Are you going to work?' },
  { line_id: 'd3-l8', speaker: 'Stranger', text: 'Yes, I work near the City Mall. What about you?' },
  { line_id: 'd3-l9', speaker: 'Aman', text: 'I am going to meet a friend there. Look, the bus is coming!' },
  { line_id: 'd3-l10', speaker: 'Stranger', text: "Ah, finally! Let's go." },
];

export const SHOPPING_CONVERSATION_SCRIPT: ScriptLine[] = [
  { line_id: 'd4-l1', speaker: 'Assistant', text: 'Hello! Welcome to our store. How can I help you today?' },
  { line_id: 'd4-l2', speaker: 'Customer', text: 'Hi! I am looking for a blue t-shirt.' },
  { line_id: 'd4-l3', speaker: 'Assistant', text: 'Sure! We have many options. What size do you need?' },
  { line_id: 'd4-l4', speaker: 'Customer', text: 'Medium size, please. How much is this blue one?' },
  { line_id: 'd4-l5', speaker: 'Assistant', text: 'This one is 500 rupees.' },
  { line_id: 'd4-l6', speaker: 'Customer', text: 'Okay. Do you have any discount on this?' },
  { line_id: 'd4-l7', speaker: 'Assistant', text: 'Yes, we have a 10% discount on this item today.' },
  { line_id: 'd4-l8', speaker: 'Customer', text: 'That sounds good! Can I try it on?' },
  { line_id: 'd4-l9', speaker: 'Assistant', text: 'Yes, of course! The trial room is right over there.' },
  { line_id: 'd4-l10', speaker: 'Customer', text: 'Great, I will take it. Here is my card.' },
];

export const DIRECTIONS_SCRIPT: ScriptLine[] = [
  { line_id: 'd5-l1', speaker: 'Traveller', text: 'Excuse me! Can you help me, please? I am lost.' },
  { line_id: 'd5-l2', speaker: 'Resident', text: 'Sure! Where do you want to go?' },
  { line_id: 'd5-l3', speaker: 'Traveller', text: 'I am looking for the nearest bank. Is it far from here?' },
  { line_id: 'd5-l4', speaker: 'Resident', text: 'No, it’s quite close. Go straight down this street for two minutes.' },
  { line_id: 'd5-l5', speaker: 'Traveller', text: 'Okay, straight. And then?' },
  { line_id: 'd5-l6', speaker: 'Resident', text: 'Turn left at the traffic light. You will see a big supermarket.' },
  { line_id: 'd5-l7', speaker: 'Traveller', text: 'Turn left at the light. Got it!' },
  { line_id: 'd5-l8', speaker: 'Resident', text: 'Yes! The bank is right next to the supermarket, on your right.' },
  { line_id: 'd5-l9', speaker: 'Traveller', text: 'Straight, left at the traffic light, then next to the supermarket. Perfect! Thank you so much.' },
];

export const LESSON_SCRIPTS: Record<string, { script: ScriptLine[]; title: string; xp: number }> = {
  'daily-1': {
    script: DAILY_1_SCRIPT,
    title: 'Lesson 1: Greetings & Introductions',
    xp: 20,
  },
  'daily-2': {
    script: ORDERING_AT_CAFE_SCRIPT,
    title: 'Lesson 2: Ordering at a Cafe',
    xp: 25,
  },
  'daily-3': {
    script: CASUAL_CONVERSATION_SCRIPT,
    title: 'Lesson 3: Casual Conversation',
    xp: 30,
  },
  'casual-conversation': {
    script: CASUAL_CONVERSATION_SCRIPT,
    title: 'Lesson 3: Casual Conversation',
    xp: 30,
  },
  'daily-4': {
    script: SHOPPING_CONVERSATION_SCRIPT,
    title: 'Lesson 4: Shopping Conversation',
    xp: 25,
  },
  'shopping-conversation': {
    script: SHOPPING_CONVERSATION_SCRIPT,
    title: 'Lesson 4: Shopping Conversation',
    xp: 25,
  },
  'daily-5': {
    script: DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Asking Directions',
    xp: 30,
  },
  'asking-directions': {
    script: DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Asking Directions',
    xp: 30,
  },
};

export function getLessonData(lessonId: string) {
  return LESSON_SCRIPTS[lessonId] || {
    script: DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Asking Directions',
    xp: 30,
  };
}

/**
 * Report lesson progress to the FastAPI backend API.
 * Keeps frontend decoupled from raw backend endpoints.
 */
export async function reportLessonProgress(
  payload: LessonProgressPayload
): Promise<{ success: boolean; xpEarned: number }> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiBase}/api/lessons/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: true, xpEarned: payload.isCompleted ? payload.xpEarned : 0 };
    }

    const data = await response.json();
    return { success: true, xpEarned: data.xpEarned || payload.xpEarned };
  } catch (error) {
    // Graceful fallback for local development or offline state
    return { success: true, xpEarned: payload.isCompleted ? payload.xpEarned : 0 };
  }
}
