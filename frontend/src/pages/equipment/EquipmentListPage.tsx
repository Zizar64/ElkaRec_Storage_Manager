import { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { EquipmentFilters } from '../../components/equipment/EquipmentFilters';
import { EquipmentTable } from '../../components/equipment/EquipmentTable';
import { UpdateStatusModal } from '../../components/equipment/UpdateStatusModal';
import { Equipment, MaintenanceStatus } from '../../types';
import { equipmentService } from '../../services/equipmentService';

export const EquipmentListPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [sector, setSector] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Modal
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEquipments = async () => {
    setIsLoading(true);
    setError('');

    try {
      const filters: any = {};
      if (sector !== 'all') filters.sector = sector;
      if (status !== 'all') filters.status = status;
      if (search) filters.search = search;

      const data = await equipmentService.getAll(filters);
      setEquipments(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des équipements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, [sector, status, search]);

  const handleUpdateStatus = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsModalOpen(true);
  };

  const handleStatusSubmit = async (newStatus: MaintenanceStatus, description: string) => {
    if (!selectedEquipment) return;

    await equipmentService.updateStatus(selectedEquipment.id, newStatus, description);
    await fetchEquipments();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Parc Matériel ElkaRec</h1>
          <div className="text-sm text-gray-400">
            {equipments.length} équipement{equipments.length > 1 ? 's' : ''}
          </div>
        </div>

        <EquipmentFilters
          sector={sector}
          status={status}
          search={search}
          onSectorChange={setSector}
          onStatusChange={setStatus}
          onSearchChange={setSearch}
        />

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="bg-gray-800 rounded-lg shadow p-8 text-center text-gray-400">
            Chargement...
          </div>
        ) : (
          <EquipmentTable
            equipments={equipments}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>

      {selectedEquipment && (
        <UpdateStatusModal
          equipment={selectedEquipment}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEquipment(null);
          }}
          onSubmit={handleStatusSubmit}
        />
      )}
    </Layout>
  );
};
