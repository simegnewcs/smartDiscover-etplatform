'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, ChevronRight, Compass, Sparkles, Play, Pause } from 'lucide-react'

// Ethiopian landmarks with better quality images
const ethiopianLandmarks = [
  {
    name: 'Lalibela Rock Churches',
    image: 'https://images.unsplash.com/photo-1535320404287-416e1c1b2e70?w=1920&q=80',
    description: 'Ancient UNESCO World Heritage rock-hewn churches'
  },
  {
    name: 'Simien Mountains',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    description: 'Breathtaking highlands & endemic wildlife'
  },
  {
    name: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=80',
    description: 'Vibrant capital of modern Ethiopia'
  },
  {
    name: 'Axum Stelae',
    image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1920&q=80',
    description: 'Ancient obelisks of the Axumite Empire'
  },
  {
    name: 'Blue Nile Falls',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1920&q=80',
    description: 'Smoking Water — Tis Issat'
  }
]

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Auto-rotate background images every 5 seconds
  useEffect(() => {
    if (!isAutoPlay) return
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % ethiopianLandmarks.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlay])

  const ethiopianCities = [
    'All Locations',
    'Addis Ababa',
    'Bahir Dar',
    'Hawassa',
    'Mekelle',
    'Dire Dawa',
    'Adama',
    'Gondar',
    'Jimma',
    'Jijiga',
    'Dessie',
    'Shashamane',
    'Debre Markos',
    'Kombolcha',
    'Nekemte',
    'Woliso',
    'Sebeta',
    'Debre Birhan',
    'Assosa',
    'Gambela',
    'Arba Minch',
    'Sodo',
    'Hosaena',
    'Alamata',
    'Shire',
    'Adigrat',
    'Debre Tabor',
    'Weldiya',
    'Ambo',
    'Gore',
    'Metu',
    'Tepi',
    'Negele',
    'Gimbi',
    'Bule Hora',
    'Bedesa',
    'Guraghe',
    'Butajira',
    'Worabe',
    'Wolaita Sodo',
    'Durame',
    'Boditi',
    'Sululta',
    'Sebeta',
    'Dukem',
    'Debre Zeyit',
    'Modjo',
    'Ziway',
    'Meki',
    'Awasa',
    'Shashemene',
    'Kemise',
    'Debark',
    'Lalibela',
    'Axum',
    'Adwa',
    'Adigrat',
    'Shire',
    'Humera',
    'Gondar',
    'Bahir Dar',
    'Debre Tabor',
    'Mekane Selam',
    'Finote Selam',
    'Injibara',
    'Metekel',
    'Pawe',
    'Bulan Bore',
    'Mendi',
    'Gambela',
    'Gog',
    'Dima',
    'Bonga',
    'Mizan Teferi',
    'Tepi',
    'Maji',
    'Yirgalem',
    'Bule',
    'Hagereselam',
    'Wolayita Sodo',
    'Areka',
    'Sodo',
    'Boditi',
    'Arba Minch',
    'Chencha',
    'Sawla',
    'Jinka',
    'Konso',
    'Moyale',
    'Yabelo',
    'Mega',
    'Gode',
    'Degehabur',
    'Kebri Dehar',
    'Shinile',
    'Dire Dawa',
    'Harar',
    'Chiro',
    'Mieso',
    'Gursum',
    'Babile',
    'Jijiga',
    'Dega Habur',
    'Aware',
    'Shinile',
    'Erer',
    'Gursum',
    'Hargeisa',
    'Berbera',
    'Borama',
    'Burao',
    'Las Anod',
    'Garowe',
    'Bosaso',
    'Qardho',
    'Galkayo',
    'Jowhar',
    'Baidoa',
    'Kismayo',
    'Merca',
    'Barawa',
    'Afgooye',
    'Marka',
    'Janaale',
    'Brava',
    'Luuq',
    'Bardera',
    'Garbaharey',
    'Buurdhuubo',
    'Doolow',
    'Beled Hawo',
    'El Wak',
    'Mandera',
    'Wajir',
    'Garissa',
    'Moyale',
    'Isiolo',
    'Marsabit',
    'Lodwar',
    'Lokichoggio',
    'Kakuma',
    'Moyale',
    'Moyale',
    'Moyale'
  ]

  return (
    <div className="relative min-h-[700px] lg:min-h-[800px] overflow-hidden">
      {/* Animated Background Images with Crossfade */}
      <div className="absolute inset-0">
        {ethiopianLandmarks.map((landmark, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1500 ease-in-out ${
              index === currentBgIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
            style={{ 
              backgroundImage: `url(${landmark.image})`,
              transitionDelay: index === currentBgIndex ? '0ms' : '0ms'
            }}
          />
        ))}
        
        {/* Rich Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#006747]/90 via-[#006747]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#EEF578]/10 via-transparent to-[#006747]/30" />
        
        {/* Animated Floating Particles - Ethiopian Stars Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#EEF578] rounded-full animate-pulse opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Ethiopian Pattern Overlay - Subtle cultural texture */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Background Image Controls */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4">
        {/* Progress Dots with Labels */}
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
          {ethiopianLandmarks.map((landmark, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentBgIndex(index)
                setIsAutoPlay(false)
              }}
              className="group relative flex flex-col items-center"
            >
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentBgIndex === index 
                  ? 'bg-[#EEF578] w-8' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}>
                {currentBgIndex === index && isAutoPlay && (
                  <div 
                    className="absolute inset-0 bg-white/50 rounded-full origin-left"
                    style={{
                      animation: 'progress 5s linear'
                    }}
                  />
                )}
              </div>
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {landmark.name}
              </span>
            </button>
          ))}
        </div>
        
        {/* Auto-play Toggle */}
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition-colors text-sm"
        >
          {isAutoPlay ? (
            <>
              <Pause className="w-3 h-3" />
              <span>Pause Slideshow</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              <span>Play Slideshow</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-2 bg-[#006747]/80 backdrop-blur-sm border border-[#EEF578]/30 rounded-full px-4 py-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-[#EEF578] animate-pulse" />
                <span className="text-sm font-medium text-white">
                  {ethiopianLandmarks[currentBgIndex].name}
                </span>
              </div>

              {/* Animated Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block animate-slideUp">Discover Ethiopia's</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#EEF578] via-[#FFD700] to-[#FFA500] animate-slideUp animation-delay-200">
                  Finest Places
                </span>
              </h1>

              {/* Animated Subtitle */}
              <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed animate-fadeIn animation-delay-300">
                Explore the <span className="text-[#EEF578] font-semibold">land of origins</span> — from ancient rock-hewn churches of Lalibela 
                to the breathtaking peaks of the Simien Mountains. Find hotels, restaurants, 
                and experiences across Ethiopia.
              </p>

              {/* Animated Search Bar - Enhanced Glassmorphism */}
              <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-2xl p-2 max-w-2xl shadow-2xl animate-fadeIn animation-delay-400 hover:bg-white/20 transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Search Input */}
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/95 rounded-xl shadow-inner">
                    <Search className="w-5 h-5 text-[#006747] flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search hotels, restaurants, places..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 outline-none text-neutral-800 placeholder-neutral-500 bg-transparent text-sm font-medium"
                    />
                  </div>
                  
                  {/* Location Dropdown */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/95 rounded-xl shadow-inner">
                    <MapPin className="w-5 h-5 text-[#006747] flex-shrink-0" />
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="outline-none text-neutral-700 bg-transparent text-sm min-w-[120px] cursor-pointer font-medium"
                    >
                      {ethiopianCities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Button - Ethiopian Green */}
                  <Link 
                    href={`/businesses?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedLocation)}`}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#006747] to-[#00523A] hover:from-[#00523A] hover:to-[#00402C] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    <span>Explore</span>
                    <ChevronRight className="w-4 h-4 animate-bounce" />
                  </Link>
                </div>
              </div>

              {/* Animated Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm animate-fadeIn animation-delay-500">
                <div className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-[#EEF578]/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-[#EEF578]/30 transition-all duration-300 group-hover:scale-110">
                    <Compass className="w-5 h-5 text-[#EEF578]" />
                  </div>
                  <span className="font-medium">1000+ Places</span>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-[#EEF578]/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-[#EEF578]/30 transition-all duration-300 group-hover:scale-110">
                    <MapPin className="w-5 h-5 text-[#EEF578]" />
                  </div>
                  <span className="font-medium">80+ Cities</span>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-[#EEF578]/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-[#EEF578]/30 transition-all duration-300 group-hover:scale-110">
                    <Sparkles className="w-5 h-5 text-[#EEF578]" />
                  </div>
                  <span className="font-medium">Top Rated</span>
                </div>
              </div>
            </div>

            {/* Right Content - Featured Cards */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Animated Featured Card */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-2xl animate-fadeIn animation-delay-600 hover:bg-white/15 transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#EEF578]" />
                      Featured Destinations
                    </h3>
                    <span className="text-white/60 text-sm bg-white/10 px-2 py-1 rounded-full">
                      {currentBgIndex + 1}/{ethiopianLandmarks.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {ethiopianLandmarks.map((landmark, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentBgIndex(index)
                          setIsAutoPlay(false)
                        }}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left group ${
                          currentBgIndex === index
                            ? 'bg-gradient-to-r from-[#006747]/50 to-[#006747]/30 border border-[#EEF578]/50 shadow-lg'
                            : 'bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/20'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/20 group-hover:ring-[#EEF578]/50 transition-all duration-300">
                          <img 
                            src={landmark.image} 
                            alt={landmark.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium truncate ${
                            currentBgIndex === index ? 'text-white' : 'text-white/90'
                          }`}>
                            {landmark.name}
                          </h4>
                          <p className="text-white/60 text-sm truncate">{landmark.description}</p>
                        </div>
                        {currentBgIndex === index && (
                          <div className="w-3 h-3 bg-[#EEF578] rounded-full flex-shrink-0 animate-pulse shadow-lg shadow-[#EEF578]/50" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link 
                    href="/businesses"
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#EEF578]/20 to-[#EEF578]/10 hover:from-[#EEF578]/30 hover:to-[#EEF578]/20 border border-[#EEF578]/30 text-white py-3 rounded-xl font-medium transition-all duration-300 group"
                  >
                    <span>View All Destinations</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Enhanced Decorative Elements with Animation */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#EEF578]/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-[#006747]/40 rounded-full blur-3xl animate-pulse animation-delay-1000" />
                <div className="absolute top-1/2 -right-8 w-20 h-20 bg-[#FFD700]/20 rounded-full blur-2xl animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
