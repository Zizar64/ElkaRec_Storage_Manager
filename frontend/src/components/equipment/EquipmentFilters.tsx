import { Sector, MaintenanceStatus } from '../../types';

interface EquipmentFiltersProps {
  sector: string;
  status: string;
  search: string;
  onSectorChange: (sector: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
}

export const EquipmentFilters = ({
  sector,
  status,
  search,
  onSectorChange,
  onStatusChange,
  onSearchChange,
}: EquipmentFiltersProps) => {
  const sectorLabels: Record<string, string> = {
    all: 'Tous les secteurs',
    BROADCAST: 'Broadcast',
    EVENEMENTIEL: 'Événementiel',
    INFORMATIQUE: 'Informatique',
  };

  const statusLabels: Record<string, string> = {
    all: 'Tous les statuts',
    READY: 'Ready',
    A_REVISER: 'À réviser',
    EN_MAINTENANCE: 'En Maintenance',
    HS: 'HS',
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Secteur</label>
          <select
            value={sector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {Object.entries(sectorLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Statut de maintenance</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Recherche</label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="TAG, localisation, type..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
    </div>
  );
};
