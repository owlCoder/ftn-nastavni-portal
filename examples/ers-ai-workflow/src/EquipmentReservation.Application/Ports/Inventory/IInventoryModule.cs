namespace EquipmentReservation.Application;

public interface IInventoryModule
{
    Task<ReserveInventoryResult> ReserveAsync(
        ReserveInventoryRequest request,
        CancellationToken cancellationToken);
}
