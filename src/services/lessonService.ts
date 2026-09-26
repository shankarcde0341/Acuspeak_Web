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

export const BUSINESS_MEETING_SCRIPT: ScriptLine[] = [
  { line_id: 'b1-l1', speaker: 'Manager', text: "Good morning, everyone. Thank you for joining today's meeting." },
  { line_id: 'b1-l2', speaker: 'Ravi', text: 'Good morning! Are we discussing the quarterly targets today?' },
  { line_id: 'b1-l3', speaker: 'Manager', text: "Yes, that's right. Let me share the agenda on the screen." },
  { line_id: 'b1-l4', speaker: 'Sneha', text: 'I have the sales report ready. Shall I present it first?' },
  { line_id: 'b1-l5', speaker: 'Manager', text: 'Please go ahead, Sneha. The floor is yours.' },
  { line_id: 'b1-l6', speaker: 'Sneha', text: 'Our revenue grew by 15% compared to the last quarter.' },
  { line_id: 'b1-l7', speaker: 'Ravi', text: "That's impressive! Which product line contributed the most?" },
  { line_id: 'b1-l8', speaker: 'Sneha', text: 'The premium subscription plan drove most of the growth.' },
  { line_id: 'b1-l9', speaker: 'Manager', text: "Excellent work, team. Let's set our goals for the next quarter." },
  { line_id: 'b1-l10', speaker: 'Ravi', text: 'I suggest we target a 20% increase. I will draft a plan by Friday.' },
];

export const PROFESSIONAL_EMAIL_SCRIPT: ScriptLine[] = [
  { line_id: 'b2-l1', speaker: 'Anita', text: 'Vikram, I need to send an email to our client about the project delay. Can you help me?' },
  { line_id: 'b2-l2', speaker: 'Vikram', text: "Sure! First, start with a professional greeting like 'Dear Mr. Sharma'." },
  { line_id: 'b2-l3', speaker: 'Anita', text: 'Okay. And how should I explain the delay without sounding unprofessional?' },
  { line_id: 'b2-l4', speaker: 'Vikram', text: "Say something like 'We regret to inform you that the delivery timeline has been revised.'" },
  { line_id: 'b2-l5', speaker: 'Anita', text: 'That sounds good. Should I mention the new deadline?' },
  { line_id: 'b2-l6', speaker: 'Vikram', text: "Absolutely. Be specific. Write 'The revised delivery date is March 15th.'" },
  { line_id: 'b2-l7', speaker: 'Anita', text: 'Should I apologize in the email?' },
  { line_id: 'b2-l8', speaker: 'Vikram', text: "Yes, add 'We sincerely apologize for any inconvenience caused.'" },
  { line_id: 'b2-l9', speaker: 'Anita', text: 'How should I close the email?' },
  { line_id: 'b2-l10', speaker: 'Vikram', text: "End with 'Please do not hesitate to reach out if you have any questions." },
  { line_id: 'b2-l11', speaker: 'Anita', text: 'Thank you so much Vikram!' },
  { line_id: 'b2-l12', speaker: 'Vikram', text: "You're welcome! I'm sure the client will understand." },
];

export const NEGOTIATION_SCRIPT: ScriptLine[] = [
  { line_id: 'b3-l1', speaker: 'Buyer', text: 'Thank you for meeting with us today. We are interested in your software package.' },
  { line_id: 'b3-l2', speaker: 'Seller', text: 'We appreciate your interest. Our standard package is priced at 5 lakh rupees per year.' },
  { line_id: 'b3-l3', speaker: 'Buyer', text: 'That is a bit above our budget. Is there any room for negotiation?' },
  { line_id: 'b3-l4', speaker: 'Seller', text: 'We can discuss flexible options. What budget range are you working with?' },
  { line_id: 'b3-l5', speaker: 'Buyer', text: 'We were hoping to keep it around 3.5 lakh rupees.' },
  { line_id: 'b3-l6', speaker: 'Seller', text: 'For that price, we could offer the basic tier with fewer features. Would that work?' },
  { line_id: 'b3-l7', speaker: 'Buyer', text: 'We really need the analytics module included. Can you meet us at 4 lakh?' },
  { line_id: 'b3-l8', speaker: 'Seller', text: 'If you commit to a two-year contract, we can offer the full package at 4 lakh per year.' },
  { line_id: 'b3-l9', speaker: 'Buyer', text: 'That sounds like a fair deal. Let me discuss this with my team and get back to you.' },
  { line_id: 'b3-l10', speaker: 'Seller', text: 'Absolutely. Take your time. We look forward to a great partnership.' },
];

export const PRESENTATION_SCRIPT: ScriptLine[] = [
  { line_id: 'b4-l1', speaker: 'Presenter', text: 'Good afternoon, everyone. Today I will be presenting our marketing strategy for Q3.' },
  { line_id: 'b4-l2', speaker: 'Presenter', text: "Let me start by sharing the key highlights from last quarter's performance." },
  { line_id: 'b4-l3', speaker: 'Presenter', text: 'As you can see on this slide, our social media engagement increased by 40%.' },
  { line_id: 'b4-l4', speaker: 'Audience', text: 'That is quite impressive. What do you attribute the growth to?' },
  { line_id: 'b4-l5', speaker: 'Presenter', text: 'We focused on video content and influencer collaborations, which really resonated with our audience.' },
  { line_id: 'b4-l6', speaker: 'Presenter', text: 'Moving forward, our strategy includes three main pillars. Let me walk you through each one.' },
  { line_id: 'b4-l7', speaker: 'Audience', text: 'Could you elaborate on the budget allocation for digital advertising?' },
  { line_id: 'b4-l8', speaker: 'Presenter', text: 'Of course. We plan to allocate 60% of the budget to digital channels and 40% to offline events.' },
  { line_id: 'b4-l9', speaker: 'Audience', text: 'Thank you. This looks like a solid plan.' },
  { line_id: 'b4-l10', speaker: 'Presenter', text: 'Thank you for your feedback. I am happy to answer any more questions after the session.' },
];

export const NETWORKING_SCRIPT: ScriptLine[] = [
  { line_id: 'b5-l1', speaker: 'Meera', text: "Hi! I don't think we have met before. I am Meera from the marketing team." },
  { line_id: 'b5-l2', speaker: 'Arjun', text: 'Hello Meera! I am Arjun. I work in the product development department.' },
  { line_id: 'b5-l3', speaker: 'Meera', text: 'Nice to meet you, Arjun! How long have you been with the company?' },
  { line_id: 'b5-l4', speaker: 'Arjun', text: 'About three years now. I joined right after the company expanded to Bangalore.' },
  { line_id: 'b5-l5', speaker: 'Meera', text: "That's wonderful! I just joined two months ago. I am still getting to know everyone." },
  { line_id: 'b5-l6', speaker: 'Arjun', text: 'Welcome aboard! If you ever need help navigating things, feel free to reach out.' },
  { line_id: 'b5-l7', speaker: 'Meera', text: 'That is very kind of you. Actually, I would love to learn more about how your team works.' },
  { line_id: 'b5-l8', speaker: 'Arjun', text: "Sure, let's grab coffee sometime this week and I will tell you all about it." },
  { line_id: 'b5-l9', speaker: 'Meera', text: 'That sounds great! How about Wednesday afternoon?' },
  { line_id: 'b5-l10', speaker: 'Arjun', text: 'Wednesday works perfectly. See you then, Meera!' },
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

export const RESTAURANT_SCRIPT: ScriptLine[] = [
  { line_id: 'd6-l1', speaker: 'Waiter', text: 'Good afternoon! Welcome to Food Palace. A table for one?' },
  { line_id: 'd6-l2', speaker: 'Customer', text: 'Yes, please. A table near the window would be great.' },
  { line_id: 'd6-l3', speaker: 'Waiter', text: 'Sure, right this way, please. Here is the menu.' },
  { line_id: 'd6-l4', speaker: 'Customer', text: 'Thank you. What do you recommend today?' },
  { line_id: 'd6-l5', speaker: 'Waiter', text: 'Our Special Paneer Butter Masala with Butter Naan is very popular.' },
  { line_id: 'd6-l6', speaker: 'Customer', text: 'That sounds delicious! I will have that, please.' },
  { line_id: 'd6-l7', speaker: 'Waiter', text: 'Would you like anything to drink with your meal?' },
  { line_id: 'd6-l8', speaker: 'Customer', text: 'Just a glass of fresh lime soda, please.' },
  { line_id: 'd6-l9', speaker: 'Waiter', text: 'Perfect! Your order will be ready in 15 minutes.' },
];

export const WEEKENDS_SCRIPT: ScriptLine[] = [
  { line_id: 'd7-l1', speaker: 'Pritam', text: 'Hi Priya! Good morning! How was your weekend?' },
  { line_id: 'd7-l2', speaker: 'Priya', text: 'Good morning Pritam! It was great, thanks. What about yours?' },
  { line_id: 'd7-l3', speaker: 'Pritam', text: 'Mine was good too! What did you do on Saturday?' },
  { line_id: 'd7-l4', speaker: 'Priya', text: 'I stayed at home and watched a movie with my family.' },
  { line_id: 'd7-l5', speaker: 'Pritam', text: 'That sounds relaxing! Did you go anywhere on Sunday?' },
  { line_id: 'd7-l6', speaker: 'Priya', text: 'Yes, I went to the park in the evening. How did you spend your weekend?' },
  { line_id: 'd7-l7', speaker: 'Pritam', text: 'I met my old school friends. We played cricket and had lunch together.' },
  { line_id: 'd7-l8', speaker: 'Priya', text: 'Wow, that sounds like a lot of fun!' },
  { line_id: 'd7-l9', speaker: 'Pritam', text: 'Yes, it was! Are you ready for the new week now?' },
  { line_id: 'd7-l10', speaker: 'Priya', text: "Yes, completely! Let's get to work." },
];

export const DOCTOR_SCRIPT: ScriptLine[] = [
  { line_id: 'd8-l1', speaker: 'Doctor', text: 'Good morning! Please take a seat. How are you feeling today?' },
  { line_id: 'd8-l2', speaker: 'Patient', text: 'Good morning, Doctor. I am not feeling very well.' },
  { line_id: 'd8-l3', speaker: 'Doctor', text: 'What seems to be the problem?' },
  { line_id: 'd8-l4', speaker: 'Patient', text: 'I have a mild fever and a bad sore throat since yesterday.' },
  { line_id: 'd8-l5', speaker: 'Doctor', text: 'I see. Let me check your temperature and throat first. Open your mouth, please.' },
  { line_id: 'd8-l6', speaker: 'Patient', text: 'Ahhh... Is it something serious, Doctor?' },
  { line_id: 'd8-l7', speaker: 'Doctor', text: "No, don't worry. It looks like a normal seasonal viral infection." },
  { line_id: 'd8-l8', speaker: 'Patient', text: 'That’s a relief! Do I need to take any medicine?' },
  { line_id: 'd8-l9', speaker: 'Doctor', text: 'Yes, I am writing some medicines. Take them twice a day after food.' },
  { line_id: 'd8-l10', speaker: 'Patient', text: 'Okay, Doctor. Should I avoid any specific food?' },
  { line_id: 'd8-l11', speaker: 'Doctor', text: 'Drink warm water and avoid cold drinks for two days. Take rest!' },
  { line_id: 'd8-l12', speaker: 'Patient', text: 'Thank you so much, Doctor!' },
];

export const PHONE_SCRIPT: ScriptLine[] = [
  { line_id: 'd9-l1', speaker: 'Rohan', text: 'Hello Amit! This is Rohan. Can you hear me clearly?' },
  { line_id: 'd9-l2', speaker: 'Amit', text: 'Hi Rohan! Yes, I can hear you fine. How are you doing?' },
  { line_id: 'd9-l3', speaker: 'Rohan', text: 'I am good, thanks! Are you busy right now or can you talk?' },
  { line_id: 'd9-l4', speaker: 'Amit', text: "I am free right now. Tell me, what's up?" },
  { line_id: 'd9-l5', speaker: 'Rohan', text: 'I was thinking of meeting up this evening. Are you free around 6 PM?' },
  { line_id: 'd9-l6', speaker: 'Amit', text: 'Oh, sorry, I have some work at 6 PM. Can we meet at 7 PM instead?' },
  { line_id: 'd9-l7', speaker: 'Rohan', text: "Sure, 7 PM works for me! Let's meet at the Central Park." },
  { line_id: 'd9-l8', speaker: 'Amit', text: 'Sounds great! See you at 7 PM then.' },
  { line_id: 'd9-l9', speaker: 'Rohan', text: 'Perfect! Take care, bye.' },
  { line_id: 'd9-l10', speaker: 'Amit', text: 'Bye!' },
];

export const OPINIONS_SCRIPT: ScriptLine[] = [
  { line_id: 'd10-l1', speaker: 'Priya', text: 'Hi Rohit! Did you watch the new action movie yesterday?' },
  { line_id: 'd10-l2', speaker: 'Rohit', text: 'Yes, I watched it last night! What about you?' },
  { line_id: 'd10-l3', speaker: 'Priya', text: 'I watched it too! In my opinion, the movie was really good.' },
  { line_id: 'd10-l4', speaker: 'Rohit', text: 'Really? Personally, I found it a bit boring.' },
  { line_id: 'd10-l5', speaker: 'Priya', text: 'Oh, why do you think so? I loved the action scenes!' },
  { line_id: 'd10-l6', speaker: 'Rohit', text: 'The action was good, but I feel the story was very weak.' },
  { line_id: 'd10-l7', speaker: 'Priya', text: 'I agree, the story was simple, but the acting was amazing!' },
  { line_id: 'd10-l8', speaker: 'Rohit', text: 'That’s true. The main hero did a fantastic job.' },
  { line_id: 'd10-l9', speaker: 'Priya', text: 'So, overall, would you recommend it to others?' },
  { line_id: 'd10-l10', speaker: 'Rohit', text: 'Yes, it is worth watching at least once!' },
];

export const INTERVIEW_INTRO_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i1-l1',
    speaker: 'Interviewer',
    text: 'Good morning! Please have a seat. Can you start by telling me a little about yourself?',
  },
  {
    line_id: 'i1-l2',
    speaker: 'Candidate',
    text: 'Good morning! Of course. My name is Aarav Sharma. I am a software engineer with five years of experience.',
  },
  {
    line_id: 'i1-l3',
    speaker: 'Candidate',
    text: 'I started my career at a startup, where I built full-stack web applications from scratch.',
  },
  {
    line_id: 'i1-l4',
    speaker: 'Interviewer',
    text: 'That sounds great. What kind of projects did you work on there?',
  },
  {
    line_id: 'i1-l5',
    speaker: 'Candidate',
    text: 'I developed an e-commerce platform that scaled to over 100,000 users within its first year.',
  },
  {
    line_id: 'i1-l6',
    speaker: 'Interviewer',
    text: 'Impressive! What brought you to apply for this position?',
  },
  {
    line_id: 'i1-l7',
    speaker: 'Candidate',
    text: 'I am looking for a role where I can work on complex challenges and grow as an engineer.',
  },
  {
    line_id: 'i1-l8',
    speaker: 'Candidate',
    text: 'Your company\'s focus on innovative products really aligns with my career goals.',
  },
  {
    line_id: 'i1-l9',
    speaker: 'Interviewer',
    text: 'That is great to hear. What would you say is your greatest professional achievement so far?',
  },
  {
    line_id: 'i1-l10',
    speaker: 'Candidate',
    text: 'Leading a team that delivered a critical feature two weeks ahead of schedule, saving the company significant costs.',
  },
];

export const INTERVIEW_BEHAVIORAL_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i2-l1',
    speaker: 'Interviewer',
    text: 'Can you tell me about a time you faced a major challenge at work?',
  },
  {
    line_id: 'i2-l2',
    speaker: 'Candidate',
    text: 'Certainly. In my previous role, our main server went down two hours before a product launch.',
  },
  {
    line_id: 'i2-l3',
    speaker: 'Interviewer',
    text: 'What did you do to handle the situation?',
  },
  {
    line_id: 'i2-l4',
    speaker: 'Candidate',
    text: 'I immediately assembled the team, identified the root cause as a database misconfiguration, and rolled back the changes.',
  },
  {
    line_id: 'i2-l5',
    speaker: 'Candidate',
    text: 'We restored the service within 45 minutes and the launch proceeded successfully.',
  },
  {
    line_id: 'i2-l6',
    speaker: 'Interviewer',
    text: 'Excellent! What did you learn from that experience?',
  },
  {
    line_id: 'i2-l7',
    speaker: 'Candidate',
    text: 'I learned the importance of having a rollback plan before any major deployment.',
  },
  {
    line_id: 'i2-l8',
    speaker: 'Candidate',
    text: 'I also improved our team\'s incident response checklist to prevent similar issues.',
  },
  {
    line_id: 'i2-l9',
    speaker: 'Interviewer',
    text: 'That shows great leadership. How did the team respond to your direction?',
  },
  {
    line_id: 'i2-l10',
    speaker: 'Candidate',
    text: 'The team was calm and focused. Clear communication made all the difference under pressure.',
  },
];

export const INTERVIEW_MOTIVATION_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i3-l1',
    speaker: 'Interviewer',
    text: 'Why do you want to work for our company specifically?',
  },
  {
    line_id: 'i3-l2',
    speaker: 'Candidate',
    text: 'I have been following your company\'s journey for the past two years and I am genuinely inspired by your mission.',
  },
  {
    line_id: 'i3-l3',
    speaker: 'Interviewer',
    text: 'What specifically about our mission resonates with you?',
  },
  {
    line_id: 'i3-l4',
    speaker: 'Candidate',
    text: 'Your commitment to making technology accessible to rural communities aligns deeply with my personal values.',
  },
  {
    line_id: 'i3-l5',
    speaker: 'Interviewer',
    text: 'That is wonderful. Have you had any experience working on similar social impact projects?',
  },
  {
    line_id: 'i3-l6',
    speaker: 'Candidate',
    text: 'Yes, I volunteered with an NGO to build a digital literacy platform for underprivileged students.',
  },
  {
    line_id: 'i3-l7',
    speaker: 'Interviewer',
    text: 'How did that experience shape your professional goals?',
  },
  {
    line_id: 'i3-l8',
    speaker: 'Candidate',
    text: 'It showed me that technology can genuinely transform lives. That is the kind of work I want to dedicate my career to.',
  },
  {
    line_id: 'i3-l9',
    speaker: 'Interviewer',
    text: 'And what role do you see yourself playing in our team?',
  },
  {
    line_id: 'i3-l10',
    speaker: 'Candidate',
    text: 'I would love to contribute both technically and as a mentor, helping junior developers grow within your team.',
  },
];

export const INTERVIEW_STRENGTHS_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i4-l1',
    speaker: 'Interviewer',
    text: 'What would you consider to be your greatest professional strength?',
  },
  {
    line_id: 'i4-l2',
    speaker: 'Candidate',
    text: 'My strongest skill is problem-solving under pressure. I stay calm and analytical even in stressful situations.',
  },
  {
    line_id: 'i4-l3',
    speaker: 'Interviewer',
    text: 'Can you give me a specific example of that?',
  },
  {
    line_id: 'i4-l4',
    speaker: 'Candidate',
    text: 'During a critical product demo, our integration with a third-party API broke unexpectedly.',
  },
  {
    line_id: 'i4-l5',
    speaker: 'Candidate',
    text: 'I quickly built a mock API in under an hour so the demo could proceed without any issues.',
  },
  {
    line_id: 'i4-l6',
    speaker: 'Interviewer',
    text: 'That is very resourceful! What other strengths do you bring to the table?',
  },
  {
    line_id: 'i4-l7',
    speaker: 'Candidate',
    text: 'I am also a strong communicator. I make it a point to keep all stakeholders informed throughout a project.',
  },
  {
    line_id: 'i4-l8',
    speaker: 'Interviewer',
    text: 'How do you ensure clear communication in a fast-moving environment?',
  },
  {
    line_id: 'i4-l9',
    speaker: 'Candidate',
    text: 'I hold brief daily stand-ups and send concise written summaries at the end of each sprint.',
  },
  {
    line_id: 'i4-l10',
    speaker: 'Interviewer',
    text: 'That is a great habit. Those are exactly the qualities we look for in candidates.',
  },
];

export const INTERVIEW_WEAKNESSES_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i5-l1',
    speaker: 'Interviewer',
    text: 'Everyone has areas to improve. What would you say is your greatest weakness?',
  },
  {
    line_id: 'i5-l2',
    speaker: 'Candidate',
    text: 'I used to struggle with delegating tasks. I often tried to handle everything myself.',
  },
  {
    line_id: 'i5-l3',
    speaker: 'Interviewer',
    text: 'That is quite common. How did that affect your work?',
  },
  {
    line_id: 'i5-l4',
    speaker: 'Candidate',
    text: 'There were times I became a bottleneck, which slowed down the overall team\'s progress.',
  },
  {
    line_id: 'i5-l5',
    speaker: 'Interviewer',
    text: 'How have you worked to address this?',
  },
  {
    line_id: 'i5-l6',
    speaker: 'Candidate',
    text: 'I actively worked on trusting my teammates more and clearly defining ownership for each task.',
  },
  {
    line_id: 'i5-l7',
    speaker: 'Candidate',
    text: 'I also took a course on team leadership to improve my delegation and management skills.',
  },
  {
    line_id: 'i5-l8',
    speaker: 'Interviewer',
    text: 'That shows strong self-awareness. Have you seen improvements since then?',
  },
  {
    line_id: 'i5-l9',
    speaker: 'Candidate',
    text: 'Absolutely. My last project was delivered ahead of schedule because the team was more empowered and efficient.',
  },
  {
    line_id: 'i5-l10',
    speaker: 'Interviewer',
    text: 'That is a great example of turning a weakness into a strength. Well done.',
  },
];

export const INTERVIEW_TECHNICAL_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i6-l1',
    speaker: 'Interviewer',
    text: 'Let\'s talk about your technical background. How would you explain REST APIs to a non-technical stakeholder?',
  },
  {
    line_id: 'i6-l2',
    speaker: 'Candidate',
    text: 'I would compare a REST API to a waiter in a restaurant. You place your order, the kitchen prepares it, and the waiter brings it back.',
  },
  {
    line_id: 'i6-l3',
    speaker: 'Interviewer',
    text: 'That is a great analogy! What about database design? Walk me through your approach.',
  },
  {
    line_id: 'i6-l4',
    speaker: 'Candidate',
    text: 'I start by identifying the entities and their relationships, then normalize the schema to eliminate redundancy.',
  },
  {
    line_id: 'i6-l5',
    speaker: 'Interviewer',
    text: 'How do you handle performance issues in large databases?',
  },
  {
    line_id: 'i6-l6',
    speaker: 'Candidate',
    text: 'I use indexing on frequently queried columns and analyze slow query logs to optimize bottlenecks.',
  },
  {
    line_id: 'i6-l7',
    speaker: 'Interviewer',
    text: 'Good. Tell me about a technically challenging problem you solved recently.',
  },
  {
    line_id: 'i6-l8',
    speaker: 'Candidate',
    text: 'I redesigned a legacy monolith into microservices, which reduced deployment time by 60%.',
  },
  {
    line_id: 'i6-l9',
    speaker: 'Interviewer',
    text: 'Impressive. What was the biggest risk you encountered during that process?',
  },
  {
    line_id: 'i6-l10',
    speaker: 'Candidate',
    text: 'Data consistency across services was the biggest risk. I solved it using an event-driven architecture with message queues.',
  },
];

export const INTERVIEW_SALARY_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i7-l1',
    speaker: 'Interviewer',
    text: 'We are very impressed with your profile. Let\'s talk about compensation. What are your salary expectations?',
  },
  {
    line_id: 'i7-l2',
    speaker: 'Candidate',
    text: 'Based on my experience and market research, I am expecting a package in the range of 18 to 22 lakhs per annum.',
  },
  {
    line_id: 'i7-l3',
    speaker: 'Interviewer',
    text: 'That is somewhat above our initial budget for this role. Is there flexibility on your end?',
  },
  {
    line_id: 'i7-l4',
    speaker: 'Candidate',
    text: 'I am open to discussing the full compensation package including benefits, bonuses, and growth opportunities.',
  },
  {
    line_id: 'i7-l5',
    speaker: 'Interviewer',
    text: 'We can offer 17 lakhs along with performance bonuses and an annual review cycle.',
  },
  {
    line_id: 'i7-l6',
    speaker: 'Candidate',
    text: 'Could you tell me more about the bonus structure? That would help me evaluate the total offer.',
  },
  {
    line_id: 'i7-l7',
    speaker: 'Interviewer',
    text: 'Typically, bonuses range from 10 to 20 percent based on performance and company targets.',
  },
  {
    line_id: 'i7-l8',
    speaker: 'Candidate',
    text: 'That is very helpful. Considering the bonus potential, I think we can make it work.',
  },
  {
    line_id: 'i7-l9',
    speaker: 'Interviewer',
    text: 'Excellent! We also offer flexible work hours and a generous learning and development budget.',
  },
  {
    line_id: 'i7-l10',
    speaker: 'Candidate',
    text: 'That sounds like a great package overall. I am excited about the opportunity to join the team.',
  },
];

export const INTERVIEW_QUESTIONS_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i8-l1',
    speaker: 'Interviewer',
    text: 'We are nearing the end of our interview. Do you have any questions for us?',
  },
  {
    line_id: 'i8-l2',
    speaker: 'Candidate',
    text: 'Yes, I do! Could you describe what a typical day looks like for someone in this role?',
  },
  {
    line_id: 'i8-l3',
    speaker: 'Interviewer',
    text: 'You would typically start with a team stand-up, then work on feature development or bug fixes for the day.',
  },
  {
    line_id: 'i8-l4',
    speaker: 'Candidate',
    text: 'That sounds great. How does the team handle knowledge sharing and continuous learning?',
  },
  {
    line_id: 'i8-l5',
    speaker: 'Interviewer',
    text: 'We have weekly tech talks and a dedicated budget for online courses and conferences.',
  },
  {
    line_id: 'i8-l6',
    speaker: 'Candidate',
    text: 'I love that. What does success look like for someone in this position after six months?',
  },
  {
    line_id: 'i8-l7',
    speaker: 'Interviewer',
    text: 'We would expect you to be independently delivering features and beginning to mentor junior team members.',
  },
  {
    line_id: 'i8-l8',
    speaker: 'Candidate',
    text: 'That aligns perfectly with my goals. One last question — what is the biggest challenge the team is currently facing?',
  },
  {
    line_id: 'i8-l9',
    speaker: 'Interviewer',
    text: 'Scaling our infrastructure to handle rapid user growth is our primary focus right now.',
  },
  {
    line_id: 'i8-l10',
    speaker: 'Candidate',
    text: 'That is exactly the kind of challenge I enjoy solving. I look forward to contributing to it.',
  },
];

export const INTERVIEW_DIFFICULT_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i9-l1',
    speaker: 'Interviewer',
    text: 'Tell me about a time you disagreed with your manager. How did you handle it?',
  },
  {
    line_id: 'i9-l2',
    speaker: 'Candidate',
    text: 'There was a time my manager wanted to release a feature without proper testing to meet a deadline.',
  },
  {
    line_id: 'i9-l3',
    speaker: 'Interviewer',
    text: 'That is a sensitive situation. What did you do?',
  },
  {
    line_id: 'i9-l4',
    speaker: 'Candidate',
    text: 'I requested a private conversation and presented data showing the risk of releasing untested code to production.',
  },
  {
    line_id: 'i9-l5',
    speaker: 'Candidate',
    text: 'I proposed a compromise — release a limited beta version while the full feature continued testing.',
  },
  {
    line_id: 'i9-l6',
    speaker: 'Interviewer',
    text: 'How did your manager respond to that?',
  },
  {
    line_id: 'i9-l7',
    speaker: 'Candidate',
    text: 'He appreciated the data-driven approach and agreed to the beta release plan.',
  },
  {
    line_id: 'i9-l8',
    speaker: 'Interviewer',
    text: 'What was the outcome?',
  },
  {
    line_id: 'i9-l9',
    speaker: 'Candidate',
    text: 'The beta helped us identify three critical bugs that would have affected thousands of users.',
  },
  {
    line_id: 'i9-l10',
    speaker: 'Interviewer',
    text: 'That is a textbook example of constructive disagreement. Excellent communication skills.',
  },
];

export const INTERVIEW_CLOSING_SCRIPT: ScriptLine[] = [
  {
    line_id: 'i10-l1',
    speaker: 'Interviewer',
    text: 'We have covered everything on our list today. Thank you for your time, Priya.',
  },
  {
    line_id: 'i10-l2',
    speaker: 'Candidate',
    text: 'Thank you so much! I really enjoyed our conversation and learning more about the role.',
  },
  {
    line_id: 'i10-l3',
    speaker: 'Interviewer',
    text: 'Is there anything you would like to add before we wrap up?',
  },
  {
    line_id: 'i10-l4',
    speaker: 'Candidate',
    text: 'I just want to reiterate how excited I am about this opportunity. I believe I can make a strong contribution.',
  },
  {
    line_id: 'i10-l5',
    speaker: 'Interviewer',
    text: 'We appreciate your enthusiasm. We will be in touch within the next three business days.',
  },
  {
    line_id: 'i10-l6',
    speaker: 'Candidate',
    text: 'That is great to hear. Would it be appropriate for me to send a follow-up email after this?',
  },
  {
    line_id: 'i10-l7',
    speaker: 'Interviewer',
    text: 'Absolutely. A brief thank-you email is always appreciated and shows professionalism.',
  },
  {
    line_id: 'i10-l8',
    speaker: 'Candidate',
    text: 'Perfect. I will send that over today. Is there anything else you need from me right now?',
  },
  {
    line_id: 'i10-l9',
    speaker: 'Interviewer',
    text: 'No, we have everything. It was a pleasure meeting you today, Priya.',
  },
  {
    line_id: 'i10-l10',
    speaker: 'Candidate',
    text: 'The pleasure was entirely mine. Thank you for the wonderful experience. Have a great day!',
  },
];

export const DIFFICULT_CONVERSATION_SCRIPT: ScriptLine[] = [
  {
    line_id: 'b6-l1',
    speaker: 'Manager',
    text: 'Rahul, do you have a moment? I would like to discuss your recent project deliverables.',
  },
  {
    line_id: 'b6-l2',
    speaker: 'Rahul',
    text: 'Of course. Is there something specific you would like to talk about?',
  },
  {
    line_id: 'b6-l3',
    speaker: 'Manager',
    text: 'I noticed the last two reports were submitted after the deadline. Can you help me understand what happened?',
  },
  {
    line_id: 'b6-l4',
    speaker: 'Rahul',
    text: 'I apologize for that. I have been managing multiple tasks and it has been difficult to prioritize.',
  },
  {
    line_id: 'b6-l5',
    speaker: 'Manager',
    text: 'I understand. Workload management can be challenging. Have you considered delegating some tasks?',
  },
  {
    line_id: 'b6-l6',
    speaker: 'Rahul',
    text: 'I have thought about it, but I was not sure who to assign them to.',
  },
  {
    line_id: 'b6-l7',
    speaker: 'Manager',
    text: "Let's work together on a plan. I can help you identify team members who can support you.",
  },
  {
    line_id: 'b6-l8',
    speaker: 'Rahul',
    text: 'That would be really helpful. I want to make sure I meet all deadlines going forward.',
  },
  {
    line_id: 'b6-l9',
    speaker: 'Manager',
    text: "I appreciate your honesty, Rahul. Let's schedule a follow-up meeting next week to review progress.",
  },
  {
    line_id: 'b6-l10',
    speaker: 'Rahul',
    text: 'Thank you for understanding. I will prepare a revised timeline by then.',
  },
];

export const REMOTE_WORK_SCRIPT: ScriptLine[] = [
  {
    line_id: 'b8-l1',
    speaker: 'Team Lead',
    text: 'Good morning, team! Can everyone hear me clearly on the video call?',
  },
  {
    line_id: 'b8-l2',
    speaker: 'Divya',
    text: 'Yes, loud and clear! Good morning.',
  },
  {
    line_id: 'b8-l3',
    speaker: 'Sameer',
    text: 'I can hear you, but my camera seems to be having issues. Let me fix it.',
  },
  {
    line_id: 'b8-l4',
    speaker: 'Team Lead',
    text: "No problem, Sameer. Let's start with a quick status update from everyone.",
  },
  {
    line_id: 'b8-l5',
    speaker: 'Divya',
    text: 'I completed the design mockups yesterday. I will share the link in the chat.',
  },
  {
    line_id: 'b8-l6',
    speaker: 'Team Lead',
    text: 'Great work, Divya! Sameer, how is the backend development progressing?',
  },
  {
    line_id: 'b8-l7',
    speaker: 'Sameer',
    text: 'The API is almost done. I need one more day to finish testing.',
  },
  {
    line_id: 'b8-l8',
    speaker: 'Team Lead',
    text: "Perfect. Let's aim to integrate everything by Thursday. Any blockers from anyone?",
  },
  {
    line_id: 'b8-l9',
    speaker: 'Divya',
    text: 'I need access to the staging server. Could you grant me permissions?',
  },
  {
    line_id: 'b8-l10',
    speaker: 'Team Lead',
    text: "I will set that up right after this call. Anything else? Great, let's wrap up then.",
  },
];

export const LEADERSHIP_SCRIPT: ScriptLine[] = [
  {
    line_id: 'b10-l1',
    speaker: 'Leader',
    text: 'Team, I want to take a moment to acknowledge the hard work everyone has put in this month.',
  },
  {
    line_id: 'b10-l2',
    speaker: 'Pooja',
    text: 'Thank you! It has been a challenging month, but very rewarding.',
  },
  {
    line_id: 'b10-l3',
    speaker: 'Leader',
    text: 'I know the deadline pressure was tough. How is everyone feeling about the workload?',
  },
  {
    line_id: 'b10-l4',
    speaker: 'Suresh',
    text: 'Honestly, it was intense, but having clear goals really helped us stay focused.',
  },
  {
    line_id: 'b10-l5',
    speaker: 'Leader',
    text: 'That is great to hear. I believe in setting clear expectations so everyone knows their role.',
  },
  {
    line_id: 'b10-l6',
    speaker: 'Pooja',
    text: 'I also appreciate that you were available whenever we needed guidance.',
  },
  {
    line_id: 'b10-l7',
    speaker: 'Leader',
    text: 'Open communication is key. My door is always open for ideas, feedback, or concerns.',
  },
  {
    line_id: 'b10-l8',
    speaker: 'Suresh',
    text: 'What are our priorities for the next month?',
  },
  {
    line_id: 'b10-l9',
    speaker: 'Leader',
    text: 'We will focus on improving customer satisfaction scores and launching the new feature update.',
  },
  {
    line_id: 'b10-l10',
    speaker: 'Pooja',
    text: 'Sounds exciting! We are ready for the challenge.',
  },
];

export const CORPORATE_ETIQUETTE_SCRIPT: ScriptLine[] = [
  {
    line_id: 'b7-l1',
    speaker: 'Nisha',
    text: 'Karan, I have a question. What is the dress code for the client visit tomorrow?',
  },
  {
    line_id: 'b7-l2',
    speaker: 'Karan',
    text: 'It is business formal. A suit or formal shirt with trousers would be appropriate.',
  },
  {
    line_id: 'b7-l3',
    speaker: 'Nisha',
    text: 'Got it. Should I prepare anything specific for the meeting?',
  },
  {
    line_id: 'b7-l4',
    speaker: 'Karan',
    text: 'Yes, bring printed copies of the proposal and your business cards.',
  },
  {
    line_id: 'b7-l5',
    speaker: 'Nisha',
    text: 'What about greeting the clients? Is there a specific protocol?',
  },
  {
    line_id: 'b7-l6',
    speaker: 'Karan',
    text: 'A firm handshake and a warm smile work best. Address them by their last name unless they say otherwise.',
  },
  {
    line_id: 'b7-l7',
    speaker: 'Nisha',
    text: 'Should I start with small talk or get straight to business?',
  },
  {
    line_id: 'b7-l8',
    speaker: 'Karan',
    text: 'Start with a few minutes of small talk. Ask about their journey or comment on something positive.',
  },
];

export const SALES_SCRIPT: ScriptLine[] = [
  {
    line_id: 'b9-l1',
    speaker: 'Sales Rep',
    text: 'Good afternoon! Thank you for taking the time to speak with me today.',
  },
  {
    line_id: 'b9-l2',
    speaker: 'Client',
    text: "Of course. I am curious to hear about your company's services.",
  },
  {
    line_id: 'b9-l3',
    speaker: 'Sales Rep',
    text: 'Before I begin, may I ask what challenges your team is currently facing?',
  },
  {
    line_id: 'b9-l4',
    speaker: 'Client',
    text: 'Our biggest challenge is managing customer data efficiently. We need a better CRM solution.',
  },
  {
    line_id: 'b9-l5',
    speaker: 'Sales Rep',
    text: 'That is exactly what we specialize in. Our CRM platform automates data management and boosts productivity.',
  },
  {
    line_id: 'b9-l6',
    speaker: 'Client',
    text: 'How is your solution different from others in the market?',
  },
  {
    line_id: 'b9-l7',
    speaker: 'Sales Rep',
    text: 'We offer AI-powered analytics and 24/7 customer support, which most competitors do not include.',
  },
  {
    line_id: 'b9-l8',
    speaker: 'Client',
    text: 'That sounds promising. Do you offer a free trial period?',
  },
  {
    line_id: 'b9-l9',
    speaker: 'Sales Rep',
    text: 'Yes, we offer a 30-day free trial with full access to all features. No commitment required.',
  },
  {
    line_id: 'b9-l10',
    speaker: 'Client',
    text: "Excellent! Let's set up a demo for my team next week.",
  },
];

export const TRAVEL_AIRPORT_SCRIPT: ScriptLine[] = [
  {
    line_id: 't1-l1',
    speaker: 'Passenger',
    text: 'Excuse me, where do I check in for the flight to Dubai?',
  },
  {
    line_id: 't1-l2',
    speaker: 'Staff',
    text: 'Good morning! Please head to counter number 12. Do you have your passport and ticket ready?',
  },
  {
    line_id: 't1-l3',
    speaker: 'Passenger',
    text: 'Yes, I have both. I also have one checked bag and a carry-on.',
  },
  {
    line_id: 't1-l4',
    speaker: 'Staff',
    text: 'Perfect. Please place your bag on the scale. It weighs 22 kilograms, which is within the limit.',
  },
  {
    line_id: 't1-l5',
    speaker: 'Passenger',
    text: 'Great. Could I please get a window seat?',
  },
  {
    line_id: 't1-l6',
    speaker: 'Staff',
    text: 'Let me check availability. Yes, seat 14A is available. Would that work for you?',
  },
  {
    line_id: 't1-l7',
    speaker: 'Passenger',
    text: 'That is perfect, thank you! How early should I be at the boarding gate?',
  },
  {
    line_id: 't1-l8',
    speaker: 'Staff',
    text: 'Please be at gate B7 at least 45 minutes before departure.',
  },
  {
    line_id: 't1-l9',
    speaker: 'Passenger',
    text: 'Understood. Is there anything else I need to know?',
  },
  {
    line_id: 't1-l10',
    speaker: 'Staff',
    text: 'You will need to pass through security first. Enjoy your flight!',
  },
];

export const TRAVEL_HOTEL_SCRIPT: ScriptLine[] = [
  {
    line_id: 't2-l1',
    speaker: 'Receptionist',
    text: 'Good evening! Welcome to the Grand Palace Hotel. Do you have a reservation?',
  },
  {
    line_id: 't2-l2',
    speaker: 'Guest',
    text: 'Yes, I made a booking online. The name is Kavya Reddy.',
  },
  {
    line_id: 't2-l3',
    speaker: 'Receptionist',
    text: 'Let me pull that up. Yes, I have a deluxe room booked for three nights. Is that correct?',
  },
  {
    line_id: 't2-l4',
    speaker: 'Guest',
    text: 'That is right. Could you tell me if breakfast is included?',
  },
  {
    line_id: 't2-l5',
    speaker: 'Receptionist',
    text: 'Yes, complimentary breakfast is served daily from 7 to 10 AM in the dining area.',
  },
  {
    line_id: 't2-l6',
    speaker: 'Guest',
    text: 'Wonderful! Does the room have a good city view?',
  },
  {
    line_id: 't2-l7',
    speaker: 'Receptionist',
    text: 'Absolutely. Your room on the 8th floor has a beautiful view of the main square.',
  },
  {
    line_id: 't2-l8',
    speaker: 'Guest',
    text: 'That sounds lovely. What time is the check-out?',
  },
  {
    line_id: 't2-l9',
    speaker: 'Receptionist',
    text: 'Check-out is at noon. If you need a late check-out, please let us know in advance.',
  },
  {
    line_id: 't2-l10',
    speaker: 'Guest',
    text: 'I will keep that in mind. Thank you so much!',
  },
];

export const TRAVEL_RESTAURANT_SCRIPT: ScriptLine[] = [
  {
    line_id: 't3-l1',
    speaker: 'Waiter',
    text: 'Good evening! Welcome. Do you have a reservation or would you like a table for two?',
  },
  {
    line_id: 't3-l2',
    speaker: 'Traveler',
    text: 'No reservation, just the two of us. A table by the window would be lovely if possible.',
  },
  {
    line_id: 't3-l3',
    speaker: 'Waiter',
    text: 'Of course! Right this way. Here are your menus. Can I start you with some drinks?',
  },
  {
    line_id: 't3-l4',
    speaker: 'Traveler',
    text: 'Yes, two glasses of still water please. What is your dish of the day?',
  },
  {
    line_id: 't3-l5',
    speaker: 'Waiter',
    text: "Today's special is grilled sea bass with lemon butter sauce. It is very popular.",
  },
  {
    line_id: 't3-l6',
    speaker: 'Traveler',
    text: 'That sounds delicious! I will have that. Does it come with any sides?',
  },
  {
    line_id: 't3-l7',
    speaker: 'Waiter',
    text: 'It comes with roasted vegetables and garlic bread.',
  },
  {
    line_id: 't3-l8',
    speaker: 'Traveler',
    text: 'Perfect. My companion is vegetarian. What would you recommend for them?',
  },
  {
    line_id: 't3-l9',
    speaker: 'Waiter',
    text: 'Our mushroom risotto is excellent and fully vegetarian. It is a guest favourite.',
  },
  {
    line_id: 't3-l10',
    speaker: 'Traveler',
    text: 'Great, we will have that as well. Thank you for your help!',
  },
];

export const TRAVEL_TRANSPORT_SCRIPT: ScriptLine[] = [
  {
    line_id: 't4-l1',
    speaker: 'Traveler',
    text: 'Excuse me, does this bus go to the city centre?',
  },
  {
    line_id: 't4-l2',
    speaker: 'Local',
    text: 'Yes, it does! Take bus number 42 and get off at Market Square.',
  },
  {
    line_id: 't4-l3',
    speaker: 'Traveler',
    text: 'How long does the journey take from here?',
  },
  {
    line_id: 't4-l4',
    speaker: 'Local',
    text: 'About 20 minutes. The bus comes every 10 minutes.',
  },
  {
    line_id: 't4-l5',
    speaker: 'Traveler',
    text: 'Do I need to buy a ticket before boarding or can I pay on the bus?',
  },
  {
    line_id: 't4-l6',
    speaker: 'Local',
    text: 'You can pay directly to the driver. Exact change is preferred.',
  },
  {
    line_id: 't4-l7',
    speaker: 'Traveler',
    text: 'Is there a metro or subway I could take instead?',
  },
  {
    line_id: 't4-l8',
    speaker: 'Local',
    text: 'Yes, the nearest metro station is just a 5-minute walk. Take the red line to Central.',
  },
  {
    line_id: 't4-l9',
    speaker: 'Traveler',
    text: 'Which option would you recommend for a first-time visitor?',
  },
  {
    line_id: 't4-l10',
    speaker: 'Local',
    text: 'The metro is faster and easier to navigate. You can also use your contactless card to pay.',
  },
];

export const TRAVEL_DIRECTIONS_SCRIPT: ScriptLine[] = [
  {
    line_id: 't5-l1',
    speaker: 'Traveler',
    text: 'Excuse me, I am a bit lost. Could you help me find the National Museum?',
  },
  {
    line_id: 't5-l2',
    speaker: 'Local',
    text: 'Of course! You are actually quite close. Head straight down this road for about 200 metres.',
  },
  {
    line_id: 't5-l3',
    speaker: 'Traveler',
    text: 'And then?',
  },
  {
    line_id: 't5-l4',
    speaker: 'Local',
    text: 'Turn left at the traffic lights. You will see a large fountain. The museum is right behind it.',
  },
  {
    line_id: 't5-l5',
    speaker: 'Traveler',
    text: 'Is there a landmark I can look out for so I know I am going the right way?',
  },
  {
    line_id: 't5-l6',
    speaker: 'Local',
    text: 'Yes! Look for the blue clock tower. Once you see that, the museum is just across the street.',
  },
  {
    line_id: 't5-l7',
    speaker: 'Traveler',
    text: 'How long will it take to walk there?',
  },
  {
    line_id: 't5-l8',
    speaker: 'Local',
    text: 'About 10 minutes on foot. It is a pleasant walk.',
  },
  {
    line_id: 't5-l9',
    speaker: 'Traveler',
    text: 'Thank you so much. Is it open on Sundays?',
  },
  {
    line_id: 't5-l10',
    speaker: 'Local',
    text: 'Yes, it is open from 10 AM to 6 PM on Sundays. Enjoy your visit!',
  },
];

export const LESSON_SCRIPTS: Record<
  string,
  { script: ScriptLine[]; title: string; categoryTitle?: string; xp: number }
> = {
  'travel-5': {
    script: TRAVEL_DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Directions',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'directions': {
    script: TRAVEL_DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Directions',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'travel-directions': {
    script: TRAVEL_DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Directions',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'travel-4': {
    script: TRAVEL_TRANSPORT_SCRIPT,
    title: 'Lesson 4: Transport',
    categoryTitle: 'Travel Conversation',
    xp: 20,
  },
  'transport': {
    script: TRAVEL_TRANSPORT_SCRIPT,
    title: 'Lesson 4: Transport',
    categoryTitle: 'Travel Conversation',
    xp: 20,
  },
  'travel-transport': {
    script: TRAVEL_TRANSPORT_SCRIPT,
    title: 'Lesson 4: Transport',
    categoryTitle: 'Travel Conversation',
    xp: 20,
  },
  'travel-3': {
    script: TRAVEL_RESTAURANT_SCRIPT,
    title: 'Lesson 3: Restaurant',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'restaurant': {
    script: TRAVEL_RESTAURANT_SCRIPT,
    title: 'Lesson 3: Restaurant',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'travel-restaurant': {
    script: TRAVEL_RESTAURANT_SCRIPT,
    title: 'Lesson 3: Restaurant',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'travel-2': {
    script: TRAVEL_HOTEL_SCRIPT,
    title: 'Lesson 2: Hotel Check-in',
    categoryTitle: 'Travel Conversation',
    xp: 25,
  },
  'hotel-check-in': {
    script: TRAVEL_HOTEL_SCRIPT,
    title: 'Lesson 2: Hotel Check-in',
    categoryTitle: 'Travel Conversation',
    xp: 25,
  },
  'travel-hotel': {
    script: TRAVEL_HOTEL_SCRIPT,
    title: 'Lesson 2: Hotel Check-in',
    categoryTitle: 'Travel Conversation',
    xp: 25,
  },
  'travel-1': {
    script: TRAVEL_AIRPORT_SCRIPT,
    title: 'Lesson 1: At the Airport',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'at-the-airport': {
    script: TRAVEL_AIRPORT_SCRIPT,
    title: 'Lesson 1: At the Airport',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'travel-airport': {
    script: TRAVEL_AIRPORT_SCRIPT,
    title: 'Lesson 1: At the Airport',
    categoryTitle: 'Travel Conversation',
    xp: 30,
  },
  'business-9': {
    script: SALES_SCRIPT,
    title: 'Lesson 9: Sales',
    categoryTitle: 'Business Conversation',
    xp: 40,
  },
  'sales': {
    script: SALES_SCRIPT,
    title: 'Lesson 9: Sales',
    categoryTitle: 'Business Conversation',
    xp: 40,
  },
  'sales-pitch': {
    script: SALES_SCRIPT,
    title: 'Lesson 9: Sales',
    categoryTitle: 'Business Conversation',
    xp: 40,
  },
  'business-7': {
    script: CORPORATE_ETIQUETTE_SCRIPT,
    title: 'Lesson 7: Corporate Etiquette',
    categoryTitle: 'Business Conversation',
    xp: 30,
  },
  'corporate-etiquette': {
    script: CORPORATE_ETIQUETTE_SCRIPT,
    title: 'Lesson 7: Corporate Etiquette',
    categoryTitle: 'Business Conversation',
    xp: 30,
  },
  'business-10': {
    script: LEADERSHIP_SCRIPT,
    title: 'Lesson 10: Leadership',
    categoryTitle: 'Business Conversation',
    xp: 50,
  },
  'leadership': {
    script: LEADERSHIP_SCRIPT,
    title: 'Lesson 10: Leadership',
    categoryTitle: 'Business Conversation',
    xp: 50,
  },
  'leaderships': {
    script: LEADERSHIP_SCRIPT,
    title: 'Lesson 10: Leadership',
    categoryTitle: 'Business Conversation',
    xp: 50,
  },
  'business-8': {
    script: REMOTE_WORK_SCRIPT,
    title: 'Lesson 8: Remote Work',
    categoryTitle: 'Business Conversation',
    xp: 25,
  },
  'remote-work': {
    script: REMOTE_WORK_SCRIPT,
    title: 'Lesson 8: Remote Work',
    categoryTitle: 'Business Conversation',
    xp: 25,
  },
  'remote-works': {
    script: REMOTE_WORK_SCRIPT,
    title: 'Lesson 8: Remote Work',
    categoryTitle: 'Business Conversation',
    xp: 25,
  },
  'business-6': {
    script: DIFFICULT_CONVERSATION_SCRIPT,
    title: 'Lesson 6: Difficult Conversation',
    categoryTitle: 'Business Conversation',
    xp: 45,
  },
  'difficult-conversation': {
    script: DIFFICULT_CONVERSATION_SCRIPT,
    title: 'Lesson 6: Difficult Conversation',
    categoryTitle: 'Business Conversation',
    xp: 45,
  },
  'difficult-conversations': {
    script: DIFFICULT_CONVERSATION_SCRIPT,
    title: 'Lesson 6: Difficult Conversation',
    categoryTitle: 'Business Conversation',
    xp: 45,
  },
  'business-5': {
    script: NETWORKING_SCRIPT,
    title: 'Lesson 5: Networking',
    categoryTitle: 'Business Conversation',
    xp: 35,
  },
  'networking': {
    script: NETWORKING_SCRIPT,
    title: 'Lesson 5: Networking',
    categoryTitle: 'Business Conversation',
    xp: 35,
  },
  'business-4': {
    script: PRESENTATION_SCRIPT,
    title: 'Lesson 4: Presentation',
    categoryTitle: 'Business Conversation',
    xp: 45,
  },
  'presentation': {
    script: PRESENTATION_SCRIPT,
    title: 'Lesson 4: Presentation',
    categoryTitle: 'Business Conversation',
    xp: 45,
  },
  'presentations': {
    script: PRESENTATION_SCRIPT,
    title: 'Lesson 4: Presentation',
    categoryTitle: 'Business Conversation',
    xp: 45,
  },
  'business-3': {
    script: NEGOTIATION_SCRIPT,
    title: 'Lesson 3: Negotiation',
    categoryTitle: 'Business Conversation',
    xp: 50,
  },
  'negotiation': {
    script: NEGOTIATION_SCRIPT,
    title: 'Lesson 3: Negotiation',
    categoryTitle: 'Business Conversation',
    xp: 50,
  },
  'negotiations': {
    script: NEGOTIATION_SCRIPT,
    title: 'Lesson 3: Negotiation',
    categoryTitle: 'Business Conversation',
    xp: 50,
  },
  'business-2': {
    script: PROFESSIONAL_EMAIL_SCRIPT,
    title: 'Lesson 2: Professional Email',
    categoryTitle: 'Business Conversation',
    xp: 25,
  },
  'professional-email': {
    script: PROFESSIONAL_EMAIL_SCRIPT,
    title: 'Lesson 2: Professional Email',
    categoryTitle: 'Business Conversation',
    xp: 25,
  },
  'professional-emails': {
    script: PROFESSIONAL_EMAIL_SCRIPT,
    title: 'Lesson 2: Professional Email',
    categoryTitle: 'Business Conversation',
    xp: 25,
  },
  'business-1': {
    script: BUSINESS_MEETING_SCRIPT,
    title: 'Lesson 1: Business Meetings',
    categoryTitle: 'Business Conversation',
    xp: 40,
  },
  'business-meetings': {
    script: BUSINESS_MEETING_SCRIPT,
    title: 'Lesson 1: Business Meetings',
    categoryTitle: 'Business Conversation',
    xp: 40,
  },
  'business-meeting': {
    script: BUSINESS_MEETING_SCRIPT,
    title: 'Lesson 1: Business Meetings',
    categoryTitle: 'Business Conversation',
    xp: 40,
  },
  'interview-10': {
    script: INTERVIEW_CLOSING_SCRIPT,
    title: 'Lesson 10: Closing the Interview',
    categoryTitle: 'Interview Conversation',
    xp: 25,
  },
  'closing-the-interview': {
    script: INTERVIEW_CLOSING_SCRIPT,
    title: 'Lesson 10: Closing the Interview',
    categoryTitle: 'Interview Conversation',
    xp: 25,
  },
  'interview-9': {
    script: INTERVIEW_DIFFICULT_SCRIPT,
    title: 'Lesson 9: Difficult Questions',
    categoryTitle: 'Interview Conversation',
    xp: 50,
  },
  'difficult-questions': {
    script: INTERVIEW_DIFFICULT_SCRIPT,
    title: 'Lesson 9: Difficult Questions',
    categoryTitle: 'Interview Conversation',
    xp: 50,
  },
  'interview-8': {
    script: INTERVIEW_QUESTIONS_SCRIPT,
    title: 'Lesson 8: Asking Questions',
    categoryTitle: 'Interview Conversation',
    xp: 30,
  },
  'asking-questions': {
    script: INTERVIEW_QUESTIONS_SCRIPT,
    title: 'Lesson 8: Asking Questions',
    categoryTitle: 'Interview Conversation',
    xp: 30,
  },
  'interview-7': {
    script: INTERVIEW_SALARY_SCRIPT,
    title: 'Lesson 7: Salary Discussion',
    categoryTitle: 'Interview Conversation',
    xp: 40,
  },
  'salary-discussion': {
    script: INTERVIEW_SALARY_SCRIPT,
    title: 'Lesson 7: Salary Discussion',
    categoryTitle: 'Interview Conversation',
    xp: 40,
  },
  'interview-6': {
    script: INTERVIEW_TECHNICAL_SCRIPT,
    title: 'Lesson 6: Technical Questions',
    categoryTitle: 'Interview Conversation',
    xp: 45,
  },
  'technical-questions': {
    script: INTERVIEW_TECHNICAL_SCRIPT,
    title: 'Lesson 6: Technical Questions',
    categoryTitle: 'Interview Conversation',
    xp: 45,
  },
  'interview-5': {
    script: INTERVIEW_WEAKNESSES_SCRIPT,
    title: 'Lesson 5: Weaknesses',
    categoryTitle: 'Interview Conversation',
    xp: 35,
  },
  'weaknesses': {
    script: INTERVIEW_WEAKNESSES_SCRIPT,
    title: 'Lesson 5: Weaknesses',
    categoryTitle: 'Interview Conversation',
    xp: 35,
  },
  'interview-4': {
    script: INTERVIEW_STRENGTHS_SCRIPT,
    title: 'Lesson 4: Strengths',
    categoryTitle: 'Interview Conversation',
    xp: 30,
  },
  'strengths': {
    script: INTERVIEW_STRENGTHS_SCRIPT,
    title: 'Lesson 4: Strengths',
    categoryTitle: 'Interview Conversation',
    xp: 30,
  },
  'interview-3': {
    script: INTERVIEW_MOTIVATION_SCRIPT,
    title: 'Lesson 3: Motivation',
    categoryTitle: 'Interview Conversation',
    xp: 35,
  },
  'motivation': {
    script: INTERVIEW_MOTIVATION_SCRIPT,
    title: 'Lesson 3: Motivation',
    categoryTitle: 'Interview Conversation',
    xp: 35,
  },
  'interview-2': {
    script: INTERVIEW_BEHAVIORAL_SCRIPT,
    title: 'Lesson 2: Behavioral Questions',
    categoryTitle: 'Interview Conversation',
    xp: 40,
  },
  'behavioral-questions': {
    script: INTERVIEW_BEHAVIORAL_SCRIPT,
    title: 'Lesson 2: Behavioral Questions',
    categoryTitle: 'Interview Conversation',
    xp: 40,
  },
  'interview-1': {
    script: INTERVIEW_INTRO_SCRIPT,
    title: 'Lesson 1: Self Introduction',
    categoryTitle: 'Interview Conversation',
    xp: 25,
  },
  'self-introduction': {
    script: INTERVIEW_INTRO_SCRIPT,
    title: 'Lesson 1: Self Introduction',
    categoryTitle: 'Interview Conversation',
    xp: 25,
  },
  'daily-1': {
    script: DAILY_1_SCRIPT,
    title: 'Lesson 1: Greetings & Introductions',
    categoryTitle: 'Daily Conversation',
    xp: 20,
  },
  'daily-2': {
    script: ORDERING_AT_CAFE_SCRIPT,
    title: 'Lesson 2: Ordering at a Cafe',
    categoryTitle: 'Daily Conversation',
    xp: 25,
  },
  'daily-3': {
    script: CASUAL_CONVERSATION_SCRIPT,
    title: 'Lesson 3: Casual Conversation',
    categoryTitle: 'Daily Conversation',
    xp: 30,
  },
  'casual-conversation': {
    script: CASUAL_CONVERSATION_SCRIPT,
    title: 'Lesson 3: Casual Conversation',
    categoryTitle: 'Daily Conversation',
    xp: 30,
  },
  'daily-4': {
    script: SHOPPING_CONVERSATION_SCRIPT,
    title: 'Lesson 4: Shopping Conversation',
    categoryTitle: 'Daily Conversation',
    xp: 25,
  },
  'shopping-conversation': {
    script: SHOPPING_CONVERSATION_SCRIPT,
    title: 'Lesson 4: Shopping Conversation',
    categoryTitle: 'Daily Conversation',
    xp: 25,
  },
  'daily-5': {
    script: DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Asking Directions',
    categoryTitle: 'Daily Conversation',
    xp: 30,
  },
  'asking-directions': {
    script: DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Asking Directions',
    categoryTitle: 'Daily Conversation',
    xp: 30,
  },
  'daily-6': {
    script: RESTAURANT_SCRIPT,
    title: 'Lesson 6: At a Restaurant',
    categoryTitle: 'Daily Conversation',
    xp: 35,
  },
  'at-a-restaurant': {
    script: RESTAURANT_SCRIPT,
    title: 'Lesson 6: At a Restaurant',
    categoryTitle: 'Daily Conversation',
    xp: 35,
  },
  'daily-7': {
    script: WEEKENDS_SCRIPT,
    title: 'Lesson 7: Talking About Weekends',
    categoryTitle: 'Daily Conversation',
    xp: 30,
  },
  'talking-about-weekends': {
    script: WEEKENDS_SCRIPT,
    title: 'Lesson 7: Talking About Weekends',
    categoryTitle: 'Daily Conversation',
    xp: 30,
  },
  'daily-8': {
    script: DOCTOR_SCRIPT,
    title: 'Lesson 8: At the Doctor',
    categoryTitle: 'Daily Conversation',
    xp: 40,
  },
  'at-the-doctor': {
    script: DOCTOR_SCRIPT,
    title: 'Lesson 8: At the Doctor',
    categoryTitle: 'Daily Conversation',
    xp: 40,
  },
  'daily-9': {
    script: PHONE_SCRIPT,
    title: 'Lesson 9: Phone Calls',
    categoryTitle: 'Daily Conversation',
    xp: 45,
  },
  'phone-calls': {
    script: PHONE_SCRIPT,
    title: 'Lesson 9: Phone Calls',
    categoryTitle: 'Daily Conversation',
    xp: 45,
  },
  'daily-10': {
    script: OPINIONS_SCRIPT,
    title: 'Lesson 10: Sharing Opinions',
    categoryTitle: 'Daily Conversation',
    xp: 50,
  },
  'sharing-opinions': {
    script: OPINIONS_SCRIPT,
    title: 'Lesson 10: Sharing Opinions',
    categoryTitle: 'Daily Conversation',
    xp: 50,
  },
};

export function getLessonData(lessonId: string) {
  return LESSON_SCRIPTS[lessonId] || {
    script: TRAVEL_DIRECTIONS_SCRIPT,
    title: 'Lesson 5: Directions',
    categoryTitle: 'Travel Conversation',
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
