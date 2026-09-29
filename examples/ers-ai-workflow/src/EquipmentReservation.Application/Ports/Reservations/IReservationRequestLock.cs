namespace EquipmentReservation.Application;

public interface IReservationRequestLock
{
    ValueTask<IAsyncDisposable> AcquireAsync(
        Guid requestId,
        CancellationToken cancellationToken);
}
