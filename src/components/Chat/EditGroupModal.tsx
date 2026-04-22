import { useEffect, useState } from "react";
import {
    Modal, Input, Button, Avatar, Typography,
    message, Divider, Tag, Select
} from "antd";
import { UserDeleteOutlined, LogoutOutlined, CrownOutlined } from "@ant-design/icons";
import axiosInstance from "../../service/axios";
import type { Conversation } from "../../types/chats";

const { Text } = Typography;

interface Member {
    id: number;
    username: string;
    firstname?: string;
    role: "admin" | "member";
}

interface Friend {
    id: number;
    username: string;
    firstname?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    conversation: Conversation;
    currentUserId: number;
    onUpdate: () => void; // ✅ refetch conversations after changes
}

const EditGroupModal = ({ open, onClose, conversation, currentUserId, onUpdate }: Props) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [groupName, setGroupName] = useState(conversation.name ?? "");
    const [selectedNewMembers, setSelectedNewMembers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const isAdmin = members.find((m) => m.id === currentUserId)?.role === "admin";

    // ✅ Fetch members and friends when modal opens
    useEffect(() => {
        if (!open) return;
        setGroupName(conversation.name ?? "");
        fetchMembers();
        fetchFriends();
    }, [open]);

    const fetchMembers = async () => {
        try {
            const res = await axiosInstance.get(
                `/conversations/${conversation.id}/members`
            );
            setMembers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFriends = async () => {
        try {
            const res = await axiosInstance.get(
                `/follow/friends/${currentUserId}`
            );
            setFriends(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveName = async () => {
        if (!groupName.trim()) return message.warning("Name cannot be empty");
        setLoading(true);
        try {
            await axiosInstance.put(`/conversations/${conversation.id}/name`, {
                name: groupName.trim(),
                userId: currentUserId,
            });
            message.success("Group name updated");
            onUpdate();
        } catch (err) {
            message.error("Failed to update name");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        try {
            await axiosInstance.delete(
                `/conversations/${conversation.id}/members/${memberId}`,
                { data: { requesterId: currentUserId } }
            );
            message.success("Member removed");
            fetchMembers();
            onUpdate();
        } catch (err) {
            message.error("Failed to remove member");
        }
    };

    const handleAddMembers = async () => {
        if (selectedNewMembers.length === 0) return;
        try {
            await axiosInstance.post(
                `/conversations/${conversation.id}/members`,
                { userIds: selectedNewMembers, requesterId: currentUserId }
            );
            message.success("Members added");
            setSelectedNewMembers([]);
            fetchMembers();
            onUpdate();
        } catch (err) {
            message.error("Failed to add members");
        }
    };

    const handleLeave = async () => {
        try {
             await axiosInstance.delete(
                `/conversations/${conversation.id}/leave`,
                { data: { userId: currentUserId } }
            );
            message.success("Left the group");
            onUpdate();
            onClose();
        } catch (err) {
            message.error("Failed to leave group");
        }
    };

    // ✅ Friends not already in group — for the add members dropdown
    const availableFriends = friends.filter(
        (f) => !members.find((m) => m.id === f.id)
    );


    return (
        <Modal
            title="Edit Group"
            open={open}
            onCancel={onClose}
            footer={null}
            width={460}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>

                {/* ── Group Name ── */}
                {isAdmin && (
                    <div>
                        <Text strong style={{ display: "block", marginBottom: 6 }}>
                            Group Name
                        </Text>
                        <div style={{ display: "flex", gap: 8 }}>
                            <Input
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                maxLength={50}
                                showCount
                            />
                            <Button
                                type="primary"
                                onClick={handleSaveName}
                                loading={loading}
                                disabled={groupName.trim() === conversation.name}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                )}

                <Divider style={{ margin: 0 }} />

                {/* ── Members List ── */}
                <div>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                        Members ({members.length})
                    </Text>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                        {members.map((member) => (
                            <div
                                key={member.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "6px 8px",
                                    borderRadius: 8,
                                    background: "#fafafa",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Avatar style={{ background: "#6C63FF" }}>
                                        {member.username.slice(0, 2).toUpperCase()}
                                    </Avatar>
                                    <div>
                                        <Text strong style={{ fontSize: 13 }}>
                                            {member.username}
                                            {member.id === currentUserId && (
                                                <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                                                    (you)
                                                </Text>
                                            )}
                                        </Text>
                                        {member.role === "admin" && (
                                            <Tag
                                                icon={<CrownOutlined />}
                                                color="gold"
                                                style={{ marginLeft: 6, fontSize: 10 }}
                                            >
                                                Admin
                                            </Tag>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ Admin can remove others (not themselves) */}
                                {isAdmin && member.id !== currentUserId && (
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<UserDeleteOutlined />}
                                        onClick={() => handleRemoveMember(member.id)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Add Members (admin only) ── */}
                {isAdmin && availableFriends.length > 0 && (
                    <>
                        <Divider style={{ margin: 0 }} />
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 6 }}>
                                Add Members
                            </Text>
                            <div style={{ display: "flex", gap: 8 }}>
                                <Select
                                    mode="multiple"
                                    style={{ flex: 1 }}
                                    placeholder="Select friends to add"
                                    value={selectedNewMembers}
                                    onChange={setSelectedNewMembers}
                                    options={availableFriends.map((f) => ({
                                        value: f.id,
                                        label: f.username,
                                    }))}
                                />
                                <Button
                                    type="primary"
                                    onClick={handleAddMembers}
                                    disabled={selectedNewMembers.length === 0}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                <Divider style={{ margin: 0 }} />

                {/* ── Leave Group ── */}
                <Button
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLeave}
                    style={{ alignSelf: "flex-start" }}
                >
                    Leave Group
                </Button>

            </div>
        </Modal>
    );
};

export default EditGroupModal;