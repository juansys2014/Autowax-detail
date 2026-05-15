const services = [
  "Professional Detailing",
  "Ceramic Coating",
  "Paint Correction",
  "Ozone Treatment",
  "Window Tint",
  "Headlight Restoration",
]

export function Marquee() {
  return (
    <div className="bg-brand-red py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...services, ...services, ...services, ...services].map((service, index) => (
          <span key={index} className="mx-8 font-condensed text-white uppercase tracking-widest text-sm sm:text-base">
            {service}
            <span className="mx-8 text-white/50">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
