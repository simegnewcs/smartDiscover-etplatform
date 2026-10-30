import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const results: Record<string, string> = {}

  // 1. Create saved_businesses table if missing
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS saved_businesses (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        business_id BIGINT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_business (user_id, business_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
      )
    `)
    results['saved_businesses'] = 'OK'
  } catch (err: any) {
    results['saved_businesses'] = err.message
  }

  // 2. Add any missing columns to users table safely
  const userColumns = [
    { name: 'email_verified', sql: 'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE' },
    { name: 'verification_token', sql: 'ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL' },
    { name: 'verification_code', sql: 'ALTER TABLE users ADD COLUMN verification_code VARCHAR(10) NULL' },
    { name: 'verification_expires_at', sql: 'ALTER TABLE users ADD COLUMN verification_expires_at DATETIME NULL' },
    { name: 'profile_image', sql: 'ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL' },
  ]

  for (const col of userColumns) {
    try {
      await prisma.$executeRawUnsafe(col.sql)
      results[`users.${col.name}`] = 'Added'
    } catch (err: any) {
      // 1060: Duplicate column name (column already exists)
      if (err.message?.includes('Duplicate column') || err.message?.includes('1060')) {
        results[`users.${col.name}`] = 'Already exists'
      } else {
        results[`users.${col.name}`] = err.message
      }
    }
  }

  // 3. Add any missing columns to businesses table safely
  const businessColumns = [
    { name: 'map_url', sql: 'ALTER TABLE businesses ADD COLUMN map_url TEXT NULL' },
    { name: 'features', sql: 'ALTER TABLE businesses ADD COLUMN features JSON NULL' },
  ]

  for (const col of businessColumns) {
    try {
      await prisma.$executeRawUnsafe(col.sql)
      results[`businesses.${col.name}`] = 'Added'
    } catch (err: any) {
      if (err.message?.includes('Duplicate column') || err.message?.includes('1060')) {
        results[`businesses.${col.name}`] = 'Already exists'
      } else {
        results[`businesses.${col.name}`] = err.message
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Database schema sync completed successfully',
    results
  })
}
