"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Loader, Hotel } from "lucide-react"
import { getConferences, getCurrentUser } from "@/lib/pocketbase"

export const AccommodationForm = () => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [conferences, setConferences] = useState([])
  const [conferenceLoading, setConferenceLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    event_name: "",
    check_in: "",
    check_out: "",
    guest: "1",
    special_requirments: "",
    dietary_restrictions: "",
  })

  // Fetch conferences on mount
  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const result = await getConferences()
        if (result.success) {
          setConferences(result.data)
        }
      } catch (err) {
        console.error("Failed to fetch conferences:", err)
      } finally {
        setConferenceLoading(false)
      }
    }

    fetchConferences()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)

      const response = await fetch("/api/accommodation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit accommodation request")
      }

      setSubmitted(true)
      setFormData({
        fullname: "",
        email: "",
        phone_number: "",
        event_name: "",
        check_in: "",
        check_out: "",
        guest: "1",
        special_requirments: "",
        dietary_restrictions: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300 min-h-screen flex items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="inline-block mb-4">
              <span className="text-xs sm:text-sm font-semibold text-cyan-600 dark:text-cyan-400  tracking-widest px-4 py-2 rounded-full">
                Logistics
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Book Your Accommodation
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Request accommodation for upcoming events and conferences. We'll help arrange your stay.
            </p>
          </div>

          {/* Card */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"></div>

            <CardHeader className="pb-6 pt-8 px-6 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex-shrink-0">
                  <Hotel className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl sm:text-3xl text-gray-900 dark:text-white">Accommodation Details</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                    Fill in the form to request accommodation for your event
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 sm:px-8 pb-8">{error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 dark:text-red-200 font-semibold text-sm">Error</p>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {submitted && (
                <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 dark:text-green-200 font-semibold text-sm">Request submitted successfully!</p>
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                      We will contact you shortly with accommodation details
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullname"
                      name="fullname"
                      placeholder="John Doe"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Phone and Event Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_name" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Event Name <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.event_name}
                      onValueChange={(value) => handleSelectChange("event_name", value)}
                      disabled={conferenceLoading}
                    >
                      <SelectTrigger 
                        id="event_name" 
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full"
                      >
                        <SelectValue placeholder={conferenceLoading ? "Loading events..." : "Select an event"} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700">
                        {conferences.length > 0 ? (
                          conferences.map((conference) => (
                            <SelectItem key={conference.id} value={conference.title} className="truncate">
                              {conference.title}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                            {conferenceLoading ? "Loading..." : "No events available"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Check-in and Check-out Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="check_in" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Check-In Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="check_in"
                      name="check_in"
                      type="date"
                      value={formData.check_in}
                      onChange={handleInputChange}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="check_out" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Check-Out Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="check_out"
                      name="check_out"
                      type="date"
                      value={formData.check_out}
                      onChange={handleInputChange}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Guests and Dietary Restrictions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="guest" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Number of Guests <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.guest}
                      onValueChange={(value) => handleSelectChange("guest", value)}
                    >
                      <SelectTrigger id="guest" className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700">
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4 Guests</SelectItem>
                        <SelectItem value="5">5+ Guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietary_restrictions" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Dietary Restrictions
                    </Label>
                    <Input
                      id="dietary_restrictions"
                      name="dietary_restrictions"
                      placeholder="e.g., Vegetarian, Vegan"
                      value={formData.dietary_restrictions}
                      onChange={handleInputChange}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="special_requirments" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    Special Requirements
                  </Label>
                  <Textarea
                    id="special_requirments"
                    name="special_requirments"
                    placeholder="Any special requirements or preferences you'd like us to know about..."
                    value={formData.special_requirments}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 dark:from-cyan-600 dark:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-3 font-semibold text-base"
                  >
                    {loading && <Loader className="w-4 h-4 animate-spin mr-2" />}
                    {loading ? "Submitting..." : "Submit Accommodation Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
