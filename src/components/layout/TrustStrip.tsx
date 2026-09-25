import { CheckCircle, Users, Shield, Star } from 'lucide-react'

export default function TrustStrip() {
  const trustItems = [
    {
      icon: CheckCircle,
      title: 'Verified Listings',
      description: 'All businesses are verified and authentic',
      color: 'text-[#047857]'
    },
    {
      icon: Users,
      title: 'Real Local Businesses',
      description: 'Support genuine Ethiopian businesses',
      color: 'text-[#FBBF24]'
    },
    {
      icon: Shield,
      title: 'Trusted Platform',
      description: 'Safe and reliable discovery experience',
      color: 'text-blue-500'
    },
    {
      icon: Star,
      title: 'User Reviews',
      description: 'Honest feedback from real customers',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="bg-neutral-50 py-12 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="text-center"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-neutral-100">
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <h3 className="font-bold text-lg text-neutral-800 mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
