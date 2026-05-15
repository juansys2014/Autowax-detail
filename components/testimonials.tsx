const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const testimonials = [
  {
    rating: 5,
    quote: "Absolutely phenomenal work! My Tesla Model 3 has never looked better. The ceramic coating gives it an incredible shine that lasts for months.",
    author: "Michael R.",
    vehicle: "Tesla Model 3",
  },
  {
    rating: 5,
    quote: "The team at Auto Wax is incredibly professional. They restored my classic Mustang&apos;s paint to better than factory condition. Highly recommended!",
    author: "Sarah T.",
    vehicle: "Ford Mustang",
  },
  {
    rating: 5,
    quote: "I&apos;ve tried several detailing services in South Florida, and Auto Wax is by far the best. Their attention to detail is unmatched.",
    author: "David L.",
    vehicle: "BMW M5",
  },
  {
    rating: 5,
    quote: "The ozone treatment completely eliminated the smoke smell from my used car purchase. It&apos;s like driving a brand new vehicle now!",
    author: "Jennifer K.",
    vehicle: "Mercedes C-Class",
  },
]

export function Testimonials() {
  return (
    <section id="reviews" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-condensed text-royal uppercase tracking-widest text-sm mb-4">Testimonials</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Don&apos;t just take our word for it. Here&apos;s what our satisfied customers have to say.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-white text-lg leading-relaxed mb-6">
                &quot;{testimonial.quote}&quot;
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-royal/20 rounded-full flex items-center justify-center">
                  <span className="font-heading text-royal text-lg">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-condensed text-white font-semibold">
                    {testimonial.author}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {testimonial.vehicle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
