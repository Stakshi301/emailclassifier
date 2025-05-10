import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { headers } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const headersList = await headers();
    const accessToken = headersList.get('authorization')?.split(' ')[1];
    const emailId = params.id;

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
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: emailId,
            format: 'full',
        });

        const email = response.data;
        const headersArr = email.payload?.headers ?? [];
        const body =
            email.payload?.parts?.find((part) => part.mimeType === 'text/plain')?.body?.data ??
            email.payload?.body?.data ??
            '';

        const decodedBody = body ? Buffer.from(body, 'base64').toString('utf-8') : '';

        const processedEmail = {
            id: email.id,
            threadId: email.threadId,
            subject: headersArr.find((header) => header.name === 'Subject')?.value,
            from: headersArr.find((header) => header.name === 'From')?.value,
            to: headersArr.find((header) => header.name === 'To')?.value,
            date: headersArr.find((header) => header.name === 'Date')?.value,
            body: decodedBody,
        };

        return NextResponse.json(processedEmail);
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'message' in error) {
            console.error('Detailed error:', (error as { message: string }).message);
            return NextResponse.json(
                { error: 'Failed to fetch full email', details: (error as { message: string }).message },
                { status: 500 }
            );
        }
        console.error('Detailed error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch full email', details: 'Unknown error' },
            { status: 500 }
        );
    }
} 