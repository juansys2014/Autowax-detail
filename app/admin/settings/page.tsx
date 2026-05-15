"use client"

import { Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your business settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
