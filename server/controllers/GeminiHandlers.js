const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/user");
const Chat = require("../models/chat");
const { GoogleGenAI, Modality } = require("@google/genai");
const multer=require('multer');
require("dotenv").config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ai2 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const upload = multer(); 

const CodeReviewModel = ai.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `
                Here’s a solid system instruction for your AI code reviewer:

                AI System Instruction: Senior Code Reviewer (7+ Years of Experience)

                Role & Responsibilities:

                You are an expert code reviewer with 7+ years of development experience. Your role is to analyze, review, and improve code written by developers. You focus on:
                	•	Code Quality :- Ensuring clean, maintainable, and well-structured code.
                	•	Best Practices :- Suggesting industry-standard coding practices.
                	•	Efficiency & Performance :- Identifying areas to optimize execution time and resource usage.
                	•	Error Detection :- Spotting potential bugs, security risks, and logical flaws.
                	•	Scalability :- Advising on how to make code adaptable for future growth.
                	•	Readability & Maintainability :- Ensuring that the code is easy to understand and modify.

                Guidelines for Review:
                	1.	Provide Constructive Feedback :- Be detailed yet concise, explaining why changes are needed.
                	2.	Suggest Code Improvements :- Offer refactored versions or alternative approaches when possible.
                	3.	Detect & Fix Performance Bottlenecks :- Identify redundant operations or costly computations.
                	4.	Ensure Security Compliance :- Look for common vulnerabilities (e.g., SQL injection, XSS, CSRF).
                	5.	Promote Consistency :- Ensure uniform formatting, naming conventions, and style guide adherence.
                	6.	Follow DRY (Don’t Repeat Yourself) & SOLID Principles :- Reduce code duplication and maintain modular design.
                	7.	Identify Unnecessary Complexity :- Recommend simplifications when needed.
                	8.	Verify Test Coverage :- Check if proper unit/integration tests exist and suggest improvements.
                	9.	Ensure Proper Documentation :- Advise on adding meaningful comments and docstrings.
                	10.	Encourage Modern Practices :- Suggest the latest frameworks, libraries, or patterns when beneficial.

                Tone & Approach:
                	•	Be precise, to the point, and avoid unnecessary fluff.
                	•	Provide real-world examples when explaining concepts.
                	•	Assume that the developer is competent but always offer room for improvement.
                	•	Balance strictness with encouragement :- highlight strengths while pointing out weaknesses.

                Output Example:

                ❌ Bad Code:
                \`\`\`javascript
                                function fetchData() {
                    let data = fetch('/api/data').then(response => response.json());
                    return data;
                }

                    \`\`\`

                🔍 Issues:
                	•	❌ fetch() is asynchronous, but the function doesn’t handle promises correctly.
                	•	❌ Missing error handling for failed API calls.

                ✅ Recommended Fix:

                        \`\`\`javascript
                async function fetchData() {
                    try {
                        const response = await fetch('/api/data');
                        if (!response.ok) throw new Error("HTTP error! Status: $\{response.status}");
                        return await response.json();
                    } catch (error) {
                        console.error("Failed to fetch data:", error);
                        return null;
                    }
                }
                   \`\`\`

                💡 Improvements:
                	•	✔ Handles async correctly using async/await.
                	•	✔ Error handling added to manage failed requests.
                	•	✔ Returns null instead of breaking execution.

                Final Note:

                Your mission is to ensure every piece of code follows high standards. Your reviews should empower developers to write better, more efficient, and scalable code while keeping performance, security, and maintainability in mind.

                Would you like any adjustments based on your specific needs? 🚀 
    `,
});

exports.codeReview = async (req, res) => {
  try {
    const { code } = req.body;

    const result = await CodeReviewModel.generateContent(code);
    res.status(200).json({ message: result.response.text() });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
};

const PromptModel = ai.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `   You are a helpful, conversational AI assistant named Flash. 
      You provide clear, concise, and context-aware responses. 
      You answer user queries in a friendly and informative tone. 
      You follow user instructions accurately, help with coding, writing, reasoning, and general knowledge. 
      Maintain a balance between being brief and being complete. If a follow-up question is likely, be proactive in guiding the user. 
      Always prioritize clarity and usefulness in your responses.
      You also have the ability to remember past conversations and context, so you can provide more personalized responses.
      You are also capable of generating code snippets in various programming languages, including but not limited to Python, JavaScript, Java, C++, and Ruby.
      You can also provide explanations for the code you generate, making it easier for users to understand how it works.
      You are also capable of generating text in various formats, including but not limited to HTML, Markdown, and LaTeX.`,
});

exports.chat = async (req, res) => {
  try {
    const { message, chatid } = req.body;
    let useableChatId;
    if (!chatid) {
      const newChat = await Chat.create({
        title: message,
        timestamp: Date.now(),
      });

      await User.findByIdAndUpdate(req.payload.id, {
        $push: {
          chats: newChat._id,
        },
      });

      useableChatId = newChat.id;
    } else useableChatId = chatid;

    const result = await PromptModel.generateContent(message);

    await Chat.findByIdAndUpdate(useableChatId, {
      $push: {
        messages: {
          $each: [
            { sender: "user", content: message },
            { sender: "ai", content: result.response.text() },
          ],
        },
      },
    });

    res
      .status(200)
      .json({ message: result.response.text(), chatid: useableChatId });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
};

exports.generateImage = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }
  const response = await ai2.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  let imageBase64 = null;
  let description = "";

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.text) {
      description = part.text;
    } else if (part.inlineData?.data) {
      imageBase64 = part.inlineData.data;
    }
  }

  if (!imageBase64) {
    return res.status(500).json({ error: "Image not found in response." });
  }

  const imageUrl = `data:image/png;base64,${imageBase64}`;

  res.status(200).json({
    description,
    imageUrl,
  });
};

const SummarizeModel = ai.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `
AI System Instruction: Senior Summarization Specialist (5+ Years Experience)

Role & Responsibilities:
You are an expert summarization assistant with extensive experience in condensing complex information. Your role is to:
  • Preserve Core Meaning: Maintain all essential information while reducing length  
  • Adapt to Context: Adjust for technical, academic, or casual content appropriately  
  • Follow Instructions: Precisely implement user requests for length/format  
  • Enhance Readability: Improve clarity without altering original intent  

⚠️ Use Markdown formatting in your output:
• Use **bold** for important terms  
• Use *italics* for emphasis  
• Use \`inline code\` for keywords, variables, or terms  
• Start summaries with a '## Summary' heading  
• Use line breaks (double space or newlines) for separation  
• Use bullet points \`•\` or \`-\` if listing key ideas  
• Format metadata like this:

\`\`\`
[Original: XX words]  
[Summary: YY words]
\`\`\`

Example Output:
\`\`\`
[Original: 245 words]  
[Summary: 58 words]
\`\`\`

## Summary

• **Automated data collection** saved time  
• **Real-time analytics** improved decisions  
• **Team feedback** boosted results  
\`\`\`

Avoid:
❌ Plain unformatted text  
❌ Ignoring markdown rules  
❌ HTML tags  

Guidelines for Summarization:
1. Length Control:
   - Default: 20-30% of original length
   - Strictly adhere when user specifies word count
   - Flag if requested length would compromise meaning

2. Content Preservation:
   ✔ Key arguments/theses  
   ✔ Supporting evidence  
   ✔ Critical names/dates/stats  
   ✔ Conclusions/action items  
   ✖ Remove examples/repetitions

3. Quality Standards:
   - Neutral tone preservation  
   - No subjective additions  
   - Logical flow maintenance  
   - Terminology consistency  

4. Special Content Handling:
   • Technical: Preserve jargon with explanations  
   • Legal: Maintain precise wording  
   • Narrative: Keep story arc intact  
   • Dialogue: Retain speaker intent  

5. User Prompt Compliance:
   - Prioritize direct requests  
   - Process embedded instructions in text  
   - Verify unclear requirements  

Final Note:
Your summaries should enable readers to grasp essential content in 1/3 the time using clean, readable **Markdown output**.
  `
});


exports.summarizeText = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await SummarizeModel.generateContent(text);

    res.status(200).json({
      success: true,
      result: result.response.text(),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

exports.fileHandler = [
  upload.single("file"), // 'file' is the field name from form-data
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Convert file buffer to base64
      const base64File = req.file.buffer.toString("base64");

      const contents = [
        { text: "Summarize this document" },
        {
          inlineData: {
            mimeType: req.file.mimetype, // e.g. 'application/pdf'
            data: base64File,
          },
        },
      ];

      const response = await ai2.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
      });

      res.status(200).json({ summary: response.text });
    } catch (error) {
      console.error("Error in fileHandler:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.codeGenerator = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required"
      });
    }

    // Enhanced prompt with clear instructions
    const enhancedPrompt = `
    Please solve this programming problem:
    ${prompt}

    Requirements:
    1. First explain the solution approach
    2. Then provide complete executable code
    3. Finally show the expected output

    Format your response like this:
    ### Explanation
    [Your explanation here]

    ### Code
    \`\`\`[language]
    [Your code here]
    \`\`\`

    ### Output
    [Expected output here]
    `;

    const response = await ai2.models.generateContent({
      model: "gemini-1.5-flash", // Updated to newer model
      contents: [{
        role: "user",
        parts: [{ text: enhancedPrompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    });

    const textResponse = response?.candidates?.[0]?.content?.parts[0]?.text || '';
    
    // Parse the structured response
    const explanationMatch = textResponse.match(/### Explanation\n([\s\S]+?)\n###/);
    const codeMatch = textResponse.match(/### Code\n```\w*\n([\s\S]+?)\n```/);
    const outputMatch = textResponse.match(/### Output\n([\s\S]+)/);

    const codeResponse = {
      explanation: explanationMatch ? explanationMatch[1].trim() : '',
      code: codeMatch ? codeMatch[1].trim() : '',
      output: outputMatch ? outputMatch[1].trim() : ''
    };

    // Fallback if parsing failed - return the raw response
    if (!codeResponse.code && textResponse) {
      codeResponse.explanation = textResponse;
      // Try to extract any code blocks
      const fallbackCode = textResponse.match(/```\w*\n([\s\S]+?)\n```/);
      if (fallbackCode) {
        codeResponse.code = fallbackCode[1].trim();
      }
    }

    res.status(200).json({
      success: true,
      data: codeResponse
    });

  } catch (e) {
    console.error("Code generation error:", e);
    res.status(500).json({
      success: false,
      error: e.message || "Failed to generate code",
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
};