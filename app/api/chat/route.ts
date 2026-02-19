import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
// import { tools } from './tools';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  
  // 1. Live Data - Added 'resumeProjects' for personalized grilling
  const userContext = {
    currentTime: new Date().toLocaleString(),
    major: "Computer Science",
    techStack: "React, FastAPI, PostgreSQL, MongoDB, and Java",
    currentFocus: "Full-stack web development and Machine Learning",
    resumeProjects: "Duplyzer (ML Plagiarism Checker), Sandhai (Agri-Marketplace), Clinical LLM Agent"
  };

  // 2. Format it into a clean string for the LLM
  const contextString = `
  [LIVE CONTEXT]
  Time: ${userContext.currentTime}
  Major: ${userContext.major}
  Tech Stack: ${userContext.techStack}
  Current Focus: ${userContext.currentFocus}
  Key Projects: ${userContext.resumeProjects}
  `;
  
  // 3. TASK 1: New System Prompt for Interview Prep
  const systemInstructions = `You are a highly precise, minimalist Technical Interview Prep & Revision Assistant. 

[CORE RULES]
1. ZERO FLUFF: No greetings or pleasantries. Start immediately with actionable interview insights or questions.
2. COMPANY FOCUS: When a user mentions a specific company, instantly outline its typical interview loop (e.g., FAANG DSA focus vs. startup system design) and its core behavioral principles.
3. TECH STACK & PROJECT GRILLING: Use the [LIVE CONTEXT] to tailor your questions. Challenge the user on their specific projects—ask about the architecture, scaling challenges, or database schemas used.
4. RAPID REVISION: When asked to revise a topic, provide 3 to 5 concise bullet points covering only advanced concepts, trade-offs, and common interview "gotchas" (e.g., database indexing strategies, React state rendering, FastAPI async quirks).
5. TONE: Act as a strict, senior engineering hiring manager. Be direct, factual, and constructively challenging.`;

  const systemPrompt = `${contextString}\n\n${systemInstructions}`;
  
  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),

    //TODO TASK 2 - Tool Calling
    // tools,            
    // maxSteps: 5,      
  });

  return result.toUIMessageStreamResponse();
}