namespace EquipmentReservation.Application;

public sealed record ReserveInventoryRequest(
    Guid EquipmentId,
    int Quantity,
    Guid ReservationId);
