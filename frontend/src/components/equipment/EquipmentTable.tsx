import { Equipment, MaintenanceStatus } from '../../types';

interface EquipmentTableProps {
  equipments: Equipment[];
  onUpdateStatus: (equipment: Equipment) => void;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
}

export const EquipmentTable = ({ equipments, onUpdateStatus, onEdit, onDelete }: EquipmentTableProps) => {
  const getStatusColor = (status: MaintenanceStatus): string => {
    switch (status) {
      case 'READY':
        return 'bg-green-900 text-green-200';
      case 'A_REVISER':
        return 'bg-yellow-900 text-yellow-200';
      case 'EN_MAINTENANCE':
        return 'bg-blue-900 text-blue-200';
      case 'HS':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-900 text-gray-200';
    }
  };

  const getStatusLabel = (status: MaintenanceStatus): string => {
    switch (status) {
      case 'READY':
        return 'Ready';
      case 'A_REVISER':
        return 'À réviser';
      case 'EN_MAINTENANCE':
        return 'En Maintenance';
      case 'HS':
        return 'HS';
      default:
        return status;
    }
  };

  const getSectorLabel = (sector: string): string => {
    switch (sector) {
      case 'BROADCAST':
        return 'Broadcast';
      case 'EVENEMENTIEL':
        return 'Événementiel';
      case 'INFORMATIQUE':
        return 'Informatique';
      default:
        return sector;
    }
  };

  if (equipments.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-8 text-center text-gray-400">
        Aucun équipement trouvé
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                TAG
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Localisation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Secteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Constructeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Modèle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Maintenance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {equipments.map((equipment) => (
              <tr key={equipment.id} className="hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {equipment.tag}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {equipment.localisation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {getSectorLabel(equipment.sector)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {equipment.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {equipment.manufacturer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {equipment.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(equipment.status)}`}>
                    {getStatusLabel(equipment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onUpdateStatus(equipment)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Update Status
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(equipment)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(equipment)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
