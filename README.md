# HelloET - Local Discovery Platform for Ethiopia
A modern, trusted local discovery platform built with Next.js, TypeScript, and MySQL to help users discover businesses across Ethiopia.

## Features

### Core Features
- **Business Discovery**: Search and browse businesses by category, location, and keywords
- **Business Profiles**: Detailed business information with photos, hours, reviews, and contact details
- **SEO-Optimized**: Programmatic SEO for category and location pages
- **Mobile-First Design**: Responsive design that works perfectly on all devices
- **Trust System**: Verified business listings and user reviews

### Business Dashboard
- **Listing Management**: Business owners can claim and manage their listings
- **Analytics**: Track views, calls, and customer engagement
- **Review Management**: Respond to customer reviews
- **Promotion Tools**: Featured listings and boosted visibility

### Admin Features
- **User Management**: Control user roles and permissions
- **Business Verification**: Approve and verify business listings
- **Content Moderation**: Manage reviews and business content
- **Analytics Dashboard**: Platform-wide insights and metrics

## 🛠 Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** + **Zod** for forms
- **Lucide React** for icons

### Backend
- **Next.js API Routes** (full-stack approach)
- **Prisma** ORM for database management
- **MySQL** database

### Deployment
- **Vercel** (recommended for frontend + API)
- **PlanetScale** or managed MySQL for database

## 📁 Project Structure

```
src/
 ├── app/                    # Next.js App Router
 │   ├── page.tsx           # Home page
 │   ├── business/[slug]/    # Business detail pages
 │   ├── dashboard/          # Business dashboard
 │   ├── api/               # API routes
 │   └── layout.tsx         # Root layout
 │
 ├── components/
 │   ├── layout/            # Layout components
 │   ├── business/          # Business-related components
 │   ├── dashboard/         # Dashboard components
 │   ├── search/            # Search components
 │   └── ui/               # Reusable UI components
 │
 ├── lib/
 │   ├── prisma.ts         # Prisma client
 │   ├── auth.ts           # Authentication utilities
 │   └── validation.ts     # Form validation schemas
 │
 └── types/                 # TypeScript type definitions
```

## 🎨 Brand Design System

### Colors
- **Primary Green**: `#16A34A`
- **Soft Green**: `#DCFCE7`
- **White**: `#FFFFFF`
- **Neutral Text**: `#111827`
- **Soft Border**: `#E5E7EB`

### Design Principles
- Clean and spacious layout
- Trust-first approach
- Mobile-first responsive design
- High readability and accessibility

## 📊 Database Schema

### Core Tables
- **users**: User accounts and roles
- **businesses**: Business listings and details
- **categories**: Business categories
- **cities** & **subcities**: Geographic data
- **reviews**: User reviews and ratings
- **business_images**: Business photo galleries
- **business_hours**: Operating hours
- **subscriptions**: Business subscription plans
- **analytics_events**: Tracking and analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd helloet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/helloet"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Seed the database** (optional)
   ```bash
   npx prisma db seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📝 API Endpoints

### Public APIs
- `GET /api/search` - Search businesses
- `GET /api/business/[slug]` - Get business details
- `GET /api/categories` - List all categories
- `GET /api/locations` - Get cities and subcities

### Business APIs (Auth Required)
- `POST /api/business/claim` - Claim a business listing
- `PUT /api/dashboard/business/[id]` - Update business info
- `POST /api/dashboard/upload` - Upload images
- `GET /api/dashboard/analytics` - View analytics

### Admin APIs
- Business approval and management
- User management
- Content moderation
- Platform analytics

## 🎯 MVP Roadmap

### Phase 1 ✅
- [x] Home page with hero search
- [x] Category browsing
- [x] Business detail pages
- [x] Search functionality
- [x] Basic API structure
- [x] Database schema

### Phase 2 (In Progress)
- [ ] User authentication
- [ ] Business claiming system
- [ ] Review system
- [ ] Business dashboard
- [ ] Analytics tracking

### Phase 3 (Future)
- [ ] Subscription system
- [ ] Featured listings
- [ ] Advanced search filters
- [ ] Mobile app
- [ ] Booking and reservations

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev # Run migrations
npx prisma generate   # Generate Prisma client
```

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Email: support@helloet.com
- Website: [helloet.com](https://helloet.com)

---

**Built with ❤️ for Ethiopian businesses and communities**
