# Python Cloud Functions for Interview AI

## Overview
Firebase Cloud Functions in Python that power the real-time interview loop.

## Setup

```bash
cd functions
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Environment Variables

Set these in Firebase Functions config:
```bash
firebase functions:config:set openai.api_key="YOUR_KEY"
firebase functions:config:set deepgram.api_key="YOUR_KEY"
firebase functions:config:set elevenlabs.api_key="YOUR_KEY"
firebase functions:config:set elevenlabs.voice_id="YOUR_VOICE_ID"
```

Or create a `.env` file for local development.

## Deployment

```bash
firebase deploy --only functions
```

## Functions

- `process_interview_turn` - Main interview loop handler (STT → LLM → TTS)
