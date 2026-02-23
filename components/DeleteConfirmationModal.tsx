import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Trash2, X, Clock, ShieldAlert } from 'lucide-react';
import { activityApi } from '../api';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [countdown, setCountdown] = useState(10);
    const [isCounting, setIsCounting] = useState(false);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const PHRASE = "CONFIRMER LA SUPPRESSION";

    useEffect(() => {
        if (!isOpen) {
            setConfirmationText('');
            setCountdown(10);
            setIsCounting(false);
            setLoading(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [isOpen]);

    const startDeleteCycle = async () => {
        if (confirmationText !== PHRASE) return;

        setIsCounting(true);
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    executeDelete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const executeDelete = async () => {
        setLoading(true);
        try {
            const result = await activityApi.deleteAllActivities();
            if (result.success) {
                onConfirm();
                onClose();
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setIsCounting(false);
        setCountdown(10);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-red-900/40 backdrop-blur-md" onClick={!isCounting && !loading ? onClose : undefined} />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-red-100">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Action Irréversible</h3>
                            <p className="text-sm text-gray-500">Toutes les données de traçabilité seront effacées.</p>
                        </div>
                        {!isCounting && !loading && (
                            <button
                                onClick={onClose}
                                className="ml-auto p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {!isCounting ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
                                <AlertCircle className="text-orange-600 shrink-0" size={18} />
                                <p className="text-xs text-orange-700 leading-relaxed">
                                    Cette action supprimera définitivement tout l'historique des activités stockées dans la base de données.
                                    Soyez certain de vouloir continuer.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    Tapez la phrase suivante pour continuer :
                                </label>
                                <div className="bg-gray-100 p-2 rounded text-center font-mono text-sm text-gray-600 mb-2 select-none">
                                    {PHRASE}
                                </div>
                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    placeholder="Écrivez la phrase exactement..."
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                />
                            </div>

                            <button
                                onClick={startDeleteCycle}
                                disabled={confirmationText !== PHRASE}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 disabled:bg-gray-200 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                Lancer la suppression
                            </button>
                        </div>
                    ) : (
                        <div className="py-8 flex flex-col items-center text-center">
                            <div className="relative w-24 h-24 mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 * (1 - countdown / 10)}
                                        className="text-red-500 transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-gray-900">
                                    {countdown}
                                </div>
                            </div>

                            <h4 className="text-lg font-bold text-gray-900 mb-2">Suppression imminente</h4>
                            <p className="text-sm text-gray-500 mb-8 max-w-[250px]">
                                Vous avez encore {countdown} secondes pour annuler cette action désastreuse.
                            </p>

                            <button
                                onClick={cancelDelete}
                                disabled={loading}
                                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
                            >
                                ANNULER MAINTENANT
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
