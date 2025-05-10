# Email Classifier

A Next.js application that helps you classify your Gmail emails using AI. The application uses Google OAuth for authentication and Hugging Face's zero-shot classification model to categorize your emails.

## Features

- 🔐 Secure Google OAuth Authentication
- 📧 Fetch emails from Gmail
- 🤖 AI-powered email classification
- 📱 Responsive and modern UI
- 🔄 Real-time email updates
- 📊 Email categorization with confidence scores
- 📝 Full email content viewing

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Authentication**: Google OAuth
- **AI Classification**: Hugging Face Inference API
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Google Cloud Project with OAuth 2.0 credentials
- Gmail API enabled in your Google Cloud Console
- A Hugging Face API key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Stakshi301/emailclassifier.git
cd emailclassifier
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click "Sign in with Google" to authenticate
2. Grant necessary permissions for Gmail access
3. Click "Fetch Emails" to load your recent emails
4. Click "Classify Emails" to categorize your emails
5. Click on any email to view its full content
6. Use the logout button to sign out

## Project Structure

```
emailclassifier/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── page.tsx       # Main page
│   │   └── layout.tsx     # Root layout
│   └── lib/              # Utility functions
├── public/               # Static assets
└── package.json
```

## API Routes

- `/api/auth/google` - Google OAuth authentication
- `/api/emails` - Fetch and classify emails
- `/api/emails/[id]` - Get full email content

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google OAuth for authentication
- Hugging Face for AI classification
- Next.js team for the amazing framework
- Tailwind CSS for styling 