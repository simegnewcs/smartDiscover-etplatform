'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, ChevronRight, Compass, Sparkles } from 'lucide-react'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

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
    <div className="relative min-h-[450px] lg:min-h-[500px] overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/helloet hero video.mp4" type="video/mp4" />
        </video>

      </div>

      {/* Main Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-10 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 mx-auto shadow-lg hover:bg-white/20 transition-all cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-bold text-[#16A34A] tracking-wide uppercase">Trusted by 10,000+ Users in Ethiopia</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#16A34A] leading-tight drop-shadow-2xl mb-4 tracking-tight">
            Find the Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-[#16A34A] drop-shadow-sm">Local Businesses</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium mb-8">
            Discover verified restaurants, luxury hotels, and professional services across Ethiopia with authentic customer reviews.
          </p>



        </div>
      </div>
    </div>
  )
}
