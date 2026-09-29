namespace EquipmentReservation.Guardrails;

public interface IToolGuardrail
{
    GuardrailDecision Evaluate(ToolInvocation invocation);
}
