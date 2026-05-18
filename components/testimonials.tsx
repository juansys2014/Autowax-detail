"use client"

import { useLanguage } from "@/lib/language-context"

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export function Testimonials() {
  const { t } = useLanguage()

  return (
    <section id="reviews" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-condensed text-royal uppercase tracking-widest text-sm mb-4">{t.testimonials.label}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6">{t.testimonials.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t.testimonials.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.testimonials.items.map((testimonial, index) => (
            <div key={index} className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>
              <p className="text-white text-lg leading-relaxed mb-6">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-royal/20 rounded-full flex items-center justify-center">
                  <span className="font-heading text-royal text-lg">{testimonial.author.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-condensed text-white font-semibold">{testimonial.author}</p>
                  <p className="text-muted-foreground text-sm">{testimonial.vehicle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
