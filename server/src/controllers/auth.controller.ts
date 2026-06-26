import { Request, Response } from 'express'
import * as authService from '../services/auth.service'

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      res.status(400).json({ error: 'username, email y password son requeridos' })
      return
    }

    const result = await authService.register(username, email, password)
    res.status(201).json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'email y password son requeridos' })
      return
    }

    const result = await authService.login(email, password)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}