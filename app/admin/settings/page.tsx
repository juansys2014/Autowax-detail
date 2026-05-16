"use client"

import { useState, useRef } from "react"
import { Save, Upload, ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

function LogoUploadBox({
  label, description, recommended, hint, accept = "image/png,image/svg+xml,image/jpeg"
}: {
  label: string; description: string; recommended: string; hint: string; accept?: string
}) {
  const [preview, setPreview] = useState<string|null>(null)
  const [fileName, setFileName] = useState<string|null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label>{label}</Label>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {preview && (
          <button onClick={()=>{setPreview(null);setFileName(null)}}
            className="text-xs text-red-400 hover:text-red-300">Remove</button>
        )}
      </div>

      {/* Upload zone */}
      <div
        onClick={()=>inputRef.current?.click()}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f)}}
        className="border-2 border-dashed border-[#2a2a2a] hover:border-[#4a8fe8]/50 rounded-xl p-6 cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 bg-[#0f0f0f] hover:bg-[#4a8fe8]/5 min-h-[140px]">
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}}/>

        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white rounded-lg p-3 shadow">
              <img src={preview} alt="Logo preview" className="max-h-16 max-w-32 object-contain"/>
            </div>
            <p className="text-xs text-green-400">✓ {fileName}</p>
            <p className="text-xs text-muted-foreground">Click to change</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-500"/>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400"><span className="text-[#4a8fe8]">Click to upload</span> or drag & drop</p>
              <p className="text-xs text-gray-600 mt-1">{accept.replace(/image\//g,'').replace(/,/g,' · ').toUpperCase()}</p>
            </div>
          </>
        )}
      </div>

      {/* Size recommendations */}
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-3 space-y-1">
        <p className="text-xs font-medium text-gray-400">Recommended size</p>
        <p className="text-xs text-[#4a8fe8] font-mono">{recommended}</p>
        <p className="text-xs text-gray-600">{hint}</p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your business settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── LOGO & BRANDING ── */}
        <Card className="bg-[#1e1e1e] border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#4a8fe8]"/>
              Logo & Branding
            </CardTitle>
            <CardDescription>Upload your logos for the website and mobile app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">

              <LogoUploadBox
                label="Website Logo"
                description="Displayed in the navbar and landing page"
                recommended="400 × 120 px — PNG or SVG"
                hint="Transparent background recommended. Max 2MB."
                accept="image/png,image/svg+xml,image/jpeg"
              />

              <LogoUploadBox
                label="Seller App Logo"
                description="Displayed in the seller PWA header"
                recommended="200 × 60 px — PNG or SVG"
                hint="Transparent background. Will appear on dark background."
                accept="image/png,image/svg+xml"
              />

              <LogoUploadBox
                label="App Icon (PWA)"
                description="Home screen icon when app is installed on phone"
                recommended="512 × 512 px — PNG only"
                hint="Square image, no transparency. Used for iOS & Android home screen icon."
                accept="image/png"
              />

            </div>

            <div className="mt-6 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 mb-2">📱 How to install the app on a phone</p>
              <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-500">
                <div>
                  <p className="text-gray-300 font-medium mb-1">iPhone (Safari)</p>
                  <p>Open the app URL → tap Share button → "Add to Home Screen" → the App Icon will appear</p>
                </div>
                <div>
                  <p className="text-gray-300 font-medium mb-1">Android (Chrome)</p>
                  <p>Open the app URL → tap ⋮ menu → "Add to Home Screen" or "Install App" → confirm</p>
                </div>
              </div>
              <p className="text-xs text-yellow-500/80 mt-3">⚠ The 512×512 App Icon is required for the phone home screen icon. Upload it above before installing the app.</p>
            </div>

            <div className="mt-4 flex justify-end">
              <Button className="bg-[#4a8fe8] hover:bg-[#3a7fd8]">
                <Save className="mr-2 h-4 w-4"/>
                Save Logos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="bg-[#1e1e1e] border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Business Information</CardTitle>
            <CardDescription>Update your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" defaultValue="Auto Wax South Florida" className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue="(305) 555-0000" className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" defaultValue="info@autowaxsfl.com" className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Ocean Drive, Miami, FL 33139" className="bg-background border-border" />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card className="bg-[#1e1e1e] border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Booking Settings</CardTitle>
            <CardDescription>Configure appointment preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-confirm Appointments</Label>
                <p className="text-xs text-muted-foreground">Automatically confirm new bookings</p>
              </div>
              <Switch />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive email for new bookings</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive SMS for new bookings</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="space-y-2">
              <Label htmlFor="slotDuration">Default Slot Duration (minutes)</Label>
              <Input id="slotDuration" type="number" defaultValue="60" className="bg-background border-border" />
            </div>
          </CardContent>
        </Card>

        {/* Commission Settings */}
        <Card className="bg-[#1e1e1e] border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Commission Settings</CardTitle>
            <CardDescription>Default commission rates for sellers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultRate">Default Commission Rate (%)</Label>
              <Input id="defaultRate" type="number" defaultValue="10" className="bg-background border-border" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-calculate Commissions</Label>
                <p className="text-xs text-muted-foreground">Calculate commissions on invoice completion</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Commission Notifications</Label>
                <p className="text-xs text-muted-foreground">Notify sellers of pending commissions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="bg-[#1e1e1e] border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Business Hours</CardTitle>
            <CardDescription>Set your operating hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Opening Time</Label>
                <Input id="openTime" type="time" defaultValue="08:00" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input id="closeTime" type="time" defaultValue="18:00" className="bg-background border-border" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Open on Weekends</Label>
                <p className="text-xs text-muted-foreground">Accept Saturday & Sunday bookings</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Save Hours
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
