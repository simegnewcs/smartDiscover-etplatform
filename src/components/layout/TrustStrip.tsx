import { Compass, MapPin, Sparkles } from 'lucide-react'

export default function TrustStrip() {
  const trustItems = [
    {
      icon: Compass,
      title: 'Verified Places',
      description: 'Discover trusted businesses that meet our quality standards',
      color: 'text-[#16A34A]'
    },
    {
      icon: MapPin,
      title: 'All Ethiopian Cities',
      description: 'Find local services in Addis Ababa, Dire Dawa, Bahir Dar and more',
      color: 'text-[#16A34A]'
    },
    {
      icon: Sparkles,
      title: 'Authentic Reviews',
      description: 'Read honest feedback from real customers before you visit',
      color: 'text-[#16A34A]'
    }
  ]

  return (
    <div className="bg-white py-12 border-b border-neutral-100 shadow-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="text-center px-4 py-6 md:py-0 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-[#16A34A]/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm transform rotate-3 hover:rotate-6 transition-transform">
                <item.icon className={`w-8 h-8 ${item.color} -rotate-3`} />
              </div>
              <h3 className="font-bold text-xl text-neutral-800 mb-3">{item.title}</h3>
              <p className="text-base text-neutral-500 leading-relaxed max-w-sm mx-auto">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
