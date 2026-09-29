namespace EquipmentReservation.Application;

public sealed record CreateReservationCommand(
    Guid RequestId,
    Guid EquipmentId,
    Guid StudentId,
    int Quantity);
