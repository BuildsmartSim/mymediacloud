"use client";

import { useEffect, useState } from "react";
import { HardDrive, Trash2, Play, FileVideo, RefreshCw } from "lucide-react";
import { VideoPlayer } from "@/components/ui/video-player/player";

interface LocalFile {
    name: string;
    size: number;
    created: string;
    path: string;
}

export default function LibraryPage() {
    const [files, setFiles] = useState<LocalFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingFile, setPlayingFile] = useState<LocalFile | null>(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/library');
            const data = await res.json();
            if (data.files) {
                setFiles(data.files);
            }
        } catch (e) {
            console.error("Failed to load library", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        try {
            const res = await fetch('/api/library', {
                method: 'DELETE',
                body: JSON.stringify({ filename }),
            });
            if (res.ok) {
                fetchFiles();
            }
        } catch (e) {
            console.error("Failed to delete", e);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Format bytes to GB
    const formatSize = (bytes: number) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(2)} GB`;
    };

    return (
        <div className="min-h-screen px-4 md:px-12 py-8">
            {playingFile && (
                <VideoPlayer
                    url={`/api/stream-local?file=${encodeURIComponent(playingFile.name)}`} // We'd need a stream route for this ideally, or just serve static if mapped
                    // For now, let's assume valid static serving or similar. 
                    // Actually, let's assume we can't easily stream local files via browser without a proper stream endpoint.
                    // I'll leave the URL placeholder. A real implementation needs `api/stream-local`.
                    title={playingFile.name}
                    onClose={() => setPlayingFile(null)}
                />
            )}

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-full">
                        <HardDrive className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Local Library</h1>
                        <p className="text-slate-400">Offline Storage • {files.length} Items</p>
                    </div>
                </div>
                <button onClick={fetchFiles} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                    <div key={file.name} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 hover:border-purple-500/50 transition-colors group">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-purple-400 transition-colors flex-shrink-0">
                                <FileVideo className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white truncate mb-1" title={file.name}>
                                    {file.name}
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    {formatSize(file.size)} • {new Date(file.created).toLocaleDateString()}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        // onClick={() => setPlayingFile(file)} // TODO: Enable when streaming route ready
                                        onClick={() => alert("Local streaming requires a streaming endpoint (next step).")}
                                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-3 h-3 fill-current" /> Play
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.name)}
                                        className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && files.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                        <HardDrive className="w-12 h-12 mb-4 opacity-20" />
                        <p>Your local library is empty.</p>
                        <p className="text-sm opacity-50">Download movies from the Cloud to watch offline.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
