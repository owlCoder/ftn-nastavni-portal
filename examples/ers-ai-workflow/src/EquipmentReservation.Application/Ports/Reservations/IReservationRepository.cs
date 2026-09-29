using EquipmentReservation.Domain;

namespace EquipmentReservation.Application;

public interface IReservationRepository
{
    Task<Reservation?> FindByRequestIdAsync(
        Guid requestId,
        CancellationToken cancellationToken);

    Task AddAsync(
        Reservation reservation,
        CancellationToken cancellationToken);
}
