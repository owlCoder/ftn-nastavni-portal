namespace EquipmentReservation.Application;

public interface IInventoryReadModel
{
    Task<int?> GetAvailableAsync(
        Guid equipmentId,
        CancellationToken cancellationToken);
}
