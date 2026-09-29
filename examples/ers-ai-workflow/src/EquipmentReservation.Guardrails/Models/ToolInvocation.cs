namespace EquipmentReservation.Guardrails;

public sealed record ToolInvocation(
    string? ToolName,
    string? Command,
    string? FilePath);
