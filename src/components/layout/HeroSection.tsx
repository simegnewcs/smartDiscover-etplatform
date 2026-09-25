'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, ChevronRight, Compass, Sparkles, Play, Pause } from 'lucide-react'

// Ethiopian landmarks with better quality images
const ethiopianLandmarks = [
  {
    name: 'Addis Ababa Skyline',
    image: 'https://images.unsplash.com/photo-1522818610486-48c665f80fc2?w=1920&q=80',
    description: 'The vibrant and modern capital of Ethiopia'
  },
  {
    name: 'Gondar — Fasilides Castle',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920&q=80',
    description: 'Royal enclosure of medieval Ethiopian emperors'
  },
  {
    name: 'Lake Tana',
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=1920&q=80',
    description: 'Source of the Blue Nile — sacred island monasteries'
  },
  {
    name: 'Simien Mountains',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    description: 'Breathtaking highlands & endemic wildlife'
  },
  {
    name: 'Blue Nile Falls',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80',
    description: 'Tis Issat — The Smoking Water near Bahir Dar'
  },
  {
    name: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=1920&q=80',
    description: 'Vibrant capital of modern Ethiopia'
  },
  {
    name: 'Axum Stelae',
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&q=80',
    description: 'Ancient obelisks of the Axumite Empire'
  },
  {
    name: 'Omo Valley',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80',
    description: 'Home to diverse indigenous tribes of Ethiopia'
  },
  {
    name: 'Bale Mountains',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    description: 'Africa\'s largest Afroalpine ecosystem'
  },
  {
    name: 'Harar Old City',
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1920&q=80',
    description: 'UNESCO walled city — 4th holiest city in Islam'
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
        
        {/* Light Overlays — images stay clearly visible */}
        <div className="absolute inset-0 bg-black/40" />
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
                  ? 'bg-[#FBBF24] w-8' 
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center text-center">
            {/* Centered Content */}
            <div className="text-white space-y-6 w-full">
              {/* Clean Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center drop-shadow-md">
                Discover Ethiopia's Finest Places
              </h1>

              {/* Clean Subtitle */}
              <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed text-center drop-shadow-sm font-medium">
                Find the best hotels, restaurants, and experiences across the land of origins.
              </p>

              {/* Professional Search Bar */}
              <div className="bg-white rounded-xl p-2 max-w-4xl w-full mx-auto shadow-2xl mt-8">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                  {/* Search Input */}
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white rounded-lg hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200">
                    <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 outline-none text-neutral-800 placeholder-neutral-500 bg-transparent text-base"
                    />
                  </div>
                  
                  {/* Divider */}
                  <div className="hidden md:block w-px h-8 bg-neutral-200 mx-2"></div>

                  {/* Location Dropdown */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200">
                    <MapPin className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="outline-none text-neutral-700 bg-transparent text-base min-w-[160px] cursor-pointer"
                    >
                      {ethiopianCities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Button */}
                  <Link 
                    href={`/businesses?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedLocation)}`}
                    className="flex items-center justify-center bg-[#047857] hover:bg-[#036246] text-white px-8 py-4 md:py-3 rounded-lg font-semibold transition-colors mt-2 md:mt-0"
                  >
                    <span>Search</span>
                  </Link>
                </div>
              </div>

              {/* Clean Quick Stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-white mt-10">
                <div className="flex items-center gap-2 text-sm font-medium drop-shadow-sm">
                  <Compass className="w-4 h-4 text-white/80" />
                  <span> Verified Places</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium drop-shadow-sm">
                  <MapPin className="w-4 h-4 text-white/80" />
                  <span>Available in Ethiopia</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium drop-shadow-sm">
                  <Sparkles className="w-4 h-4 text-white/80" />
                  <span>Real Customer Reviews</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
