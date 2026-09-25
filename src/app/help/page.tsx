'use client'

import { motion } from 'framer-motion'
import { Search, Star, Store, ArrowRight, UserPlus, CheckCircle2, MapPin } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    id: 1,
    title: 'Find What You Need',
    description: 'Use our powerful search to find restaurants, hotels, pharmacies, and local services anywhere in Ethiopia. Filter by city, category, or rating.',
    icon: Search,
    color: 'bg-blue-100 text-blue-600',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  },
  {
    id: 2,
    title: 'Check Reviews & Details',
    description: 'Read authentic customer reviews, check opening hours, view photos, and get direct contact information and directions.',
    icon: Star,
    color: 'bg-yellow-100 text-yellow-600',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  },
  {
    id: 3,
    title: 'Register Your Business',
    description: 'Are you a business owner? Create a free account to claim your listing, update your details, and reach thousands of daily visitors.',
    icon: Store,
    color: 'bg-green-100 text-[#047857]',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  },
  {
    id: 4,
    title: 'Manage Your Dashboard',
    description: 'Track your business analytics, respond to customer reviews, and update your opening hours directly from your personalized dashboard.',
    icon: UserPlus,
    color: 'bg-purple-100 text-purple-600',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  }
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-24">
      {/* Hero Section */}
      <div className="bg-[#047857] text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            How HelloET Works
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            Your ultimate guide to discovering local businesses or growing your own brand across Ethiopia.
          </motion.p>
        </div>
      </div>

      {/* Step-by-Step Interactive Guide */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="space-y-32">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0
            const Icon = step.icon

            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 lg:gap-24`}
              >
                {/* Text Content */}
                <div className="flex-1 space-y-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color} shadow-sm`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold text-neutral-800 mb-2">
                      <span className="text-neutral-400 text-2xl mr-3">0{step.id}.</span>
                      {step.title}
                    </h2>
                    <div className="w-20 h-1.5 bg-[#047857] rounded-full mt-4 mb-6"></div>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 + 0.4 }}
                        className="flex items-center gap-3 text-neutral-700 font-medium"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#047857]" />
                        {index === 0 && (i === 0 ? 'Search by keyword' : i === 1 ? 'Filter by location' : 'Browse verified categories')}
                        {index === 1 && (i === 0 ? 'Trust real ratings' : i === 1 ? 'View business hours' : 'Find contact info instantly')}
                        {index === 2 && (i === 0 ? '100% Free registration' : i === 1 ? 'Verify your identity' : 'Upload beautiful photos')}
                        {index === 3 && (i === 0 ? 'Track profile views' : i === 1 ? 'Engage with customers' : 'Update info anytime')}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Image Content */}
                <div className="flex-1 w-full">
                  <div className="relative group perspective">
                    <motion.div
                      whileHover={{ scale: 1.02, rotateY: isEven ? -5 : 5 }}
                      transition={{ duration: 0.4 }}
                      className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white bg-white"
                    >
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="w-full h-[400px] object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
                        }}
                      />
                      
                      {/* Floating Badge overlay */}
                      <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 flex items-center gap-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-[#047857] p-3 rounded-full text-white">
                          {isEven ? <MapPin className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-800 text-sm">HelloET Platform</p>
                          <p className="text-xs text-neutral-500 font-medium">Step {step.id} in action</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Decorative Background Blob */}
                    <div className={`absolute -inset-4 bg-gradient-to-r ${isEven ? 'from-green-200 to-emerald-100' : 'from-yellow-100 to-amber-100'} rounded-[3rem] blur-2xl -z-10 opacity-50`}></div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Call to Action Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 mt-20 text-center bg-white rounded-3xl p-12 md:p-20 shadow-xl border border-neutral-100"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-6">
          <Store className="w-8 h-8 text-[#047857]" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-neutral-600 mb-8 max-w-xl mx-auto text-lg">
          Whether you're looking for the best local spots or you want to grow your business, HelloET is here for you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/businesses" 
            className="w-full sm:w-auto px-8 py-4 bg-[#047857] text-white rounded-xl font-bold hover:bg-[#036246] transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Explore Businesses <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/auth/register" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-[#047857] border-2 border-[#047857] rounded-xl font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            Register My Business
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
