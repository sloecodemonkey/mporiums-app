// ============================================================
// MessagingContext.jsx
// src/context/MessagingContext.jsx
// ============================================================
// The shared "backpack" for the entire messaging system.
// Follows the exact same pattern as CartContext and WishlistContext.
//
// Any component accesses it with:
//   const { conversations, sendMessage, unreadCount } = useMessaging();
//
// What it holds:
//   conversations  — array of all conversation threads
//   unreadCount    — total unread messages across all threads
//                    (used by Navbar badge)
//
// What it can do:
//   startConversation(product, seller) — create a new thread or
//                    return an existing one for the same product+seller
//   sendMessage(conversationId, text, type) — add a message to a thread
//   markAsRead(conversationId) — mark all messages in a thread as read
//   getConversation(id) — look up a single thread by id
//
// Data structure of a conversation:
//   {
//     id:          unique id
//     productId:   the listing this is about
//     productTitle
//     productImage
//     productPrice
//     sellerName:  who the buyer is talking to
//     sellerAvatar
//     buyerName:   always "You" for now (real auth later)
//     lastMessage: text of the most recent message
//     lastMessageAt: ISO timestamp
//     unreadCount: number of unread messages in this thread
//     messages: [
//       { id, text, sender ("you"|"seller"), type ("message"|"offer"),
//         offerAmount, timestamp, read }
//     ]
//   }
//
// In production replace localStorage with:
//   GET  /api/messages              → load all conversations
//   POST /api/messages              → start a new conversation
//   POST /api/messages/:id          → send a message
//   PATCH /api/messages/:id/read    → mark as read
//   Use WebSockets for real-time delivery
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";

const MessagingContext = createContext();

// ── Placeholder seed data ────────────────────────────────────
// Gives the inbox something to show before real API data exists.
// Each conversation is pre-seeded with a realistic back-and-forth.
const SEED_CONVERSATIONS = [
  {
    id: "conv-1",
    productId: "1",
    productTitle: "Fender Stratocaster '62 Reissue",
    productImage: "/images/fender-stratocaster.jpg",
    productPrice: 1450,
    sellerName: "VintageAxes",
    sellerAvatar: "VA",
    buyerName: "You",
    lastMessage: "Does it come with the original case?",
    lastMessageAt: "2024-03-10T14:30:00Z",
    unreadCount: 1,
    messages: [
      {
        id: "m1", sender: "you", type: "message",
        text: "Hi! Is this still available?",
        timestamp: "2024-03-10T14:00:00Z", read: true,
      },
      {
        id: "m2", sender: "seller", type: "message",
        text: "Yes, still available! It's in great condition — just had a full setup done.",
        timestamp: "2024-03-10T14:15:00Z", read: true,
      },
      {
        id: "m3", sender: "you", type: "message",
        text: "Does it come with the original case?",
        timestamp: "2024-03-10T14:30:00Z", read: false,
      },
    ],
  },
  {
    id: "conv-2",
    productId: "2",
    productTitle: "Roland Juno-106 Synthesizer",
    productImage: "/images/roland-juno-106.jpg",
    productPrice: 2800,
    sellerName: "SynthWizard",
    sellerAvatar: "SW",
    buyerName: "You",
    lastMessage: "Would you take $2,500?",
    lastMessageAt: "2024-03-09T10:00:00Z",
    unreadCount: 0,
    messages: [
      {
        id: "m4", sender: "you", type: "offer",
        text: "I'd like to make an offer on this Juno-106.",
        offerAmount: 2500,
        timestamp: "2024-03-09T09:45:00Z", read: true,
      },
      {
        id: "m5", sender: "you", type: "message",
        text: "Would you take $2,500?",
        timestamp: "2024-03-09T10:00:00Z", read: true,
      },
      {
        id: "m6", sender: "seller", type: "message",
        text: "Best I can do is $2,650 — it just had all the voice chips recapped.",
        timestamp: "2024-03-09T10:20:00Z", read: true,
      },
    ],
  },
];

export function MessagingProvider({ children }) {

  // Load from localStorage on first render
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem("mporiums-messages");
      return saved ? JSON.parse(saved) : SEED_CONVERSATIONS;
    } catch {
      return SEED_CONVERSATIONS;
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("mporiums-messages", JSON.stringify(conversations));
  }, [conversations]);

  // ── Total unread count across all conversations ───────────
  // Used by the Navbar badge
  const unreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount, 0
  );

  // ── Get a single conversation by id ──────────────────────
  function getConversation(id) {
    return conversations.find((c) => c.id === id) || null;
  }

  // ── Start a new conversation or return existing one ───────
  // Called when the user clicks "Message Seller" on a product.
  // If a thread for this product+seller already exists, returns
  // its id so we navigate to the existing thread instead of
  // creating a duplicate.
  // Returns the conversation id.
  function startConversation(product) {
    const existing = conversations.find(
      (c) => c.productId === product.id && c.sellerName === product.seller
    );
    if (existing) return existing.id;

    const newConv = {
      id:             `conv-${Date.now()}`,
      productId:      product.id,
      productTitle:   product.title,
      productImage:   product.images?.[0] || "",
      productPrice:   product.price,
      sellerName:     product.seller,
      sellerAvatar:   product.sellerAvatar || product.seller.slice(0, 2).toUpperCase(),
      buyerName:      "You",
      lastMessage:    "",
      lastMessageAt:  new Date().toISOString(),
      unreadCount:    0,
      messages:       [],
    };

    setConversations((prev) => [newConv, ...prev]);
    return newConv.id;
  }

  // ── Send a message ────────────────────────────────────────
  // type: "message" | "offer"
  // offerAmount: number (only used when type is "offer")
  function sendMessage(conversationId, text, type = "message", offerAmount = null) {
    const newMsg = {
      id:          `msg-${Date.now()}`,
      sender:      "you",
      type,
      text,
      offerAmount,
      timestamp:   new Date().toISOString(),
      read:        true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv;

        // Auto-reply from seller after a short delay (demo only)
        // In production this comes via WebSocket from the back-end
        setTimeout(() => {
          const replies = [
            "Thanks for your message! Let me check on that for you.",
            "Great question — I'll get back to you shortly.",
            "Sounds good, I appreciate your interest!",
            "Happy to answer any questions you have.",
            "I can ship within 2 business days if you'd like to proceed.",
          ];
          const autoReply = {
            id:        `msg-auto-${Date.now()}`,
            sender:    "seller",
            type:      "message",
            text:      replies[Math.floor(Math.random() * replies.length)],
            timestamp: new Date().toISOString(),
            read:      false,
          };
          setConversations((prev2) =>
            prev2.map((c) => {
              if (c.id !== conversationId) return c;
              return {
                ...c,
                messages:      [...c.messages, autoReply],
                lastMessage:   autoReply.text,
                lastMessageAt: autoReply.timestamp,
                unreadCount:   c.unreadCount + 1,
              };
            })
          );
        }, 1500);

        return {
          ...conv,
          messages:      [...conv.messages, newMsg],
          lastMessage:   text,
          lastMessageAt: newMsg.timestamp,
        };
      })
    );
  }

  // ── Mark all messages in a thread as read ─────────────────
  // Called when the user opens a conversation
  function markAsRead(conversationId) {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv;
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map((m) => ({ ...m, read: true })),
        };
      })
    );
  }

  // ── Delete a conversation ─────────────────────────────────
  function deleteConversation(conversationId) {
    setConversations((prev) =>
      prev.filter((c) => c.id !== conversationId)
    );
  }

  return (
    <MessagingContext.Provider value={{
      conversations,
      unreadCount,
      getConversation,
      startConversation,
      sendMessage,
      markAsRead,
      deleteConversation,
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  return useContext(MessagingContext);
}
