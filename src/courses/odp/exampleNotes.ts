export type ExampleNote = {
  folder: string
  project: string
  summary: string
  code: string
  codeCaption: string
  test: string
  testCaption: string
  output: string
  observe: string[]
  task: string
}

// Kod, test i ispis su prepisani iz examples/odp-dotnet; pri izmeni primera ažurirati i ovde.
export const odpExampleNotes: Record<number, ExampleNote> = {
  1: {
    folder: "vezba-01-vlasnistvo-neizvesnost",
    project: "Odp.Vezba01",
    summary: "Primer razdvaja poslovni entitet od procesa koji ga predstavlja. Kada udaljeni čvor prestane da se javlja, sistem zna samo koliko dugo ćuti; ne zna da li je proces pao, mreža prekinuta ili je poruka izgubljena. Zato status govori ono što sistem zna, a čvor ostaje registrovan.",
    code: "public NodeLivenessAssessment Evaluate(StationNode node, DateTimeOffset now)\n{\n    ArgumentNullException.ThrowIfNull(node);\n\n    var silence = SilenceOf(node, now);\n    if (silence < _thresholds.SuspectAfter)\n        return new(NodeStatus.Online, NodeLivenessCodes.HeartbeatFresh, silence);\n    if (silence < _thresholds.UnreachableAfter)\n        return new(NodeStatus.Suspected, NodeLivenessCodes.HeartbeatLate, silence);\n    return new(NodeStatus.Unreachable, NodeLivenessCodes.HeartbeatMissing, silence);\n}\n\nprivate static TimeSpan SilenceOf(StationNode node, DateTimeOffset now) =>\n    now > node.LastHeartbeatAt ? now - node.LastHeartbeatAt : TimeSpan.Zero;",
    codeCaption: "examples/odp-dotnet/vezba-01-vlasnistvo-neizvesnost/src/Odp.Vezba01.Domain/Liveness/NodeLivenessPolicy.cs",
    test: "[Test]\npublic void Assess_WhenNodeStaysSilent_ReportsItUnreachableButKeepsItRegistered()\n{\n    var clock = new ManualClock(Start);\n    var registry = new InMemoryNodeRegistry([new StationNode(\"node-ns-1\", \"GS-NOVI-SAD\", Start)]);\n    var handler = new MonitorNodesHandler(\n        registry,\n        new NodeLivenessPolicy(new LivenessThresholds(TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(90))),\n        clock);\n\n    clock.Advance(TimeSpan.FromMinutes(10));\n    var view = handler.Assess().Single();\n\n    using (Assert.EnterMultipleScope())\n    {\n        Assert.That(view.Liveness.Status, Is.EqualTo(NodeStatus.Unreachable));\n        Assert.That(view.Liveness.Code, Is.EqualTo(NodeLivenessCodes.HeartbeatMissing));\n        Assert.That(registry.Find(\"node-ns-1\"), Is.Not.Null);\n    }\n}",
    testCaption: "examples/odp-dotnet/vezba-01-vlasnistvo-neizvesnost/tests/Odp.Vezba01.Tests/Application/MonitorNodesHandlerTests.cs",
    output: "POČETAK [09:00:00]\n  node-bg-1 (GS-BEOGRAD): Online | heartbeat_fresh | tišina 0 s\n  node-ns-1 (GS-NOVI-SAD): Online | heartbeat_fresh | tišina 0 s\n  heartbeat node-ns-1 poslat u 09:00:45 -> heartbeat_accepted\nPOSLE 45 s (javio se samo node-ns-1) [09:00:45]\n  node-bg-1 (GS-BEOGRAD): Suspected | heartbeat_late | tišina 45 s\n  node-ns-1 (GS-NOVI-SAD): Online | heartbeat_fresh | tišina 0 s\nPOSLE 105 s [09:01:45]\n  node-bg-1 (GS-BEOGRAD): Unreachable | heartbeat_missing | tišina 105 s\n  node-ns-1 (GS-NOVI-SAD): Suspected | heartbeat_late | tišina 60 s\n  heartbeat node-ns-1 poslat u 09:00:20 -> heartbeat_out_of_order\nSTIGAO ZAKASNELI HEARTBEAT ZA node-ns-1 [09:01:45]\n  node-bg-1 (GS-BEOGRAD): Unreachable | heartbeat_missing | tišina 105 s\n  node-ns-1 (GS-NOVI-SAD): Suspected | heartbeat_late | tišina 60 s\n  heartbeat node-bg-1 poslat u 09:01:45 -> heartbeat_accepted\nnode-bg-1 SE PONOVO JAVIO [09:01:45]\n  node-bg-1 (GS-BEOGRAD): Online | heartbeat_fresh | tišina 0 s\n  node-ns-1 (GS-NOVI-SAD): Suspected | heartbeat_late | tišina 60 s",
    observe: [
      "Status zavisi samo od dužine tišine; razlog tišine sistem ne zna i ne pretpostavlja.",
      "Čvor koji je `Unreachable` ostaje u registru: nestanak procesa nije nestanak entiteta.",
      "Zakasneli heartbeat dobija kod `heartbeat_out_of_order` i ne vraća poznato stanje unazad."
    ],
    task: "Dodati status `Draining` za čvor koji je najavio planirano gašenje. Takav čvor ne sme postati `Unreachable` dok traje najavljeni period. Pravilo dodati u `NodeLivenessPolicy`, uvesti nov kod i pokriti ga testom."
  },
  2: {
    folder: "vezba-02-ugovori-simulator",
    project: "Odp.Vezba02",
    summary: "Primer pokazuje dve stvari koje omogućavaju da se komponente razvijaju nezavisno: poruka ima eksplicitan ugovor koji se proverava na ulazu, a udaljena stanica se zamenjuje simulatorom čiji je tok u potpunosti određen scenarijom. Isti scenario uvek daje iste poruke, pa se i greška može ponoviti.",
    code: "public Result Validate(TelemetryMessage message)\n{\n    ArgumentNullException.ThrowIfNull(message);\n\n    if (message.ContractVersion != TelemetryContract.Version)\n        return Result.Fail(ContractErrorCodes.UnsupportedVersion);\n    if (string.IsNullOrWhiteSpace(message.StationId))\n        return Result.Fail(ContractErrorCodes.StationIdRequired);\n    if (message.Sequence <= 0)\n        return Result.Fail(ContractErrorCodes.SequenceMustBePositive);\n    if (message.SignalStrengthDbm is < TelemetryContract.MinSignalDbm or > TelemetryContract.MaxSignalDbm)\n        return Result.Fail(ContractErrorCodes.SignalOutOfRange);\n\n    return Result.Ok();\n}",
    codeCaption: "examples/odp-dotnet/vezba-02-ugovori-simulator/src/Odp.Vezba02.Domain/Contracts/TelemetryContractValidator.cs",
    test: "[Test]\npublic void Emit_WithTheSameScenario_ProducesTheSameMessages()\n{\n    var first = new ScriptedStationSimulator(Scenario).Emit(20);\n    var second = new ScriptedStationSimulator(Scenario).Emit(20);\n\n    Assert.That(second, Is.EqualTo(first));\n}",
    testCaption: "examples/odp-dotnet/vezba-02-ugovori-simulator/tests/Odp.Vezba02.Tests/Infrastructure/ScriptedStationSimulatorTests.cs",
    output: "Poruke simulatora:\n  #1 09:00:00  -83.0 dBm\n  #2 09:00:05 -105.0 dBm\n  #3 09:00:10 -105.0 dBm\n  #4 09:00:15    5.0 dBm\n  #5 09:00:20 -104.0 dBm\n  #6 09:00:25 -100.0 dBm\n  #7 09:00:30  -81.0 dBm\n  #8 09:00:35    5.0 dBm\n\nPrihvaćeno: 6, odbijeno: 2\n  #4 -> signal_out_of_range\n  #8 -> signal_out_of_range\n\nPonovljeno pokretanje daje isti ishod: True",
    observe: [
      "Ugovor se proverava na ulazu, a svako odbijanje ima stabilan kod.",
      "Isti scenario (isti `Seed`) daje iste poruke, pa se i greška može ponoviti.",
      "Simulator je adapter iza porta `IStationSimulator`; pravila ne znaju da stanica nije prava."
    ],
    task: "Dodati u scenario kašnjenje poruke (`DelayEvery`), tako da svaka N-ta poruka nosi `MeasuredAt` stariji od prethodne. Uvesti pravilo ugovora koje takvu poruku odbija novim kodom i pokriti ga testom."
  },
  3: {
    folder: "vezba-03-identitet-audit-konfiguracija",
    project: "Odp.Vezba03",
    summary: "Primer prati jednu operaciju kroz dve komponente. Zakazivanje kontakta sa stanicom dobija identifikator operacije (`CorrelationId`) i identitet aktera; isti identifikator stiže do stanice i do revizijskog traga, pa se tok može rekonstruisati i kada delovi sistema vode odvojene logove. Ograničenje trajanja kontakta dolazi iz konfiguracije koja se proverava pre pokretanja.",
    code: "public ScheduleContactResult Schedule(ContactRequest request, OperationContext context)\n{\n    ArgumentNullException.ThrowIfNull(request);\n    ArgumentNullException.ThrowIfNull(context);\n\n    var code = Decide(request, context);\n\n    auditLog.Record(new AuditEntry(\n        clock.UtcNow,\n        context.CorrelationId,\n        context.ActorId,\n        Action,\n        request.StationId,\n        code));\n\n    return new ScheduleContactResult(code == ContactCodes.Scheduled, code, context.CorrelationId);\n}",
    codeCaption: "examples/odp-dotnet/vezba-03-identitet-audit-konfiguracija/src/Odp.Vezba03.Application/Contacts/ScheduleContactHandler.cs",
    test: "[Test]\npublic void Schedule_CarriesTheSameCorrelationIdToTheStationAndTheAuditTrail()\n{\n    var result = _handler.Schedule(Request, Context);\n\n    using (Assert.EnterMultipleScope())\n    {\n        Assert.That(result, Is.EqualTo(new ScheduleContactResult(true, ContactCodes.Scheduled, \"op-42\")));\n        Assert.That(_stationGateway.Calls.Single().CorrelationId, Is.EqualTo(\"op-42\"));\n        Assert.That(\n            _auditLog.Entries.Single(),\n            Is.EqualTo(new AuditEntry(\n                Now,\n                \"op-42\",\n                \"ana\",\n                \"contact.schedule\",\n                \"GS-NOVI-SAD\",\n                ContactCodes.Scheduled)));\n    }\n}",
    testCaption: "examples/odp-dotnet/vezba-03-identitet-audit-konfiguracija/tests/Odp.Vezba03.Tests/Application/ScheduleContactHandlerTests.cs",
    output: "op-0001: GS-NOVI-SAD, 10 min -> contact_scheduled\nop-0002: GS-NOVI-SAD, 40 min -> duration_too_long\nop-0003: GS-BEOGRAD, 10 min -> station_unavailable\n\nLog stanice:\n  op-0001 | GS-NOVI-SAD | reserved=True\n  op-0003 | GS-BEOGRAD | reserved=False\n\nRevizijski trag:\n  op-0001 | ana | contact.schedule | GS-NOVI-SAD | contact_scheduled\n  op-0002 | marko | contact.schedule | GS-NOVI-SAD | duration_too_long\n  op-0003 | jelena | contact.schedule | GS-BEOGRAD | station_unavailable",
    observe: [
      "Isti `CorrelationId` vidi se u logu stanice i u revizijskom tragu centra.",
      "Revizijski zapis nastaje i kada je zahtev odbijen pre poziva stanice.",
      "Neispravna konfiguracija zaustavlja pokretanje sa kodom greške."
    ],
    task: "Dodati u `OperationContext` identifikator pozivajuće komponente (`Source`) i upisati ga u revizijski zapis. Proširiti test tako da dokazuje da zapis sadrži i izvor operacije."
  },
  4: {
    folder: "vezba-04-verzionisanje-failure-first",
    project: "Odp.Vezba04",
    summary: "Primer polazi od onoga što mreža sigurno radi: ista poruka može stići dva puta, može zakasniti i može biti poslata novijom verzijom ugovora. Prijemna strana zato za svaku poruku donosi eksplicitnu odluku, a testovi najpre pokrivaju neuspešne puteve.",
    code: "public InboxDecision Decide(MessageEnvelope envelope, bool alreadyProcessed, DateTimeOffset now)\n{\n    ArgumentNullException.ThrowIfNull(envelope);\n\n    if (envelope.Version.Major != rules.SupportedMajor)\n        return new(false, InboxCodes.UnsupportedMajorVersion);\n    if (alreadyProcessed)\n        return new(false, InboxCodes.Duplicate);\n    if (now - envelope.SentAt > rules.MaxAge)\n        return new(false, InboxCodes.TooOld);\n\n    return new(true, InboxCodes.Accepted);\n}",
    codeCaption: "examples/odp-dotnet/vezba-04-verzionisanje-failure-first/src/Odp.Vezba04.Domain/Messaging/InboxPolicy.cs",
    test: "[Test]\npublic void Receive_WhenTheSameMessageIsDeliveredTwice_ProcessesItOnce()\n{\n    var envelope = Envelope(\"m-1\", 1, Start);\n\n    var first = _handler.Receive(envelope);\n    var second = _handler.Receive(envelope);\n\n    using (Assert.EnterMultipleScope())\n    {\n        Assert.That(first.Code, Is.EqualTo(InboxCodes.Accepted));\n        Assert.That(second.Code, Is.EqualTo(InboxCodes.Duplicate));\n        Assert.That(_processor.ProcessedPayloads, Has.Count.EqualTo(1));\n    }\n}",
    testCaption: "examples/odp-dotnet/vezba-04-verzionisanje-failure-first/tests/Odp.Vezba04.Tests/Application/ReceiveMessageHandlerTests.cs",
    output: "m-1 v1.0 (prva isporuka) -> message_accepted\nm-1 v1.0 (ponovljena isporuka iste poruke) -> message_duplicate\nm-2 v1.3 (novija minor verzija) -> message_accepted\nm-3 v2.0 (druga major verzija) -> message_major_version_unsupported\nm-4 v1.0 (poruka koja je putovala 12 minuta) -> message_too_old\n\nPoslovni efekat se dogodio 2 puta:\n  telemetrija m-1\n  telemetrija m-2",
    observe: [
      "Duplikat, zakasnela poruka i druga major verzija su očekivani ulazi sa sopstvenim kodom.",
      "Poslovni efekat se dešava jednom, koliko god puta da ista poruka stigne.",
      "Novija minor verzija se prihvata; druga major verzija se odbija."
    ],
    task: "Dodati pravilo da se poruka sa minor verzijom većom od poznate prihvata, ali se ishod označava novim kodom `message_accepted_newer_minor`, kako bi tim znao da ugovor treba pregledati. Pokriti granični slučaj testom."
  },
  5: {
    folder: "vezba-05-tok-podataka-read-model",
    project: "Odp.Vezba05",
    summary: "Primer razdvaja zapis od prikaza. Svako prihvaćeno merenje ulazi u zapis redom kojim je stiglo, a prikaz stanice se izvodi iz zapisa i pamti samo poslednje merenje. Merenje koje zakasni ostaje u zapisu, ali ne vraća prikaz unazad; prikaz koji dugo nije osvežen se označava kao zastareo umesto da izgleda kao trenutno stanje.",
    code: "public (StationView View, bool Changed) Apply(StationView? current, TelemetryReading reading)\n{\n    ArgumentNullException.ThrowIfNull(reading);\n\n    if (current is not null && reading.Sequence <= current.LastSequence)\n        return (current, false);\n\n    return (\n        new StationView(\n            reading.StationId,\n            reading.Sequence,\n            reading.MeasuredAt,\n            reading.SignalStrengthDbm),\n        true);\n}",
    codeCaption: "examples/odp-dotnet/vezba-05-tok-podataka-read-model/src/Odp.Vezba05.Domain/ReadModels/StationViewProjector.cs",
    test: "[Test]\npublic void Ingest_WhenOlderReadingArrivesLate_KeepsItInTheLogButNotInTheView()\n{\n    _handler.Ingest(Reading(3, -88));\n\n    var outcome = _handler.Ingest(Reading(2, -97));\n\n    using (Assert.EnterMultipleScope())\n    {\n        Assert.That(outcome, Is.EqualTo(new IngestOutcome(true, TelemetryCodes.Stored, ViewChanged: false)));\n        Assert.That(_log.ForStation(\"GS-NOVI-SAD\"), Has.Count.EqualTo(2));\n        Assert.That(_views.Find(\"GS-NOVI-SAD\")!.LastSequence, Is.EqualTo(3));\n    }\n}",
    testCaption: "examples/odp-dotnet/vezba-05-tok-podataka-read-model/tests/Odp.Vezba05.Tests/Application/IngestTelemetryHandlerTests.cs",
    output: "merenje #1 -> reading_stored, prikaz promenjen: True\nmerenje #3 -> reading_stored, prikaz promenjen: True\nmerenje #2 -> reading_stored, prikaz promenjen: False\nmerenje #0 -> sequence_must_be_positive, prikaz promenjen: False\n[posle prijema] #3 -88 dBm, staro 5 s, zastarelo: False\n[dva minuta bez novih merenja] #3 -88 dBm, staro 125 s, zastarelo: True\n\nZapis sadrži 3 merenja, prikaz samo poslednje.",
    observe: [
      "Zapis čuva sva prihvaćena merenja; prikaz čuva samo poslednje.",
      "Merenje koje zakasni ostaje u zapisu, ali ne menja prikaz.",
      "Prikaz koji dugo nije osvežen ostaje vidljiv, ali je označen kao zastareo."
    ],
    task: "Dodati use-case `RebuildStationView` koji briše prikaz stanice i ponovo ga izvodi iz zapisa. Testom pokazati da je rezultat isti bez obzira na redosled kojim su merenja prvobitno stigla."
  },
  6: {
    folder: "vezba-06-komande-idempotentnost",
    project: "Odp.Vezba06",
    summary: "Primer vodi komandu ka udaljenom uređaju kroz neizvesnost. Slanje nema povratnu vrednost: potvrda stiže odvojeno, kasni ili ne stigne. Zato komanda ima stabilan identifikator, ponovno slanje nosi isti identifikator, uređaj ga izvršava jednom, a potvrda koja stigne posle isteka i dalje ispravlja stanje.",
    code: "public (DeviceCommand Command, string Code) Acknowledge(DeviceCommand command) =>\n    command.State switch\n    {\n        CommandState.Sent =>\n            (command with { State = CommandState.Acknowledged }, CommandCodes.Acknowledged),\n        CommandState.TimedOut =>\n            (command with { State = CommandState.Acknowledged }, CommandCodes.LateAckReconciled),\n        _ => (command, CommandCodes.AckDuplicate)\n    };",
    codeCaption: "examples/odp-dotnet/vezba-06-komande-idempotentnost/src/Odp.Vezba06.Domain/Commands/CommandLifecycle.cs",
    test: "[Test]\npublic void Run_WhenAckIsMissing_ResendsTheSameCommandAndTheDeviceExecutesItOnce()\n{\n    _dispatch.Dispatch(\"cmd-1\", \"antena-1\", \"rotate:120\");\n    _clock.Advance(TimeSpan.FromSeconds(12));\n\n    var outcomes = _retry.Run();\n\n    using (Assert.EnterMultipleScope())\n    {\n        Assert.That(outcomes, Is.EqualTo(new[] { new RetryOutcome(\"cmd-1\", CommandCodes.Retried) }));\n        Assert.That(_device.Deliveries, Is.EqualTo(2));\n        Assert.That(_device.ExecutedCommandIds, Is.EqualTo(new[] { \"cmd-1\" }));\n    }\n}",
    testCaption: "examples/odp-dotnet/vezba-06-komande-idempotentnost/tests/Odp.Vezba06.Tests/Application/CommandFlowTests.cs",
    output: "operator šalje komandu -> command_sent (pokušaj 1)\noperator ponavlja isti zahtev -> command_already_dispatched (pokušaj 1)\npotvrda nije stigla 12 s -> cmd-7: command_retried\npotvrda nije stigla još 12 s -> cmd-7: attempts_exhausted\nzakasnela potvrda -> late_ack_reconciled\nista potvrda ponovo -> ack_duplicate\n\nUređaj je primio 2 isporuke, a izvršio 1 komandu.",
    observe: [
      "Ponovljeni zahtev sa istim `CommandId` ne šalje komandu drugi put.",
      "Posle isteka se šalje ista komanda; uređaj je prima dva puta, a izvršava jednom.",
      "Potvrda koja stigne posle odustajanja ispravlja stanje (`late_ack_reconciled`)."
    ],
    task: "Dodati odlaganje između pokušaja (`RetryDelay`) koje raste sa brojem pokušaja. Pravilo dodati u `CommandLifecycle` i testom pokazati da se ponovno slanje ne dešava pre isteka odlaganja."
  },
  7: {
    folder: "vezba-07-rad-bez-veze-outbox",
    project: "Odp.Vezba07",
    summary: "Primer čuva nameru kroz prekid veze. Stanica svako merenje najpre upisuje u lokalni outbox, a slanje je odvojen korak koji se ponavlja dok ne stigne potvrda. Pošto potvrda može da se izgubi i posle uspešne isporuke, ista poruka ponekad stigne dva puta; centar je zato primenjuje samo prvi put.",
    code: "public FlushReport Flush()\n{\n    var pending = ordering.PendingInOrder(outbox.All());\n    if (pending.Count == 0)\n        return new(0, 0, OutboxCodes.NothingPending);\n\n    var delivered = 0;\n    foreach (var message in pending)\n    {\n        if (!uplink.TrySend(message))\n            return new(delivered, pending.Count - delivered, OutboxCodes.DeliveryUnconfirmed);\n\n        outbox.MarkDelivered(message.Position);\n        delivered++;\n    }\n\n    return new(delivered, 0, OutboxCodes.Flushed);\n}",
    codeCaption: "examples/odp-dotnet/vezba-07-rad-bez-veze-outbox/src/Odp.Vezba07.Application/Flushing/FlushOutboxHandler.cs",
    test: "[Test]\npublic void Flush_WhenAckIsLost_ResendsAndTheCenterAppliesTheMessageOnce()\n{\n    _record.Record(\"m-1\", \"a\");\n    _record.Record(\"m-2\", \"b\");\n    _uplink.LoseNextAck = true;\n\n    var first = _flush.Flush();\n    var second = _flush.Flush();\n\n    using (Assert.EnterMultipleScope())\n    {\n        Assert.That(first, Is.EqualTo(new FlushReport(0, 2, OutboxCodes.DeliveryUnconfirmed)));\n        Assert.That(second, Is.EqualTo(new FlushReport(2, 0, OutboxCodes.Flushed)));\n        Assert.That(_center.AppliedPayloads, Is.EqualTo(new[] { \"a\", \"b\" }));\n        Assert.That(_center.DuplicatesIgnored, Is.EqualTo(1));\n    }\n}",
    testCaption: "examples/odp-dotnet/vezba-07-rad-bez-veze-outbox/tests/Odp.Vezba07.Tests/Application/OutboxFlowTests.cs",
    output: "Veza je u prekidu.\n  merenje m-1 -> message_queued\n  merenje m-2 -> message_queued\n  merenje m-3 -> message_queued\n  pokušaj slanja bez veze -> delivery_unconfirmed, isporučeno 0, preostalo 3\nVeza se vratila, ali se prva potvrda gubi.\n  prvi pokušaj posle povratka -> delivery_unconfirmed, isporučeno 0, preostalo 3\n  drugi pokušaj -> outbox_flushed, isporučeno 3, preostalo 0\n\nCentar je primenio 3 poruke redom:\n  signal -91 dBm\n  signal -88 dBm\n  signal -97 dBm\nIgnorisanih duplikata: 1",
    observe: [
      "Upis merenja uspeva i kada veze nema; slanje je odvojen korak.",
      "Posle povratka veze poruke stižu redom kojim su nastale.",
      "Izgubljena potvrda izaziva ponovno slanje, a centar poruku primenjuje jednom."
    ],
    task: "Ograničiti veličinu outbox-a (`Capacity`). Kada je pun, novo merenje se odbija kodom `outbox_full` umesto da se tiho izgubi staro. Pravilo pokriti testom u kome veza ostaje u prekidu."
  },
  8: {
    folder: "vezba-08-koordinacija-protok",
    project: "Odp.Vezba08",
    summary: "Primer pokazuje dve garancije koje sistem mora da izabere kada raste. Prva je vlasništvo: samo jedan worker sme da menja raspored stanice, vlasništvo je vremenski ograničeno (lease), a resurs odbija upis bivšeg vlasnika po zastarelom tokenu. Druga je protok: kada je red pun, pošiljalac dobija jasan odgovor umesto da posao neograničeno čeka.",
    code: "public LeaseDecision Acquire(Lease? current, string resource, string candidateId, DateTimeOffset now)\n{\n    ArgumentException.ThrowIfNullOrWhiteSpace(resource);\n    ArgumentException.ThrowIfNullOrWhiteSpace(candidateId);\n\n    if (current is null || now >= current.ExpiresAt)\n    {\n        var token = (current?.FencingToken ?? 0) + 1;\n        return new(true, LeaseCodes.Granted, new Lease(resource, candidateId, token, now + _duration));\n    }\n\n    return current.OwnerId == candidateId\n        ? new(true, LeaseCodes.Renewed, current with { ExpiresAt = now + _duration })\n        : new(false, LeaseCodes.HeldByAnother, current);\n}",
    codeCaption: "examples/odp-dotnet/vezba-08-koordinacija-protok/src/Odp.Vezba08.Domain/Leases/LeasePolicy.cs",
    test: "[Test]\npublic void Write_WhenFormerOwnerWakesUpAfterTakeover_IsRejectedByItsStaleToken()\n{\n    var former = _acquire.Acquire(Resource, \"worker-a\").Lease;\n    _clock.Advance(TimeSpan.FromSeconds(45));\n    var current = _acquire.Acquire(Resource, \"worker-b\").Lease;\n    _write.Write(Resource, current.FencingToken, \"plan B\");\n\n    var code = _write.Write(Resource, former.FencingToken, \"zakasneli plan A\");\n\n    using (Assert.EnterMultipleScope())\n    {\n        Assert.That(code, Is.EqualTo(FencingCodes.StaleToken));\n        Assert.That(_schedules.ValueOf(Resource), Is.EqualTo(\"plan B\"));\n    }\n}",
    testCaption: "examples/odp-dotnet/vezba-08-koordinacija-protok/tests/Odp.Vezba08.Tests/Application/CoordinationFlowTests.cs",
    output: "Koordinacija:\n  worker-a traži lease -> lease_granted (vlasnik worker-a, token 1)\n  worker-b traži lease -> lease_held_by_another (vlasnik worker-a, token 1)\n  worker-a upisuje \"plan A\" sa tokenom 1 -> write_accepted\n  worker-a je zastao 45 s; lease je istekao\n  worker-b traži lease -> lease_granted (vlasnik worker-b, token 2)\n  worker-b upisuje \"plan B\" sa tokenom 2 -> write_accepted\n  worker-a upisuje \"zakasneli plan A\" sa tokenom 1 -> stale_fencing_token\n  važeći raspored: plan B\n\nProtok (kapacitet reda 2):\n  job-1 -> job_accepted\n  job-2 -> job_accepted\n  job-3 -> queue_overloaded",
    observe: [
      "U jednom trenutku samo jedan worker je vlasnik resursa.",
      "Posle isteka lease-a novi vlasnik dobija veći token, a upis bivšeg vlasnika je odbijen.",
      "Kada je red pun, pošiljalac dobija `queue_overloaded` umesto tihog čekanja."
    ],
    task: "Dodati u prikaz rasporeda podatak o svežini: vreme poslednjeg upisa i oznaku `IsStale` kada je prikaz stariji od zadatog praga. Testom pokazati da čitalac vidi zastareo, ali jasno označen podatak dok vlasnik ne upiše novi."
  }
}
