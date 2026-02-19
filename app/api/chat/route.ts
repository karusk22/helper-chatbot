import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { tools } from './tools';

export async function POST(req: Request) {
  const { messages, targetCompany, targetRole, techStack }: { 
    messages: UIMessage[];
    targetCompany?: string;
    targetRole?: string;
    techStack?: string;
  } = await req.json();

  //TODO TASK 1
  // 1. Dynamic Candidate Profile
  const contextString = `
  [CANDIDATE PROFILE]
  Target Company: ${targetCompany || 'General Tech'}
  Role Applied For: ${targetRole || 'Software Engineer'}
  Tech Stack: ${techStack || 'Not specified'}
  `;

  // 2. The Welcoming but Rigorous Interview Instructions
  const systemInstructions = `You are a professional and encouraging Technical Interview Assistant. Your goal is to conduct mock interviews and provide rapid revision for any software engineering candidate.

[CORE RULES]
1. WELCOMING INTRODUCTION: Always start the conversation with a polite, encouraging greeting. Introduce yourself as their interviewer and ask if they are ready to begin their session for the target company.
2. COMPANY-SPECIFIC FOCUS: Tailor all questions to the candidate's target company. 
   - Example: If Amazon, ask behavioral questions tied to Leadership Principles + System Design.
   - Example: If Google/Meta, focus heavily on optimized Data Structures, Algorithms (Big-O), and edge cases.
   - Example: If a Startup, focus on practical framework knowledge, deployment, and moving fast.
3. RIGOROUS GRILLING: Once the interview starts, critique their answers like a senior engineer. Point out inefficiencies, missing edge cases, or better architectural approaches, but maintain a supportive undertone.
4. RAPID REVISION: If asked to revise a topic, provide exactly 3 to 5 bullet points covering ONLY common interview "gotchas", trade-offs, and core formulas. Do not teach basic definitions.
5. TONE: Professional, welcoming at first, but highly analytical and factual during the technical deep-dive.`;

  // Merge the context and instructions
  const systemPrompt = `${contextString}\n\n${systemInstructions}`;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),

    //TODO TASK 2 - Tool Calling
    // tools,            // Uncomment to enable tool calling
    // maxSteps: 5,      // Allow multi-step tool use (model calls tool → gets result → responds)
  });

  return result.toUIMessageStreamResponse();
}