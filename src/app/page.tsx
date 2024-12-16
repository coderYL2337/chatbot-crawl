"use client";

import { useState, useEffect } from "react";
import {
  Message,
  getConversation,
  saveConversation,
} from "@/app/utils/conversation";

type ShareModalProps = {
  isOpen: boolean;
  shareUrl?: string;
  onClose: () => void;
};

const ShareModal = ({ isOpen, shareUrl, onClose }: ShareModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl max-w-lg w-full">
        <h2 className="text-xl text-white mb-4">Share chat</h2>
        <p className="text-gray-300 mb-4">
          Your name and custom instructions will stay private
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl || "");
            }}
            className="bg-cyan-600 text-white px-4 py-2 rounded"
          >
            Copy link
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-gray-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// function cleanContent(content: string): string {
//   // Remove HTML tags and decode entities
//   return content
//     .replace(/<[^>]*>/g, "") // Remove HTML tags
//     .replace(/&[^;]+;/g, "") // Remove HTML entities
//     .trim();
// }

function cleanContent(content: string): string {
  // First check if content is a string
  if (typeof content !== "string") {
    return "";
  }

  return content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&[^;]+;/g, "") // Remove HTML entities
    .replace(/<!DOCTYPE[^>]*>/g, "") // Remove DOCTYPE declarations
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .replace(/^\s+|\s+$/g, "") // Trim whitespace
    .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\uFFFF]/g, "") // Keep only printable characters
    .trim();
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>();

  // Load conversation if ID is in URL
  useEffect(() => {
    const loadConversation = async () => {
      const pathParts = window.location.pathname.split("/");
      const id = pathParts[pathParts.length - 1];
      if (id && id !== "chat") {
        const conversation = await getConversation(id);
        if (conversation) {
          setMessages(conversation.messages);
          setConversationId(id);
        }
      }
    };
    loadConversation();
  }, []);

  const handleShare = async () => {
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await response.json();
      setShareUrl(data.shareUrl);
      setIsShareModalOpen(true);
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: cleanContent(message),
    };

    // const userMessage = { role: "user" as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Validate content before sending
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanContent(message),
          messages: messages, // Include the messages array
        }),
        // body: JSON.stringify({ message: cleanContent(message) }),
        // // body: JSON.stringify({ message, messages }),
      });
      const data = await response.json();
      console.log("data:", data);

      const assistantMessage: Message = {
        role: "assistant",
        content: cleanContent(data.message),
        // content: data.message,
      };

      const newMessages: Message[] = [
        ...messages,
        userMessage,
        assistantMessage,
      ];

      setMessages(newMessages);

      // Save conversation
      if (!conversationId) {
        const newId = Math.random().toString(36).substring(2, 15);
        setConversationId(newId);
        await saveConversation({
          id: newId,
          messages: newMessages,
          createdAt: Date.now(),
        });
      } else {
        await saveConversation({
          id: conversationId,
          messages: newMessages,
          createdAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="w-full bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">Chat</h1>
          <button
            onClick={handleShare}
            className="text-gray-300 hover:text-white"
          >
            Share
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 pt-4">
        <div className="max-w-3xl mx-auto px-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-4 mb-4 ${
                msg.role === "assistant"
                  ? "justify-start"
                  : "justify-end flex-row-reverse"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  msg.role === "assistant"
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-cyan-600 text-white ml-auto"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 w-full bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border bg-gray-900 px-4 py-3 text-gray-100"
              onKeyPress={e => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-cyan-600 text-white px-5 py-3 rounded-xl"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        shareUrl={shareUrl}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
