import type { Block } from '../../../practicum/types'
import { text, list, callout, code, table, diagram } from '../../../practicum/blocks'

export const exercise5: Block[] = [
  [
    text('h1', 'Vežba 5 — Integracija modula, ugovori i podaci'),
    text('paragraph', 'Od ove vežbe do kraja praktikuma koristi se isti izvršivi primer: <b>Equipment Reservation</b>. Izvorni kod nalazi se u direktorijumu <code>examples/ers-ai-workflow/</code>, a rešenje se otvara datotekom <code>EquipmentReservation.sln</code>. Na istom sistemu redom se obrađuju integracija modula, razvoj uz podršku AI alata, MCP i izvršivi zaštitni mehanizmi.'),
    code('bash', `cd examples/ers-ai-workflow
dotnet restore EquipmentReservation.sln
dotnet build EquipmentReservation.sln --configuration Release
dotnet test EquipmentReservation.sln --configuration Release --no-build`, 'Otvaranje i provera kompletnog nastavnog primera'),
    diagram('Jedan solution, jasne granice', [
      ['Domain', 'modeli i domenski servisi', 'slate'],
      ['Application', 'use-case i portovi', 'cyan'],
      ['Infrastructure', 'adapteri ka spoljnim detaljima', 'blue'],
      ['API / Console UI', 'composition root i transport', 'violet'],
      ['Tests', 'nezavisna provera ponašanja', 'emerald'],
    ], 'MCP i Guardrails projekti postoje u istom solution-u, ali ne postaju zavisnosti poslovnog jezgra.'),
  ],

  [
    text('h2', '5.1. Struktura solution-a i Dependency Rule'),
    text('paragraph', 'Rešenje sadrži osam projekata. Prvih pet čine aplikaciju sa dva presentation adaptera, MCP i Guardrails pripadaju razvojnim alatima, dok projekat sa testovima proverava poslovno jezgro, izvršive zaštitne politike i sam smer zavisnosti. Smer zavisnosti ostaje osnovno arhitektonsko pravilo: unutrašnji slojevi ne poznaju spoljne detalje.'),
    table(['Projekat', 'Odgovornost'], [
      ['EquipmentReservation.Domain', 'Modeli, Result i domenski servisi sa poslovnim pravilima; nema projektnih zavisnosti.'],
      ['EquipmentReservation.Application', 'Slučajevi upotrebe, validatori i portovi prema drugim modulima/infrastrukturi.'],
      ['EquipmentReservation.Infrastructure', 'Implementacije portova; u primeru in-memory adapteri bez poslovnih odluka.'],
      ['EquipmentReservation.Api', 'Composition root i HTTP granica; ne sadrži poslovna pravila.'],
      ['EquipmentReservation.ConsoleUi', 'Drugi presentation adapter nad istim slučajevima upotrebe.'],
      ['EquipmentReservation.Mcp', 'Kontrolisano izlaganje projektnog konteksta AI klijentu.'],
      ['EquipmentReservation.Guardrails', 'Determinističke politike za rizične pozive alata.'],
      ['EquipmentReservation.Tests', 'NUnit provere domena, use-case-a, guardrail-a, AI artefakata i smera zavisnosti.'],
    ]),
    callout('info', 'Zašto je ovo Clean Architecture', 'Promena baze, AI klijenta, MCP transporta ili hook konfiguracije ne zahteva promenu poslovnih pravila. Spoljni detalji zavise ka unutra, a ne obrnuto. Test <code>DependencyRuleTests</code> pada ako neki projekat dobije zavisnost u pogrešnom smeru.'),
  ],

  [
    text('h2', '5.2. Poslovno pravilo ostaje u Domain sloju'),
    text('paragraph', 'Modeli <code>Reservation</code> i <code>InventoryItem</code> predstavljaju stanje i ne znaju za HTTP, bazu, MCP niti AI. Provera ulaznih vrednosti pripada validatoru, a pravilo raspoložive količine sprovodi domenski servis <code>InventoryReservationService</code>.'),
    code('csharp', `public sealed record InventoryItem(Guid EquipmentId, int Available);

public sealed class InventoryReservationService
{
    public Result<InventoryItem> Reserve(InventoryItem item, int quantity)
    {
        if (quantity <= 0)
            return Result<InventoryItem>.Fail(InventoryErrorCodes.InvalidQuantity);
        if (item.Available < quantity)
            return Result<InventoryItem>.Fail(InventoryErrorCodes.InsufficientStock);

        return Result<InventoryItem>.Ok(
            item with { Available = item.Available - quantity });
    }
}`, 'examples/ers-ai-workflow/src/EquipmentReservation.Domain/Inventory/InventoryReservationService.cs'),
    list([
      'SRP: model čuva stanje; validator proverava ulaz; domenski servis sprovodi pravilo; use-case orkestrira; adapter čuva podatke.',
      'Kod neuspeha je deo poslovnog ishoda, a ne izuzetak infrastrukture.',
      'Isto pravilo koriste API, Console UI, testovi i budući adapteri, bez dupliranja.',
    ]),
  ],

  [
    text('h2', '5.3. Ugovor između Reservations i Inventory dela sistema'),
    text('paragraph', 'Application sloj definiše ono što use-case za rezervaciju zaista treba. Ne prosleđuje ORM entitet niti omogućava pristup internom skladištu Inventory modula. Ovo je praktična primena ISP i DIP.'),
    code('csharp', `public sealed record ReserveInventoryRequest(
    Guid EquipmentId,
    int Quantity,
    Guid ReservationId);

public interface IInventoryModule
{
    Task<Result> ReserveAsync(
        ReserveInventoryRequest request,
        CancellationToken cancellationToken);
}

public interface IReservationRepository
{
    Task<Reservation?> FindByRequestIdAsync(
        Guid requestId,
        CancellationToken cancellationToken);

    Task AddAsync(
        Reservation reservation,
        CancellationToken cancellationToken);
}`, 'examples/ers-ai-workflow/src/EquipmentReservation.Application/Ports/'),
    callout('note', 'Dependency inversion', 'Use-case zavisi od ugovora koje poseduje Application sloj. Infrastructure bira kako će ti ugovori biti realizovani, a pravilo zalihe poziva iz domenskog servisa umesto da ga sam donosi.'),
  ],

  [
    text('h2', '5.4. CreateReservationHandler kao Application use-case'),
    text('paragraph', 'Handler proverava ulaz kroz validator, zatim idempotentnost, poziva Inventory kroz port i čuva rezultat kroz repository port. Ne zna koja konkretna klasa čuva podatke i ne menja zalihu direktnim pristupom drugom modulu. API i Console UI ga pozivaju preko interfejsa <code>ICreateReservationUseCase</code>.'),
    code('csharp', `public async Task<CreateReservationResult> HandleAsync(
    CreateReservationCommand command,
    CancellationToken cancellationToken)
{
    var validation = _validator.Validate(command);
    if (!validation.Success)
        return CreateReservationResult.Invalid(validation.Error);

    await using var requestLease = await _requestLock.AcquireAsync(
        command.RequestId, cancellationToken);

    var existing = await _reservations.FindByRequestIdAsync(
        command.RequestId, cancellationToken);
    if (existing is not null)
        return CreateReservationResult.From(existing, replayed: true);

    var reservation = await ReserveAsync(command, cancellationToken);
    await _reservations.AddAsync(reservation, cancellationToken);
    return CreateReservationResult.From(reservation, replayed: false);
}`, 'examples/ers-ai-workflow/src/EquipmentReservation.Application/Reservations/Create/CreateReservationHandler.cs'),
    table(['Ishod', 'Značenje', 'HTTP odgovor'], [
      ['Confirmed', 'Zaliha je umanjena i rezervacija sačuvana.', '200'],
      ['Rejected', 'Inventory je odbio zahtev, na primer <code>InsufficientStock</code>.', '409'],
      ['Invalid', 'Komanda nije prošla validaciju, na primer <code>QuantityMustBePositive</code>.', '400'],
    ]),
  ],

  [
    text('h2', '5.5. Idempotentnost mora biti proverena testom'),
    text('paragraph', '<code>RequestId</code> predstavlja idempotency key. Ako isti zahtev stigne ponovo, postojeća rezervacija se vraća bez drugog umanjenja zalihe. To nije komentar niti pretpostavka; ponašanje je zaključano testom.'),
    code('csharp', `[Test]
public async Task CreateReservation_WhenRequestIsRepeated_IsIdempotent()
{
    ComposeSystem(available: 5);
    var command = Command(quantity: 2);

    var first = await _handler.HandleAsync(command, CancellationToken.None);
    var replay = await _handler.HandleAsync(command, CancellationToken.None);

    using (Assert.EnterMultipleScope())
    {
        Assert.That(first.Outcome,
            Is.EqualTo(CreateReservationOutcome.Confirmed));
        Assert.That(replay.ReservationId, Is.EqualTo(first.ReservationId));
        Assert.That(replay.Replayed, Is.True);
        Assert.That(await AvailableAsync(), Is.EqualTo(3));
    }
}`, 'examples/ers-ai-workflow/tests/EquipmentReservation.Tests/Integration/ReservationFlowTests.cs'),
    text('paragraph', 'Pored integracionih testova nad in-memory adapterima, <code>CreateReservationHandlerTests</code> proverava handler u izolaciji. Moq zamenjuje samo portove: repository, Inventory, lock i generator identifikatora.'),
    callout('success', 'Provera integracije', 'Ispravnost integracije potvrđuje se pokretanjem komande <code>dotnet test EquipmentReservation.sln</code> i pregledom rezultata testova.'),
  ],

  [
    text('h2', '5.6. SOLID mapa na stvarnom primeru'),
    table(['Princip', 'Gde se vidi'], [
      ['SRP', 'Reservation čuva stanje; validator proverava ulaz; InventoryReservationService sprovodi pravilo zalihe; handler orkestrira use-case; adapter čuva podatke.'],
      ['OCP', 'Nova Infrastructure implementacija ili nova opcija menija (IMenuAction) dodaje se bez menjanja handler-a.'],
      ['LSP', 'Svaka IInventoryModule implementacija mora poštovati isti ugovor uspeha/neuspeha.'],
      ['ISP', 'IInventoryModule izlaže samo ReserveAsync; čitanje stanja ide kroz poseban IInventoryReadModel.'],
      ['DIP', 'API i Console UI zavise od ICreateReservationUseCase, handler od portova; composition root bira konkretne adaptere.'],
    ]),
    callout('task', 'Rad na vežbi', 'Otvoriti <code>EquipmentReservation.sln</code>, pronaći smer svih ProjectReference zavisnosti i nacrtati ga. Zatim zameniti jedan in-memory adapter sopstvenim test-double-om bez promene Domain/Application koda i pokrenuti ceo solution test.'),
  ],
].flat()
