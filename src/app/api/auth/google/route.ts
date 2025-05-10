import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        const userInfo = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

        return NextResponse.json({ user: userInfo.data });
    } catch (error: any) {
        console.error('Error verifying token:', error);
        return NextResponse.json(
            { error: 'Invalid token', details: error.message },
            { status: 400 }
        );
    }
} 