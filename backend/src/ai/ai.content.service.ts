// backend/src/ai/ai-content.service.ts
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

export interface CourseGenerationPrompt {
  topic: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  duration: number; // in hours
  targetAudience?: string;
  specificRequirements?: string;
}

export interface QuizGenerationPrompt {
  topic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  numberOfQuestions: number;
  questionTypes?: string[];
  focus?: string;
}

@Injectable()
export class AIContentService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get('GEMINI_API_KEY'),
    );
  }

  private cleanResponse(
    text: string,
    expectedFormat: 'json' | 'html' = 'json',
  ): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/``````/g, '');

    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();

    if (expectedFormat === 'json') {
      // JSON-specific cleaning
      const jsonStart = Math.min(
        cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'),
        cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('['),
      );

      if (jsonStart !== Infinity && jsonStart > 0) {
        cleaned = cleaned.substring(jsonStart);
      }

      const lastBrace = cleaned.lastIndexOf('}');
      const lastBracket = cleaned.lastIndexOf(']');
      const jsonEnd = Math.max(lastBrace, lastBracket);

      if (jsonEnd !== -1 && jsonEnd < cleaned.length - 1) {
        cleaned = cleaned.substring(0, jsonEnd + 1);
      }
    } else if (expectedFormat === 'html') {
      // HTML-specific cleaning
      const htmlStart = cleaned.search(
        /<\s*html\s*>|<\s*!doctype|<\s*div|<\s*h[1-6]|<\s*p/i,
      );
      if (htmlStart > 0) {
        cleaned = cleaned.substring(htmlStart);
      }
    }

    return cleaned;
  }
  // ✅ Helper method to clean AI response
  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/``````\s*/g, '');

    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();

    // Remove any text before the first { or [
    const jsonStart = Math.min(
      cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'),
      cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('['),
    );

    if (jsonStart !== Infinity && jsonStart > 0) {
      cleaned = cleaned.substring(jsonStart);
    }

    // Remove any text after the last } or ]
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const jsonEnd = Math.max(lastBrace, lastBracket);

    if (jsonEnd !== -1 && jsonEnd < cleaned.length - 1) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }

    return cleaned;
  }

  async generateCourse(prompt: CourseGenerationPrompt) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const coursePrompt = `
    Create a comprehensive course structure for the following requirements:
    
    Topic: ${prompt.topic}
    Level: ${prompt.level}
    Category: ${prompt.category}
    Duration: ${prompt.duration} hours
    Target Audience: ${prompt.targetAudience || 'Software developers'}
    Specific Requirements: ${prompt.specificRequirements || 'None'}
    
    Please generate a detailed course structure in the following JSON format:
    {
      "title": "Course Title",
      "description": "Detailed course description",
      "shortDescription": "Brief summary",
      "estimatedHours": ${prompt.duration},
      "modules": [
        {
          "title": "Module Title",
          "description": "Module description",
          "orderIndex": 0,
          "isRequired": true,
          "lessons": [
            {
              "title": "Lesson Title",
              "content": "Detailed lesson content in HTML format",
              "contentType": "TEXT",
              "duration": 30,
              "orderIndex": 0,
              "isRequired": true
            }
          ]
        }
      ]
    }
    
    Requirements:
    - Create 4-6 modules
    - Each module should have 3-5 lessons
    - Total duration should match the requested ${prompt.duration} hours
    - Content should be practical and industry-relevant
    - Include code examples where applicable
    - Use proper HTML formatting for lesson content
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting, explanations, or additional text. Do not wrap the response in code blocks.
    `;

    try {
      const result = await model.generateContent(coursePrompt);
      const response = await result.response;
      const text = response.text();

      // ✅ Clean the response before parsing
      const cleanedText = this.cleanJsonResponse(text);

      // Parse and validate the JSON response
      const courseData = JSON.parse(cleanedText);
      return courseData;
    } catch (error) {
      console.error('AI Course Generation Error:', error);
      console.error('Failed to parse response as JSON'); // ✅ Better error message
      throw new Error('Failed to generate course content');
    }
  }

  async generateQuiz(prompt: QuizGenerationPrompt) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const quizPrompt = `
    Create a comprehensive quiz for the following requirements:
    
    Topic: ${prompt.topic}
    Difficulty: ${prompt.difficulty}
    Number of Questions: ${prompt.numberOfQuestions}
    Question Types: ${prompt.questionTypes?.join(', ') || 'Multiple Choice, True/False'}
    Focus: ${prompt.focus || 'General knowledge'}
    
    Please generate a detailed quiz structure in the following JSON format:
    {
      "title": "Quiz Title",
      "description": "Quiz description",
      "type": "MODULE_ASSESSMENT",
      "difficulty": "${prompt.difficulty}",
      "duration": 30,
      "passingScore": 70,
      "maxAttempts": 3,
      "isRandomized": false,
      "showResults": true,
      "allowReview": true,
      "timeLimit": true,
      "questions": [
        {
          "text": "Question text",
          "type": "MULTIPLE_CHOICE",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "Option 1",
          "explanation": "Detailed explanation",
          "points": 1,
          "difficulty": "${prompt.difficulty}",
          "orderIndex": 0
        }
      ]
    }
    
    Requirements:
    - Create exactly ${prompt.numberOfQuestions} questions
    - Mix different question types: Multiple Choice, True/False, Short Answer
    - Ensure questions are relevant to ${prompt.topic}
    - Provide detailed explanations for each answer
    - Questions should be appropriate for ${prompt.difficulty} level
    - Include practical scenarios and real-world applications
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting, explanations, or additional text. Do not wrap the response in code blocks.
    `;

    try {
      const result = await model.generateContent(quizPrompt);
      const response = await result.response;
      const text = response.text();

      // ✅ Clean the response before parsing
      const cleanedText = this.cleanJsonResponse(text);

      const quizData = JSON.parse(cleanedText);
      return quizData;
    } catch (error) {
      console.error('AI Quiz Generation Error:', error);
      console.error('Failed to parse quiz response as JSON');
      throw new Error('Failed to generate quiz content');
    }
  }

  async generateLessonContent(topic: string, duration: number, level: string) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const contentPrompt = `
    Create detailed lesson content for:
    Topic: ${topic}
    Duration: ${duration} minutes
    Level: ${level}
    
    Generate comprehensive lesson content in HTML format including:
    - Introduction and learning objectives
    - Main content with examples
    - Code snippets where applicable
    - Practical exercises
    - Summary and key takeaways
    
    IMPORTANT: Return only clean HTML content without any markdown formatting, code blocks, or explanations.
    `;

    try {
      const result = await model.generateContent(contentPrompt);
      const response = await result.response;
      const text = response.text();

      // ✅ Clean the HTML response
      const cleanedText = this.cleanResponse(text, 'html');

      return cleanedText;
    } catch (error) {
      console.error('AI Content Generation Error:', error);
      throw new Error('Failed to generate lesson content');
    }
  }
}
