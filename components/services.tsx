const CarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-royal">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.6 1 12.5 1 13.4V16c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-royal">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-royal">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const WindIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-royal">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
)

const LightbulbIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-royal">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
)

const FilmIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-royal">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 3v18" />
    <path d="M3 7.5h4" />
    <path d="M3 12h18" />
    <path d="M3 16.5h4" />
    <path d="M17 3v18" />
    <path d="M17 7.5h4" />
    <path d="M17 16.5h4" />
  </svg>
)

const services = [
  {
    number: "01",
    icon: <CarIcon />,
    title: "Professional Detailing",
    description: "Comprehensive interior and exterior detailing that restores your vehicle to showroom condition.",
  },
  {
    number: "02",
    icon: <SparkleIcon />,
    title: "Paint Correction & Ceramic Coating",
    description: "Advanced paint correction techniques combined with long-lasting ceramic protection.",
  },
  {
    number: "03",
    icon: <ShieldIcon />,
    title: "Paint & Fabric Protection",
    description: "Premium protective treatments that guard against UV damage, stains, and everyday wear.",
  },
  {
    number: "04",
    icon: <WindIcon />,
    title: "Ozone Treatment",
    description: "Eliminate odors and sanitize your vehicle interior with professional ozone treatment.",
  },
  {
    number: "05",
    icon: <LightbulbIcon />,
    title: "Headlight Restoration",
    description: "Restore clarity and brightness to foggy, yellowed headlights for improved visibility and aesthetics.",
  },
  {
    number: "06",
    icon: <FilmIcon />,
    title: "Window Tint & Paint Protection Film",
    description: "High-quality window tinting and PPF installation for style, privacy, and protection.",
  },
]

export function Services() {
  return (
    <section id="services" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-condensed text-royal uppercase tracking-widest text-sm mb-4">What We Offer</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Premium automotive care services tailored to protect and enhance your vehicle.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.number}
              className="group bg-card border border-border rounded-2xl p-6 sm:p-8 hover:border-royal/50 transition-all duration-300"
            >
              {/* Number */}
              <span className="font-condensed text-muted-foreground/30 text-6xl font-bold">
                {service.number}
              </span>
              
              {/* Icon */}
              <div className="mt-4 mb-6 w-16 h-16 bg-royal/10 rounded-xl flex items-center justify-center group-hover:bg-royal/20 transition-colors">
                {service.icon}
              </div>
              
              {/* Content */}
              <h3 className="font-heading text-xl text-white mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
