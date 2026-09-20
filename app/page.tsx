'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    // Waveform animation logic from your HTML script
    const wave = document.getElementById('wave');
    if (wave && wave.children.length === 0) {
      const heights = [10, 18, 26, 14, 30, 20, 12, 24, 16, 22, 10, 18, 28, 14, 20];
      heights.forEach((h) => {
        const bar = document.createElement('span');
        bar.style.height = h + 'px';
        bar.style.width = '3px';
        bar.style.borderRadius = '2px';
        bar.style.backgroundColor = '#3B82F6';
        bar.style.display = 'inline-block';
        wave.appendChild(bar);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans selection:bg-blue-500 selection:text-white">
      {/* Header / Nav */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[var(--glass)] border-b border-[var(--glass-border)]">
        <nav className="max-w-[1080px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-xl font-['Outfit'] text-[var(--text-primary)]">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white font-bold text-[16px] shrink-0 font-['Outfit']">
              A
            </div>
            Acuspeak
          </div>
          <ul className="hidden md:flex gap-8 text-[14px] font-semibold text-[var(--text-secondary)] list-none">
            <li><a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors">How it works</a></li>
            <li><a href="#contact" className="hover:text-[var(--primary)] transition-colors">Contact</a></li>
          </ul>
          <Link href="/login" className="bg-white text-[var(--text-primary)] font-['Outfit'] font-semibold text-[14px] px-5 py-2.5 rounded-full border border-[var(--divider)] shadow-sm hover:bg-gray-50 transition-all">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <div className="max-w-[1080px] mx-auto px-6">

        {/* Hero Section */}
        <section className="relative overflow-py py-24 md:py-32">
          <div className="absolute -top-[180px] -right-[160px] w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.28),rgba(30,58,138,0)_70%)] pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-14 items-center relative">
            <div>
              <span className="inline-flex items-center gap-2 bg-blue-500/10 text-[var(--primary)] text-[13px] font-semibold px-3.5 py-1.5 rounded-full mb-6">
                🎙️ Live voice practice, every day
              </span>
              <h1 className="text-4xl md:text-[48px] font-bold leading-[1.08] mb-5 font-['Outfit']">
                Speak English <span className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#0D9488] bg-clip-text text-transparent">like you mean it.</span>
              </h1>
              <p className="text-[17px] text-[var(--text-secondary)] max-w-[480px] mb-8 leading-relaxed">
                Acuspeak pairs structured lessons with real voice conversations, so you build fluency by actually speaking — not just reading.
              </p>
              <div className="flex gap-3.5 flex-wrap">
                <Link href="/login" className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-['Outfit'] font-semibold text-[15px] px-7 py-3.5 rounded-full shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity">
                  Get started
                </Link>
                <a href="#how-it-works" className="bg-white text-[var(--text-primary)] font-['Outfit'] font-semibold text-[15px] px-7 py-3.5 rounded-full border border-[var(--divider)] shadow-sm hover:bg-gray-50 transition-colors">
                  See how it works
                </a>
              </div>
            </div>

            {/* Voice Card Simulation */}
            <div className="bg-white rounded-[28px] p-6.5 shadow-xl shadow-slate-900/5 border border-[var(--glass-border)]">
              <div className="flex items-center justify-between mb-5">
                <strong className="font-['Outfit'] text-[15px]">Interview Practice Room</strong>
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[12px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
                </span>
              </div>
              <div className="flex gap-3 mb-4 items-start">
                <div className="w-[38px] h-[38px] rounded-full shrink-0 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] flex items-center justify-center text-white font-bold text-[14px] font-['Outfit']">
                  R
                </div>
                <div className="bg-[var(--bg)] rounded-2xl p-3.5 text-[13.5px] text-[var(--text-primary)] max-w-[260px]">
                  &ldquo;Tell me about a time you solved a difficult problem at work.&rdquo;
                </div>
              </div>
              <div className="flex gap-3 mb-4 items-start">
                <div className="w-[38px] h-[38px] rounded-full shrink-0 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center text-white font-bold text-[14px] font-['Outfit']">
                  P
                </div>
                <div className="bg-[var(--bg)] rounded-2xl p-3.5 text-[13.5px] text-[var(--text-primary)] max-w-[260px]">
                  &ldquo;Sure — last year, our team faced a tight deadline on a client project…&rdquo;
                </div>
              </div>
              <div id="wave" className="flex items-center gap-[3px] mt-5 p-3.5 bg-[var(--bg)] rounded-2xl justify-between" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-18">
          <div className="max-w-[560px] mb-12">
            <div className="text-[13px] font-bold text-[var(--accent)] mb-2.5 tracking-wide uppercase">What&apos;s inside</div>
            <h2 className="text-3xl font-bold mb-3.5 font-['Outfit']">Everything fluency actually needs</h2>
            <p className="text-[var(--text-secondary)] text-[15.5px]">Lessons build the vocabulary. Live rooms build the confidence. Progress tracking keeps you coming back.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🗣️', title: 'Live voice rooms', desc: 'Join topic-based rooms or match with another learner for real, unscripted conversation practice.', bg: 'bg-blue-500/10', color: 'text-[var(--primary)]' },
              { icon: '📚', title: 'Structured lessons', desc: 'Daily, business, interview, and travel English tracks with interactive dialogue scripts you speak along to.', bg: 'bg-teal-500/10', color: 'text-[var(--accent)]' },
              { icon: '🏆', title: 'XP, streaks & certificates', desc: 'Track progress with daily goals, streaks, and speaking-test certificates that show real improvement.', bg: 'bg-amber-500/10', color: 'text-[var(--gold)]' },
              { icon: '🎤', title: 'Speaking tests', desc: 'Scored speaking assessments give you an honest read on where you stand — and what to work on next.', bg: 'bg-rose-500/10', color: 'text-[var(--flame)]' },
              { icon: '🤝', title: 'Friends & leaderboards', desc: 'Add friends, compare progress, and stay motivated with a leaderboard that rewards consistency.', bg: 'bg-blue-500/10', color: 'text-[var(--primary)]' },
              { icon: '✈️', title: 'Real-world scenarios', desc: 'Practice English for interviews, business meetings, travel, and everyday situations — not just textbook drills.', bg: 'bg-teal-500/10', color: 'text-[var(--accent)]' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-[22px] p-6.5 shadow-md shadow-blue-900/[0.03] border border-slate-100 hover:shadow-lg transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4.5 ${feature.bg} ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-[17px] font-bold mb-2 font-['Outfit']">{feature.title}</h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="py-18">
          <div className="max-w-[560px] mb-12">
            <div className="text-[13px] font-bold text-[var(--accent)] mb-2.5 tracking-wide uppercase">How it works</div>
            <h2 className="text-3xl font-bold mb-3.5 font-['Outfit']">From onboarding to your first live conversation</h2>
          </div>

          <div className="flex flex-col">
            {[
              { num: '1', title: 'Sign up in seconds', desc: 'Get started with Google sign-in or a phone number — no lengthy forms.' },
              { num: '2', title: 'Pick a track', desc: 'Choose Daily, Business, Interview, or Travel English based on what you actually need to speak about.' },
              { num: '3', title: 'Practice the words', desc: 'Work through short interactive lessons and vocabulary before you speak out loud.' },
              { num: '4', title: 'Join a live room', desc: 'Put it into practice in a live voice room or a matched conversation with another learner.' },
            ].map((step, idx) => (
              <div key={idx} className="grid grid-cols-[56px_1fr] gap-5 py-6 border-t border-[var(--divider)] last:border-b">
                <div className="font-['Outfit'] font-bold text-[15px] text-[var(--primary)] bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold mb-1 font-['Outfit']">{step.title}</h3>
                  <p className="text-[14px] text-[var(--text-secondary)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Audience Band Section */}
        <section className="py-12">
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#312E81] text-white rounded-[32px] p-10 md:p-14 relative overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <h2 className="text-white text-2xl md:text-[28px] font-bold mb-3 font-['Outfit']">Built for learners who need to speak, not just study.</h2>
                <p className="text-white/78 text-[15px] max-w-[460px] leading-relaxed">Students preparing for exams, professionals prepping for interviews, and travelers who want to be understood — Acuspeak meets you where your English actually needs to work.</p>
              </div>
              <div className="flex gap-7 flex-wrap">
                <div>
                  <b className="font-['Outfit'] text-[30px] block">40+</b>
                  <span className="text-[12.5px] text-white/65">Interactive lessons</span>
                </div>
                <div>
                  <b className="font-['Outfit'] text-[30px] block">4</b>
                  <span className="text-[12.5px] text-white/65">Learning tracks</span>
                </div>
                <div>
                  <b className="font-['Outfit'] text-[30px] block">Live</b>
                  <span className="text-[12.5px] text-white/65">Voice practice rooms</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-18">
          <div className="bg-white rounded-[28px] p-11 text-center shadow-lg shadow-slate-900/5 border border-slate-100">
            <h2 className="text-2xl font-bold mb-2.5 font-['Outfit']">Questions about Acuspeak?</h2>
            <p className="text-[var(--text-secondary)] text-[15px] mb-6.5">Reach out and we&apos;ll get back to you — whether you&apos;re a learner, a partner, or just curious.</p>
            <a href="mailto:hello@acuspeak.app" className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-['Outfit'] font-semibold text-[15px] px-8 py-3.5 rounded-full shadow-lg shadow-blue-900/20 inline-block hover:opacity-95 transition-opacity">
              hello@acuspeak.app
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-[var(--divider)]">
          <div className="flex justify-between items-center flex-wrap gap-4 text-[13px] text-[var(--text-muted)]">
            <div className="flex items-center gap-2 font-bold text-[15px] font-['Outfit'] text-[var(--text-primary)]">
              <div className="w-[26px] h-[26px] rounded-[8px] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white font-bold text-[12px]">
                A
              </div>
              Acuspeak
            </div>
            <div className="flex gap-5.5 font-semibold text-[var(--text-secondary)]">
              <a href="#" className="hover:text-[var(--primary)]">Privacy Policy</a>
              <a href="#" className="hover:text-[var(--primary)]">Terms of Service</a>
              <a href="mailto:hello@acuspeak.app" className="hover:text-[var(--primary)]">Contact</a>
            </div>
            <div>© 2026 Acuspeak. All rights reserved.</div>
          </div>
        </footer>

      </div>
    </div>
  );
}