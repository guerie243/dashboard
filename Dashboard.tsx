import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Filter,
    Download,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Activity,
    User,
    Globe,
    Clock,
    Layout,
    Monitor,
    Smartphone,
    Calendar
} from 'lucide-react';
import { UserAction, ActivityApiResponse } from './types';
import { activityApi } from './api';
import EventInspectionPanel from './components/EventInspectionPanel';
import ExportButton from './components/ExportButton';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const Dashboard: React.FC = () => {
    const [actions, setActions] = useState<UserAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedAction, setSelectedAction] = useState<UserAction | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [userFilter, setUserFilter] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchActions = async () => {
        setLoading(true);
        try {
            const result = await activityApi.getAllActivities(500);
            if (result.success) {
                setActions(result.data);
            } else {
                throw new Error('Failed to fetch actions');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActions();
    }, []);

    // Base actions filtered by Search and Date only (to calculate dynamic counts for types/users)
    const baseActions = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return actions.filter(action => {
            const matchesSearch = !term ||
                (action.userName || '').toLowerCase().includes(term) ||
                (action.userId || '').toLowerCase().includes(term) ||
                (action.ipAddress || '').toLowerCase().includes(term) ||
                (action.screenName || '').toLowerCase().includes(term) ||
                (action.eventType || '').toLowerCase().includes(term) ||
                JSON.stringify(action.metadata || {}).toLowerCase().includes(term);

            // Date filtering
            const actionDate = new Date(action.createdAt || action.timestamp || '').getTime();
            const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
            const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

            const matchesDate = (!start || actionDate >= start) && (!end || actionDate <= end);

            return matchesSearch && matchesDate;
        });
    }, [actions, searchTerm, startDate, endDate]);

    const eventTypes = useMemo(() => {
        const counts: Record<string, number> = {};
        baseActions.forEach(a => {
            counts[a.eventType] = (counts[a.eventType] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);
    }, [baseActions]);

    const users = useMemo(() => {
        const userMap = new Map<string, { name: string; count: number }>();
        baseActions.forEach(a => {
            if (a.userId) {
                const existing = userMap.get(a.userId) || { name: a.userName || 'Utilisateur Anonyme', count: 0 };
                userMap.set(a.userId, { ...existing, count: existing.count + 1 });
            }
        });
        return Array.from(userMap.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count);
    }, [baseActions]);

    const filteredActions = useMemo(() => {
        return baseActions.filter(action => {
            const matchesType = typeFilter === 'all' || action.eventType === typeFilter;
            const matchesUser = userFilter === 'all' || action.userId === userFilter;
            return matchesType && matchesUser;
        });
    }, [baseActions, typeFilter, userFilter]);

    const paginatedActions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredActions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredActions, currentPage]);

    const totalPages = Math.ceil(filteredActions.length / itemsPerPage);

    const handleExport = () => {
        const dataStr = JSON.stringify(filteredActions, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `traceability_export_${new Date().toISOString()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && actions.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Traçabilité des Actions</h1>
                        <p className="text-gray-500">Consultez et analysez les événements utilisateurs en temps réel.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExportButton
                            data={filteredActions}
                            filename={`traceability_export_${new Date().toISOString()}`}
                        />
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                        >
                            <Trash2 size={16} />
                            Tout Effacer
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher par Nom, ID, IP, Métadonnées..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 font-medium cursor-pointer"
                            >
                                <option value="all">Tous les types ({baseActions.length})</option>
                                {eventTypes.map(({ type, count }) => (
                                    <option key={type} value={type}>
                                        {type} ({count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 font-medium cursor-pointer"
                            >
                                <option value="all">Tous les utilisateurs ({baseActions.filter(a => !!a.userId).length})</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 font-medium cursor-pointer"
                                placeholder="Date début"
                            />
                        </div>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 font-medium cursor-pointer"
                                placeholder="Date fin"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Événement</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedActions.length > 0 ? paginatedActions.map((action) => (
                                    <tr
                                        key={action._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedAction(action)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                    <Activity size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900">{action.eventType}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {action.deviceInfo?.platform === 'ios' || action.deviceInfo?.platform === 'android' ? (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-tight border border-indigo-100">
                                                                <Smartphone size={10} />
                                                                Mobile
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 uppercase tracking-tight border border-amber-100">
                                                                <Monitor size={10} />
                                                                Web / Landing
                                                            </span>
                                                        )}
                                                        {action.screenName && (
                                                            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[100px]">
                                                                • {action.screenName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 font-medium">{action.userName || 'Utilisateur Anonyme'}</span>
                                                <span className="text-[10px] text-gray-400 font-mono tracking-tighter truncate max-w-[120px]">{action.userId || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Globe size={14} className="text-gray-400" />
                                                {action.ipAddress || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-gray-400" />
                                                {formatDate(action.createdAt || action.timestamp || new Date().toISOString())}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group-hover:scale-110">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            Aucun événement trouvé correspondant à vos critères.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide Panel */}
            <EventInspectionPanel
                action={selectedAction}
                onClose={() => setSelectedAction(null)}
            />

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={fetchActions}
            />
        </div>
    );
};

export default Dashboard;
