import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-r from-navy via-secondary to-navy relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
          Schedule Your Appointment
        </h2>
        <p className="text-white/80 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
          Ready to give your vehicle the premium care it deserves? Book your appointment today and experience the Auto Wax difference.
        </p>
        <Button 
          size="lg"
          className="bg-brand-red hover:bg-brand-red/90 text-white font-condensed uppercase tracking-wide px-10 py-6 text-lg"
        >
          Reserve a Slot
        </Button>
      </div>
    </section>
  )
}
