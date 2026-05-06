# Vercel Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Set these in Vercel Dashboard (Settings → Environment Variables):

```
# Database (Required)
DATABASE_URL="mysql://username:password@host:port/database"

# NextAuth (Required)
NEXTAUTH_SECRET="your-random-secret-key-min-32-chars"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Image Upload (Optional - defaults to ./public/uploads)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880"
```

### 2. Database Setup
- Ensure MySQL database is accessible from Vercel's IP ranges
- Run `npx prisma migrate deploy` to apply migrations
- Run `npx prisma generate` to generate client

### 3. Vercel Build Settings
Build Command:
```bash
prisma generate && next build
```

Output Directory: `.next`

Install Command:
```bash
npm install
```

### 4. Post-Deployment
- Test login with demo accounts:
  - Business: business@helloet.com / demo123
  - User: user@helloet.com / demo123
- Verify image uploads work
- Check database connections

## Known Issues & Fixes Applied

1. ✅ BigInt type errors - Fixed by converting IDs to strings
2. ✅ City model 'description' field - Removed (not in schema)
3. ✅ Type comparison errors - Fixed type narrowing
4. ✅ Console logs - Cleaned up for production
5. ✅ Images config - Added Unsplash domain

## Troubleshooting

### Build Fails
1. Check all env vars are set
2. Ensure DATABASE_URL is correct and DB is accessible
3. Run `npm run build` locally to test

### Database Connection Issues
- Whitelist Vercel IPs in your database provider
- Check DATABASE_URL format
- Ensure SSL is configured for production DB

### Image Upload Not Working
- Check UPLOAD_DIR path exists
- Verify write permissions
- Consider using cloud storage (S3, Cloudinary) for production

## Production Considerations

1. **Password Hashing**: Currently using plain text for demo. Implement bcrypt for production.
2. **Email Service**: Set up SMTP for transactional emails.
3. **Image Storage**: Move from local filesystem to cloud storage.
4. **Monitoring**: Add error tracking (Sentry) and analytics.
5. **Rate Limiting**: Implement API rate limiting.
6. **Caching**: Enable Redis caching for database queries.
