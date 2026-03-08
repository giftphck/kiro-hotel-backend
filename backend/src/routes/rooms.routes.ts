import { Router } from 'express';
import roomsController from '../controllers/rooms.controller';

const router = Router();

// GET /api/rooms - Get all rooms
router.get('/', roomsController.getAllRooms.bind(roomsController));

// GET /api/rooms/:id/status - Get room status for date range (must be before /:id)
router.get('/:id/status', roomsController.getRoomStatus.bind(roomsController));

// PUT /api/rooms/:id/status - Update room status (must be before /:id)
router.put('/:id/status', roomsController.updateRoomStatus.bind(roomsController));

// GET /api/rooms/:id - Get room by ID
router.get('/:id', roomsController.getRoomById.bind(roomsController));

// POST /api/rooms - Create a new room
router.post('/', roomsController.createRoom.bind(roomsController));

// PUT /api/rooms/:id - Update room details
router.put('/:id', roomsController.updateRoom.bind(roomsController));

// DELETE /api/rooms/:id - Delete a room
router.delete('/:id', roomsController.deleteRoom.bind(roomsController));

export default router;
