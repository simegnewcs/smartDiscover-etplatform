import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const results: Record<string, string> = {}

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

  const columns = [
    'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE',
    'ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL',
    'ALTER TABLE users ADD COLUMN verification_code VARCHAR(10) NULL',
    'ALTER TABLE users ADD COLUMN verification_expires_at DATETIME NULL',
    'ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL',
    'ALTER TABLE businesses ADD COLUMN map_url TEXT NULL',
    'ALTER TABLE businesses ADD COLUMN features JSON NULL'
  ]

  for (const sql of columns) {
    try {
      await prisma.$executeRawUnsafe(sql)
    } catch {
      // Ignored if column already exists
    }
  }

  return NextResponse.json({ success: true, message: 'Database synced successfully', results })
}
