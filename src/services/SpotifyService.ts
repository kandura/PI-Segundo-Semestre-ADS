import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client'; 
import * as querystring from 'querystring';
import { title } from 'process';

const prisma = new PrismaClient();

interface SpotifyTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
}

export class SpotifyService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly api: AxiosInstance;

    constructor() {
        this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
        this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || '';

        this.api = axios.create({
            baseURL: 'https://api.spotify.com/v1/',
     });

        this.api.interceptors.request.use(async (config) => {
            const token = await this.getValidAcessToken();
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
    }

    private async getValidAcessToken(): Promise<string> {
        const authData = await prisma.spotifyAuth.findFirst();

        if (!authData) {
            throw new Error('No Spotify authentication data found.');
        }
        
        const safatyBuffer = 5 * 60 * 1000;
        const expirationTime = authData.expiresIn.getTime() - safatyBuffer;

        if (Date.now() < expirationTime) {
            return authData.accessToken;
        }

        console.log('Acess Token expired. Refreshing token...');
        return this.refreshToken(authData.refreshToken);
    }

private async refreshToken(refreshToken: string): Promise<string> {
    const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
        const response = await axios.post<SpotifyTokenResponse>(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
            {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const newAccessToken = response.data.access_token;
        const expiresIn = response.data.expires_in;

        await prisma.spotifyAuth.updateMany({
            where: { refreshToken },
            data: {
                accessToken: newAccessToken,
                expiresAt: new Date(Date.now() + expiresIn * 1000),
                tokenObtainedAt: new Date(),
            },
        });

        return newAccessToken;

    } catch (error) {
        console.error('Error refreshing Spotify token:', error.response?.data
        throw new Error('Failed to refresh Spotify token.');
    }
}   

public async getTokensFromCode(code: string): Promise<SpotifyTokenResponse> {
    const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await axios.post<SpotifyTokenResponse>('httsps://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
        }),
        {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return response.data;
}

public async searchTracks(query: string) {
    const response = await this.api.get('search', {
        params: {
            q: query,
            type: 'track',
            limit: 10,
        },
    }); 

    return response.data.tracks.items.map((item: any) => ({
        spotifyUri: track.uri,
        title: track.name,
        artists: track.artists.map((artist: any) => artist.name).join(', '),
        album: track.album.images[0]?.url
    }));
}

public async addToQueue(spotifyUri: string) {
    try {
        await this.api.post('me/player/queue', null, {
            params: {
                uri: spotifyUri,
            },
        });
    } catch (error) {
        console.error('Error adding track to queue:', error.response?.data);
        throw new Error('Failed to add track to Spotify queue.');
    }
}
}