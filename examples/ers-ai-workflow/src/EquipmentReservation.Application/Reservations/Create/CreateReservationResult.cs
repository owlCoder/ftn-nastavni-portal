namespace EquipmentReservation.Application;

public sealed record CreateReservationResult(
    Guid ReservationId,
    CreateReservationOutcome Outcome,
    string? ErrorCode,
    bool Replayed);
