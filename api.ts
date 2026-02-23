import { UserAction, ActivityApiResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const activityApi = {
    /**
     * Récupère tous les événements de traçabilité
     */
    async getAllActivities(limit = 1000, skip = 0): Promise<ActivityApiResponse> {
        const response = await fetch(`${API_URL}/activities/all?limit=${limit}&skip=${skip}`);
        if (!response.ok) {
            throw new Error(`Erreur API (${response.status}): Impossible de récupérer les activités`);
        }
        return await response.json();
    },

    /**
     * Enregistre un nouvel événement (principalement util pour le test)
     */
    async logActivity(activity: Partial<UserAction>): Promise<{ success: boolean }> {
        const response = await fetch(`${API_URL}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activity),
        });
        if (!response.ok) {
            throw new Error(`Erreur API (${response.status}): Échec de l'enregistrement`);
        }
        return await response.json();
    },

    /**
     * Supprime tout l'historique des activités
     */
    async deleteAllActivities(): Promise<{ success: boolean; message?: string }> {
        const response = await fetch(`${API_URL}/activities/all`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Erreur API (${response.status}): Échec de la suppression`);
        }
        return await response.json();
    }
};
