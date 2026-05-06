import { CheckCircle, Users, Shield, Star } from 'lucide-react'

export default function TrustStrip() {
  const trustItems = [
    {
      icon: CheckCircle,
      title: 'Verified Listings',
      description: 'All businesses are verified and authentic'
    },
    {
      icon: Users,
      title: 'Real Local Businesses',
      description: 'Support genuine Ethiopian businesses'
    },
    {
      icon: Shield,
      title: 'Trusted Platform',
      description: 'Safe and reliable discovery experience'
    },
    {
      icon: Star,
      title: 'User Reviews',
      description: 'Honest feedback from real customers'
    }
  ]

  return (
    <div className="bg-neutral-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-[#006747] rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
