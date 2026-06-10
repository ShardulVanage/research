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
      color: "from-blue-500 to-cyan-500",
      lightColor: "from-blue-100 to-cyan-100",
      darkColor: "from-blue-900/40 to-cyan-900/40",
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
      color: "from-cyan-500 to-blue-500",
      lightColor: "from-cyan-100 to-blue-100",
      darkColor: "from-cyan-900/40 to-blue-900/40",
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
      color: "from-blue-500 to-cyan-500",
      lightColor: "from-blue-100 to-cyan-100",
      darkColor: "from-blue-900/40 to-cyan-900/40",
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
        <div className="mb-12 flex flex-col items-center text-center">
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

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {coordinators.map((coordinator) => (
            <Card
              key={coordinator.id}
              className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group"
            >
            
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
        </div> */}

        {/* Main Office Card */}
        <Card className="overflow-hidden max-w-7xl mx-auto  shadow-lg bg-gradient-to-br from-white to-white border-1  dark:from-cyan-900/20 dark:to-blue-900/20">
  <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />

  <div className="flex min-h-[280px]">
    {/* Left: Google Maps Embed */}
    <div className="flex-1 min-w-0 bg-slate-200">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d65361457.19497969!2d113.81235615!3d-0.88092185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa66f2e453767b0c1%3A0x3e57812412af4784!2sZep%20Research%20(OPC)%20Pvt.%20Ltd!5e0!3m2!1sen!2sin!4v1781030699777!5m2!1sen!2sin"
         width="100%"
        height="100%"
        className="border-0 block min-h-[280px]"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>

    {/* Right: Contact Info */}
    <div className="flex-[1.1] p-6 flex flex-col gap-0 min-w-0 ">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/40 rounded-xl">
            <MapPin className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Main Office</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Bhubaneswar, India</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
          Flat No: 202, Plot.no.2028/2044, Sai Aarti Enclave,<br />
          Behind Tanishq, Chandrasekharpur,<br />
          Bhubaneswar, India
        </p>

        {/* Phone number display */}
        <div className="flex items-center gap-2 mb-5">
          <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <a
            href="tel:+919876543210"
            className="text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >+91 82600 80050
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <Link href="https://maps.app.goo.gl/73u1WJGmRFRKxnd17" target="_blank">
            <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 shadow-md transition-all duration-300">
              <MapPin className="w-4 h-4" />
              Get Directions
            </Button>
          </Link>

          <Link href="https://wa.me/918260080050" target="_blank">
            <Button className="gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0 shadow-md transition-all duration-300">
              <Phone className="w-4 h-4  rounded-full bg-transparent" />
              WhatsApp
            </Button>
          </Link>

          <Link href="tel:+918260080050">
            <Button
              variant="outline"
              className="gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </Button>
          </Link>
        </div>
      </CardContent>
    </div>
  </div>
</Card>
      </div>
    </section>
  )
}
