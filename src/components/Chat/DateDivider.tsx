// components/Chat/DateDivider.tsx
import { Typography, theme } from "antd";

const { Text } = Typography;

const DateDivider = ({ label }: { label: string }) => {
    const { token } = theme.useToken();
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "16px 0",
            padding: "0 16px",
        }}>
            <div style={{ flex: 1, height: 1, background: token.colorBorderSecondary }} />
            <Text style={{
                fontSize: 12,
                color: token.colorTextSecondary,
                background: token.colorBgLayout,
                padding: "2px 10px",
                borderRadius: 10,
                border: `1px solid ${token.colorBorderSecondary}`,
                whiteSpace: "nowrap",
            }}>
                {label}
            </Text>
            <div style={{ flex: 1, height: 1, background: token.colorBorderSecondary }} />
        </div>
    );
};

export default DateDivider;