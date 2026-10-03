import type { DocumentPage } from '../types'
import { text, list, callout, code, table, diagram, page } from './canvaPracticumShared'

export const exercise5 = (): DocumentPage[] => [
  page('Vežba 5 — Poslovna logika i aplikacioni sloj', [
    text('h1', 'Vežba 5 — Poslovna logika i aplikacioni sloj'),
    text('paragraph', 'Nakon uspostavljanja arhitektonskih granica potrebno je rasporediti odgovornosti između modela, validatora i servisa slučaja upotrebe. Model predstavlja stanje, validator proverava ispravnost ulaznih vrednosti, a aplikacioni servis koordinira poslovna pravila i zavisnosti. Nijedan od ovih elemenata ne treba da zavisi od konkretnog korisničkog interfejsa, baze podataka ili transportnog protokola.'),
    diagram('Tok jednog slučaja upotrebe', [
      ['Ulaz', 'komanda ili zahtev', 'cyan'],
      ['Validacija', 'osnovna i poslovna pravila', 'blue'],
      ['Poslovna pravila', 'odluka i promena stanja', 'violet'],
      ['Čuvanje', 'ugovor repozitorijuma', 'amber'],
      ['Rezultat', 'eksplicitan ishod za klijenta', 'emerald'],
    ], 'Aplikacioni servis povezuje zahtev sa poslovnim pravilima i eksplicitno definisanim ishodom.'),
    callout('info', 'Studija slučaja: ECommerce', 'Primer ECommerce razdvaja Domain, podatke i repozitorijume, Application i implementaciju poslovnih servisa. Upiti i komande pripadaju aplikacionom sloju, dok konkretna baza podataka ili spoljni web servis ostaju infrastrukturni detalji.'),
    callout('success', 'Rešenje za preuzimanje', 'Kompletno rešenje studije slučaja dostupno je kao <a href="./E-Commerce.zip" download>ECommerce ZIP</a>.'),
  ]),
  page('5.1. Model, validacija i poslovna pravila', [
    text('h2', '5.1. Model, validacija i poslovna pravila'),
    text('paragraph', 'Klasa modela predstavlja podatke i stanje rezervacije. Provera opsega i međusobnog odnosa ulaznih vrednosti pripada posebnom validatoru, dok pravila koja zahtevaju podatke iz repozitorijuma ili drugih modula pripadaju aplikacionom ili domenskom servisu. Ovakva podela sprečava da model istovremeno postane nosilac podataka, validator i servis.'),
    code('csharp', `public sealed class Reservation\n{\n    public Guid Id { get; }\n    public Guid EquipmentId { get; }\n    public DateTime From { get; }\n    public DateTime To { get; }\n    public bool Cancelled { get; private set; }\n\n    public Reservation(\n        Guid id, Guid equipmentId, DateTime from, DateTime to)\n    {\n        Id = id;\n        EquipmentId = equipmentId;\n        From = from;\n        To = to;\n    }\n\n    public void MarkCancelled() => Cancelled = true;\n}\n\npublic static class ReservationValidator\n{\n    public static Result ValidatePeriod(DateTime from, DateTime to)\n        => from < to\n            ? Result.Ok()\n            : Result.Fail("InvalidPeriod");\n}`, 'Model čuva stanje, a validator proverava ispravnost perioda'),
    list([
      'Model predstavlja stanje i ne pristupa repozitorijumu, vremenu sistema niti spoljnim servisima.',
      'Validator proverava format, opseg i međusobni odnos ulaznih vrednosti.',
      'Aplikacioni ili domenski servis sprovodi pravila koja zahtevaju dodatni kontekst.',
      'Promena stanja modela izvodi se ograničenom operacijom nakon uspešne validacije i poslovne provere.',
    ]),
  ]),
  page('5.2. Eksplicitni poslovni ishodi', [
    text('h2', '5.2. `Result` i očekivani neuspeh'),
    text('paragraph', 'Očekivani poslovni neuspeh nije isto što i neočekivana greška sistema. Kada korisnik pokuša da rezerviše zauzet termin, sistem radi ispravno ako zahtev odbije i vrati stabilan i razumljiv ishod. Takvo ponašanje treba da bude eksplicitno i testabilno, umesto da se prikrije vrednostima `null`, `false` ili generičkim izuzetkom.'),
    code('csharp', `public sealed record Result(bool Success, string? Error)\n{\n    public static Result Ok() => new(true, null);\n    public static Result Fail(string error) => new(false, error);\n}\n\npublic sealed class ReservationService\n{\n    private readonly IReservationRepository _repository;\n\n    public ReservationService(IReservationRepository repository)\n        => _repository = repository;\n\n    public Result Reserve(ReservationRequest request)\n    {\n        var validation = ReservationValidator.ValidatePeriod(\n            request.From, request.To);\n        if (!validation.Success)\n            return validation;\n\n        if (_repository.HasOverlap(\n            request.EquipmentId, request.From, request.To))\n            return Result.Fail("OverlappingReservation");\n\n        var reservation = new Reservation(\n            Guid.NewGuid(), request.EquipmentId,\n            request.From, request.To);\n\n        _repository.Add(reservation);\n        return Result.Ok();\n    }\n}`, 'Eksplicitan rezultat poslovne operacije u aplikacionom servisu'),
    table(['Situacija', 'Preporučeni model'], [
      ['Nevažeći poslovni zahtev', 'Eksplicitan Result i stabilan kod poslovnog neuspeha.'],
      ['Entitet nije pronađen', 'Result sa stabilnim kodom ili domenom definisan NotFound ishod.'],
      ['Baza privremeno nedostupna', 'Infrastrukturna greška koja se obrađuje na granici sistema (middleware, retry politika).'],
      ['Narušena pretpostavka unutar domena', 'Result.Fail sa jasnim kodom — poslovni sloj ostaje predvidljiv i bez izuzetaka.'],
    ]),
  ]),
  page('5.3. Servis slučaja upotrebe i dependency injection', [
    text('h2', '5.3. Servis slučaja upotrebe i dependency injection'),
    text('paragraph', 'Dependency Injection nije samo mogućnost framework-a. To je način da objekat dobije saradnike spolja, tako da centralna logika ne mora da zna kako se ti saradnici kreiraju. Time se promenljive zavisnosti mogu zameniti u testu ili drugom izvršnom okruženju.'),
    code('csharp', `public sealed class ReservationService\n{\n    private readonly IReservationRepository _repository;\n    private readonly IClock _clock;\n\n    public ReservationService(\n        IReservationRepository repository,\n        IClock clock)\n    {\n        _repository = repository;\n        _clock = clock;\n    }\n\n    public Result Reserve(ReservationRequest request)\n    {\n        var validation = ReservationValidator.ValidatePeriod(\n            request.From, request.To);\n        if (!validation.Success)\n            return validation;\n\n        if (request.From <= _clock.UtcNow)\n            return Result.Fail("ReservationMustBeInFuture");\n\n        if (_repository.HasOverlap(\n            request.EquipmentId, request.From, request.To))\n            return Result.Fail("OverlappingReservation");\n\n        var reservation = new Reservation(\n            Guid.NewGuid(), request.EquipmentId,\n            request.From, request.To);\n\n        _repository.Add(reservation);\n        return Result.Ok();\n    }\n}`, 'Servis slučaja upotrebe sa ubrizganim zavisnostima'),
    callout('note', 'Testabilnost se projektuje unapred', '`IClock` i `IReservationRepository` nisu uvedeni samo radi testova, već zato što vreme i skladište predstavljaju promenljive spoljne zavisnosti. Testiranje koristi činjenicu da su granice sistema već jasno postavljene.'),
  ]),
  page('5.4. Projektna kontrolna tačka P2', [
    text('h2', '5.4. Projektna kontrolna tačka P2 — funkcionalno jezgro'),
    text('paragraph', 'Do ove projektne kontrolne tačke projekat treba da ima najmanje jedan zaokružen slučaj upotrebe čije se ponašanje može obrazložiti od ulaznog zahteva do poslovnog rezultata. Završetak svih ekrana nije uslov; ocenjuje se pravilno modelovan centralni tok.'),
    list([
      'Implementirati najmanje dva ključna slučaja upotrebe sa eksplicitnim ulazima i rezultatima.',
      'Poslovna pravila ne smeju biti raspoređena po kontroleru, konzolnom meniju i repozitorijumu bez definisane granice odgovornosti.',
      'Za očekivane neuspehe definisati stabilne kodove ili tipove rezultata.',
      'Spoljne zavisnosti uvoditi kroz ugovore i composition root.',
      'U pull request-u opisati najmanje jednu arhitektonsku odluku koja je promenjena nakon implementacije i obrazložiti razlog promene.',
    ]),
    callout('task', 'Mini domaći — bonus 1 bod', 'Izabrati metodu koja za očekivani poslovni neuspeh vraća `bool`, `null` ili generički `Exception`. Preoblikovati je u eksplicitan rezultat i dodati dva mala testa ili demonstraciona scenarija.'),
  ]),
]
