import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Try to get profileImage (column may not exist yet)
    let profileImage: string | null = null
    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT profile_image FROM users WHERE id = ?`, userId
      )
      if (result.length > 0) {
        profileImage = result[0].profile_image || null
      }
    } catch (e) {
      // Column doesn't exist yet, ignore
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        profileImage,
        role: user.role,
        createdAt: user.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { name, email, profileImage, currentPassword, newPassword } = body

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (name && name !== user.name) {
      updateData.name = name
    }

    if (email && email !== user.email) {
      // Check if email already in use
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        )
      }
      updateData.email = email
    }

    // Password change
    if (currentPassword && newPassword) {
      if (currentPassword !== user.passwordHash) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
      updateData.passwordHash = newPassword
    }

    // Handle profileImage via raw SQL (column may not exist yet)
    let profileImageUpdated = false
    if (profileImage !== undefined) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE users SET profile_image = ? WHERE id = ?`,
          profileImage,
          userId
        )
        profileImageUpdated = true
      } catch (e) {
        // Column doesn't exist yet, ignore
      }
    }

    // Update other fields via Prisma
    let updatedUser = user
    if (Object.keys(updateData).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          role: true
        }
      })
    }

    // Get current profileImage
    let currentProfileImage: string | null = null
    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT profile_image FROM users WHERE id = ?`, userId
      )
      if (result.length > 0) {
        currentProfileImage = result[0].profile_image || null
      }
    } catch (e) {
      // Column doesn't exist
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: currentProfileImage,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
