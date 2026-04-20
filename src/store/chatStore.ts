import { create } from "zustand";
import type { Conversation, Message } from "../types/chats";

interface ChatStore {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    messages: Message[];
    setConversations: (c: Conversation[]) => void;
    setActiveConversation: (c: Conversation) => void;
    setMessages: (m: Message[]) => void;
    addMessage: (m: Message) => void;
    updateConversationToTop: (conversationId: number, lastMessageAt: string) => void;
    deleteMessageForMe: (messageId: number) => void;
    deleteMessageForEveryone: (messageId: number) => void;
    editMessage: (messageId: number, newBody: string) => void;
    resetChat: () => void;
    updateMessageDelivered: (messageId: number) => void;
    updateMessageRead: (messageId: number) => void;
}

const initialState = {
    conversations: [],
    activeConversation: null,
    messages: [],
};

export const useChatStore = create<ChatStore>((set) => ({
    ...initialState,

    setConversations: (conversations) =>
        set({ conversations: Array.isArray(conversations) ? conversations : [] }),

    setActiveConversation: (activeConversation) => set({ activeConversation }),

    setMessages: (messages) =>
        set({ messages: Array.isArray(messages) ? messages : [] }),


    updateConversationToTop: (conversationId, lastMessageAt) =>
        set((state) => {
            const index = state.conversations.findIndex((c) => c.id === conversationId);
            if (index === -1) return state;
            const updated = [...state.conversations];
            const [conversation] = updated.splice(index, 1);
            return {
                conversations: [
                    { ...conversation, last_message_at: lastMessageAt },
                    ...updated,
                ],
            };
        }),

    // ── Delete for me — only marks for current user ────────────────────────
    deleteMessageForMe: (messageId) =>
        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === messageId
                    ? { ...m, is_deleted_for_me: true }
                    : m
            ),
        })),

    // ── Delete for everyone — wipes body and files for all ─────────────────
    deleteMessageForEveryone: (messageId) =>
        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === messageId
                    ? { ...m, is_deleted_for_everyone: true, body: null, file_urls: [] }
                    : m
            ),
        })),

    // ── Edit — updates body and marks as edited ────────────────────────────
    editMessage: (messageId, newBody) =>
        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === messageId
                    ? { ...m, body: newBody, is_edited: true }
                    : m
            ),
        })),

    updateMessageDelivered: (messageId) =>
        set(state => ({
            messages: state.messages.map(m =>
                m.id === messageId ? { ...m, is_delivered: true } : m
            ),
        })),

    updateMessageRead: (messageId) =>
        set(state => ({
            messages: state.messages.map(m =>
                m.id === messageId ? { ...m, is_read: true, is_delivered: true } : m
            ),
        })),
    replaceMessage: (tempId: number, newMessage: Message) =>
        set(state => ({
            messages: state.messages.map(m =>
                m.id === tempId ? newMessage : m
            ),
        })),

    // OR if you're not using optimistic IDs, just prevent duplicates:
    addMessage: (message: Message) =>
        set(state => {
            // ✅ Don't add if message with same id already exists
            const exists = state.messages.some(m => m.id === message.id);
            if (exists) return state;
            return { messages: [...state.messages, message] };
        }),

    resetChat: () => set(initialState),
}));