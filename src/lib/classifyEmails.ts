import axios from 'axios';

export type EmailClassification = {
    label: string;
    score: number;
};

interface HuggingFaceResponse {
    labels: string[];
    scores: number[];
}

export async function classifyEmail(
    email: { subject: string; body: string },
    hfApiKey: string
): Promise<EmailClassification> {
    const labels = ["important", "promotional", "social", "marketing", "spam"];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/joeddav/xlm-roberta-large-xnli', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hfApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: `${email.subject}\n${email.body}`,
                parameters: { candidate_labels: labels }
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.statusText}`);
        }

        const data = await response.json();
        // Pick the top label
        return {
            label: data.labels[0],
            score: data.scores[0]
        };
    } catch (error: unknown) {
        if (error instanceof Error &&
            (error.name === 'AbortError' || error.message.includes('timed out'))) {
            // Fallback to rule-based
            return ruleBasedClassify(email);
        }
        throw error;
    }
}

function ruleBasedClassify(email: { subject: string; body: string }) {
    const text = `${email.subject} ${email.body}`.toLowerCase();
    if (text.includes('invoice') || text.includes('meeting') || text.includes('urgent')) return { label: 'important', score: 1 };
    if (text.includes('unsubscribe') || text.includes('newsletter') || text.includes('offer')) return { label: 'promotional', score: 1 };
    if (text.includes('friend') || text.includes('party') || text.includes('event')) return { label: 'social', score: 1 };
    if (text.includes('marketing') || text.includes('campaign')) return { label: 'marketing', score: 1 };
    if (text.includes('win') || text.includes('prize') || text.includes('lottery')) return { label: 'spam', score: 1 };
    return { label: 'other', score: 1 };
}

export async function classifyEmailWithHuggingFace(
    email: string,
    apiKey: string
): Promise<EmailClassification> {
    try {
        const response = await axios.post<HuggingFaceResponse>(
            'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
            {
                inputs: email,
                parameters: {
                    candidate_labels: [
                        'urgent',
                        'important',
                        'newsletter',
                        'social',
                        'promotional',
                        'other'
                    ]
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const { labels, scores } = response.data;
        const maxScoreIndex = scores.indexOf(Math.max(...scores));

        return {
            label: labels[maxScoreIndex],
            score: scores[maxScoreIndex]
        };
    } catch (error: unknown) {
        if (error instanceof Error &&
            (error.name === 'AbortError' || error.message.includes('timed out'))) {
            // Fallback to rule-based
            return ruleBasedClassify({ subject: '', body: email });
        }
        throw error;
    }
}