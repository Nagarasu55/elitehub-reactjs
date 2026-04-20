import { useEffect, useRef, useState } from "react";
import {
    Avatar,
    Button,
    Input,
    Typography,
    Spin,
    theme,
    Badge,
    Progress,
    Tooltip,
    message as antMessage,
    Image,
} from "antd";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    SendOutlined,
    PaperClipOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    FileZipOutlined,
    FileTextOutlined,
    VideoCameraOutlined,
    AudioOutlined,
    CloseOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { useChatStore } from "../../store/chatStore";
import { getSocket } from "../../service/socket";
import axiosInstance from "../../service/axios";
import MessageBubble from "./MessageBubble";
import type { Message } from "../../types/chats";
import { getDateLabel } from "../../utils/datelabel";
import DateDivider from "./DateDivider";
import EditGroupModal from "../../components/Chat/EditGroupModal";

const { Text } = Typography;

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
    currentUserId: number;
    onBack: () => void;
    hideSidebar: boolean;
    onlineUsers: number[];
    lastSeenMap: Record<number, string>;
    currentUserName: string;
}

interface FilePreview {
    file: File;
    previewUrl?: string;   // only for images
    name: string;
    size: number;
    mimeType: string;
}

export interface S3FileUrl {
    url: string;       // full S3 public URL
    key: string;       // S3 key (for deletion)
    name: string;      // original filename
    size: number;      // bytes
    mimeType: string;  // MIME type
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageMime = (mime: string) => mime.startsWith("image/");
const isVideoMime = (mime: string) => mime.startsWith("video/");
const isAudioMime = (mime: string) => mime.startsWith("audio/");

const FileIcon = ({ mimeType, size = 20 }: { mimeType: string; size?: number }) => {
    const style = { fontSize: size };
    if (isImageMime(mimeType)) return <FileImageOutlined style={style} />;
    if (isVideoMime(mimeType)) return <VideoCameraOutlined style={style} />;
    if (isAudioMime(mimeType)) return <AudioOutlined style={style} />;
    if (mimeType === "application/pdf") return <FilePdfOutlined style={style} />;
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z"))
        return <FileZipOutlined style={style} />;
    if (mimeType.startsWith("text/")) return <FileTextOutlined style={style} />;
    return <FileOutlined style={style} />;
};

// ─── Component ────────────────────────────────────────────────────────────────
const ChatWindow = ({
    currentUserId,
    onBack,
    hideSidebar,
    onlineUsers,
    lastSeenMap,
    currentUserName,
}: Props) => {
    const {
        setConversations,
        activeConversation,
        messages,
        setMessages,
        addMessage,
        updateConversationToTop,
        deleteMessageForMe,        // ← add
        deleteMessageForEveryone,  // ← add
        editMessage,
        updateMessageRead,
        updateMessageDelivered
    } = useChatStore();

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [editGroupOpen, setEditGroupOpen] = useState(false);

    // ── File state ─────────────────────────────────────────────────────────
    const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // In ChatWindow.tsx

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxImages, setLightboxImages] = useState<S3FileUrl[]>([]);



    const bottomRef = useRef<HTMLDivElement>(null);
    const socket = getSocket();
    const { token } = theme.useToken();

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);



    // ── Typing events ──────────────────────────────────────────────────────
    useEffect(() => {

        if (!activeConversation) return;

        const handleTyping = ({ conversationId, username }: { conversationId: number; userId: number; username: string }) => {
            if (Number(conversationId) !== Number(activeConversation?.id)) return;
            setTypingUsers((prev) => (prev.includes(username) ? prev : [...prev, username]));
        };

        const handleStopTyping = ({ conversationId, username }: { conversationId: number; userId: number; username: string }) => {
            if (Number(conversationId) !== Number(activeConversation?.id)) return;
            setTypingUsers((prev) => prev.filter((u) => u !== username));
        };

        // ✅ Mark undelivered messages as delivered when opening conversation
        socket.emit("mark_delivered", {
            conversationId: activeConversation.id,
            userId: currentUserId,
        });

        // ✅ Mark unread messages as read when opening conversation
        socket.emit("mark_read", {
            conversationId: activeConversation.id,
            userId: currentUserId,
        });

        // ✅ Handle sent confirmation — replaces optimistic message with server version
        // const handleSent = (msg: Message) => {
        //     if (Number(msg.conversation_id) === Number(activeConversation.id)) {
        //         addMessage(msg); // or replaceMessage if you track optimistic ids
        //     }
        // };

        const handleDelivered = ({ messageId, conversationId }: { messageId: number; conversationId: number }) => {
            if (Number(conversationId) === Number(activeConversation.id)) {
                updateMessageDelivered(messageId);
            }
        };

        const handleRead = ({ messageId, conversationId }: { messageId: number; conversationId: number }) => {
            if (Number(conversationId) === Number(activeConversation.id)) {
                updateMessageRead(messageId);
            }
        };




        // inside the conversation useEffect
        const handleMessageDeletedForMe = ({ messageId }: { messageId: number }) => {
            deleteMessageForMe(messageId);
        };

        const handleMessageDeletedForEveryone = ({ messageId }: { messageId: number }) => {
            deleteMessageForEveryone(messageId);
        };

        const handleMessageEdited = ({ messageId, newBody }: { messageId: number; newBody: string }) => {
            editMessage(messageId, newBody);
        };


        socket.on("message_deleted_for_me", handleMessageDeletedForMe);
        socket.on("message_deleted_for_everyone", handleMessageDeletedForEveryone);
        socket.on("message_edited", handleMessageEdited);
        socket.on("user_typing", handleTyping);
        socket.on("user_stop_typing", handleStopTyping);
        // socket.on("message_sent", handleSent);
        socket.on("message_delivered", handleDelivered);
        socket.on("message_read", handleRead);

        return () => {
            socket.off("user_typing", handleTyping);
            socket.off("user_stop_typing", handleStopTyping);
            socket.off("message_deleted_for_me", handleMessageDeletedForMe);
            socket.off("message_deleted_for_everyone", handleMessageDeletedForEveryone);
            socket.off("message_edited", handleMessageEdited);
            socket.off("message_delivered", handleDelivered);
            socket.off("message_read", handleRead);
            // socket.off("message_sent", handleSent);
        };
    }, [activeConversation?.id]);

    // ── Derived values ─────────────────────────────────────────────────────
    const otherMember =
        activeConversation?.type !== "group"
            ? activeConversation?.members.find((m) => m.id !== currentUserId)
            : null;

    const conversationName =
        activeConversation?.type === "group"
            ? activeConversation.name
            : otherMember?.username;

    const isOnline = otherMember ? onlineUsers.includes(otherMember.id) : false;

    const formatLastSeen = (userId: number): string => {
        const timestamp = lastSeenMap[userId];
        if (!timestamp) return "Offline";
        const lastSeen = new Date(timestamp);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        return lastSeen.toLocaleDateString();
    };

    const statusText =
        activeConversation?.type === "group"
            ? `${activeConversation.members.length} members`
            : isOnline
                ? "Online"
                : otherMember
                    ? formatLastSeen(otherMember.id)
                    : "Offline";

    // ── Fetch messages on conversation change ──────────────────────────────
    useEffect(() => {
        if (!activeConversation) return;
        setLoading(true);
        setTypingUsers([]);
        setText("");
        setFilePreviews([]);

        const fetchMessages = async () => {
            try {
                const res = await axiosInstance.get(
                    `/messages/${activeConversation.id}?userId=${currentUserId}`
                );
                setMessages(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        socket.emit("join", activeConversation.id);

        // In ChatWindow.tsx — inside the activeConversation useEffect
        const handleMessage = (msg: Message) => {
            if (Number(msg.conversation_id) === Number(activeConversation.id)) {
                addMessage(msg);

                // ✅ If this message is from someone else and chat is already open
                // immediately mark it as delivered + read
                if (msg.sender_id !== currentUserId) {
                    socket.emit("mark_delivered", {
                        conversationId: activeConversation.id,
                        userId: currentUserId,
                    });
                    socket.emit("mark_read", {
                        conversationId: activeConversation.id,
                        userId: currentUserId,
                    });
                }
            }
        };

        socket.on("receive_message", handleMessage);

        return () => {
            socket.emit("leave", activeConversation.id);
            socket.off("receive_message", handleMessage);
        };
    }, [activeConversation?.id]);

    
    // ── Auto scroll ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!loading) {
            bottomRef.current?.scrollIntoView({ behavior: "instant" });
        }
    }, [messages, loading, typingUsers.length]);

    // ── File selection ─────────────────────────────────────────────────────
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remaining = MAX_FILES - filePreviews.length;
        if (remaining <= 0) {
            antMessage.warning(`You can attach a maximum of ${MAX_FILES} files.`);
            return;
        }

        const valid: FilePreview[] = [];

        for (const file of files.slice(0, remaining)) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                antMessage.error(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
                continue;
            }
            valid.push({
                file,
                previewUrl: isImageMime(file.type)
                    ? URL.createObjectURL(file)
                    : undefined,
                name: file.name,
                size: file.size,
                mimeType: file.type,
            });
        }

        if (files.length > remaining) {
            antMessage.warning(
                `Only ${remaining} more file(s) can be added. Extra files were skipped.`
            );
        }

        setFilePreviews((prev) => [...prev, ...valid]);

        // Reset so same file can be reselected
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFilePreview = (index: number) => {
        setFilePreviews((prev) => {
            const updated = [...prev];
            if (updated[index].previewUrl) {
                URL.revokeObjectURL(updated[index].previewUrl!);
            }
            updated.splice(index, 1);
            return updated;
        });
    };

    // ── Upload files to S3 via backend ─────────────────────────────────────
    const uploadFilesToS3 = async (): Promise<S3FileUrl[]> => {
        if (!filePreviews.length) return [];

        const formData = new FormData();
        // formData.append("conversationId", String(activeConversation?.id));
        // formData.append("senderId", String(currentUserId));
        filePreviews.forEach((fp) => formData.append("files", fp.file));

        console.log('formData', formData)

        setIsUploading(true);
        setUploadProgress(0);

        try {

            const res = await axiosInstance.post(
                `/messages/upload?conversationId=${activeConversation?.id}&senderId=${currentUserId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Backend returns: { fileUrls: [{ url, key, name, size, mimeType }] }
            return res.data.fileUrls as S3FileUrl[];
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // ── Send message ───────────────────────────────────────────────────────
    const handleSend = async () => {
        const hasText = text.trim().length > 0;
        const hasFiles = filePreviews.length > 0;
        if ((!hasText && !hasFiles) || !activeConversation) return;

        setSending(true);
        try {
            let fileUrls: S3FileUrl[] = [];

            if (hasFiles) {
                fileUrls = await uploadFilesToS3();

                // Revoke object URLs after upload
                filePreviews.forEach((fp) => {
                    if (fp.previewUrl) URL.revokeObjectURL(fp.previewUrl);
                });
                setFilePreviews([]);
            }

            socket.emit("message", {
                conversationId: activeConversation.id,
                senderId: currentUserId,
                body: text.trim(),
                fileUrls,   // [{ url, key, name, size, mimeType }]
            });


            updateConversationToTop(activeConversation.id, new Date().toISOString());
            setText("");
        } catch (err) {
            console.error("Send failed:", err);
            antMessage.error("Failed to send message. Please try again.");
            setIsUploading(false);
        } finally {
            setSending(false);
        }
    };

    // ── Typing handler ─────────────────────────────────────────────────────
    const handleMessageOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        socket.emit("typing", {
            conversationId: activeConversation?.id,
            userId: currentUserId,
            username: currentUserName,
        });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", {
                conversationId: activeConversation?.id,
                userId: currentUserId,
                username: currentUserName,
            });
        }, 1500);
    };

    // ── Render messages with date dividers ─────────────────────────────────
    const renderMessagesWithDividers = () => {
        let lastDateLabel = "";
        return messages.map((msg) => {
            const label = getDateLabel(msg.created_at);
            const showDivider = label !== lastDateLabel;
            lastDateLabel = label;
            return (
                <div key={msg.id}>
                    {showDivider && <DateDivider label={label} />}
                    <MessageBubble
                        message={msg}
                        isOwn={msg.sender_id === currentUserId}
                        isGroupMessage={activeConversation?.type === "group"}
                        groupImages={imageGroups.get(msg.id) ?? []}   // ✅ group for this message
                        onImageClick={openLightbox}
                        onDeleteForMe={handleDeleteForMe}
                        onDeleteForEveryone={handleDeleteForEveryone}
                        onEdit={handleEditMessage}
                    />


                </div>
            );
        });
    };

    // ── Typing dots ────────────────────────────────────────────────────────
    // const TypingDots = () => (
    //     <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
    //         {[0, 1, 2].map((i) => (
    //             <div
    //                 key={i}
    //                 style={{
    //                     width: 7,
    //                     height: 7,
    //                     borderRadius: "50%",
    //                     background: token.colorTextSecondary,
    //                     animation: "typingBounce 1.2s infinite ease-in-out",
    //                     animationDelay: `${i * 0.2}s`,
    //                 }}
    //             />
    //         ))}
    //         <style>{`
    //             @keyframes typingBounce {
    //                 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    //                 30% { transform: translateY(-5px); opacity: 1; }
    //             }
    //         `}</style>
    //     </div>
    // );

    const TypingDots = () => (
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <style>{`
            @keyframes typingBounce {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.35;
                }
                30% {
                    transform: translateY(-5px);
                    opacity: 1;
                }
            }
            @keyframes typingPulse {
                0%, 100% { transform: scale(0.8); opacity: 0.4; }
                50% { transform: scale(1.2); opacity: 1; }
            }
        `}</style>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: token.colorPrimary,
                        animation: "typingBounce 1.4s infinite ease-in-out",
                        animationDelay: `${i * 0.16}s`,
                        willChange: "transform, opacity",
                    }}
                />
            ))}
        </div>
    );

    // ── File preview strip ─────────────────────────────────────────────────
    const FilePreviewStrip = () => {
        if (!filePreviews.length && !isUploading) return null;
        return (
            <div
                style={{
                    padding: "8px 16px",
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorBgContainer,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                {/* File count label */}
                <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                    {filePreviews.length} / {MAX_FILES} files selected
                </Text>

                {/* File chips */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {filePreviews.map((fp, idx) => (
                        <div
                            key={idx}
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: token.colorBgLayout,
                                border: `1px solid ${token.colorBorderSecondary}`,
                                borderRadius: 8,
                                padding: fp.previewUrl ? 0 : "6px 10px",
                                overflow: "hidden",
                                maxWidth: 160,
                                flexShrink: 0,
                            }}
                        >
                            {/* Image thumbnail */}
                            {fp.previewUrl ? (
                                <img
                                    src={fp.previewUrl}
                                    alt={fp.name}
                                    style={{
                                        width: 64,
                                        height: 64,
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                            ) : (
                                <>
                                    <FileIcon mimeType={fp.mimeType} />
                                    <div style={{ overflow: "hidden" }}>
                                        <Text
                                            ellipsis
                                            style={{ fontSize: 12, display: "block", maxWidth: 90 }}
                                        >
                                            {fp.name}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
                                            {formatBytes(fp.size)}
                                        </Text>
                                    </div>
                                </>
                            )}

                            {/* Remove button */}
                            <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined style={{ fontSize: 10 }} />}
                                onClick={() => removeFilePreview(idx)}
                                disabled={isUploading}
                                style={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    width: 18,
                                    height: 18,
                                    minWidth: "unset",
                                    padding: 0,
                                    background: "rgba(0,0,0,0.45)",
                                    color: "#fff",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Upload progress bar */}
                {isUploading && (
                    <Progress
                        percent={uploadProgress}
                        size="small"
                        status="active"
                        format={(p) => `Uploading ${p}%`}
                    />
                )}
            </div>
        );
    };


    // ─── Build consecutive image groups ───────────────────────────────────────
    const buildImageGroups = (msgs: Message[]): Map<number, S3FileUrl[]> => {
        // Returns a map of messageId → the full image array for that message's group
        const groups = new Map<number, S3FileUrl[]>();

        let currentGroup: { messageIds: number[]; images: S3FileUrl[] } | null = null;

        for (const msg of msgs) {
            const fileUrls: S3FileUrl[] = typeof msg.file_urls === "string"
                ? JSON.parse(msg.file_urls)
                : (msg.file_urls ?? []);

            const imageFiles = fileUrls.filter(f => f.mimeType?.startsWith("image/"));
            const hasOnlyImages = imageFiles.length > 0 && !msg.body?.trim();
            const hasImagesWithText = imageFiles.length > 0 && !!msg.body?.trim();

            if (imageFiles.length > 0 && !hasImagesWithText) {
                // Pure image message — extend or start a group
                if (!currentGroup) {
                    currentGroup = { messageIds: [], images: [] };
                }
                currentGroup.messageIds.push(msg.id);
                currentGroup.images.push(...imageFiles);
            } else {
                // Text message or image+text — flush current group, don't extend
                currentGroup = null;

                if (hasImagesWithText) {
                    // Images attached to a text message get their own isolated group
                    groups.set(msg.id, imageFiles);
                }
            }

            // Assign the current group snapshot to all message IDs in it
            if (currentGroup) {
                for (const id of currentGroup.messageIds) {
                    groups.set(id, [...currentGroup.images]);
                }
            }
        }

        return groups;
    };

    const imageGroups = buildImageGroups(messages);

    const openLightbox = (groupImages: S3FileUrl[], clickedUrl: string) => {
        const idx = groupImages.findIndex(img => img.url === clickedUrl);
        setLightboxImages(groupImages);
        setLightboxIndex(idx >= 0 ? idx : 0);
        setLightboxOpen(true);
    };

    // handlers passed to MessageBubble
    const handleDeleteForMe = (messageId: number) => {
        socket.emit("delete_message_for_me", {
            messageId,
            userId: currentUserId,
        });
    };

    const handleDeleteForEveryone = (messageId: number) => {
        socket.emit("delete_message_for_everyone", {
            messageId,
            conversationId: activeConversation?.id,
        });
    };

    const handleEditMessage = (messageId: number, newBody: string) => {
        socket.emit("edit_message", {
            messageId,
            conversationId: activeConversation?.id,
            newBody,
        });
    };

    // ── Main render ────────────────────────────────────────────────────────
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

            {/* Header */}
            <div
                style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: token.colorBgContainer,
                }}
            >
                <Button
                    type="text"
                    icon={hideSidebar ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                    onClick={onBack}
                    style={{ display: "flex" }}
                />

                <Badge
                    dot
                    offset={[-2, 32]}
                    styles={{
                        indicator: {
                            width: 10,
                            height: 10,
                            backgroundColor:
                                activeConversation?.type === "group"
                                    ? "transparent"
                                    : isOnline
                                        ? "#52c41a"
                                        : "#d9d9d9",
                            boxShadow: "0 0 0 2px #fff",
                        },
                    }}
                >
                    <Avatar style={{ background: token.colorPrimary }}>
                        {conversationName?.slice(0, 2).toUpperCase()}
                    </Avatar>
                </Badge>

                <div>
                    <Text strong style={{ display: "block", fontSize: 14 }}>
                        {conversationName}
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color:
                                isOnline && activeConversation?.type !== "group"
                                    ? "#52c41a"
                                    : token.colorTextSecondary,
                        }}
                    >
                        {statusText}
                    </Text>
                </div>

                {activeConversation?.type === "group" && (
                    <Button
                        type="text"
                        icon={<SettingOutlined />}
                        onClick={() => setEditGroupOpen(true)}
                        style={{ marginLeft: "auto" }}
                    />
                )}
            </div>

            {/* Messages area */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                {loading ? (
                    <div style={{ textAlign: "center", paddingTop: 40 }}>
                        <Spin />
                    </div>
                ) : (
                    renderMessagesWithDividers()
                )}

    
                <div ref={bottomRef} />
            </div>

            <div
                style={{
                    overflow: "hidden",
                    maxHeight: typingUsers.length > 0 ? "48px" : "0px",
                    opacity: typingUsers.length > 0 ? 1 : 0,
                    transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
                    padding: typingUsers.length > 0 ? "6px 16px" : "0 16px",
                    background: token.colorBgContainer,
                    borderTop: typingUsers.length > 0
                        ? `1px solid ${token.colorBorderSecondary}`
                        : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <TypingDots />
                <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                    {typingUsers.join(", ")}{" "}
                    {typingUsers.length === 1 ? "is" : "are"} typing...
                </Text>
            </div>

            {/* File preview strip — above input */}
            <FilePreviewStrip />

            {/* Input bar */}
            <div
                style={{
                    padding: "12px 16px",
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorBgContainer,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                }}
            >
                {/* Hidden file input — accepts all file types */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="*/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                />

                <Tooltip
                    title={
                        filePreviews.length >= MAX_FILES
                            ? `Maximum ${MAX_FILES} files reached`
                            : `Attach files (max ${MAX_FILES}, ${MAX_FILE_SIZE_MB}MB each)`
                    }
                >
                    <Button
                        type="text"
                        icon={<PaperClipOutlined />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || filePreviews.length >= MAX_FILES}
                        style={{ flexShrink: 0 }}
                    />
                </Tooltip>

                <Input
                    value={text}
                    onChange={handleMessageOnchange}
                    onPressEnter={handleSend}
                    placeholder="Type a message..."
                    style={{ flex: 1 }}
                    disabled={isUploading}
                />

                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={sending || isUploading}
                    disabled={!text.trim() && !filePreviews.length}
                />
            </div>

            {activeConversation?.type === "group" && (
                <EditGroupModal
                    open={editGroupOpen}
                    onClose={() => setEditGroupOpen(false)}
                    conversation={activeConversation}
                    currentUserId={currentUserId}
                    onUpdate={() => {
                        axiosInstance
                            .get(`/conversations/${currentUserId}`)
                            .then((res) => setConversations(res.data))
                            .catch(console.error);
                    }}
                />
            )}

            <div style={{ display: "none" }}>
                <Image.PreviewGroup
                    preview={{
                        visible: lightboxOpen,
                        current: lightboxIndex,
                        onVisibleChange: v => setLightboxOpen(v),
                        onChange: current => setLightboxIndex(current),
                    }}
                >
                    {lightboxImages.map((img, i) => (
                        <Image key={i} src={img.url} />
                    ))}
                </Image.PreviewGroup>
            </div>
        </div>
    );
};

export default ChatWindow;