"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-royal">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-royal">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-royal">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-royal">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export function Contact() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", service: "", message: "" })

  const contactInfo = [
    { icon: <PhoneIcon />, label: t.contact.contactLabels.phone, value: "(561) 555-0123" },
    { icon: <MailIcon />,  label: t.contact.contactLabels.email, value: "info@autowaxsfl.com" },
    { icon: <MapPinIcon />, label: t.contact.contactLabels.address, value: "Royal Palm Beach, FL 33411" },
    { icon: <ClockIcon />, label: t.contact.contactLabels.hours, value: "Mon-Sat: 8AM - 6PM" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <section id="contact" className="py-20 sm:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-condensed text-royal uppercase tracking-widest text-sm mb-4">{t.contact.label}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6">{t.contact.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t.contact.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-2xl text-white mb-8">{t.contact.infoTitle}</h3>
            <div className="space-y-6 mb-10">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-royal/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-condensed text-muted-foreground text-sm uppercase tracking-wide">{item.label}</p>
                    <p className="text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-background rounded-2xl h-64 flex items-center justify-center border border-border">
              <div className="text-center">
                <MapPinIcon />
                <p className="text-muted-foreground mt-2">Royal Palm Beach, FL</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-background border border-border rounded-2xl p-6 sm:p-8">
            <h3 className="font-heading text-2xl text-white mb-6">{t.contact.formTitle}</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="font-condensed text-sm text-muted-foreground uppercase tracking-wide block mb-2">
                  {t.contact.form.name}
                </label>
                <Input
                  type="text"
                  placeholder={t.contact.form.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-card border-border text-white placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-condensed text-sm text-muted-foreground uppercase tracking-wide block mb-2">
                    {t.contact.form.email}
                  </label>
                  <Input
                    type="email"
                    placeholder={t.contact.form.emailPlaceholder}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-card border-border text-white placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="font-condensed text-sm text-muted-foreground uppercase tracking-wide block mb-2">
                    {t.contact.form.phone}
                  </label>
                  <Input
                    type="tel"
                    placeholder={t.contact.form.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-card border-border text-white placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="font-condensed text-sm text-muted-foreground uppercase tracking-wide block mb-2">
                  {t.contact.form.service}
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-card border border-border text-white"
                >
                  <option value="" className="bg-card">{t.contact.form.servicePlaceholder}</option>
                  {t.contact.services.map((service) => (
                    <option key={service} value={service} className="bg-card">{service}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-condensed text-sm text-muted-foreground uppercase tracking-wide block mb-2">
                  {t.contact.form.message}
                </label>
                <textarea
                  rows={4}
                  placeholder={t.contact.form.messagePlaceholder}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-card border border-border text-white placeholder:text-muted-foreground resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-condensed uppercase tracking-wide py-6"
              >
                {t.contact.form.submit}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
