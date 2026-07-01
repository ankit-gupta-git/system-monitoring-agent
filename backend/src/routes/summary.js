import express from 'express';
import { GoogleGenAI } from '@google/genai';
import metricsStore from '../data/metrics-store.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /summary
 * @desc    Generate system health analysis using Gemini 3.5 Flash
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    if (!config.geminiApiKey) {
      return res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Gemini API Key is not configured in the environment variables.',
      });
    }

    const currentMetrics = metricsStore.getCurrent();
    if (!currentMetrics) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'No system metrics collected yet. Please try again in a few seconds.',
      });
    }

    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

    const prompt = `
You are an expert system administrator monitoring tool.
Analyze the following JSON metrics collected from the local system:

${JSON.stringify(currentMetrics, null, 2)}

Provide a concise summary of the system's performance and suggest actionable optimization recommendations.
You MUST output your response in valid JSON matching the following schema structure:
{
  "explanation": "A short, concise paragraph summarizing overall system health, calling out any warning signs like CPU spikes, high memory utilization, low disk space, or network latency.",
  "recommendations": [
    "Actionable advisory note 1",
    "Actionable advisory note 2",
    ...
  ]
}

Return ONLY raw JSON. Do not wrap in markdown tags like \`\`\`json. Just return the JSON object directly.
`;

    logger.info('Requesting system monitoring health analysis from Gemini...');
    
    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-flash',
      input: prompt,
    });

    const outputText = interaction.output_text || '';
    
    // Extract raw JSON content from LLM response if wrapped in markdown code blocks
    let sanitizedJson = outputText.trim();
    if (sanitizedJson.startsWith('```')) {
      const jsonStart = sanitizedJson.indexOf('{');
      const jsonEnd = sanitizedJson.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        sanitizedJson = sanitizedJson.substring(jsonStart, jsonEnd + 1);
      }
    }

    try {
      const summaryPayload = JSON.parse(sanitizedJson);
      res.status(200).json(summaryPayload);
    } catch (parseError) {
      logger.warn(`Failed to parse Gemini output as JSON: ${parseError.message}. Sending raw text format.`);
      res.status(200).json({
        explanation: outputText,
        recommendations: [
          'Verify core dashboard panels to inspect system performance statistics manually.',
          'Verify background collector health logs.'
        ]
      });
    }

  } catch (error) {
    logger.error(`Error generating Gemini system summary: ${error.message}`);
    next(error);
  }
});

export default router;
