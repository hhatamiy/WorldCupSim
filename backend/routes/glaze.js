// backend/routes/glaze.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

const router = express.Router();

async function generateScript(bracket) {
    console.log('Generating glaze script with Gemini');
    try {
        const prompt = "Here is the proposed winner's bracket for the World Cup 2026.\n" 
            + bracket + 
            "\nGenerate a voiceover script that greatly praises this proposed bracket. Your output must contain only spoken dialogue and no sound effects, headings, titles, or stage directions. The script must specifically and enthusiastically cover the following: \n" +
            "1.  The excitement and potential upsets of the **Round of 32** matchups.\n" +
            "2.  The high-stakes rivalries in the **Round of 16** matchups.\n" +
            "3.  The quality and drama of the four teams reaching the **Quarter-Finals**.\n" + 
            "4.  The final four teams and their path to the **Semi-Finals**.\n" + 
            "5.  The ultimate **Final round matchup**.\n" + 
            "6.  The **Winner** of the tournament.\n"
        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        const headers = {
            'x-goog-api-key': process.env.GEMINI_API_KEY,
            'Content-Type': 'application/json'
        };
        const data = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }
        const response = await axios.post(url,data,{headers})
        const script = response.data.candidates[0].content.parts[0].text;
        console.log('Glaze script generated');
        console.log(`Script length: ${script.length} characters`);
        return script;
    } catch (error) {
        throw new Error('Failed to generate podcast script');
    }
}
async function generateAudio(text) {
    console.log('Converting text to speech with ElevenLabs');
    try {
        const voiceId = process.env.PODCAST_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const headers = {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
        };
        const data = {
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        };
        const response = await axios.post(url, data, { headers, responseType: 'arraybuffer' });
        return filePath;

    } catch (error) {
        throw new Error('Failed to generate audio');
    }
}

async function generateGlaze(bracket){
    try {
        const script = await generateScript(bracket);
        if (!script || script.length === 0) {
            throw new Error('No script generated');
        }
        const audioFilePath = await generateAudio(script);
        if (!audioFilePath) {
            throw new Error('No audio file generated');
        }
        return {
            success: true,
            //articlesCount: articles.length,
            script: script,
            scriptLength: script.length,
            audioFile: audioFilePath
        };

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}


// GLAZE
router.post('/bracket', async (req, res) => {
  try {
    const body = req.body;
    console.log(JSON.stringify(body));

    // Create token
    const script = await generateScript(body);

    res.json({ script });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
