import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface UpdateInfo {
    available: boolean;
    progress: number;
    downloaded: boolean;
}

export function UpdateNotification() {
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
        available: false,
        progress: 0,
        downloaded: false,
    });

    useEffect(() => {
        if (window.ipcRenderer) {
            window.ipcRenderer.on('update_available', () => {
                setUpdateInfo((prev) => ({ ...prev, available: true }));
            });

            window.ipcRenderer.on('download_progress', (arg: unknown) => {
                const percent = arg as number;
                setUpdateInfo((prev) => ({ ...prev, progress: Math.round(percent) }));
            });

            window.ipcRenderer.on('update_downloaded', () => {
                setUpdateInfo((prev) => ({ ...prev, downloaded: true }));
            });
        }
    }, []);

    if (!updateInfo.available) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[200] bg-slate-900 border border-blue-500/50 p-4 rounded-xl shadow-2xl animate-in slide-in-from-left duration-500 min-w-[240px]">
            <h4 className="text-blue-400 font-bold text-sm mb-1 flex items-center gap-2">
                <Globe size={14} className="animate-pulse" />
                {updateInfo.downloaded ? 'Update Ready' : 'Downloading Update...'}
            </h4>
            {!updateInfo.downloaded ? (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${updateInfo.progress}%` }}
                    />
                </div>
            ) : (
                <button
                    onClick={() => window.ipcRenderer.send('restart_app')}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                >
                    Restart Now
                </button>
            )}
        </div>
    );
}
