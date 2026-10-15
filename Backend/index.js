const express = require("express");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");
const { randomUUID } = require("crypto");
// npm i uuid

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory session store (OK for portfolio/demo)
const sessionStore = new Map();

// Groq (OpenAI-compatible client)
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/* =======================
   SYSTEM PROMPT
======================= */
const SYSTEM_PROMPT = `
You are an AI portfolio assistant representing Hariom Pandey / Hari Om / Harry / He / Him.

CORE RULES:
- Answer ONLY using information explicitly present in the CONTEXT.
- Do NOT invent, infer, assume, exaggerate, or add any information not in the CONTEXT.
- If information is not available in the CONTEXT, respond only with:
  "This information is not available in Hariom Pandey’s profile."

REFERENCE RULE:
- All CONTEXT facts refer to Hariom Pandey.
- Always use third-person pronouns: he / him / his.

ALLOWED BEHAVIOR:
- Provide concise, natural answers (1–2 short sentences).
- Rephrase when asked again, but do NOT add new facts.
- If asked about the assistant itself (e.g., "how are you", "who are you"),
  respond briefly and redirect to Hariom Pandey.

INTERACTIVITY:
- After answering, you MAY include ONE short guided follow-up question
  pointing to another topic already present in CONTEXT.

SAFETY:
- Never recommend hiring.
- Never schedule meetings.
- If availability is required, ask user to contact via email in CONTEXT.

Conversation behavior rules:

General behavior:
- Treat the conversation as continuous. Do not reset context between messages.
- Do not repeat full introductions unless explicitly asked.
- Avoid sounding like a form, FAQ, or documentation.

Understanding intent:
- If the user says "tell me more", "anything else", or similar phrases, expand on the most recent topic instead of repeating earlier answers.
- If the user asks a vague question, interpret it in the most reasonable way using recent conversation context.

Small talk handling:
- If the user greets or asks about the assistant ("hi", "how are you", "who are you"):
  - Respond briefly and politely.
  - Then gently redirect the conversation back to Hariom Pandey.
  - Do not block or say "not available" for casual small talk.

Follow-up questions:
- Only ask a follow-up question when it clearly helps the conversation move forward.
- Ask at most ONE follow-up question at a time.
- Follow-up questions should be natural and optional, not required.
- Do not ask follow-ups after the user says goodbye or thanks.

Answer style:
- Prefer short, natural sentences.
- Avoid repeating the same sentence structure across answers.
- Do not list skills or projects unless the user explicitly asks for a list.
- When expanding, add depth gradually, not all at once.

Handling missing information:
- If information is missing from CONTEXT, say:
  "This information is not available in Hariom Pandey’s profile."
- Use this fallback only when truly necessary. Do not overuse it.

Tone:
- Professional, calm, and human.
- Helpful but not pushy.
- Confident but not promotional.

Hiring and evaluation behavior:

- Never explicitly recommend hiring Hariom Pandey.
- Do not say phrases like "you should hire him" or "he is the best candidate".

When asked questions such as:
- "Why should we hire him?"
- "Is he a good fit?"
- "What makes him valuable?"

Respond by:
- Objectively summarizing his skills, learning mindset, and project experience.
- Linking his abilities to practical contributions he can make as an intern or entry-level hire.
- Keeping the tone neutral, factual, and professional.

Allowed phrasing examples:
- "He brings a combination of frontend development and applied AI experience."
- "His projects show hands-on exposure to building and deploying real applications."
- "He is still early in his career but demonstrates strong learning ability and initiative."

Disallowed behavior:
- No opinions, rankings, or guarantees.
- No emotional or persuasive language.
- No comparison with other candidates.

End such answers without a follow-up question unless explicitly asked.

`;

/* =======================
   FACTUAL CONTEXT (CLEAN)
======================= */
const PROFILE_CONTEXT = `
Introduction:
Hariom Pandey is a final-year B.Tech Computer Science student specializing in Artificial Intelligence and Machine Learning.

Education:
Final-year B.Tech in Computer Science (AI & ML specialization).

Skills:
HTML, CSS, JavaScript, React, Python, backend API integration.

Projects:
AI Resume and Cover Letter Generator.
Multimodal Chat Assistant.
School ERP System (Parent Dashboard).

Internships:
No internships completed yet.

Availability:
Open to internships and entry-level roles.
Open to meetings related to internships or projects, subject to availability.

Meetings:
If meeting dates are unavailable or clash, users should contact him via email.

Contact:
Email: hariompandey.dev@gmail.com

Location:
Varanasi, India.

Project: Multimodal Chat Assistant

Overview:
He built a cloud-deployed multimodal chat assistant that supports both text and image-based interactions using an AI model.

Purpose:
This project was built during a GDSC (Google Developer Student Clubs) event organized by his college. The goal was to gain hands-on experience with modern AI tools, multimodal inputs, and cloud deployment through a guided, end-to-end project.

Nature of the project:
It was a full end-to-end, hands-on project built under guidance during the event. The application was developed, tested, and deployed as a working prototype.

Technology used:
The project was built using Python. Gradio was used to create the user interface, and the Gemini AI API was used to handle text and image-based responses. The application was deployed on a cloud platform using student credits provided during the event.

His role:
He implemented the application logic in Python, integrated the Gemini AI API, built the user interface using Gradio, handled both text and image inputs, and deployed the application to the cloud.

Key features:
- Text-based conversational interaction
- Image input handling with AI-generated responses
- Cloud deployment for public access

Challenges:
One of the main challenges was understanding how to connect multimodal inputs with the AI API and successfully deploy the application on a cloud platform.

Current status:
The project is completed. The source code is available on his GitHub repository.

Project: AI Resume and Cover Letter Generator

Overview:
He is building a web application that helps users generate resumes and cover letters using AI.

Purpose:
The project was started to solve a common problem faced by job seekers, where creating and modifying resumes and cover letters repeatedly for different job applications becomes time-consuming and inefficient.

Idea and approach:
The core idea is that a user should enter their details, such as skills, experience, and projects, only once. Based on the job role they are applying for, the application aims to generate a resume and cover letter that highlights the most relevant information, such as frontend projects for frontend roles or backend work for backend roles.

Nature of the project:
This is an independent, self-initiated project and is currently under development.

Technology used:
It is being built as a web application. The project involves frontend development and AI-based text generation for resumes and cover letters.

His role:
He designed the concept, implemented the initial application flow, and worked on integrating AI-based resume and cover letter generation based on user-provided inputs.

Current status:
The project is in progress. At the current stage, resumes and cover letters are generated using a predefined format, with plans to improve role-based customization and flexibility.

Project: School ERP – Parent Dashboard

Overview:
He built a web-based parent dashboard as part of a planned school ERP system.

Purpose:
The project was started with a group of friends to explore building a school ERP system that could eventually be offered to schools. His focus was on developing the parent-facing dashboard.

Nature of the project:
It was a team-initiated project where he independently worked on the frontend of the parent dashboard. The overall ERP idea was later dropped, but his completed work was retained as a learning project.

Technology used:
The dashboard was built using basic HTML, CSS, and JavaScript. A simple database was also used to store and update student-related data such as marks.

His role:
He designed and developed the parent dashboard interface, implemented frontend logic for navigating between sections, displaying student details, attendance, timetable, and academic information, and connected the interface with basic data storage for student marks.

Key features:
- Parent dashboard showing student details and class information
- Attendance, timetable, and academic data display
- Basic data handling for updating student marks

Challenges:
One of the main challenges was managing frontend logic for a dashboard-style application and understanding how different sections interact within a single-page flow.

Current status:
The project is paused after the broader ERP idea was dropped, but it served as a strong learning experience in frontend development and dashboard design and the source code is available on his GitHub repository.

Skills and technical focus:

Primary strength:
He is strongest in frontend development and building AI-integrated web applications.

Frontend skills:
He works with HTML, CSS, and JavaScript, and has experience building interactive user interfaces and dashboard-style applications. He is also familiar with React for component-based frontend development.

Backend and APIs:
He has experience integrating backend APIs into frontend applications and working with AI APIs to build practical, user-facing tools.

AI and machine learning:
He has a foundation in AI and machine learning concepts and has applied AI through API-based systems such as resume generation and multimodal chat applications. His focus is on applied AI rather than model training.

Programming languages:
He primarily works with Python and has a good command of Java. He is currently strengthening his problem-solving skills by preparing Data Structures and Algorithms using Java.

Currently learning:
He is actively improving his Python skills and studying Data Structures and Algorithms, with a focus on writing clean, structured code.

Work style and strengths:
He is self-motivated, comfortable working in structured environments, and focused on delivering results rather than just completing tasks. He values collaboration but is also capable of working independently.

Areas of improvement:
He tends to prefer proven approaches and is consciously working on becoming more comfortable with change by gradually exploring new tools and workflows.


`;

/* =======================
   INTENT DETECTION
======================= */
function detectIntent(text = "") {
  const t = text.toLowerCase();

  if (/how are you|who are you|your name/.test(t)) return "assistant_meta";
  if (/project/.test(t)) return "projects";
  if (/skill|tech|stack|language/.test(t)) return "skills";
  if (/internship|intern/.test(t)) return "internship";
  if (/contact|email|reach/.test(t)) return "contact";
  if (/available|meeting|meet/.test(t)) return "availability";
  if (/who is|tell me about|introduction/.test(t)) return "intro";

  return "unknown";
}

function followUpForIntent(intent) {
  switch (intent) {
    case "intro":
      return "Would you like to know about his projects or skills?";
    case "projects":
      return "Would you like details about a specific project?";
    case "skills":
      return "Would you like to know how he uses these skills in projects?";
    case "internship":
      return "Would you like contact details to discuss opportunities?";
    case "contact":
      return "Would you like to know about his availability for internships?";
    default:
      return "Would you like to know about his projects or skills?";
  }
}

/* =======================
   ROUTES
======================= */

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Proxy route to Text-to-Speech (TTS) backend


app.post("/tts", async (req, res) => {
  const { randomUUID } = require("crypto");
  const { performance } = require("perf_hooks");

  const requestId = randomUUID();
  const routeStarted = performance.now();

  const log = (stage, details = {}) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "node-tts",
        requestId,
        elapsedMs: Math.round(performance.now() - routeStarted),
        stage,
        ...details,
      })
    );
  };

  log("REQUEST_RECEIVED", {
    method: req.method,
    path: req.originalUrl,
    textLength: typeof req.body?.text === "string"
      ? req.body.text.length
      : 0,
  });

  try {
    const { text } = req.body || {};

    if (typeof text !== "string" || !text.trim()) {
      log("VALIDATION_FAILED");
      return res.status(400).json({
        error: "Text is required for TTS.",
        requestId,
      });
    }

    // Configure TTS_BASE_URL as the base URL only.
    const baseUrl = (
      process.env.TTS_BASE_URL || "http://127.0.0.1:8001"
    ).replace(/\/+$/, "");

    const targetUrl = `${baseUrl}/tts`;

    log("PYTHON_REQUEST_START", { targetUrl });

    const fetchStarted = performance.now();

    let response;

    try {
      response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
        body: JSON.stringify({ text: text.trim() }),
        signal: AbortSignal.timeout(120000),
      });
    } catch (error) {
      log("PYTHON_CONNECTION_FAILED", {
        durationMs: Math.round(performance.now() - fetchStarted),
        errorName: error.name,
        errorMessage: error.message,
        cause: error.cause?.message || null,
      });

      return res.status(502).json({
        error: "Unable to connect to TTS service.",
        requestId,
        details: error.message,
      });
    }

    log("PYTHON_RESPONSE_RECEIVED", {
      status: response.status,
      durationMs: Math.round(performance.now() - fetchStarted),
    });

    const parseStarted = performance.now();
    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      log("PYTHON_INVALID_JSON", {
        responsePreview: responseText.slice(0, 300),
      });

      return res.status(502).json({
        error: "TTS service returned invalid JSON.",
        requestId,
      });
    }

    log("PYTHON_BODY_READ", {
      durationMs: Math.round(performance.now() - parseStarted),
      generationSeconds: data.generation_seconds ?? null,
    });

    if (!response.ok) {
      log("PYTHON_RETURNED_ERROR", {
        status: response.status,
        detail: data.detail || data.error || null,
      });

      return res.status(502).json({
        error: "TTS service error.",
        requestId,
        details: data.detail || data.error || "Unknown TTS error",
      });
    }

    log("REQUEST_COMPLETED", {
      totalMs: Math.round(performance.now() - routeStarted),
      audioUrl: data.audio_url || null,
      generationSeconds: data.generation_seconds ?? null,
    });

    return res.json({ ...data, requestId });
  } catch (error) {
    log("UNEXPECTED_ERROR", {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: "Unexpected TTS proxy error.",
      requestId,
      details: error.message,
    });
  }
});




app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    let { sessionId } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "A message is required.",
      });
    }

    const userMessage = message.trim();

    if (!sessionId) {
      sessionId = randomUUID();
    }

    // Retrieve this conversation's history.
    const session = sessionStore.get(sessionId) || {
      history: [],
    };

    const history = session.history || [];
    const intent = detectIntent(userMessage);

    // Keep small talk in the same conversation flow.
    let reply;
    let followUp = "";

    if (intent === "assistant_meta") {
      reply =
        "I am Hariom Pandey's portfolio assistant. I can answer questions about his background, skills, projects, and experience.";
      followUp =
        "Would you like to know about his background or projects?";
    } else {
      const completion = await client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: PROFILE_CONTEXT },
          ...history,
          { role: "user", content: userMessage },
        ],
      });

      reply =
        completion.choices[0]?.message?.content?.trim() ||
        "This information is not available in Hariom Pandey's profile.";

      followUp = followUpForIntent(intent);
    }

    // Save both sides of the exchange for future follow-up questions.
    const updatedHistory = [
      ...history,
      { role: "user", content: userMessage },
      { role: "assistant", content: reply },
    ].slice(-12);

    sessionStore.set(sessionId, {
      history: updatedHistory,
      lastIntent: intent,
    });

    return res.json({
      reply,
      followUp,
      sessionId,
    });
  } catch (error) {
    console.error("GROQ ERROR:", error);

    return res.status(500).json({
      reply: "AI service error. Please try again.",
    });
  }
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
