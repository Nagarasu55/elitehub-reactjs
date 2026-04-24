// import { Avatar, Typography, theme, Badge } from "antd";
// import type { Conversation } from "../../../types/chats";
// import { useChatStore } from "../../../store/chatStore";

// const { Text } = Typography;

// interface Props {
//     conversation: Conversation;
//     currentUserId: number;
//     onClick: () => void;
//     onlineUsers?: number[];
//     lastSeenMap?: Record<number, string>;
//     unreadCount?: number;  // ✅
// }


// const ChatListItem = ({ conversation, currentUserId, onClick, onlineUsers = [], lastSeenMap = {},unreadCount }: Props) => {
//     const { activeConversation } = useChatStore();
//     const { token } = theme.useToken();

// console.log('conversation',conversation);


//     // Make sure this matches your actual conversation type string
//     const otherMember =
//         conversation.type !== "group"  // ✅ use !== "group" instead of === "dm"
//             ? conversation.members.find((m) => m.id !== currentUserId)
//             : null;

//     const name =
//         conversation.type === "group"
//             ? conversation.name
//             : otherMember?.username;

//     const isActive = activeConversation?.id === conversation.id;
//     const isOnline = otherMember ? onlineUsers.includes(otherMember.id) : false;

//     const formatLastSeen = (userId: number): string => {
//         const timestamp = lastSeenMap[userId];

//         if (!timestamp) return "Offline";

//         const lastSeen = new Date(timestamp);
//         const now = new Date();
//         const diffMins = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);
//         const diffHours = Math.floor(diffMins / 60);
//         const diffDays = Math.floor(diffHours / 24);

//         if (diffMins < 1) return "Just now";
//         if (diffMins < 60) return `${diffMins}m ago`;
//         if (diffHours < 24) return `${diffHours}h ago`;
//         if (diffDays === 1) return "last seen Yesterday";
//         return `last seen on ${lastSeen.toLocaleDateString()}`;
//     };


//     const statusText =
//         conversation.type === "group"
//             ? `${conversation.members.length} members`
//             : isOnline
//                 ? "Online"
//                 : otherMember
//                     ? formatLastSeen(otherMember.id)
//                     : "Offline";


//     return (
//         <div
//             onClick={onClick}
//             style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 padding: "10px 14px",
//                 cursor: "pointer",
//                 background: isActive ? token.colorPrimaryBg : "transparent",
//                 borderLeft: isActive
//                     ? `3px solid ${token.colorPrimary}`
//                     : "3px solid transparent",
//                 transition: "background 0.2s",
//             }}
//         >
//             {/* Avatar with online dot */}
//             <Badge
//                 dot
//                 offset={[-2, 30]}
//                 styles={{
//                     indicator: {
//                         width: 10,
//                         height: 10,
//                         backgroundColor:
//                             conversation.type === "group"
//                                 ? "transparent"
//                                 : isOnline
//                                     ? "#52c41a"   // 🟢 online
//                                     : "#d9d9d9",  // ⚫ offline
//                         boxShadow: conversation.type === "group" ? "none" : "0 0 0 2px #fff",
//                     },
//                 }}
//             >
//                 <Avatar
//                     style={{
//                         background: token.colorPrimary,
//                         flexShrink: 0,
//                     }}
//                 >
//                     {name?.slice(0, 2).toUpperCase()}
//                 </Avatar>
//             </Badge>



            
//             <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <Text
//                         strong
//                         style={{
//                             fontSize: 13,
//                             whiteSpace: "nowrap",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                         }}
//                     >
//                         {name}
//                     </Text>

//                     {/* ✅ Unread count badge */}
//                     {unreadCount && unreadCount > 0 ? (
//                         <span style={{
//                             background: "#52c41a",
//                             color: "#fff",
//                             borderRadius: "50%",
//                             minWidth: 18,
//                             height: 18,
//                             fontSize: 11,
//                             fontWeight: 600,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             padding: "0 4px",
//                             flexShrink: 0,
//                         }}>
//                             {unreadCount > 99 ? "99+" : unreadCount}
//                         </span>
//                     ) : null}
//                 </div>

//                 <Text
//                     style={{
//                         fontSize: 12,
//                         color: isOnline && conversation.type !== "group"
//                             ? "#52c41a"
//                             : token.colorTextSecondary,
//                     }}
//                 >
//                     {statusText}
//                 </Text>
//             </div>

//         </div>
//     );
// };

// export default ChatListItem;


import { Avatar, Typography, theme, Badge } from "antd";
import type { Conversation } from "../../../types/chats";
import { useChatStore } from "../../../store/chatStore";
import styles from "./ChatListItem.module.css";

const { Text } = Typography;

interface Props {
    conversation: Conversation;
    currentUserId: number;
    onClick: () => void;
    onlineUsers?: number[];
    lastSeenMap?: Record<number, string>;
    unreadCount?: number;
}

const ChatListItem = ({
    conversation,
    currentUserId,
    onClick,
    onlineUsers = [],
    lastSeenMap = {},
    unreadCount,
}: Props) => {
    const { activeConversation } = useChatStore();
    const { token } = theme.useToken();

    const otherMember =
        conversation.type !== "group"
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

    // ✅ Better approach for dynamic token-based styles:
    // Compute them as a plain object once, apply via style prop only where needed.
    // Static structure lives in CSS; only token-dependent values stay inline.
    const dynamicItemStyle = {
        background: isActive ? token.colorPrimaryBg : "transparent",
        borderLeftColor: isActive ? token.colorPrimary : "transparent",
    };

    const dynamicStatusStyle = {
        color:
            isOnline && conversation.type !== "group"
                ? "#52c41a"
                : token.colorTextSecondary,
    };

    const dynamicAvatarStyle = {
        background: token.colorPrimary,
        flexShrink: 0 as const,
    };

    return (
        <div
            onClick={onClick}
            className={styles.item}
            style={dynamicItemStyle}
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
                                    ? "#52c41a"
                                    : "#d9d9d9",
                        boxShadow:
                            conversation.type === "group" ? "none" : "0 0 0 2px #fff",
                    },
                }}
            >
                <Avatar style={dynamicAvatarStyle}>
                    {name?.slice(0, 2).toUpperCase()}
                </Avatar>
            </Badge>

            {/* Info */}
            <div className={styles.info}>
                <div className={styles.row}>
                    <Text strong className={styles.name}>
                        {name}
                    </Text>

                    {/* Unread badge */}
                    {unreadCount && unreadCount > 0 ? (
                        <span className={styles.unreadBadge}>
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    ) : null}
                </div>

                <Text className={styles.status} style={dynamicStatusStyle}>
                    {statusText}
                </Text>
            </div>
        </div>
    );
};

export default ChatListItem;