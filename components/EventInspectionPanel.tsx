import { X, User, Globe, Clock, Layout, Package, Info, Code, Activity, Smartphone, Hash, MousePointer2 } from 'lucide-react';
import { UserAction } from '../types';

interface EventInspectionPanelProps {
    action: UserAction | null;
    onClose: () => void;
}

const EventInspectionPanel: React.FC<EventInspectionPanelProps> = ({ action, onClose }) => {
    if (!action) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-screen w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Détails de l'Événement</h2>
                        <p className="text-sm text-gray-500 font-mono text-xs mt-1">{action._id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                <Activity size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Type</span>
                            </div>
                            <p className="text-sm font-semibold text-blue-900">{action.eventType}</p>
                        </div>
                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <Clock size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                            </div>
                            <p className="text-sm font-semibold text-emerald-900">{formatDate(action.createdAt || action.timestamp || new Date().toISOString())}</p>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* User Info */}
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} />
                                Utilisateur & IP
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 bg-gray-100 rounded text-gray-500">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Nom & ID</p>
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{action.userName || 'N/A'}</p>
                                        <p className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{action.userId || 'ID Inconnu'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 bg-gray-100 rounded text-gray-500">
                                        <Globe size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Adresse IP</p>
                                        <p className="text-sm font-medium text-gray-900">{action.ipAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* App/Session Info */}
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Hash size={14} />
                                Session & Source
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 bg-gray-100 rounded text-gray-500">
                                        <Layout size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Écran / Source</p>
                                        <p className="text-sm font-medium text-gray-900">{action.screenName || 'Unknown'}</p>
                                    </div>
                                </div>
                                {action.sessionId && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-gray-100 rounded text-gray-500">
                                            <Hash size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">ID de Session</p>
                                            <p className="text-[10px] font-mono text-gray-900 truncate max-w-[150px]">{action.sessionId}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Device Details */}
                    {action.deviceInfo && (
                        <section className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Smartphone size={14} />
                                Détails de l'Appareil
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Plateforme</p>
                                    <p className="text-sm font-semibold text-gray-900">{action.deviceInfo.platform}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">OS Version</p>
                                    <p className="text-sm font-semibold text-gray-900">{action.deviceInfo.osVersion}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">App Version</p>
                                    <p className="text-sm font-semibold text-gray-900">{action.deviceInfo.appVersion}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Modèle</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">{action.deviceInfo.deviceModel}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* MetaData Section - Special Display for common fields */}
                    {action.metadata && Object.keys(action.metadata).length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MousePointer2 size={14} />
                                Propriétés de l'événement
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {Object.entries(action.metadata).map(([key, value]) => {
                                    if (typeof value === 'object') return null;
                                    return (
                                        <div key={key} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{key}</p>
                                            <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Raw Payload Section */}
                    <section className="pb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Code size={14} />
                            Payload Complet (JSON)
                        </h3>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-gray-800">
                            <pre className="text-sm font-mono text-gray-300">
                                <code>{JSON.stringify(action.metadata || {}, null, 2)}</code>
                            </pre>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Fermer le Panel
                    </button>
                </div>
            </div>
        </>
    );
};

export default EventInspectionPanel;
