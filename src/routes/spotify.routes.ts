import { Router, Request, Response } from "express";
import { SpotifyService } from '../services/SpotifyService.js'
import * as querystring from 'querystring';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const spotifyRoutes = Router();
const spotifyService = new SpotifyService();

const scopes = [
    'playlist-read-private',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-read-private'
];

spotifyRoutes.get('/login', (req: Request, res: Response) => {
    const authorizeUrl = 'https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scopes.join(' '),
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        });
    
    res.redirect(authorizeUrl);
});

spotifyRoutes.get('/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).send('Spotify authorization failed.');
    }

    try {
        const tokens = await spotifyService.getTokensFromCode(code);
        
        await prisma.SpotifyAuth.upsert({
            where: { id: 1 },
            update: {
                refreshToken: tokens.refresh_token,
                accessToken: tokens.access_token,
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
                tokenObtainedAt: new Date(),
            },
            create: {
                id: 1,
                refreshToken: tokens.refresh_token,
                accessToken: tokens.access_token,
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            }
        });

        return res.send('Sportify Autorized! You can close this window.');
    
    } catch (error) {
        return res.status(500).send('Error during Spotify authorization.');
    }
});

export default spotifyRoutes;