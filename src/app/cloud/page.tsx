import { getCloudMedia } from "@/lib/api/rd";
import { Download, FileVideo, HardDrive } from "lucide-react";
import { PlayButton } from "@/components/ui/play-button";

export const dynamic = 'force-dynamic';

export default async function CloudPage() {
    const media = await getCloudMedia();

    return (
        <div className="min-h-screen px-4 md:px-12 py-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-full">
                    <HardDrive className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">My Cloud</h1>
                    <p className="text-slate-400">Real-Debrid Storage • {media?.length || 0} Items</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {media?.map((item: any) => (
                    <div key={item.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 hover:border-primary/50 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                    <FileVideo className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-medium text-white truncate max-w-[200px]" title={item.filename}>
                                        {item.filename}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {(item.bytes / 1024 / 1024 / 1024).toFixed(2)} GB
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <PlayButton torrentId={item.id} variant="minimal" />
                        </div>
                    </div>
                ))}

                {(!media || media.length === 0) && (
                    <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                        No items found in your Real-Debrid cloud.
                    </div>
                )}
            </div>
        </div>
    );
}
