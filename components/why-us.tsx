"use client"

import { useLanguage } from "@/lib/language-context"

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-royal">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export function WhyUs() {
  const { t } = useLanguage()

  return (
    <section id="why-us" className="py-20 sm:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <p className="font-condensed text-royal uppercase tracking-widest text-sm mb-4">{t.whyUs.label}</p>
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-8">{t.whyUs.title}</h2>

            <div className="space-y-6">
              {t.whyUs.features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-royal/10 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-white mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Rating Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-background border border-border rounded-3xl p-8 sm:p-12 text-center max-w-sm">
              <div className="w-20 h-20 bg-royal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="font-heading text-4xl text-royal">5</span>
              </div>

              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>

              <h3 className="font-heading text-2xl text-white mb-2">{t.whyUs.ratingTitle}</h3>
              <p className="text-muted-foreground mb-6">{t.whyUs.ratingDesc}</p>

              <div className="bg-card rounded-xl p-4">
                <p className="text-muted-foreground text-sm italic">&quot;{t.whyUs.quote}&quot;</p>
                <p className="font-condensed text-white mt-2 text-sm">- {t.whyUs.quoteAuthor}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
