namespace EquipmentReservation.Application;

public sealed record ReserveInventoryResult(
    bool Success,
    string? ErrorCode);
