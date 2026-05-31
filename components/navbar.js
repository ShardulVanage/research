"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Search, Plus, User, LogOut, Sun, Moon, Monitor, Menu, X, Book, FileText, Crown, ExternalLink } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"
import { NoiseBackground } from "@/components/ui/noise-background"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export const Navbar = () => {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ]

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Zep Research" width={120} height={36} />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search publications, authors..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle & Create Button */}
            <div className="flex items-end justify-center">
              <NoiseBackground
                containerClassName="w-fit p-2 rounded-full mx-auto"
                gradientColors={[
                  "rgb(59, 130, 246)",
                  "rgb(37, 99, 235)",
                  "rgb(14, 165, 233)",
                ]}
              >
                <div className="flex items-center gap-2">
                  {/* Theme Toggle */}
                  <div className="flex items-center gap-1 p-1 bg-linear-to-r from-neutral-100 via-neutral-100 to-white rounded-full text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                    {themeOptions.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          theme === value
                            ? "bg-cyan-500 text-white shadow-lg"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        title={label}
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>

                  {/* Create Publication Button */}
                  <Link href="/create-publication">
                    <button className="h-full w-full inline-flex gap-2 items-center cursor-pointer text-sm rounded-full bg-linear-to-r from-neutral-100 via-neutral-100 to-white px-4 py-2 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-98 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                      <Plus size={16} />
                      <span className="hidden lg:inline">Create</span>
                    </button>
                  </Link>
                </div>
              </NoiseBackground>
            </div>

            {/* User Menu — shadcn DropdownMenu */}
            <div className="border-l-4 pl-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none">
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user, user.avatar) || "/placeholder.svg"}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                    <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name || user?.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">

                  {/* Profile section */}
                  <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-2 py-1">
                    Profile
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User size={15} />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/membership" className="flex items-center gap-2 cursor-pointer pl-6">
                      <Crown size={15} />
                      My Membership
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Journals section */}
                  <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-2 py-1">
                    Journals
                  </DropdownMenuLabel>
                 <DropdownMenuItem asChild>
  <Link href="/journals" className="flex items-center gap-2 cursor-pointer">
    <Book size={15} />
    Journals
  </Link>
</DropdownMenuItem>
<DropdownMenuItem asChild>
<Link href="/journals/my-submission" className="flex items-center gap-2 cursor-pointer pl-6">
    <FileText size={15} />
    My Submissions
  </Link>
</DropdownMenuItem>
 <DropdownMenuSeparator />
                  {/* Visit main website */}
                  <DropdownMenuItem asChild>
                    <a
                      href="https://zepresearch.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2  cursor-pointer mx-1 my-2 rounded-md bg-cyan-500 hover:bg-cyan-600 text-white focus:bg-cyan-600 focus:text-white px-3 py-2"
                    >
                      <ExternalLink size={15} className="text-white "/>
                      <span className="font-medium">Visit Zep Research</span>
                    </a>
                  </DropdownMenuItem>


                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={signOut}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search publications, authors..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              <Link
                href="/create-publication"
                className="flex items-center gap-2 px-4 py-2 text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Plus size={16} />
                Create Publication
              </Link>

              {/* Profile group */}
              <p className="px-4 pt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Profile</p>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} />
                My Profile
              </Link>
              <Link
                href="/membership"
                className="flex items-center gap-2 px-8 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Crown size={16} />
                My Membership
              </Link>

              {/* Journals group */}
              <p className="px-4 pt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Journals</p>
              <Link
                href="/journals"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Book size={16} />
                Journals
              </Link>
              <Link
                href="/journals/my-submissions"
                className="flex items-center gap-2 px-8 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText size={16} />
                My Submissions
              </Link>



              <div className="pt-2">
                <button
                  onClick={() => { signOut(); setIsMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
               
            </div>

            {/* Mobile Theme Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <a
                      href="https://zepresearch.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2  cursor-pointer mx-1 my-2 rounded-md bg-cyan-500 hover:bg-cyan-600 text-white focus:bg-cyan-600 focus:text-white px-3 py-2"
                    >
                      <ExternalLink size={15} className="text-white "/>
                      <span className="font-medium">Visit Zep Research</span>
                    </a>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</p>
              <div className="flex gap-2">
                {themeOptions.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      theme === value
                        ? "bg-cyan-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}