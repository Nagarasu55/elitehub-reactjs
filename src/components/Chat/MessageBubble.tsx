// import { Typography, theme } from "antd";
// import {
//     FileOutlined,
//     FilePdfOutlined,
//     FileImageOutlined,
//     FileZipOutlined,
//     FileTextOutlined,
//     VideoCameraOutlined,
//     AudioOutlined,
// } from "@ant-design/icons";
// import type { Message } from "../../types/chats";
// import type { S3FileUrl } from "./ChatWindow";

// const { Text } = Typography;

// interface Props {
//     message: Message;
//     isOwn: boolean;
//     isGroupMessage: boolean;
// }

// const formatBytes = (bytes: number): string => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// };

// const FileIcon = ({ mimeType }: { mimeType: string }) => {
//     const style = { fontSize: 20 };
//     if (mimeType.startsWith("image/")) return <FileImageOutlined style={style} />;
//     if (mimeType.startsWith("video/")) return <VideoCameraOutlined style={style} />;
//     if (mimeType.startsWith("audio/")) return <AudioOutlined style={style} />;
//     if (mimeType === "application/pdf") return <FilePdfOutlined style={style} />;
//     if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z"))
//         return <FileZipOutlined style={style} />;
//     if (mimeType.startsWith("text/")) return <FileTextOutlined style={style} />;
//     return <FileOutlined style={style} />;
// };

// const getAvatarColor = (text: string) => {
//     const colors = [
//         "#f56a00", "#7265e6", "#ffbf00", "#00a2ae",
//         "#87d068", "#1890ff", "#eb2f96", "#fa541c",
//     ];
//     let hash = 0;
//     for (let i = 0; i < text.length; i++) {
//         hash = text.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     return colors[Math.abs(hash) % colors.length];
// };

// const MessageBubble = ({ message, isOwn, isGroupMessage }: Props) => {
//     const { token } = theme.useToken();

//     const fileUrls: S3FileUrl[] = typeof message.file_urls === "string"
//         ? JSON.parse(message.file_urls)
//         : (message.file_urls ?? []);

//     const hasFiles = fileUrls.length > 0;
//     const hasBody = !!message.body?.trim();

//     const time = new Date(message.created_at).toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//     });

//     const bubbleBg = isOwn ? token.colorPrimary : token.colorBgTextHover;
//     const textColor = isOwn ? "#fff" : token.colorText;
//     const subtleColor = isOwn ? "rgba(255,255,255,0.65)" : token.colorTextSecondary;

//     return (
//         <div style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
//             <div
//                 style={{
//                     maxWidth: "70%",
//                     padding: "8px 12px",
//                     borderRadius: isOwn ? "16px 0 16px 16px" : "0 16px 16px 16px",
//                     background: bubbleBg,
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: 6,
//                 }}
//             >
//                 {/* Group sender name */}
//                 {isGroupMessage && !isOwn && (
//                     <Text style={{
//                         color: getAvatarColor(message.username),
//                         fontSize: 13,
//                         fontWeight: "bold",
//                         display: "block",
//                     }}>
//                         @{message.username}
//                     </Text>
//                 )}

//                 {/* File attachments */}
//                 {hasFiles && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//                         {fileUrls.map((f, i): React.ReactElement | null => {
//                             if (f.mimeType?.startsWith("image/")) {
//                                 return (
//                                     <img
//                                         key={i}
//                                         src={f.url}
//                                         alt={f.name}
//                                         onClick={() => window.open(f.url, "_blank")}
//                                         style={{
//                                             maxWidth: 220,
//                                             maxHeight: 220,
//                                             borderRadius: 8,
//                                             objectFit: "cover",
//                                             cursor: "pointer",
//                                             display: "block",
//                                         }}
//                                     />
//                                 );
//                             }

//                             if (f.mimeType?.startsWith("video/")) {
//                                 return (
//                                     <video
//                                         key={i}
//                                         controls={true}
//                                         style={{ maxWidth: 260, borderRadius: 8, display: "block" }}
//                                     >
//                                         <source src={f.url} type={f.mimeType} />
//                                     </video>
//                                 );
//                             }

//                             if (f.mimeType?.startsWith("audio/")) {
//                                 return (
//                                     <audio key={i} controls={true} style={{ maxWidth: 260 }}>
//                                         <source src={f.url} type={f.mimeType} />
//                                     </audio>
//                                 );
//                             }

//                             if (f.url && f.name) {
//                                 return (
//                                     <a
//                                         key={i}
//                                         href={f.url}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         style={{
//                                             display: "flex",
//                                             alignItems: "center",
//                                             gap: 8,
//                                             padding: "6px 10px",
//                                             background: isOwn ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
//                                             borderRadius: 8,
//                                             textDecoration: "none",
//                                             color: textColor,
//                                         }}
//                                     >
//                                         <FileIcon mimeType={f.mimeType} />
//                                         <div style={{ overflow: "hidden" }}>
//                                             <Text
//                                                 ellipsis
//                                                 style={{ fontSize: 12, color: textColor, display: "block", maxWidth: 160 }}
//                                             >
//                                                 {f.name}
//                                             </Text>
//                                             <Text style={{ fontSize: 11, color: subtleColor }}>
//                                                 {formatBytes(f.size)}
//                                             </Text>
//                                         </div>
//                                     </a>
//                                 );
//                             }

//                             return null;  // ✅ explicit fallback — never returns a plain object
//                         })}
//                     </div>
//                 )}

//                 {/* Text body */}
//                 {hasBody && (
//                     <Text style={{ color: textColor, fontSize: 13, display: "block" }}>
//                         {message.body}
//                     </Text>
//                 )}

//                 {/* Timestamp */}
//                 <Text style={{
//                     color: subtleColor,
//                     fontSize: 11,
//                     display: "block",
//                     textAlign: "right",
//                     marginTop: 2,
//                 }}>
//                     {time}
//                 </Text>
//             </div>
//         </div>
//     );
// };

// export default MessageBubble;



// import { Typography, theme, Modal, Image } from "antd";
// import { useState, useEffect } from "react";
// import {
//     FileOutlined, FilePdfOutlined, FileImageOutlined,
//     FileZipOutlined, FileTextOutlined, VideoCameraOutlined,
//     AudioOutlined, DownloadOutlined, EyeOutlined,
//     FileWordOutlined, FileExcelOutlined, FilePptOutlined,
// } from "@ant-design/icons";
// import type { Message } from "../../types/chats";
// import type { S3FileUrl } from "./ChatWindow";

// const { Text } = Typography;

// interface Props {
//     message: Message;
//     isOwn: boolean;
//     isGroupMessage: boolean;
//     groupImages: S3FileUrl[];                                    // ✅ new
//     onImageClick: (groupImages: S3FileUrl[], url: string) => void; // ✅ new

// }

// interface DownloadedFile {
//     url: string;
//     blobUrl: string;
//     name: string;
// }

// const formatBytes = (bytes: number): string => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// };

// const FileIcon = ({ mimeType, size = 20 }: { mimeType: string; size?: number }) => {
//     const style = { fontSize: size };
//     if (mimeType.startsWith("image/")) return <FileImageOutlined style={style} />;
//     if (mimeType.startsWith("video/")) return <VideoCameraOutlined style={style} />;
//     if (mimeType.startsWith("audio/")) return <AudioOutlined style={style} />;
//     if (mimeType === "application/pdf") return <FilePdfOutlined style={style} />;
//     if (mimeType.includes("wordprocessingml") || mimeType === "application/msword")
//         return <FileWordOutlined style={style} />;
//     if (mimeType.includes("spreadsheetml") || mimeType === "application/vnd.ms-excel")
//         return <FileExcelOutlined style={style} />;
//     if (mimeType.includes("presentationml") || mimeType === "application/vnd.ms-powerpoint")
//         return <FilePptOutlined style={style} />;
//     if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z"))
//         return <FileZipOutlined style={style} />;
//     if (mimeType.startsWith("text/")) return <FileTextOutlined style={style} />;
//     return <FileOutlined style={style} />;
// };

// const getAvatarColor = (text: string) => {
//     const colors = ["#f56a00", "#7265e6", "#ffbf00", "#00a2ae", "#87d068", "#1890ff", "#eb2f96", "#fa541c"];
//     let hash = 0;
//     for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
//     return colors[Math.abs(hash) % colors.length];
// };

// // ─── Detect if a file type should offer "open with" instead of just download ──
// const isOpenWithType = (mimeType: string) =>
//     mimeType === "application/pdf" ||
//     mimeType.includes("wordprocessingml") ||
//     mimeType === "application/msword" ||
//     mimeType.includes("spreadsheetml") ||
//     mimeType === "application/vnd.ms-excel" ||
//     mimeType.includes("presentationml") ||
//     mimeType === "application/vnd.ms-powerpoint";

// // ─── Open With options per file type ─────────────────────────────────────────
// const getOpenWithOptions = (mimeType: string, url: string) => {
//     const encoded = encodeURIComponent(url);
//     if (mimeType === "application/pdf") return [
//         { label: "Open in browser", href: url },
//         { label: "Open in Adobe", href: `adobe-dc://open?url=${encoded}` },
//         { label: "Google Drive viewer", href: `https://drive.google.com/viewerng/viewer?url=${encoded}` },
//     ];
//     if (mimeType.includes("wordprocessingml") || mimeType === "application/msword") return [
//         { label: "Open in browser", href: url },
//         { label: "Open in Google Docs", href: `https://docs.google.com/viewer?url=${encoded}` },
//         { label: "Open in Microsoft 365", href: `ms-word:ofe|u|${url}` },
//     ];
//     if (mimeType.includes("spreadsheetml") || mimeType === "application/vnd.ms-excel") return [
//         { label: "Open in browser", href: url },
//         { label: "Open in Google Sheets", href: `https://docs.google.com/viewer?url=${encoded}` },
//         { label: "Open in Microsoft 365", href: `ms-excel:ofe|u|${url}` },
//     ];
//     if (mimeType.includes("presentationml") || mimeType === "application/vnd.ms-powerpoint") return [
//         { label: "Open in browser", href: url },
//         { label: "Open in Google Slides", href: `https://docs.google.com/viewer?url=${encoded}` },
//         { label: "Open in Microsoft 365", href: `ms-powerpoint:ofe|u|${url}` },
//     ];
//     return [{ label: "Open in browser", href: url }];
// };

// // ─── Core download function ───────────────────────────────────────────────────
// const triggerDownload = (blobUrl: string, name: string) => {
//     const a = document.createElement("a");
//     a.href = blobUrl;
//     a.download = name;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
// };

// const MessageBubble = ({ message, isOwn, isGroupMessage, onImageClick, groupImages }: Props) => {
//     const { token } = theme.useToken();

//     // ── Download tracking (persisted per session in memory) ────────────────
//     const [downloadedFiles, setDownloadedFiles] = useState<Record<string, DownloadedFile>>({});
//     const [downloadingKeys, setDownloadingKeys] = useState<Record<string, boolean>>({});

//     // ── Image lightbox ─────────────────────────────────────────────────────
//     const [previewImages, setPreviewImages] = useState<S3FileUrl[]>([]);
//     const [previewIndex, setPreviewIndex] = useState(0);
//     const [previewOpen, setPreviewOpen] = useState(false);

//     // ── Video modal ────────────────────────────────────────────────────────
//     const [videoModal, setVideoModal] = useState<S3FileUrl | null>(null);

//     // ── Re-download confirm modal ──────────────────────────────────────────
//     const [redownloadTarget, setRedownloadTarget] = useState<S3FileUrl | null>(null);

//     // ── Open-with modal ────────────────────────────────────────────────────
//     const [openWithFile, setOpenWithFile] = useState<S3FileUrl | null>(null);

//     const fileUrls: S3FileUrl[] = typeof message.file_urls === "string"
//         ? JSON.parse(message.file_urls)
//         : (message.file_urls ?? []);

//     const hasFiles = fileUrls.length > 0;
//     const hasBody = !!message.body?.trim();
//     const imageFiles = fileUrls.filter(f => f.mimeType?.startsWith("image/"));

//     const time = new Date(message.created_at).toLocaleTimeString([], {
//         hour: "2-digit", minute: "2-digit",
//     });

//     const bubbleBg = isOwn ? token.colorPrimary : token.colorBgTextHover;
//     const textColor = isOwn ? "#fff" : token.colorText;
//     const subtleColor = isOwn ? "rgba(255,255,255,0.65)" : token.colorTextSecondary;



//     // ── Click handler for office/pdf files ────────────────────────────────
//     const handleOfficeFileClick = (f: S3FileUrl) => {
//         setOpenWithFile(f);
//     };

//     const openImagePreview = (f: S3FileUrl) => {
//         setPreviewImages(imageFiles);
//         setPreviewIndex(imageFiles.findIndex(img => img.url === f.url));
//         setPreviewOpen(true);
//     };

//     // ── Fetch + cache blob, then trigger download ──────────────────────────

//     // const triggerDownload = (blobUrl: string, name: string) => {
//     //     const a = document.createElement("a");
//     //     a.href = blobUrl;
//     //     a.download = name;
//     //     document.body.appendChild(a);
//     //     a.click();
//     //     document.body.removeChild(a);
//     // };

//     // const handleDownload = async (f: S3FileUrl, forceRename = false) => {
//     //     const key = f.key;

//     //     if (downloadedFiles[key] && !forceRename) {
//     //         setRedownloadTarget(f);
//     //         return;
//     //     }

//     //     setDownloadingKeys(prev => ({ ...prev, [key]: true }));
//     //     try {
//     //         // ✅ Route through backend to avoid S3 CORS issues
//     //         const proxyUrl = `/api/messages/download?url=${encodeURIComponent(f.url)}&name=${encodeURIComponent(f.name)}`;
//     //         const res = await fetch(proxyUrl);
//     //         const blob = await res.blob();
//     //         const blobUrl = URL.createObjectURL(blob);

//     //         setDownloadedFiles(prev => ({ ...prev, [key]: { url: f.url, blobUrl, name: f.name } }));
//     //         triggerDownload(blobUrl, forceRename ? `${Date.now()}_${f.name}` : f.name);
//     //     } catch {
//     //         window.open(f.url, "_blank");
//     //     } finally {
//     //         setDownloadingKeys(prev => ({ ...prev, [key]: false }));
//     //     }
//     // };


//     const triggerOpenWith = (blobUrl: string, name: string) => {
//         const a = document.createElement("a");
//         a.href = blobUrl;
//         a.download = name;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//     };

//     const handleDownloadAndOpen = async (f: S3FileUrl) => {
//         const key = f.key;

//         // Already cached — just re-trigger OS open with
//         if (downloadedFiles[key]) {
//             triggerOpenWith(downloadedFiles[key].blobUrl, f.name);
//             return;
//         }

//         setDownloadingKeys(prev => ({ ...prev, [key]: true }));
//         try {
//             const proxyUrl = `/api/messages/download?url=${encodeURIComponent(f.url)}&name=${encodeURIComponent(f.name)}`;
//             const res = await fetch(proxyUrl);
//             const blob = await res.blob();
//             const blobUrl = URL.createObjectURL(blob);

//             setDownloadedFiles(prev => ({
//                 ...prev,
//                 [key]: { url: f.url, blobUrl, name: f.name },
//             }));

//             triggerOpenWith(blobUrl, f.name);
//         } catch {
//             window.open(f.url, "_blank");
//         } finally {
//             setDownloadingKeys(prev => ({ ...prev, [key]: false }));
//         }
//     };

//     return (
//         <>
//             <div style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
//                 <div
//                     style={{
//                         maxWidth: "70%",
//                         padding: "8px 12px",
//                         borderRadius: isOwn ? "16px 0 16px 16px" : "0 16px 16px 16px",
//                         background: bubbleBg,
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 6,
//                     }}
//                 >
//                     {/* Group sender name */}
//                     {isGroupMessage && !isOwn && (
//                         <Text style={{
//                             color: getAvatarColor(message.username),
//                             fontSize: 13, fontWeight: "bold", display: "block",
//                         }}>
//                             @{message.username}
//                         </Text>
//                     )}

//                     {/* ── File attachments ──────────────────────────────── */}
//                     {hasFiles && (
//                         <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//                             {fileUrls.map((f, i): React.ReactElement | null => {
//                                 const isDownloaded = !!downloadedFiles[f.key];
//                                 const isDownloading = !!downloadingKeys[f.key];

//                                 // ── Image ──────────────────────────────
//                                 if (f.mimeType?.startsWith("image/")) {
//                                     return (
//                                         <div
//                                             key={i}
//                                             style={{ position: "relative", display: "inline-block" }}
//                                             onMouseEnter={e => {
//                                                 const overlay = e.currentTarget.querySelector(".overlay") as HTMLElement;
//                                                 if (overlay) overlay.style.opacity = "1";
//                                             }}
//                                             onMouseLeave={e => {
//                                                 const overlay = e.currentTarget.querySelector(".overlay") as HTMLElement;
//                                                 if (overlay) overlay.style.opacity = "0";
//                                             }}
//                                         >
//                                             <img
//                                                 src={f.url}
//                                                 alt={f.name}
//                                                 style={{
//                                                     maxWidth: 220, maxHeight: 220, borderRadius: 8,
//                                                     objectFit: "cover", display: "block",
//                                                 }}
//                                             />
//                                             <div
//                                                 className="overlay"
//                                                 style={{
//                                                     position: "absolute", inset: 0, borderRadius: 8,
//                                                     background: "rgba(0,0,0,0.5)",
//                                                     display: "flex", alignItems: "center",
//                                                     justifyContent: "center", gap: 20,
//                                                     opacity: 0, transition: "opacity 0.2s",
//                                                 }}
//                                             >
//                                                 {/* 

//                                                 <EyeOutlined
//                                                     style={{ fontSize: 22, color: "#fff", cursor: "pointer" }}
//                                                     onClick={() => onImageClick(groupImages, f.url)}  // ✅ passes the group
//                                                 /> */}

//                                                 <EyeOutlined
//                                                     style={{
//                                                         fontSize: 16, cursor: "pointer",
//                                                         color: isDownloading ? subtleColor : textColor,
//                                                         opacity: isDownloading ? 0.5 : 1,
//                                                     }}
//                                                     onClick={() => !isDownloading && handleDownloadAndOpen(f)}
//                                                 />
//                                                 <DownloadOutlined
//                                                     style={{
//                                                         fontSize: 22, cursor: "pointer",
//                                                         color: isDownloaded ? "#52c41a" : "#fff",
//                                                     }}
//                                                     onClick={() => handleDownload(f)}
//                                                 />
//                                             </div>
//                                         </div>
//                                     );
//                                 }

//                                 // ── Video ──────────────────────────────
//                                 if (f.mimeType?.startsWith("video/")) {
//                                     return (
//                                         <div
//                                             key={i}
//                                             style={{
//                                                 display: "flex", alignItems: "center", gap: 8,
//                                                 padding: "6px 10px", borderRadius: 8,
//                                                 background: isOwn ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
//                                             }}
//                                         >
//                                             <VideoCameraOutlined style={{ fontSize: 20, color: textColor, flexShrink: 0 }} />
//                                             <div style={{ overflow: "hidden", flex: 1 }}>
//                                                 <Text ellipsis style={{ fontSize: 12, color: textColor, display: "block", maxWidth: 140 }}>
//                                                     {f.name}
//                                                 </Text>
//                                                 <Text style={{ fontSize: 11, color: subtleColor }}>{formatBytes(f.size)}</Text>
//                                             </div>
//                                             <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
//                                                 <EyeOutlined
//                                                     style={{ fontSize: 16, color: textColor, cursor: "pointer" }}
//                                                     onClick={() => setVideoModal(f)}
//                                                 />
//                                                 <DownloadOutlined
//                                                     style={{
//                                                         fontSize: 16, cursor: "pointer",
//                                                         color: isDownloaded ? "#52c41a" : textColor,
//                                                         opacity: isDownloading ? 0.5 : 1,
//                                                     }}
//                                                     onClick={() => handleDownload(f)}
//                                                 />
//                                             </div>
//                                         </div>
//                                     );
//                                 }

//                                 // ── Audio ──────────────────────────────
//                                 if (f.mimeType?.startsWith("audio/")) {
//                                     return (
//                                         <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//                                             <audio controls={true} style={{ maxWidth: 260, height: 36 }}>
//                                                 <source src={f.url} type={f.mimeType} />
//                                             </audio>
//                                             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                                                 <Text style={{ fontSize: 11, color: subtleColor }}>{f.name}</Text>
//                                                 <DownloadOutlined
//                                                     style={{
//                                                         fontSize: 14, cursor: "pointer",
//                                                         color: isDownloaded ? "#52c41a" : subtleColor,
//                                                     }}
//                                                     onClick={() => handleDownload(f)}
//                                                 />
//                                             </div>
//                                         </div>
//                                     );
//                                 }

//                                 // ── Office / PDF (open-with flow) ──────
//                                 if (isOpenWithType(f.mimeType)) {
//                                     return (
//                                         <div
//                                             key={i}
//                                             style={{
//                                                 display: "flex", alignItems: "center", gap: 8,
//                                                 padding: "6px 10px", borderRadius: 8,
//                                                 background: isOwn ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
//                                             }}
//                                         >
//                                             <FileIcon mimeType={f.mimeType} />
//                                             <div style={{ overflow: "hidden", flex: 1 }}>
//                                                 <Text ellipsis style={{ fontSize: 12, color: textColor, display: "block", maxWidth: 140 }}>
//                                                     {f.name}
//                                                 </Text>
//                                                 <Text style={{ fontSize: 11, color: subtleColor }}>{formatBytes(f.size)}</Text>
//                                             </div>
//                                             <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
//                                                 <EyeOutlined
//                                                     style={{ fontSize: 16, color: textColor, cursor: "pointer" }}
//                                                     onClick={() => handleOfficeFileClick(f)}
//                                                 />
//                                                 <DownloadOutlined
//                                                     style={{
//                                                         fontSize: 16, cursor: "pointer",
//                                                         color: isDownloaded ? "#52c41a" : textColor,
//                                                         opacity: isDownloading ? 0.5 : 1,
//                                                     }}
//                                                     onClick={() => handleDownload(f)}
//                                                 />
//                                             </div>
//                                         </div>
//                                     );
//                                 }

//                                 // ── Generic file (zip, txt, csv…) ──────
//                                 if (f.url && f.name) {
//                                     return (
//                                         <div
//                                             key={i}
//                                             style={{
//                                                 display: "flex", alignItems: "center", gap: 8,
//                                                 padding: "6px 10px", borderRadius: 8,
//                                                 background: isOwn ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
//                                             }}
//                                         >
//                                             <FileIcon mimeType={f.mimeType} />
//                                             <div style={{ overflow: "hidden", flex: 1 }}>
//                                                 <Text ellipsis style={{ fontSize: 12, color: textColor, display: "block", maxWidth: 140 }}>
//                                                     {f.name}
//                                                 </Text>
//                                                 <Text style={{ fontSize: 11, color: subtleColor }}>{formatBytes(f.size)}</Text>
//                                             </div>
//                                             <DownloadOutlined
//                                                 style={{
//                                                     fontSize: 16, cursor: "pointer",
//                                                     color: isDownloaded ? "#52c41a" : textColor,
//                                                     opacity: isDownloading ? 0.5 : 1,
//                                                     flexShrink: 0,
//                                                 }}
//                                                 onClick={() => handleDownload(f)}
//                                             />
//                                         </div>
//                                     );
//                                 }

//                                 return null;
//                             })}
//                         </div>
//                     )}

//                     {/* Text body */}
//                     {hasBody && (
//                         <Text style={{ color: textColor, fontSize: 13, display: "block" }}>
//                             {message.body}
//                         </Text>
//                     )}

//                     {/* Timestamp */}
//                     <Text style={{
//                         color: subtleColor, fontSize: 11,
//                         display: "block", textAlign: "right", marginTop: 2,
//                     }}>
//                         {time}
//                     </Text>
//                 </div>
//             </div>

//             {/* ── Image lightbox ─────────────────────────────────────────── */}
//             <div style={{ display: "none" }}>
//                 <Image.PreviewGroup
//                     preview={{
//                         visible: previewOpen,
//                         current: previewIndex,
//                         onVisibleChange: v => setPreviewOpen(v),
//                     }}
//                 >
//                     {previewImages.map((img, i) => (
//                         <Image key={i} src={img.url} />
//                     ))}
//                 </Image.PreviewGroup>
//             </div>

//             {/* ── Video modal ────────────────────────────────────────────── */}
//             <Modal
//                 open={!!videoModal}
//                 onCancel={() => setVideoModal(null)}
//                 footer={null}
//                 centered
//                 title={videoModal?.name}
//                 width={640}
//                 destroyOnClose
//             >
//                 {videoModal && (
//                     <video controls={true} style={{ width: "100%", borderRadius: 8 }}>
//                         <source src={videoModal.url} type={videoModal.mimeType} />
//                     </video>
//                 )}
//             </Modal>

//             {/* ── Re-download confirm modal ──────────────────────────────── */}
//             <Modal
//                 open={!!redownloadTarget}
//                 onCancel={() => setRedownloadTarget(null)}
//                 title="File already downloaded"
//                 centered
//                 footer={null}
//             >
//                 {redownloadTarget && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
//                         <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>
//                             <strong>{redownloadTarget.name}</strong> has already been downloaded. What would you like to do?
//                         </Text>
//                         <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//                             <button
//                                 style={{
//                                     padding: "8px 16px", borderRadius: 8, border: `1px solid ${token.colorBorder}`,
//                                     cursor: "pointer", background: token.colorBgContainer,
//                                     color: token.colorText, fontSize: 13, textAlign: "left",
//                                 }}
//                                 onClick={() => {
//                                     const f = redownloadTarget;
//                                     setRedownloadTarget(null);
//                                     // Re-trigger same filename (browser will handle -1, -2 etc.)
//                                     triggerDownload(downloadedFiles[f.key].blobUrl, f.name);
//                                 }}
//                             >
//                                 Replace (download again with same name)
//                             </button>
//                             <button
//                                 style={{
//                                     padding: "8px 16px", borderRadius: 8, border: `1px solid ${token.colorBorder}`,
//                                     cursor: "pointer", background: token.colorBgContainer,
//                                     color: token.colorText, fontSize: 13, textAlign: "left",
//                                 }}
//                                 onClick={() => {
//                                     const f = redownloadTarget;
//                                     setRedownloadTarget(null);
//                                     handleDownload(f, true); // forceRename = prepend timestamp
//                                 }}
//                             >
//                                 Save as new file (rename with timestamp)
//                             </button>
//                             <button
//                                 style={{
//                                     padding: "8px 16px", borderRadius: 8, border: `1px solid ${token.colorBorder}`,
//                                     cursor: "pointer", background: token.colorBgContainer,
//                                     color: token.colorTextSecondary, fontSize: 13, textAlign: "left",
//                                 }}
//                                 onClick={() => setRedownloadTarget(null)}
//                             >
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </Modal>

//             {/* ── Open-with modal (PDF / Office docs) ───────────────────── */}
//             <Modal
//                 open={!!openWithFile}
//                 onCancel={() => setOpenWithFile(null)}
//                 title={`Open "${openWithFile?.name}"`}
//                 centered
//                 footer={null}
//             >
//                 {openWithFile && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
//                         <Text style={{ color: token.colorTextSecondary, fontSize: 13, marginBottom: 4 }}>
//                             Choose how to open this file:
//                         </Text>
//                         {getOpenWithOptions(openWithFile.mimeType, openWithFile.url).map((opt, i) => (
//                             <a
//                                 key={i}
//                                 href={opt.href}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 onClick={() => setOpenWithFile(null)}
//                                 style={{
//                                     display: "block", padding: "8px 16px",
//                                     borderRadius: 8, border: `1px solid ${token.colorBorder}`,
//                                     color: token.colorText, textDecoration: "none",
//                                     fontSize: 13,
//                                 }}
//                             >
//                                 {opt.label}
//                             </a>
//                         ))}
//                         <button
//                             style={{
//                                 marginTop: 4, padding: "8px 16px", borderRadius: 8,
//                                 border: `1px solid ${token.colorBorder}`,
//                                 cursor: "pointer", background: "transparent",
//                                 color: token.colorTextSecondary, fontSize: 13,
//                             }}
//                             onClick={() => {
//                                 handleDownload(openWithFile);
//                                 setOpenWithFile(null);
//                             }}
//                         >
//                             Download instead
//                         </button>
//                     </div>
//                 )}
//             </Modal>
//         </>
//     );
// };

// export default MessageBubble;


import { Typography, theme, Modal, Tooltip, Input, Dropdown } from "antd";
import { useState } from "react";
import {
    FileOutlined, FilePdfOutlined, FileImageOutlined,
    FileZipOutlined, FileTextOutlined, VideoCameraOutlined,
    AudioOutlined, DownloadOutlined, EyeOutlined,
    FileWordOutlined, FileExcelOutlined, FilePptOutlined,
    DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined,
} from "@ant-design/icons";
import type { Message } from "../../types/chats";
import type { S3FileUrl } from "./ChatWindow";
import type { MenuProps } from "antd";

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
    message: Message;
    isOwn: boolean;
    isGroupMessage: boolean;
    groupImages: S3FileUrl[];
    onImageClick: (groupImages: S3FileUrl[], url: string) => void;
    onDeleteForMe: (messageId: number) => void;
    onDeleteForEveryone: (messageId: number) => void;
    onEdit: (messageId: number, newBody: string) => void;
}

interface DownloadedFile {
    url: string;
    blobUrl: string;
    name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileIcon = ({ mimeType, size = 20 }: { mimeType: string; size?: number }) => {
    const style = { fontSize: size };
    if (mimeType.startsWith("image/")) return <FileImageOutlined style={style} />;
    if (mimeType.startsWith("video/")) return <VideoCameraOutlined style={style} />;
    if (mimeType.startsWith("audio/")) return <AudioOutlined style={style} />;
    if (mimeType === "application/pdf") return <FilePdfOutlined style={style} />;
    if (mimeType.includes("wordprocessingml") || mimeType === "application/msword")
        return <FileWordOutlined style={style} />;
    if (mimeType.includes("spreadsheetml") || mimeType === "application/vnd.ms-excel")
        return <FileExcelOutlined style={style} />;
    if (mimeType.includes("presentationml") || mimeType === "application/vnd.ms-powerpoint")
        return <FilePptOutlined style={style} />;
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z"))
        return <FileZipOutlined style={style} />;
    if (mimeType.startsWith("text/")) return <FileTextOutlined style={style} />;
    return <FileOutlined style={style} />;
};

const getAvatarColor = (text: string) => {
    const colors = ["#f56a00", "#7265e6", "#ffbf00", "#00a2ae", "#87d068", "#1890ff", "#eb2f96", "#fa541c"];
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const isOpenWithType = (mimeType: string) =>
    mimeType === "application/pdf" ||
    mimeType.includes("wordprocessingml") ||
    mimeType === "application/msword" ||
    mimeType.includes("spreadsheetml") ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType.includes("presentationml") ||
    mimeType === "application/vnd.ms-powerpoint";

// ─── Component ────────────────────────────────────────────────────────────────
const MessageBubble = ({
    message,
    isOwn,
    isGroupMessage,
    onImageClick,
    groupImages,
    onDeleteForMe,
    onDeleteForEveryone,
    onEdit,
}: Props) => {
    const { token } = theme.useToken();

    const [downloadedFiles, setDownloadedFiles] = useState<Record<string, DownloadedFile>>({});
    const [downloadingKeys, setDownloadingKeys] = useState<Record<string, boolean>>({});
    const [redownloadTarget, setRedownloadTarget] = useState<S3FileUrl | null>(null);
    const [videoModal, setVideoModal] = useState<S3FileUrl | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.body ?? "");
    const [deleteTarget, setDeleteTarget] = useState<"for_me" | "for_everyone" | null>(null);

    // ── Derived ────────────────────────────────────────────────────────────
    const fileUrls: S3FileUrl[] = typeof message.file_urls === "string"
        ? JSON.parse(message.file_urls)
        : (message.file_urls ?? []);

    const hasFiles = fileUrls.length > 0;
    const hasBody = !!message.body?.trim();

    const isDeletedForMe = !!message.is_deleted_for_me;
    const isDeletedForEveryone = !!message.is_deleted_for_everyone;
    const isDeleted = isDeletedForMe || isDeletedForEveryone;

    const time = new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit",
    });

    const bubbleBg = isDeleted
        ? (isOwn ? "rgba(99,99,132,0.35)" : token.colorBgTextHover)
        : (isOwn ? token.colorPrimary : token.colorBgTextHover);
    const textColor = isOwn ? "#fff" : token.colorText;
    const subtleColor = isOwn ? "rgba(255,255,255,0.65)" : token.colorTextSecondary;

    // ── 5-minute edit window ───────────────────────────────────────────────
    const isWithin5Mins = (): boolean => {
        const sent = new Date(message.created_at).getTime();
        return Date.now() - sent < 5 * 60 * 1000;
    };

    // ── Context menu ───────────────────────────────────────────────────────


    const menuItems: MenuProps["items"] = [
        // Edit — own, text-only, not deleted, within 5 mins
        ...(isOwn && hasBody && !isDeleted && isWithin5Mins()
            ? [{
                key: "edit",
                label: "Edit",
                icon: <EditOutlined />,
                onClick: () => {
                    setEditText(message.body ?? "");
                    setIsEditing(true);
                },
            }]
            : []
        ),

        // Delete for me — always visible
        {
            key: "delete_for_me",
            label: "Delete for me",
            icon: <DeleteOutlined />,
            onClick: () => onDeleteForMe(message.id),  // ✅ immediate, no confirm
        },

        // Delete for everyone — own messages only
        ...(isOwn && !isDeleted
            ? [{
                key: "delete_for_everyone",
                label: "Delete for everyone",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => onDeleteForEveryone(message.id),  // ✅ immediate, no confirm
            }]
            : []
        ),
    ];

    // ── Edit submit ────────────────────────────────────────────────────────
    const handleEditSubmit = () => {
        const trimmed = editText.trim();
        if (!trimmed || trimmed === message.body) {
            setIsEditing(false);
            return;
        }
        onEdit(message.id, trimmed);
        setIsEditing(false);
    };

    // ── Incremented filename helper ────────────────────────────────────────
    const getIncrementedFileName = (originalName: string): string => {
        const dotIndex = originalName.lastIndexOf(".");
        const hasExt = dotIndex > 0;
        const base = hasExt ? originalName.slice(0, dotIndex) : originalName;
        const ext = hasExt ? originalName.slice(dotIndex) : "";
        const cleanBase = base.replace(/\s*\(\d+\)$/, "");
        let n = 1;
        while (downloadedFiles[`${cleanBase}(${n})${ext}`]) n++;
        return `${cleanBase}(${n})${ext}`;
    };

    // ── Fetch + cache ──────────────────────────────────────────────────────
    const fetchAndCache = async (f: S3FileUrl): Promise<string> => {
        if (downloadedFiles[f.key]) return downloadedFiles[f.key].blobUrl;
        const proxyUrl = `/api/messages/download?url=${encodeURIComponent(f.url)}&name=${encodeURIComponent(f.name)}`;
        const res = await fetch(proxyUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        setDownloadedFiles(prev => ({ ...prev, [f.key]: { url: f.url, blobUrl, name: f.name } }));
        return blobUrl;
    };

    // ── Save to disk ───────────────────────────────────────────────────────
    const triggerSaveToDisk = (blobUrl: string, name: string) => {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownload = async (f: S3FileUrl, forceRename = false) => {
        if (downloadedFiles[f.key] && !forceRename) {
            setRedownloadTarget(f);
            return;
        }
        setDownloadingKeys(prev => ({ ...prev, [f.key]: true }));
        try {
            const blobUrl = await fetchAndCache(f);
            triggerSaveToDisk(blobUrl, forceRename ? getIncrementedFileName(f.name) : f.name);
        } catch {
            window.open(f.url, "_blank");
        } finally {
            setDownloadingKeys(prev => ({ ...prev, [f.key]: false }));
        }
    };


    // ── Tick component ─────────────────────────────────────────────────────
    const MessageTicks = ({ isRead, isDelivered, isOwn }: {
        isRead: boolean;
        isDelivered: boolean;
        isOwn: boolean;
    }) => {
        if (!isOwn) return null;

        // ── Double blue tick = read ──────────────────────────────
        if (isRead) return (
            <span style={{ display: "inline-flex", alignItems: "center", marginLeft: 4 }}>
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                    <path d="M1 6L5 10L11 1" stroke="#29e442" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 6L9 10L15 1" stroke="#29e442" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
        );

        // ── Double grey tick = delivered ─────────────────────────
        if (isDelivered) return (
            <span style={{ display: "inline-flex", alignItems: "center", marginLeft: 4 }}>
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                    <path d="M1 6L5 10L11 1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 6L9 10L15 1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
        );

        // ── Single grey tick = sent ──────────────────────────────
        return (
            <span style={{ display: "inline-flex", alignItems: "center", marginLeft: 4 }}>
                <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
                    <path d="M1 6L4 10L9 1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>


            <div style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" , }}>
                <Dropdown
                    menu={{ items: menuItems }}
                    trigger={["contextMenu"]}
                    disabled={isDeleted}
                >
                    <div
                        style={{
                            // maxWidth: "70%",
                            maxWidth: "min(70%, 420px)",
                            padding: "8px 12px",
                            borderRadius: isOwn ? "16px 0 16px 16px" : "0 16px 16px 16px",
                            background: bubbleBg,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            cursor: isDeleted ? "default" : "context-menu",
                        }}
                    >
                        {/* Group sender name */}
                        {isGroupMessage && !isOwn && (
                            <Text style={{
                                color: getAvatarColor(message.username),
                                fontSize: 13, fontWeight: "bold", display: "block",
                            }}>
                                @{message.username}
                            </Text>
                        )}

                        {/* ── Deleted placeholder ────────────────────── */}
                        {isDeleted ? (
                            <Text style={{
                                color: subtleColor,
                                fontSize: 13,
                                fontStyle: "italic",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}>
                                🚫 This message was deleted
                            </Text>
                        ) : (
                            <>
                                {/* ── File attachments ──────────────────── */}
                                {hasFiles && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {fileUrls.map((f, i): React.ReactElement | null => {
                                            const isDownloaded = !!downloadedFiles[f.key];
                                            const isDownloading = !!downloadingKeys[f.key];

                                            // ── Image ──────────────────────────────
                                            if (f.mimeType?.startsWith("image/")) {
                                                return (
                                                    <div
                                                        key={i}
                                                        style={{ position: "relative", display: "inline-block" }}
                                                        onMouseEnter={e => {
                                                            const el = e.currentTarget.querySelector(".overlay") as HTMLElement;
                                                            if (el) el.style.opacity = "1";
                                                        }}
                                                        onMouseLeave={e => {
                                                            const el = e.currentTarget.querySelector(".overlay") as HTMLElement;
                                                            if (el) el.style.opacity = "0";
                                                        }}
                                                    >
                                                        <img
                                                            src={f.url}
                                                            alt={f.name}
                                                            style={{
                                                                maxWidth: 220, maxHeight: 220, borderRadius: 8,
                                                                objectFit: "cover", display: "block",
                                                                width: "100%",           // ✅ fills bubble width
                                                                height: "auto",          // ✅ maintain aspect ratio
                                                            }}
                                                        />
                                                        <div
                                                            className="overlay"
                                                            style={{
                                                                position: "absolute", inset: 0, borderRadius: 8,
                                                                background: "rgba(0,0,0,0.5)",
                                                                display: "flex", alignItems: "center",
                                                                justifyContent: "center", gap: 20,
                                                                opacity: 0, transition: "opacity 0.2s",
                                                            }}
                                                        >
                                                            <Tooltip title="View">
                                                                <EyeOutlined
                                                                    style={{ fontSize: 22, color: "#fff", cursor: "pointer" }}
                                                                    onClick={() => onImageClick(groupImages, f.url)}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title={isDownloaded ? "Downloaded" : "Download"}>
                                                                <DownloadOutlined
                                                                    style={{
                                                                        fontSize: 22, cursor: "pointer",
                                                                        color: isDownloaded ? "#52c41a" : "#fff",
                                                                        opacity: isDownloading ? 0.5 : 1,
                                                                    }}
                                                                    onClick={() => !isDownloading && handleDownload(f)}
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // ── Video ──────────────────────────────
                                            if (f.mimeType?.startsWith("video/")) {
                                                return (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 8,
                                                            padding: "6px 10px", borderRadius: 8,
                                                            background: isOwn ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
                                                        }}
                                                    >
                                                        <VideoCameraOutlined style={{ fontSize: 20, color: textColor, flexShrink: 0 }} />
                                                        <div style={{ overflow: "hidden", flex: 1 }}>
                                                            <Text ellipsis style={{ fontSize: 12, color: textColor, display: "block", maxWidth: 140 }}>
                                                                {f.name}
                                                            </Text>
                                                            <Text style={{ fontSize: 11, color: subtleColor }}>{formatBytes(f.size)}</Text>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                                                            <Tooltip title="View">
                                                                <EyeOutlined
                                                                    style={{ fontSize: 16, color: textColor, cursor: "pointer" }}
                                                                    onClick={() => setVideoModal(f)}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title={isDownloaded ? "Downloaded" : "Download"}>
                                                                <DownloadOutlined
                                                                    style={{
                                                                        fontSize: 16, cursor: "pointer",
                                                                        color: isDownloaded ? "#52c41a" : textColor,
                                                                        opacity: isDownloading ? 0.5 : 1,
                                                                    }}
                                                                    onClick={() => !isDownloading && handleDownload(f)}
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // ── Audio ──────────────────────────────
                                            if (f.mimeType?.startsWith("audio/")) {
                                                return (
                                                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                        <audio controls style={{ maxWidth: 260, height: 36 }}>
                                                            <source src={f.url} type={f.mimeType} />
                                                        </audio>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                            <Text style={{ fontSize: 11, color: subtleColor }}>{f.name}</Text>
                                                            <Tooltip title={isDownloaded ? "Downloaded" : "Download"}>
                                                                <DownloadOutlined
                                                                    style={{
                                                                        fontSize: 14, cursor: "pointer",
                                                                        color: isDownloaded ? "#52c41a" : subtleColor,
                                                                        opacity: isDownloading ? 0.5 : 1,
                                                                    }}
                                                                    onClick={() => !isDownloading && handleDownload(f)}
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // ── PDF / Office ───────────────────────
                                            if (isOpenWithType(f.mimeType)) {
                                                return (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 8,
                                                            padding: "6px 10px", borderRadius: 8,
                                                            background: isOwn ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
                                                        }}
                                                    >
                                                        <FileIcon mimeType={f.mimeType} />
                                                        <div style={{ overflow: "hidden", flex: 1 }}>
                                                            <Text ellipsis style={{ fontSize: 12, color: textColor, display: "block", maxWidth: 140 }}>
                                                                {f.name}
                                                            </Text>
                                                            <Text style={{ fontSize: 11, color: subtleColor }}>{formatBytes(f.size)}</Text>
                                                        </div>
                                                        <Tooltip title={isDownloaded ? "Downloaded" : "Save to disk"}>
                                                            <DownloadOutlined
                                                                style={{
                                                                    fontSize: 16, cursor: isDownloading ? "not-allowed" : "pointer",
                                                                    color: isDownloaded ? "#52c41a" : textColor,
                                                                    opacity: isDownloading ? 0.5 : 1,
                                                                    flexShrink: 0,
                                                                }}
                                                                onClick={() => !isDownloading && handleDownload(f)}
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                );
                                            }

                                            // ── Generic file ───────────────────────
                                            if (f.url && f.name) {
                                                return (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 8,
                                                            padding: "6px 10px", borderRadius: 8,
                                                            background: isOwn ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
                                                        }}
                                                    >
                                                        <FileIcon mimeType={f.mimeType} />
                                                        <div style={{ overflow: "hidden", flex: 1 }}>
                                                            <Text ellipsis style={{ fontSize: 12, color: textColor, display: "block", maxWidth: 140 }}>
                                                                {f.name}
                                                            </Text>
                                                            <Text style={{ fontSize: 11, color: subtleColor }}>{formatBytes(f.size)}</Text>
                                                        </div>
                                                        <Tooltip title={isDownloaded ? "Downloaded" : "Download"}>
                                                            <DownloadOutlined
                                                                style={{
                                                                    fontSize: 16, cursor: isDownloading ? "not-allowed" : "pointer",
                                                                    color: isDownloaded ? "#52c41a" : textColor,
                                                                    opacity: isDownloading ? 0.5 : 1,
                                                                    flexShrink: 0,
                                                                }}
                                                                onClick={() => !isDownloading && handleDownload(f)}
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })}
                                    </div>
                                )}

                                {/* ── Text body or inline edit ───────────── */}
                                {hasBody && (
                                    isEditing ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            <Input.TextArea
                                                value={editText}
                                                onChange={e => setEditText(e.target.value)}
                                                onPressEnter={e => {
                                                    if (!e.shiftKey) {
                                                        e.preventDefault();
                                                        handleEditSubmit();
                                                    }
                                                }}
                                                autoSize={{ minRows: 1, maxRows: 6 }}
                                                autoFocus
                                                style={{
                                                    fontSize: 13,
                                                    background: "rgba(255,255,255,0.15)",
                                                    color: textColor,
                                                    border: "1px solid rgba(255,255,255,0.4)",
                                                    borderRadius: 6,
                                                }}
                                            />
                                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                <Tooltip title="Cancel">
                                                    <CloseOutlined
                                                        style={{ color: subtleColor, cursor: "pointer", fontSize: 14 }}
                                                        onClick={() => setIsEditing(false)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Save (Enter)">
                                                    <CheckOutlined
                                                        style={{ color: isOwn ? "#fff" : token.colorSuccess, cursor: "pointer", fontSize: 14 }}
                                                        onClick={handleEditSubmit}
                                                    />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    ) : (
                                        <Text style={{ color: textColor, fontSize: 13, display: "block" }}>
                                            {message.body}
                                            {message.is_edited && (
                                                <Text style={{ fontSize: 10, color: subtleColor, marginLeft: 4 }}>
                                                    (edited)
                                                </Text>
                                            )}
                                        </Text>
                                    )
                                )}
                            </>
                        )}

                        {/* Timestamp — always visible */}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, marginTop: 2 }}>
                            <Text style={{ color: subtleColor, fontSize: 11 }}>
                                {time}
                            </Text>
                            <MessageTicks
                                isOwn={isOwn}
                                isDelivered={message.is_delivered}
                                isRead={message.is_read}
                            />
                        </div>

                    </div>
                </Dropdown>
            </div>

            {/* ── Delete confirm modal ───────────────────────────────────── */}
            <Modal
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onOk={() => {
                    if (deleteTarget === "for_me") {
                        onDeleteForMe(message.id);
                    } else if (deleteTarget === "for_everyone") {
                        onDeleteForEveryone(message.id);
                    }
                    setDeleteTarget(null);
                }}
                okText={deleteTarget === "for_everyone" ? "Delete for everyone" : "Delete for me"}
                okButtonProps={{ danger: true }}
                title="Delete message"
                centered
            >
                <Text>
                    {deleteTarget === "for_everyone"
                        ? "This message will be deleted for everyone in this conversation."
                        : "This message will be deleted only for you."
                    }
                </Text>
            </Modal>

            {/* ── Video modal ────────────────────────────────────────────── */}
            <Modal
                open={!!videoModal}
                onCancel={() => setVideoModal(null)}
                footer={null}
                centered
                title={videoModal?.name}
                width={640}
                destroyOnClose
            >
                {videoModal && (
                    <video controls style={{ width: "100%", borderRadius: 8 }}>
                        <source src={videoModal.url} type={videoModal.mimeType} />
                    </video>
                )}
            </Modal>

            {/* ── Re-download confirm modal ──────────────────────────────── */}
            <Modal
                open={!!redownloadTarget}
                onCancel={() => setRedownloadTarget(null)}
                title="File already downloaded"
                centered
                footer={null}
            >
                {redownloadTarget && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                        <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                            <strong>{redownloadTarget.name}</strong> has already been downloaded. What would you like to do?
                        </Text>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <button
                                style={{
                                    padding: "8px 16px", borderRadius: 8, border: `1px solid ${token.colorBorder}`,
                                    cursor: "pointer", background: token.colorBgContainer,
                                    color: token.colorText, fontSize: 13, textAlign: "left",
                                }}
                                onClick={() => {
                                    const f = redownloadTarget;
                                    setRedownloadTarget(null);
                                    triggerSaveToDisk(downloadedFiles[f.key].blobUrl, f.name);
                                }}
                            >
                                Replace (download again with same name)
                            </button>
                            <button
                                style={{
                                    padding: "8px 16px", borderRadius: 8, border: `1px solid ${token.colorBorder}`,
                                    cursor: "pointer", background: token.colorBgContainer,
                                    color: token.colorText, fontSize: 13, textAlign: "left",
                                }}
                                onClick={() => {
                                    const f = redownloadTarget;
                                    setRedownloadTarget(null);
                                    handleDownload(f, true);
                                }}
                            >
                                Save as new file
                            </button>
                            <button
                                style={{
                                    padding: "8px 16px", borderRadius: 8, border: `1px solid ${token.colorBorder}`,
                                    cursor: "pointer", background: token.colorBgContainer,
                                    color: token.colorTextSecondary, fontSize: 13, textAlign: "left",
                                }}
                                onClick={() => setRedownloadTarget(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default MessageBubble;