import { Avatar, Typography, theme, Badge } from "antd";
import type { Conversation } from "../../types/chats";
import { useChatStore } from "../../store/chatStore";

const { Text } = Typography;

interface Props {
    conversation: Conversation;
    currentUserId: number;
    onClick: () => void;
    onlineUsers?: number[];
    lastSeenMap?: Record<number, string>;
    unreadCount?: number;  // ✅
}



const ChatListItem = ({ conversation, currentUserId, onClick, onlineUsers = [], lastSeenMap = {},unreadCount }: Props) => {
    const { activeConversation } = useChatStore();
    const { token } = theme.useToken();

    console.log('onlineUsers chatitem', onlineUsers);


    // Make sure this matches your actual conversation type string
    const otherMember =
        conversation.type !== "group"  // ✅ use !== "group" instead of === "dm"
            ? conversation.members.find((m) => m.id !== currentUserId)
            : null;

    const name =
        conversation.type === "group"
            ? conversation.name
            : otherMember?.username;

    const isActive = activeConversation?.id === conversation.id;
    const isOnline = otherMember ? onlineUsers.includes(otherMember.id) : false;

    const formatLastSeen = (userId: number): string => {
        const timestamp = lastSeenMap[userId];
        console.log('lastSeenMap for', userId, '->', timestamp, '| full map:', lastSeenMap); // 👈 add this

        if (!timestamp) return "Offline";

        const lastSeen = new Date(timestamp);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "last seen Yesterday";
        return `last seen on ${lastSeen.toLocaleDateString()}`;
    };


    const statusText =
        conversation.type === "group"
            ? `${conversation.members.length} members`
            : isOnline
                ? "Online"
                : otherMember
                    ? formatLastSeen(otherMember.id)
                    : "Offline";

    console.log('lastseen othermember', otherMember)

    return (
        <div
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                cursor: "pointer",
                background: isActive ? token.colorPrimaryBg : "transparent",
                borderLeft: isActive
                    ? `3px solid ${token.colorPrimary}`
                    : "3px solid transparent",
                transition: "background 0.2s",
            }}
        >
            {/* Avatar with online dot */}
            <Badge
                dot
                offset={[-2, 30]}
                styles={{
                    indicator: {
                        width: 10,
                        height: 10,
                        backgroundColor:
                            conversation.type === "group"
                                ? "transparent"
                                : isOnline
                                    ? "#52c41a"   // 🟢 online
                                    : "#d9d9d9",  // ⚫ offline
                        boxShadow: conversation.type === "group" ? "none" : "0 0 0 2px #fff",
                    },
                }}
            >
                <Avatar
                    style={{
                        background: token.colorPrimary,
                        flexShrink: 0,
                    }}
                >
                    {name?.slice(0, 2).toUpperCase()}
                </Avatar>
            </Badge>



            
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text
                        strong
                        style={{
                            fontSize: 13,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {name}
                    </Text>

                    {/* ✅ Unread count badge */}
                    {unreadCount && unreadCount > 0 ? (
                        <span style={{
                            background: "#52c41a",
                            color: "#fff",
                            borderRadius: "50%",
                            minWidth: 18,
                            height: 18,
                            fontSize: 11,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 4px",
                            flexShrink: 0,
                        }}>
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    ) : null}
                </div>

                <Text
                    style={{
                        fontSize: 12,
                        color: isOnline && conversation.type !== "group"
                            ? "#52c41a"
                            : token.colorTextSecondary,
                    }}
                >
                    {statusText}
                </Text>
            </div>

        </div>
    );
};

export default ChatListItem;