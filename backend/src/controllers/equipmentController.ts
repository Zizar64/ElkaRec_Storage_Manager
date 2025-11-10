import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest, EquipmentFilters } from '../types';
import { Sector, MaintenanceStatus } from '@prisma/client';

export const getEquipments = async (req: AuthRequest, res: Response) => {
  try {
    const { sector, status, search }: EquipmentFilters = req.query;

    const where: any = {};

    if (sector && sector !== 'all') {
      where.sector = sector.toUpperCase() as Sector;
    }

    if (status && status !== 'all') {
      where.status = status as MaintenanceStatus;
    }

    if (search) {
      where.OR = [
        { tag: { contains: search } },
        { localisation: { contains: search } },
        { type: { contains: search } },
        { manufacturer: { contains: search } },
        { model: { contains: search } },
      ];
    }

    const equipments = await prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(equipments);
  } catch (error) {
    console.error('Get equipments error:', error);
    res.status(500).json({ error: 'Failed to fetch equipments' });
  }
};

export const getEquipmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        history: {
          include: { user: { select: { email: true, firstName: true, lastName: true } } },
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

export const createEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { tag, localisation, sector, type, manufacturer, model, status, serialNumber, purchaseDate, notes } = req.body;

    // Validation
    if (!tag || !localisation || !sector || !type || !manufacturer || !model) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if tag already exists
    const existingEquipment = await prisma.equipment.findUnique({ where: { tag } });
    if (existingEquipment) {
      return res.status(409).json({ error: 'Equipment with this TAG already exists' });
    }

    const equipment = await prisma.equipment.create({
      data: {
        tag,
        localisation,
        sector: sector.toUpperCase() as Sector,
        type,
        manufacturer,
        model,
        status: status || 'READY',
        serialNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        notes,
      },
    });

    res.status(201).json(equipment);
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
};

export const updateEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tag, localisation, sector, type, manufacturer, model, status, serialNumber, purchaseDate, notes } = req.body;

    const existingEquipment = await prisma.equipment.findUnique({ where: { id } });
    if (!existingEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        tag,
        localisation,
        sector: sector ? (sector.toUpperCase() as Sector) : undefined,
        type,
        manufacturer,
        model,
        status: status as MaintenanceStatus | undefined,
        serialNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        notes,
      },
    });

    res.json(equipment);
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
};

export const updateEquipmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    if (!status || !description) {
      return res.status(400).json({ error: 'Status and description are required' });
    }

    const existingEquipment = await prisma.equipment.findUnique({ where: { id } });
    if (!existingEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Update equipment and create history entry in a transaction
    const result = await prisma.$transaction([
      prisma.equipment.update({
        where: { id },
        data: { status: status as MaintenanceStatus },
      }),
      prisma.equipmentHistory.create({
        data: {
          equipmentId: id,
          userId: req.userId!,
          oldStatus: existingEquipment.status,
          newStatus: status as MaintenanceStatus,
          description,
        },
      }),
    ]);

    res.json(result[0]);
  } catch (error) {
    console.error('Update equipment status error:', error);
    res.status(500).json({ error: 'Failed to update equipment status' });
  }
};

export const deleteEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingEquipment = await prisma.equipment.findUnique({ where: { id } });
    if (!existingEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await prisma.equipment.delete({ where: { id } });

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
};
