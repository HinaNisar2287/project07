
"use client";

import { useState } from "react";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

// Keep the chatbot rules in this file so the page does not depend on a
// missing rules.json module.
const chatbotRules: Rule[] = [
  {
    intent: "greeting",
    keywords: ["hi", "hello", "salam", "assalam o alaikum", "aoa"],
    reply: "Wa-Alaikum-Salam! How can I help you with the University of Sargodha?"
  },
  {
    intent: "admissions",
    keywords: ["admission", "apply", "application", "deadline"],
    reply: "For current admission requirements, dates, and applications, please check the official University of Sargodha website: https://www.uos.edu.pk/."
  },
  {
    intent: "fees",
    keywords: ["fee", "fees", "fee structure", "challan"],
    reply: "Fee structures and challan instructions can change. Please verify the latest details through the official University of Sargodha website: https://www.uos.edu.pk/."
  },
  {
    intent: "merit",
    keywords: ["merit", "merit list", "eligibility"],
    reply: "Please check the official University of Sargodha website for current merit lists and eligibility criteria: https://www.uos.edu.pk/."
  },
  {
    intent: "programs",
    keywords: ["program", "programs", "department", "departments"],
    reply: "For the current list of programs and departments, please consult the official University of Sargodha website: https://www.uos.edu.pk/."
  },
  {
    intent: "exams",
    keywords: ["exam", "exams", "date sheet", "result", "results"],
    reply: "Please verify exam schedules and results through the official University of Sargodha website: https://www.uos.edu.pk/."
  },
  {
    intent: "scholarships",
    keywords: ["scholarship", "scholarships"],
    reply: "For current scholarship opportunities and application details, please check the official University of Sargodha website: https://www.uos.edu.pk/."
  },
  {
    intent: "library",
    keywords: ["library"],
    reply: "For library services and timings, please confirm the latest information with the University of Sargodha through https://www.uos.edu.pk/."
  },
  {
    intent: "hostel",
    keywords: ["hostel", "accommodation"],
    reply: "For hostel availability and facilities, please confirm the latest information with the University of Sargodha through https://www.uos.edu.pk/."
  }
];

const greeting: Message = {
  id: "welcome-message",
  sender: "bot",
  text:
    "Assalam-o-Alaikum! Welcome to UOS Helpdesk Bot.\n\n" +
    "I can help you with admissions, fees, merit lists, eligibility, " +
    "programs, departments, exams, results, scholarships, library, " +
    "hostel and university timings.\n\n" +
    "Ask your question in English or Roman Urdu."
};

function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[’']/g, "")
    .replace(/[?!.,;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsKeyword(
  normalizedMessage: string,
  normalizedKeyword: string
): boolean {
  if (!normalizedKeyword) return false;

  // Match whole words or complete phrases, not random substrings.
  const escapedKeyword = normalizedKeyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const pattern = new RegExp(
    `(^|\\s)${escapedKeyword}(?=\\s|$)`,
    "i"
  );

  return pattern.test(normalizedMessage);
}

function getBotReply(message: string): string {
  const normalizedMessage = normalizeMessage(message);

  if (!normalizedMessage) {
    return "Please type a message. I can help with admissions, fees, exams, library, hostel and other university information.";
  }

  // Handle greetings as greetings, not as general keyword matches.
  const greetings = [
    "hi",
    "hello",
    "hey",
    "salam",
    "assalam o alaikum",
    "assalamu alaikum",
    "aoa",
    "good morning",
    "good afternoon",
    "good evening"
  ];

  if (
    greetings.some(
      (greeting) =>
        normalizedMessage === greeting ||
        normalizedMessage.startsWith(greeting + " ")
    )
  ) {
    const greetingRule = chatbotRules.find(
      (rule) => rule.intent === "greeting"
    );

    if (greetingRule) return greetingRule.reply;
  }

  // Prefer the rule with the strongest keyword match.
  let bestRule: Rule | undefined;
  let bestScore = 0;

  for (const rule of chatbotRules) {
    let ruleScore = 0;

    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeMessage(keyword);

      if (
        containsKeyword(normalizedMessage, normalizedKeyword)
      ) {
        // Longer phrases are generally more specific.
        const score = normalizedKeyword.split(" ").length * 10
          + normalizedKeyword.length / 100;

        ruleScore = Math.max(ruleScore, score);
      }
    }

    if (ruleScore > bestScore) {
      bestScore = ruleScore;
      bestRule = rule;
    }
  }

  if (bestRule) {
    return bestRule.reply;
  }

  // Handle common conversational messages.
  if (
    normalizedMessage.includes("how are you") ||
    normalizedMessage.includes("kya haal") ||
    normalizedMessage.includes("kaise ho")
  ) {
    return "I'm working properly and ready to help! Ask me about UOS admissions, fees, merit, exams, departments, library or hostel.";
  }

  if (
    normalizedMessage.includes("not helpful") ||
    normalizedMessage.includes("wrong answer") ||
    normalizedMessage.includes("not working")
  ) {
    return "Sorry that wasn't helpful. Please rephrase your question or choose a topic such as admissions, fees, exams, scholarships, library or hostel. For official information, visit https://www.uos.edu.pk/";
  }

  return (
    "Sorry, I don't have a matching answer for that question yet.\n\n" +
    "Try asking about:\n" +
    "• Admissions and application deadlines\n" +
    "• Fees and fee challans\n" +
    "• Merit lists and eligibility\n" +
    "• Programs and departments\n" +
    "• Exams and results\n" +
    "• Scholarships\n" +
    "• Library and hostel\n" +
    "• Timings and contact information\n\n" +
    "You can also check the official website: https://www.uos.edu.pk/"
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    greeting
  ]);

  const [input, setInput] = useState("");

  function sendMessage(messageText?: string) {
    const text = (messageText ?? input).trim();

    if (!text) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      sender: "user",
      text
    };

    const botMessage: Message = {
      id: `${Date.now()}-bot`,
      sender: "bot",
      text: getBotReply(text)
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      botMessage
    ]);

    setInput("");
  }

  const quickQuestions = [
    "Admission process",
    "Fee structure",
    "Merit list",
    "Scholarships",
    "Exam date sheet",
    "Hostel facilities"
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-3 sm:p-6">
      <section className="flex h-[90vh] min-h-[500px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-blue-700 px-5 py-5 text-white sm:px-6">
          <h1 className="text-2xl font-bold">
            UOS Helpdesk Bot
          </h1>

          <p className="mt-1 text-sm text-blue-100">
            University of Sargodha Student Assistance
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            Rule-based assistant
          </div>
        </header>

        <div
          className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6"
          aria-live="polite"
          aria-label="Chat conversation"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${
                  message.sender === "user"
                    ? "rounded-br-sm bg-blue-700 text-white"
                    : "rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-sm"
                }`}
              >
                <p className="mb-1 text-xs font-semibold opacity-70">
                  {message.sender === "user"
                    ? "You"
                    : "UOS Bot"}
                </p>

                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
          <p className="mb-2 text-xs font-semibold text-slate-500">
            QUICK QUESTIONS
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="rounded-full border border-blue-200 bg-white px-3 py-2 text-xs text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {question}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask a question in English or Roman Urdu..."
              aria-label="Type your question"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-slate-400">
            Verify important information through official university sources.
          </p>
        </div>
      </section>
    </main>
  );
}
