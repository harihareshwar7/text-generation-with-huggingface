import { InferenceClient } from '@huggingface/inferenceclient';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  throwIfMissing(process.env, ['HUGGINGFACE_ACCESS_TOKEN']);

  if (req.method === 'GET') {
    return res.text(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (!req.bodyJson.prompt) {
    return res.json({ ok: false, error: 'Prompt is required.' }, 400);
  }

  const client = new InferenceClient({
    provider: 'hf-inference',
    api_key: process.env.HUGGINGFACE_ACCESS_TOKEN,
  });

  try {
    const completion = await client.chat.completions.create({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      messages: [
        {
          role: 'user',
          content: req.bodyJson.prompt,
        },
      ],
      max_tokens: req.bodyJson.max_new_tokens || 500,
    });

    return res.json({ ok: true, completion: completion.choices[0].message }, 200);
  } catch (err) {
    return res.json({ ok: false, error: err.message || 'Failed to query model.' }, 500);
  }
};
