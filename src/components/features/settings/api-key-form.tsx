"use client";

import { useState } from "react";
import { Key, Save, Check, ExternalLink, HelpCircle } from "lucide-react";
import { saveDebridSettings } from "@/app/actions/settings";

interface ApiKeyFormProps {
    currentService?: string;
    hasKey: boolean;
}

const PROVIDERS = [
    {
        id: 'real-debrid',
        name: 'Real-Debrid',
        url: 'https://real-debrid.com/apitoken',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
    },
    {
        id: 'premiumize',
        name: 'Premiumize.me',
        url: 'https://www.premiumize.me/account',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10'
    },
    {
        id: 'alldebrid',
        name: 'AllDebrid',
        url: 'https://alldebrid.com/apikeys/',
        color: 'text-green-400',
        bg: 'bg-green-500/10'
    }
];

export function ApiKeyForm({ currentService = 'real-debrid', hasKey }: ApiKeyFormProps) {
    const [service, setService] = useState(currentService);
    const [loading, setLoading] = useState(false);

    // Find active provider details
    const activeProvider = PROVIDERS.find(p => p.id === service) || PROVIDERS[0];

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await saveDebridSettings(formData);
            // Simple feedback since we might not have a toast provider installed yet
            // If the user installed sonner, great, otherwise alert
            if (typeof window !== 'undefined') window.alert("Settings Saved Successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Key className="w-6 h-6 text-purple-400" />
                Streaming Services
            </h2>

            <form action={handleSubmit} className="space-y-6">

                {/* SERVICE SELECTOR */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 ml-1">Provider</label>
                    <div className="grid grid-cols-3 gap-2">
                        {PROVIDERS.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setService(p.id)}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${service === p.id
                                    ? 'bg-white/10 border-white/20 text-white shadow-lg scale-105'
                                    : 'bg-black/20 border-transparent text-slate-500 hover:bg-white/5'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${p.color}`} />
                                <span className="text-xs font-bold">{p.name}</span>
                            </button>
                        ))}
                    </div>
                    {/* Hidden input for form submission */}
                    <input type="hidden" name="service" value={service} />
                </div>

                {/* API KEY INPUT */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-bold text-slate-400">API Key</label>
                        <a
                            href={activeProvider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:text-white transition-colors"
                        >
                            Get your key here <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="relative">
                        <input
                            name="apiKey"
                            type="password"
                            placeholder={hasKey ? "••••••••••••••••••••••••••" : `Paste your ${activeProvider.name} API Key`}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {hasKey && <Check className="w-4 h-4 text-green-500" />}
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 px-1 pb-2">
                        Your key is stored securely in your browser (HTTP-Only Cookie).
                        It is never saved to a database.
                    </p>
                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Settings
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
