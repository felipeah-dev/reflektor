import Link from "next/link";
import { Logo } from "@/components/ui/Logo";


export default function Home() {
  return (
    <div className="layout-container flex h-full grow flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-[#28392e]/50 bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Reflektor AI",
                "operatingSystem": "Web",
                "applicationCategory": "EducationalApplication",
                "description": "Advanced AI Coaching for Public Speaking and Communication training.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              })
            }}
          />

          <div className="flex items-center gap-4">
            <Link href="/settings" className="flex size-10 items-center justify-center rounded-full text-[#8fa99a] hover:bg-[#28392e] hover:text-white transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </Link>

            <div
              className="size-9 rounded-full bg-cover bg-center ring-2 ring-[#28392e]"
              data-alt="User profile avatar showing a smiling person"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCPKLXaquCbAMMuNBwQ_lDdyA03hfk3WtoQhkuRXsn7VHfCPl296ypmg78fJgSRrcLytr6UKOIWk86Qq_HiLwOXJFJ3zxXACmMSMXudFKRHj4NyvzyWtKgh6jGHRupoK2ahCkhaKtHo2hryFYTP4HPg6PozDS-3zA3XjvZOr6387ee4kTuqRGh35tOX_RXxK2gCNho1xVQ8fSCzJjpSDJXOnu0LUvOUUHEN--n3xQQnTqljv0duYwSs-cpXku6fvExmuLqHBFNiYdYc")',
              }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-8">
          {/* HERO */}
          <div className="flex flex-col gap-4 pt-6 pb-4 md:pt-10 md:pb-6">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
              What do you want to <span className="text-primary">practice</span> today?
            </h1>
            <p className="max-w-2xl text-lg text-[#8fa99a] font-normal">
              Choose a context to start your AI-analyzed practice session. Refine your communication skills in a safe environment.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-3">
            {/* CARD 1 */}
            <Link
              href="/setup?scenario=sales"
              aria-label="Practice Sales Presentation with AI Coach"
              className={[
                "group relative flex flex-col overflow-hidden rounded-xl",
                "border border-white/5",
                "bg-[linear-gradient(180deg,rgba(28,46,34,0.92),rgba(20,36,27,0.96))]",
                "p-4 text-left transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/40",
              ].join(" ")}
            >
              <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  data-alt="Abstract 3D illustration representing a sales presentation with charts"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC88ZMEhl1hIFZxtExiadRDNLPV8_qWc4r7809iA5cr9jKOD82rtcHowBMBg4yAxGU3V-h6xOYQ6PZt2Z886lTN9cOybFn-a2XVJhWguqBy8GNMec93coZ-wRIOFD23IQAJSsMkIBPoFt2wFvCPShBj5-a-STRPbYa9By4ZEwO1TZ-4f0fd3CtCnot-2Cc21pi5vzqCUkE16f1f8IgE4Wt0B-S26v1o3fP74AKZ2fBQxoq3A20vGMWcTgOwSFyqS7pQHEUHfvH8JWaW")',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-white">trending_up</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                    Sales Presentation
                  </h3>
                  <p className="text-sm text-[#8fa99a] mt-1">
                    Master persuasion and handling client objections.
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center rounded-md bg-[#28392e] px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                    Advanced
                  </span>
                  <span className="material-symbols-outlined text-[#28392e] group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>

            {/* CARD 2 */}
            <Link
              href="/setup?scenario=pitch"
              aria-label="Practice Startup Pitch with AI Coach"
              className={[
                "group relative flex flex-col overflow-hidden rounded-xl",
                "border border-white/5",
                "bg-[linear-gradient(180deg,rgba(28,46,34,0.92),rgba(20,36,27,0.96))]",
                "p-4 text-left transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/40",
              ].join(" ")}
            >
              <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  data-alt="Abstract 3D illustration representing a startup pitch environment"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBa1nUu4DGO7_mcnFG0KzuoH5fFBahbzRtZ_K9bGgF10T62PNyzi_Sjr-aRCMJfJjDpWT3d4_c-dTMMdLpWQCT2P4GASPPdGk-DWNmgwICibJY-eIuRuC86ItOCN7sbAXhj1VRyldpoa0_ypT73R26uFgVp-Xcc2IrTDtlo9lfTF4UnJH5roKKG4fGNmKijx4rZrywj03I5hJHZUdU_RP2cuPHVUrgi2ik65Vmxf5WEoy3AwfbueSnCyKpqeOPxfn7e6SlwB3KyoXcl")',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-white">rocket_launch</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                    Startup Pitch
                  </h3>
                  <p className="text-sm text-[#8fa99a] mt-1">
                    Convince investors with a clear and powerful narrative.
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center rounded-md bg-[#28392e] px-2 py-1 text-xs font-medium text-[#8fa99a] ring-1 ring-inset ring-white/10">
                    Intermediate
                  </span>
                  <span className="material-symbols-outlined text-[#28392e] group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>

            {/* CARD 3 */}
            <Link
              href="/setup?scenario=speaking"
              aria-label="Practice Public Speaking with AI Coach"
              className={[
                "group relative flex flex-col overflow-hidden rounded-xl",
                "border border-white/5",
                "bg-[linear-gradient(180deg,rgba(28,46,34,0.92),rgba(20,36,27,0.96))]",
                "p-4 text-left transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/40",
              ].join(" ")}
            >
              <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  data-alt="Abstract 3D illustration representing a public speaking podium"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA5ULbHlJBMOMPgqTPaIDpW0V8NdkOYkaIgwMoLOgCS_KskGdzXOD3J5iqzLv3tPkgDEecMxvets6NdYur3dBd2a8EaGF69DubRLVv1k_wkQCk7zpZCH382lMJLpKn8eJ-vU2yby1ZZNRJDmlj-hvpaxDEln1v0q6bhLR5uRI_AcSIvpOonjDTAs6GDZbWIMd7x9Vsmq-uOKUJFM0NyY1N2r75tW6Ve12AZXsg9vOvWxslLUHZn7VSPBsr7MWfKEGTCYp0Cgv22wzkQ")',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-white">podium</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                    Public Speaking
                  </h3>
                  <p className="text-sm text-[#8fa99a] mt-1">
                    Improve your oratory and stage presence before audiences.
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center rounded-md bg-[#28392e] px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                    Advanced
                  </span>
                  <span className="material-symbols-outlined text-[#28392e] group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-4">
            <button
              className="flex items-center justify-center gap-3 rounded-lg bg-[#1c2e22] border border-[#28392e] px-6 py-4 text-base font-bold text-[#8fa99a] transition-all cursor-not-allowed opacity-75 w-full sm:w-auto min-w-[320px]"
              disabled
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span>Create Custom Scenario</span>
              <span className="ml-2 rounded bg-[#28392e] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#8fa99a]">
                Soon
              </span>
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-auto w-full border-t border-[#28392e] bg-background-dark py-10 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
            <p className="text-sm text-[#8fa99a]">© 2026 REFLEKTOR AI. All rights reserved.</p>

            <div className="flex gap-8">
              <a className="text-sm font-medium text-[#8fa99a] hover:text-primary transition-colors" href="#">
                Help
              </a>
              <a className="text-sm font-medium text-[#8fa99a] hover:text-primary transition-colors" href="#">
                Privacy
              </a>
              <a className="text-sm font-medium text-[#8fa99a] hover:text-primary transition-colors" href="#">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
