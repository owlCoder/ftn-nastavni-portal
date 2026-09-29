namespace EquipmentReservation.Infrastructure;

internal sealed class InventorySlot(int available)
{
    public int Available { get; set; } = available;
    public object SyncRoot { get; } = new();
}
