import { Button } from "@/components/ui/button"

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-royal">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-royal">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-royal">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const stats = [
  { icon: <StarIcon />, value: "5", label: "Customer Rating", suffix: "" },
  { icon: <ShieldIcon />, value: "100%", label: "Licensed & Insured" },
  { icon: <SparklesIcon />, value: "6", label: "Premium Services" },
  { icon: <MapPinIcon />, value: "FL", label: "Royal Palm Beach" },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-bg">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-dark-bg/70 via-dark-bg/50 to-dark-bg"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1f8a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center">
          {/* Main Title */}
          <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight mb-2">
            <span className="bg-gradient-to-r from-royal via-primary to-navy bg-clip-text text-transparent">
              AUTO WAX
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="font-heading text-2xl sm:text-3xl md:text-4xl text-brand-red italic mb-8">
            South Florida
          </p>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg sm:text-xl mb-10 leading-relaxed">
            Premium automotive detailing services that transform your vehicle. 
            Experience the difference of professional care with our expert team.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="bg-brand-red hover:bg-brand-red/90 text-white font-condensed uppercase tracking-wide px-8 py-6 text-lg"
            >
              Book Appointment
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 font-condensed uppercase tracking-wide px-8 py-6 text-lg"
            >
              Our Services
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {stat.icon}
                  <span className="font-heading text-2xl sm:text-3xl text-white">
                    {stat.value}{stat.suffix}
                  </span>
                </div>
                <p className="font-condensed text-muted-foreground text-sm uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
