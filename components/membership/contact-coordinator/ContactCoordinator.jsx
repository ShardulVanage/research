"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, User, MessageCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export const ContactCoordinator = () => {
  const coordinators = [
    {
      id: 1,
      name: "Abhinash",
      title: "Academic Coordinator",
      department: "Conferences & Events",
      email: "sarah.johnson@research.org",
      phone: "+1 (555) 123-4567",
      specialization: "Conference Registration",
      bio: "Specializes in conference registration and speaker coordination",
      color: "from-cyan-500 to-blue-500",
      lightColor: "from-cyan-100 to-blue-100",
      darkColor: "from-cyan-900/40 to-blue-900/40",
    },
    {
      id: 2,
      name: "Abhinash ",
      title: "Logistics Manager",
      department: "Accommodation & Travel",
      email: "michael.chen@research.org",
      phone: "+1 (555) 234-5678",
      specialization: "Accommodation & Travel",
      bio: "Handles all accommodation and travel arrangements for events",
      color: "from-blue-500 to-purple-500",
      lightColor: "from-blue-100 to-purple-100",
      darkColor: "from-blue-900/40 to-purple-900/40",
    },
    {
      id: 3,
      name: "Abhinash Rodriguez",
      title: "Publication Support Officer",
      department: "Publications",
      email: "emily.rodriguez@research.org",
      phone: "+1 (555) 345-6789",
      specialization: "Journal Submissions",
      bio: "Provides guidance and support for journal submissions and publications",
      color: "from-purple-500 to-pink-500",
      lightColor: "from-purple-100 to-pink-100",
      darkColor: "from-purple-900/40 to-pink-900/40",
    },
    {
      id: 4,
      name: "Abhinash Williams",
      title: "Events Coordinator",
      department: "Member Services",
      email: "david.williams@research.org",
      phone: "+1 (555) 456-7890",
      specialization: "General Inquiries",
      bio: "General member support and event coordination",
      color: "from-pink-500 to-cyan-500",
      lightColor: "from-pink-100 to-cyan-100",
      darkColor: "from-pink-900/40 to-cyan-900/40",
    },
  ]

  const handleEmail = (email) => {
    window.location.href = `mailto:${email}`
  }

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Support Team</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
            Contact Our Team
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Get in touch with our coordinators for any assistance you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {coordinators.map((coordinator) => (
            <Card
              key={coordinator.id}
              className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group"
            >
              {/* Colored Header Bar */}
              <div className={`h-1.5 bg-gradient-to-r ${coordinator.color}`} />

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 bg-gradient-to-br ${coordinator.lightColor} dark:bg-gradient-to-br ${coordinator.darkColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
                <CardTitle className="text-base text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {coordinator.name}
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {coordinator.title}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <Badge
                  variant="secondary"
                  className="w-fit text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0"
                >
                  {coordinator.department}
                </Badge>

                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Specialization
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {coordinator.specialization}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
                    {coordinator.bio}
                  </p>
                </div>

                <div className="pt-3 space-y-2">
                  <Button
                    onClick={() => handleEmail(coordinator.email)}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs h-8 border-gray-300 dark:border-gray-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-200"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span className="truncate text-xs">{coordinator.email}</span>
                  </Button>

                  <Button
                    onClick={() => handleCall(coordinator.phone)}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs h-8 border-gray-300 dark:border-gray-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-200"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs">{coordinator.phone}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Office Card */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

          <CardHeader className="pb-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 rounded-xl">
                <MapPin className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Main Office</CardTitle>
               
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Main Office</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
             Flat No: 202 Plot.no.2028/2044, Sai Aarti Enclave, Behind Tanishq Chandasekharpur, Bhubaneshwar, India
            </p>
            <div className="flex gap-3">
              <Link href={'https://maps.app.goo.gl/73u1WJGmRFRKxnd17'}>
              <Button
                className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 dark:from-cyan-600 dark:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 text-white border-0 shadow-md transition-all duration-300"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </Button>
              </Link>
              {/* <Button
                variant="outline"
                className="gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
                Contact
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
