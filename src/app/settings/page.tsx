"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";


export default function SettingsPage() {
    const router = useRouter();

    return (
        <div className="bg-background-dark text-white font-display overflow-x-hidden min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-solid border-[#28392e] bg-background-dark/95 backdrop-blur-md px-4 sm:px-10 py-3">
                <div className="mx-auto max-w-[1440px] flex items-center justify-between whitespace-nowrap">
                    <Link
                        className="hover:opacity-90 transition-opacity"
                        href="/"
                    >
                        <Logo textSize="text-lg" />
                    </Link>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <button className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-[#10c94d] text-[#102216] font-bold text-sm shadow-[0_0_15px_rgba(19,236,91,0.2)] hover:shadow-[0_0_20px_rgba(19,236,91,0.4)] transition-all">
                            <span className="material-symbols-outlined text-[20px]">
                                add_circle
                            </span>
                            <span>New Practice</span>
                        </button>
                        <div className="h-6 w-px bg-[#28392e] hidden sm:block"></div>
                        <button className="flex items-center justify-center size-9 rounded-lg text-muted hover:bg-[#1a2e22] hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border-2 border-[#28392e] hover:border-primary transition-colors cursor-pointer"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCkg8uMpUcsz5iuVM6tqV2fWFdgpdaK64O4fRTpdqykksXYqp0Q8cU5h6stG0gzRnuUJ6AuegdhCYtk_yP05n20puHimoVBWRg1OMmDgQRUthRRkBCP4GfSzScX6YMrL7aYVjZde2QVx7ep_mtfZ0hgFm573bwx6PF-s5Mq5kunASOl4y3KiKu5tLnRBvcIHHOu6RKiMGrkfM1ocUpGKhU_h7_6ujIyKEObq7S_2JoQpTpDV0w6hQhzqWV02EAvjZJ6AH4CsRLzJp0X")',
                            }}
                        ></div>
                    </div>
                </div>
            </header>
            <div className="layout-container flex grow flex-col w-full max-w-[1440px] mx-auto">
                <div className="flex flex-col lg:flex-row flex-1 py-8 px-4 sm:px-10 gap-8">
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-28 flex flex-col gap-6">
                            <div className="flex flex-col px-2">
                                <h1 className="text-xl font-bold leading-normal text-white">
                                    Settings
                                </h1>
                                <p className="text-muted text-sm">
                                    Manage your experience
                                </p>
                            </div>
                            <nav className="flex flex-col gap-2">
                                <a
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-[#1a2e22] text-slate-600 dark:text-muted transition-colors group"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined group-hover:text-primary">
                                        person
                                    </span>
                                    <span className="text-sm font-medium">Profile</span>
                                </a>
                                <a
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 text-white shadow-sm"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined text-primary">
                                        verified_user
                                    </span>
                                    <span className="text-sm font-bold">Privacy & Data</span>
                                </a>
                                <a
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-[#1a2e22] text-slate-600 dark:text-muted transition-colors group"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined group-hover:text-primary">
                                        psychology
                                    </span>
                                    <span className="text-sm font-medium">AI Preferences</span>
                                </a>
                                <a
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#1a2e22] text-muted transition-colors group"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined group-hover:text-primary">
                                        notifications
                                    </span>
                                    <span className="text-sm font-medium">Notifications</span>
                                </a>
                            </nav>
                            <div className="mt-8 p-4 rounded-xl bg-[#1a2e22]/50 border border-[#28392e]">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary mt-1">
                                        auto_awesome
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-white mb-1">
                                            Pro Plan Active
                                        </p>
                                        <p className="text-[10px] text-muted leading-relaxed">
                                            Your subscription renews on Oct 24, 2026.
                                        </p>
                                        <button className="mt-2 text-[10px] font-bold text-primary hover:underline">
                                            Manage Subscription
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1 flex flex-col min-w-0">
                        <div className="flex flex-col gap-2 mb-8 border-b border-[#28392e] pb-6">
                            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
                                Privacy & Data Control
                            </h2>
                            <p className="text-slate-500 dark:text-muted text-base max-w-2xl">
                                You have full control over how REFLEKTOR uses your data for
                                coaching. Adjust your analysis and retention preferences.
                            </p>
                        </div>
                        <div className="flex flex-col gap-10">
                            <section className="bg-[#14231b] rounded-xl border border-[#28392e] overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#28392e] flex items-center justify-between bg-[#1a2e22]/50">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">
                                                analytics
                                            </span>
                                            AI Analysis Permissions
                                        </h3>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20">
                                        Active
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col gap-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-bold text-white">
                                                Facial Expression Analysis
                                            </p>
                                            <p className="text-sm text-muted">
                                                Allows AI to detect micro-expressions to evaluate
                                                confidence and empathy.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                defaultChecked
                                                className="sr-only peer"
                                                type="checkbox"
                                                value=""
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <hr className="border-[#28392e]" />
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-bold text-white">
                                                Voice Tone & Pace Analysis
                                            </p>
                                            <p className="text-sm text-muted">
                                                Enables audio processing to detect intonation, pauses, and
                                                speed.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                defaultChecked
                                                className="sr-only peer"
                                                type="checkbox"
                                                value=""
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <hr className="border-[#28392e]" />
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-bold text-white">
                                                Semantic Speech Analysis
                                            </p>
                                            <p className="text-sm text-muted">
                                                Processes your speech content to suggest better vocabulary
                                                and structure.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                defaultChecked
                                                className="sr-only peer"
                                                type="checkbox"
                                                value=""
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </section>
                            <section className="bg-white dark:bg-[#14231b] rounded-xl border border-slate-200 dark:border-[#28392e] overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-[#28392e] bg-slate-50 dark:bg-[#1a2e22]/50">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">
                                            database
                                        </span>
                                        Data Retention & Usage
                                    </h3>
                                </div>
                                <div className="p-6 flex flex-col gap-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-white">
                                                Automatic Session Retention
                                            </label>
                                            <div className="relative">
                                                <select className="w-full bg-[#1a2e22] border border-[#28392e] text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5">
                                                    <option>30 Days (Recommended)</option>
                                                    <option>7 Days</option>
                                                    <option>90 Days</option>
                                                    <option>Indefinitely</option>
                                                    <option>Do not save history</option>
                                                </select>
                                            </div>
                                            <p className="text-xs text-muted mt-1">
                                                Deleted videos cannot be recovered.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-white">
                                                Profile Visibility
                                            </label>
                                            <div className="relative">
                                                <select className="w-full bg-[#1a2e22] border border-[#28392e] text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5">
                                                    <option>Private (Only me)</option>
                                                    <option>Visible to my Coach</option>
                                                    <option>Public in community</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-[#1a2e22] border border-dashed border-[#28392e] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-1.5 rounded-full bg-primary/20 text-primary">
                                                <span className="material-symbols-outlined text-[20px]">
                                                    model_training
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    Continuous Improvement (Training)
                                                </p>
                                                <p className="text-xs text-muted mt-1 max-w-md">
                                                    Allow REFLEKTOR to use anonymized data from my sessions
                                                    to train and improve AI models. No personally
                                                    identifiable information is shared.
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                className="sr-only peer"
                                                type="checkbox"
                                                value=""
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </section>
                            <div className="mt-8 pt-8 border-t border-[#28392e]">
                                <h3 className="text-red-500 text-sm font-bold uppercase tracking-wider mb-4">
                                    Danger Zone
                                </h3>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            Delete all session data
                                        </p>
                                        <p className="text-xs text-muted mt-1">
                                            Permanently removes videos, analysis, and progress metrics.
                                        </p>
                                    </div>
                                    <button className="whitespace-nowrap px-4 py-2 bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-colors">
                                        Delete Data
                                    </button>
                                </div>
                            </div>
                            <div className="sticky bottom-4 z-40 flex items-center justify-end gap-3 p-4 bg-[#102216]/95 backdrop-blur border border-[#28392e] rounded-xl shadow-2xl mt-4">
                                <span className="text-xs text-muted mr-auto hidden sm:block">
                                    Last saved: Today, 10:42 AM
                                </span>
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-6 py-2.5 rounded-lg text-white font-medium text-sm hover:bg-[#28392e] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-[#10c94d] text-[#102216] font-bold text-sm shadow-[0_0_15px_rgba(19,236,91,0.3)] transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
