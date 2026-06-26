import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as profileService from '../services/profile.service'

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.userId
    const username = req.params.username as string

    if (!username) {
      res.status(400).json({ error: 'Username es requerido' })
      return
    }

    const profile = await profileService.getProfileByUsername(currentUserId, username)
    res.status(200).json(profile)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { display_name, bio, social_links, avatar_url } = req.body

    const updated = await profileService.updateProfile(userId, {
      display_name,
      bio,
      social_links,
      avatar_url
    })

    res.status(200).json(updated)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function toggleFollow(req: AuthRequest, res: Response) {
  try {
    const followerId = req.userId!
    const { followingId } = req.body

    if (!followingId) {
      res.status(400).json({ error: 'followingId es requerido' })
      return
    }

    const result = await profileService.toggleFollow(followerId, followingId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
