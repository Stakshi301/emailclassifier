import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        const userInfo = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

        return NextResponse.json({ user: userInfo.data });
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'message' in error) {
            console.error('Error verifying token:', (error as { message: string }).message);
            return NextResponse.json(
                { error: 'Invalid token', details: (error as { message: string }).message },
                { status: 400 }
            );
        }
        console.error('Error verifying token:', error);
        return NextResponse.json(
            { error: 'Invalid token', details: 'Unknown error' },
            { status: 400 }
        );
    }
} 