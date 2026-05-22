"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system"
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme) => {
    const root = window.document.documentElement
    
    // Add transition class for smooth color change
    root.style.transition = "background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease"
    
    root.classList.remove("light", "dark")

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  const setThemeMode = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  return <ThemeContext.Provider value={{ theme, setTheme: setThemeMode }}>{children}</ThemeContext.Provider>
}
