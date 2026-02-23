import React from 'react';
import { Download } from 'lucide-react';
import { UserAction } from '../types';

interface ExportButtonProps {
    data: UserAction[];
    filename?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, filename = 'export.json' }) => {
    const handleExport = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = filename.endsWith('.json') ? filename : `${filename}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        linkElement.remove();
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
            <Download size={16} />
            Exporter JSON
        </button>
    );
};

export default ExportButton;
