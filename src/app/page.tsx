'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Ye main Landing Page component hai jo home route (/) ka pura UI render karta hai.
export default function LandingPage() {
  // Page load hone par waveform animation initialize karne ke liye side effect function.
  useEffect(() => {
    // Hero section ke voice simulation card mein waveform bars inject karne ka logic.
    const wave = document.getElementById('wave');
    if (wave && wave.children.length === 0) {
      const heights = [10, 18, 26, 14, 30, 20, 12, 24, 16, 22, 10, 18, 28, 14, 20];
      
      // Heights array par loop chalakar har bar ka visual element span DOM me add kar rahe hain.
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
          <Link
            href="/"
            // Brand name par click karne se page ke top par smooth scroll karwane ka handler function.
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2.5 font-bold text-xl font-outfit text-[var(--text-primary)] hover:opacity-90 transition-opacity"
          >
            <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] inline-flex items-center justify-center text-white font-bold text-[16px] shrink-0 font-outfit shadow-sm">
              A
            </div>
            <span>Acuspeak</span>
          </Link>

          <ul className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-[var(--text-secondary)] list-none m-0 p-0">
            <li>
              <a href="#features" className="hover:text-[var(--primary)] transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors">
                How it works
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-[var(--primary)] transition-colors">
                Contact
              </a>
            </li>
          </ul>

          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-white text-[var(--text-primary)] font-outfit font-semibold text-[14px] px-5 py-2.5 rounded-full border border-[var(--divider)] shadow-sm hover:bg-gray-50 transition-all leading-none"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <div className="max-w-[1080px] mx-auto px-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute -top-[180px] -right-[160px] w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.28),rgba(30,58,138,0)_70%)] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 bg-blue-500/10 text-[var(--primary)] text-[13px] font-semibold px-4 py-2 rounded-full mb-6">
                🎙️ Live voice practice, every day
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold leading-[1.15] mb-5 font-outfit text-[var(--text-primary)]">
                Speak English{' '}
                <span className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#0D9488] bg-clip-text text-transparent inline-block">
                  like you mean it.
                </span>
              </h1>

              <p className="text-[16px] sm:text-[17px] text-[var(--text-secondary)] max-w-[480px] mb-8 leading-relaxed font-normal">
                Acuspeak pairs structured lessons with real voice conversations, so you build fluency by actually speaking — not just reading.
              </p>

              <div className="flex items-center gap-3.5 flex-wrap">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-outfit font-semibold text-[15px] px-7 py-3.5 rounded-full shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity leading-none"
                >
                  Get started
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center bg-white text-[var(--text-primary)] font-outfit font-semibold text-[15px] px-7 py-3.5 rounded-full border border-[var(--divider)] shadow-sm hover:bg-gray-50 transition-colors leading-none"
                >
                  See how it works
                </a>
              </div>
            </div>

            {/* Voice Card Simulation */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white rounded-[28px] p-6 sm:p-[26px] shadow-xl shadow-slate-900/5 border border-[var(--glass-border)] w-full">
                <div className="flex items-center justify-between mb-5">
                  <strong className="font-outfit text-[15px] text-[var(--text-primary)]">
                    Interview Practice Room
                  </strong>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[12px] font-bold px-2.5 py-1 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
                  </span>
                </div>

                <div className="flex gap-3 mb-4 items-start">
                  <div className="w-[38px] h-[38px] rounded-full shrink-0 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] inline-flex items-center justify-center text-white font-bold text-[14px] font-outfit">
                    R
                  </div>
                  <div className="bg-[var(--bg)] rounded-2xl p-3.5 text-[13.5px] text-[var(--text-primary)] max-w-[260px] leading-snug">
                    &ldquo;Tell me about a time you solved a difficult problem at work.&rdquo;
                  </div>
                </div>

                <div className="flex gap-3 mb-4 items-start">
                  <div className="w-[38px] h-[38px] rounded-full shrink-0 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] inline-flex items-center justify-center text-white font-bold text-[14px] font-outfit">
                    P
                  </div>
                  <div className="bg-[var(--bg)] rounded-2xl p-3.5 text-[13.5px] text-[var(--text-primary)] max-w-[260px] leading-snug">
                    &ldquo;Sure — last year, our team faced a tight deadline on a client project…&rdquo;
                  </div>
                </div>

                <div id="wave" className="flex items-center gap-[3px] mt-5 p-3.5 bg-[var(--bg)] rounded-2xl justify-between" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-20">
          <div className="max-w-[560px] mb-12">
            <div className="text-[13px] font-bold text-[var(--accent)] mb-2.5 tracking-wide uppercase font-manrope">
              What&apos;s inside
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3.5 font-outfit text-[var(--text-primary)] leading-tight">
              Everything fluency actually needs
            </h2>
            <p className="text-[var(--text-secondary)] text-[15.5px] leading-relaxed">
              Lessons build the vocabulary. Live rooms build the confidence. Progress tracking keeps you coming back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🗣️', title: 'Live voice rooms', desc: 'Join topic-based rooms or match with another learner for real, unscripted conversation practice.', bg: 'bg-blue-500/10', color: 'text-[var(--primary)]' },
              { icon: '👥', title: 'Speak with real people', desc: 'Practice speaking English directly with real learners to build natural fluency and confidence.', bg: 'bg-sky-500/10', color: 'text-sky-600' },
              { icon: '📚', title: 'Structured lessons', desc: 'Daily, business, interview, and travel English tracks with interactive dialogue scripts you speak along to.', bg: 'bg-teal-500/10', color: 'text-[var(--accent)]' },
              { icon: '🏆', title: 'XP, streaks & certificates', desc: 'Track progress with daily goals, streaks, and speaking-test certificates that show real improvement.', bg: 'bg-amber-500/10', color: 'text-[var(--gold)]' },
              { icon: '🎤', title: 'Speaking tests', desc: 'Scored speaking assessments give you an honest read on where you stand — and what to work on next.', bg: 'bg-rose-500/10', color: 'text-[var(--flame)]' },
              { icon: '🤝', title: 'Friends & leaderboards', desc: 'Add friends, compare progress, and stay motivated with a leaderboard that rewards consistency.', bg: 'bg-blue-500/10', color: 'text-[var(--primary)]' },
              { icon: '✈️', title: 'Real-world scenarios', desc: 'Practice English for interviews, business meetings, travel, and everyday situations — not just textbook drills.', bg: 'bg-teal-500/10', color: 'text-[var(--accent)]' },
            ]
            // Features list ke har element ko Map karke feature cards generate karne wala render function.
            .map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[22px] p-6 sm:p-[26px] shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-start"
              >
                <div className={`w-12 h-12 rounded-xl inline-flex items-center justify-center text-2xl mb-4 shrink-0 ${feature.bg} ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-[17px] font-bold mb-2 font-outfit text-[var(--text-primary)] leading-snug">
                  {feature.title}
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="py-16 md:py-20">
          <div className="max-w-[560px] mb-12">
            <div className="text-[13px] font-bold text-[var(--accent)] mb-2.5 tracking-wide uppercase font-manrope">
              How it works
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3.5 font-outfit text-[var(--text-primary)] leading-tight">
              From onboarding to your first live conversation
            </h2>
          </div>

          <div className="flex flex-col">
            {[
              { num: '1', title: 'Sign up in seconds', desc: 'Get started with Google sign-in or a phone number — no lengthy forms.' },
              { num: '2', title: 'Pick a track', desc: 'Choose Daily, Business, Interview, or Travel English based on what you actually need to speak about.' },
              { num: '3', title: 'Practice the words', desc: 'Work through short interactive lessons and vocabulary before you speak out loud.' },
              { num: '4', title: 'Speak with real people', desc: 'Connect for real, interactive conversations with fellow learners to build fluency.' },
              { num: '5', title: 'Join a live room', desc: 'Put it into practice in a live voice room or a matched conversation room.' },
            ]
            // Onboarding step objects par map chalakar numbered step list item return karne wala function.
            .map((step, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[48px_1fr] sm:grid-cols-[56px_1fr] gap-4 sm:gap-5 py-6 border-t border-[var(--divider)] last:border-b items-start"
              >
                <div className="font-outfit font-bold text-[15px] text-[var(--primary)] bg-blue-500/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl inline-flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold mb-1 font-outfit text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Audience Band Section */}
        <section className="py-12">
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#312E81] text-white rounded-[32px] p-8 sm:p-12 md:p-14 relative overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <h2 className="text-white text-2xl sm:text-[28px] font-bold mb-3 font-outfit leading-tight">
                  Built for learners who need to speak, not just study.
                </h2>
                <p className="text-white/78 text-[15px] max-w-[460px] leading-relaxed font-normal">
                  Students preparing for exams, professionals prepping for interviews, and travelers who want to be understood — Acuspeak meets you where your English actually needs to work.
                </p>
              </div>

              <div className="flex items-center gap-8 flex-wrap">
                <div>
                  <b className="font-outfit text-[30px] sm:text-[34px] block font-bold leading-none mb-1">
                    40+
                  </b>
                  <span className="text-[12.5px] text-white/65 font-medium">
                    Interactive lessons
                  </span>
                </div>
                <div>
                  <b className="font-outfit text-[30px] sm:text-[34px] block font-bold leading-none mb-1">
                    4
                  </b>
                  <span className="text-[12.5px] text-white/65 font-medium">
                    Learning tracks
                  </span>
                </div>
                <div>
                  <b className="font-outfit text-[30px] sm:text-[34px] block font-bold leading-none mb-1">
                    Live
                  </b>
                  <span className="text-[12.5px] text-white/65 font-medium">
                    Voice practice rooms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 md:py-20">
          <div className="bg-white rounded-[28px] p-8 sm:p-11 text-center shadow-lg shadow-slate-900/5 border border-slate-100 max-w-[680px] mx-auto">
            <h2 className="text-2xl font-bold mb-2.5 font-outfit text-[var(--text-primary)]">
              Questions about Acuspeak?
            </h2>
            <p className="text-[var(--text-secondary)] text-[15px] mb-6 leading-relaxed">
              Reach out and we&apos;ll get back to you — whether you&apos;re a learner, a partner, or just curious.
            </p>
            <a
              href="mailto:hello@acuspeak.app"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-outfit font-semibold text-[15px] px-8 py-3.5 rounded-full shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity leading-none"
            >
              hello@acuspeak.app
            </a>
          </div>
        </section>

        {/* Comprehensive Footer */}
        <footer className="pt-16 pb-12 border-t border-[var(--divider)]">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 pb-12 border-b border-[var(--divider)]">
            {/* Column 1: Brand & Tagline */}
            <div className="lg:col-span-2">
              <Link
                href="/"
                // Footer ke logo par click karke top of page par smooth scroll karne ka event function.
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2.5 font-bold text-xl font-outfit text-[var(--text-primary)] hover:opacity-90 transition-opacity mb-4"
              >
                <div className="w-[32px] h-[32px] rounded-[10px] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] inline-flex items-center justify-center text-white font-bold text-[15px] shrink-0 font-outfit shadow-sm">
                  A
                </div>
                <span>Acuspeak</span>
              </Link>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-[340px] mb-6 font-normal">
                Acuspeak is your personal English speaking coach — pairing structured interactive lessons with live 1-on-1 voice practice so you build real-world fluency and confidence.
              </p>

              {/* System Status Pill */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-semibold px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>

            {/* Column 2: Legal & Policies */}
            <div>
              <h4 className="font-outfit font-bold text-[14px] text-[var(--text-primary)] mb-4 uppercase tracking-wider text-xs">
                Legal & Policies
              </h4>
              <ul className="space-y-2.5 text-[14px] text-[var(--text-secondary)] font-medium list-none m-0 p-0">
                <li>
                  <a href="#" className="hover:text-[var(--primary)] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[var(--primary)] transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[var(--primary)] transition-colors">
                    Cookie Settings
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Support */}
            <div>
              <h4 className="font-outfit font-bold text-[14px] text-[var(--text-primary)] mb-4 uppercase tracking-wider text-xs">
                Contact & Support
              </h4>
              <ul className="space-y-3 text-[13.5px] text-[var(--text-secondary)] list-none m-0 p-0">
                <li className="flex items-start gap-2">
                  <span className="text-[15px]">📧</span>
                  <a href="mailto:hello@acuspeak.app" className="hover:text-[var(--primary)] transition-colors font-medium">
                    hello@acuspeak.app
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[15px]">🕒</span>
                  <span>
                    Support Hours:<br />
                    <strong className="text-[var(--text-primary)] font-semibold">Mon – Fri, 9 AM – 6 PM IST</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[15px]">📍</span>
                  <span>New Delhi, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Centered Copyright */}
          <div className="pt-8 flex flex-col items-center justify-center gap-3 text-[13px] text-[var(--text-muted)] font-medium text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Link
                href="/"
                // Footer copyright brand link scroll-to-top handler function.
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 font-bold font-outfit text-[var(--text-primary)] hover:opacity-90"
              >
                <div className="w-[20px] h-[20px] rounded-[6px] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] inline-flex items-center justify-center text-white font-bold text-[10px]">
                  A
                </div>
                <span>Acuspeak</span>
              </Link>
              <span>© 2026 Acuspeak Inc. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}