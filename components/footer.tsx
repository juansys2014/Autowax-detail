import Link from "next/link"

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
)

const services = [
  { label: "Professional Detailing", href: "#services" },
  { label: "Ceramic Coating", href: "#services" },
  { label: "Paint Correction", href: "#services" },
  { label: "Ozone Treatment", href: "#services" },
  { label: "Window Tint", href: "#services" },
]

const company = [
  { label: "About Us", href: "#why-us" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
  { label: "Book Now", href: "#contact" },
]

const socials = [
  { icon: <InstagramIcon />, href: "#", label: "Instagram" },
  { icon: <FacebookIcon />, href: "#", label: "Facebook" },
  { icon: <YoutubeIcon />, href: "#", label: "YouTube" },
]

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-royal to-navy rounded-lg flex items-center justify-center">
                <span className="font-heading text-white text-sm">AW</span>
              </div>
              <span className="font-heading text-white text-lg">AUTO WAX</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Premium automotive detailing services in South Florida. Transform your vehicle with our expert care.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-royal hover:border-royal transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-white mb-4">Services</h4>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="font-heading text-white mb-4">Follow Us</h4>
            <p className="text-muted-foreground mb-4">
              Stay updated with our latest work and special offers.
            </p>
            <div className="flex flex-col gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors"
                >
                  {social.icon}
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Auto Wax South Florida. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
