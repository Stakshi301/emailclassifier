import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { headers } from 'next/headers';
import { classifyEmail } from '@/lib/classifyEmails';

export async function GET(request: Request) {
    const headersList = await headers();
    const accessToken = headersList.get('authorization')?.split(' ')[1];
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count') || '15';

    if (!accessToken) {
        return NextResponse.json(
            { error: 'No access token provided' },
            { status: 401 }
        );
    }

    try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth });
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: parseInt(count),
        });

        if (!response.data.messages) {
            return NextResponse.json({ emails: [] });
        }

        const emails = await Promise.all(
            response.data.messages.map(async (message) => {
                const email = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                });
                return {
                    id: email.data.id,
                    subject: email.data.payload?.headers?.find(
                        (header) => header.name === 'Subject'
                    )?.value,
                    snippet: email.data.snippet,
                };
            })
        );

        return NextResponse.json({ emails });
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'message' in error) {
            console.error('Detailed error:', (error as { message: string }).message);
            return NextResponse.json(
                { error: 'Failed to fetch emails', details: (error as { message: string }).message },
                { status: 500 }
            );
        }
        console.error('Detailed error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch emails', details: 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const { emails } = await request.json();

    if (!emails || emails.length === 0) {
        return NextResponse.json(
            { error: 'Missing emails' },
            { status: 400 }
        );
    }

    try {
        const hfApiKey = process.env.HUGGINGFACE_API_KEY!;
        const classifiedEmails = [];
        for (const email of emails) {
            const classification = await classifyEmail(
                {
                    subject: email.subject || '',
                    body: email.snippet || '',
                },
                hfApiKey
            );
            classifiedEmails.push({ ...email, classification });
        }
        return NextResponse.json({ classifiedEmails });
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'message' in error) {
            console.error('Classification error:', (error as { message: string }).message);
            return NextResponse.json(
                { error: 'Failed to classify emails', details: (error as { message: string }).message },
                { status: 500 }
            );
        }
        console.error('Classification error:', error);
        return NextResponse.json(
            { error: 'Failed to classify emails', details: 'Unknown error' },
            { status: 500 }
        );
    }
} 