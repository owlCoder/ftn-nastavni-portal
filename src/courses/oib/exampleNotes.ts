export const oibExampleNotes: Record<number, {
  folder: string
  project: string
  summary: string
  scenario: string
  tests: string
  evidence: string
  task: string
}> = {
  "1": {
    "folder": "vezba-01-identitet-rbac",
    "project": "Oib.Vezba01",
    "summary": "Autorizacija pristupa izveštajima na osnovu uloga. `RbacPolicy` podrazumevano odbija pristup; prijavljen nalog mora imati traženu dozvolu.",
    "scenario": "Uloga bez dozvole `reports:export` pokušava izvoz.",
    "tests": "`RbacPolicyTests`, `AuthorizeAccessHandlerTests`",
    "evidence": "`AccessAuditEntry` beleži i odobren i odbijen pristup.",
    "task": "Dodati atribut `IsActive` akteru i pravilo da deaktiviran nalog nema pristup iako ima ulogu. Pravilo dodati u `RbacPolicy`, uvesti nov kod odluke i pokriti ga testom."
  },
  "2": {
    "folder": "vezba-02-resurs-klasifikacija",
    "project": "Oib.Vezba02",
    "summary": "`ResourceReadPolicy` proverava dozvolu, vlasništvo i klasifikaciju konkretnog zapisa. Provera se izvršava na serveru za svaki zahtev.",
    "scenario": "Korisnik pogađa identifikator tuđeg zapisa.",
    "tests": "`ResourceReadPolicyTests`, `ReadResourceHandlerTests`",
    "evidence": "`ResourceAccessAuditEntry` sadrži ishod i stabilan kod odluke.",
    "task": "Uvesti radnju izmene zapisa: menja ga samo vlasnik, bez obzira na `records:read:any`. Dodati novu politiku i use-case pored postojećih, bez menjanja `ResourceReadPolicy`."
  },
  "3": {
    "folder": "vezba-03-politike-konfiguracija",
    "project": "Oib.Vezba03",
    "summary": "`ConfigurationDriftDetector` poredi aktivnu konfiguraciju sa usvojenim baseline-om. Kontrole implementiraju `IConfigurationControl`; nalaz označava slabljenje zaštite.",
    "scenario": "Minimalna dužina lozinke ili zahtev za administratorski MFA oslabi u odnosu na baseline.",
    "tests": "`ConfigurationControlTests`, `DetectConfigurationDriftHandlerTests`",
    "evidence": "`DriftReport` sadrži correlation ID i verziju baseline-a.",
    "task": "Dodati kontrolu za maksimalno trajanje sesije: proširiti `SecurityBaseline` i `SecurityConfiguration`, napisati novu `IConfigurationControl` klasu i test koji pokazuje da duža sesija od dozvoljene daje nalaz."
  },
  "4": {
    "folder": "vezba-04-threat-modeling",
    "project": "Oib.Vezba04",
    "summary": "Procena scenarija pretnje povezuje imovinu, tok podataka i granicu poverenja. `ThreatRiskCalculator` računa rizik; demonstraciona politika zahteva tretman pri vrednosti 24 ili većoj.",
    "scenario": "Izvoz ličnih podataka stiže neovlašćenom primaocu.",
    "tests": "`ThreatRiskCalculatorTests`, `AssessThreatModelHandlerTests`",
    "evidence": "`ThreatModelReport` prikazuje scenarije po riziku i predložene kontrole.",
    "task": "Dodati rezidualni rizik: `ThreatScenario` dobija procenu efikasnosti kontrole, a izveštaj prikazuje rizik pre i posle kontrole. Pravilo smestiti u domenski servis i pokriti graničnim testovima."
  },
  "5": {
    "folder": "vezba-05-mfa-sesije-tajne",
    "project": "Oib.Vezba05",
    "summary": "`StepUpAuthenticationPolicy` proverava da li sesija ima dovoljno svežu MFA potvrdu za rizičnu operaciju. Odluka razlikuje odbijanje i potrebu za novom potvrdom.",
    "scenario": "Preuzeta, opozvana ili davno potvrđena sesija pokušava poverljiv izvoz.",
    "tests": "`StepUpAuthenticationPolicyTests`, `AuthorizeRiskyOperationHandlerTests`",
    "evidence": "`StepUpDecision` vraća kod odluke i oznaku da li se traži MFA.",
    "task": "Dodati maksimalnu starost same sesije: sesija izdata pre više od osam sati odbija se bez obzira na MFA. Uvesti nov kod odluke i test za graničnu vrednost."
  },
  "6": {
    "folder": "vezba-06-detekcija-incident",
    "project": "Oib.Vezba06",
    "summary": "`RepeatedFailedLoginRule` prepoznaje najmanje tri neuspešne prijave u deset minuta. `IncidentFactory` iz signala formira incident sa određenom ozbiljnošću.",
    "scenario": "Uzastopni pokušaji prijave sa iste adrese.",
    "tests": "`RepeatedFailedLoginRuleTests`, `IncidentFactoryTests`, `DetectIncidentsHandlerTests`",
    "evidence": "`Incident` sadrži identifikator, ozbiljnost, sažetak i vreme otvaranja.",
    "task": "Dodati pravilo koje prepoznaje password spraying: ista adresa neuspešno pokušava prijavu na više različitih naloga. Napisati novu `IDetectionRule` klasu i registrovati je u composition root-u."
  },
  "7": {
    "folder": "vezba-07-abac-rizik-pregled",
    "project": "Oib.Vezba07",
    "summary": "`RiskBasedAccessPolicy` proverava kontekst kroz skup `IAccessRule` pravila. Pristup zahteva odgovarajuću ulogu, uređaj, lokaciju i prihvatljiv rizik.",
    "scenario": "Ispravna uloga koristi se sa nepoznatog uređaja ili uz visok rizik.",
    "tests": "`AccessRuleTests`, `RiskBasedAccessPolicyTests`, `EvaluateAccessHandlerTests`",
    "evidence": "`AccessDecision` daje razlog odluke; `AccessReviewItem` određuje rok i vlasnika pregleda.",
    "task": "Dodati pravilo radnog vremena: ograničen resurs dostupan je samo radnim danima od 8 do 18 časova. Vreme proslediti kroz kontekst, a ne čitati ga iz sistema unutar pravila."
  },
  "8": {
    "folder": "vezba-08-korelacija-efektivnost",
    "project": "Oib.Vezba08",
    "summary": "`EventCorrelator` povezuje događaje u slučajeve. `ControlEffectivenessCalculator` poredi udeo blokiranih pokušaja sa zadatim ciljem; bez pokušaja nema osnova za ocenu efektivnosti.",
    "scenario": "Kontrola postoji, ali ne blokira potreban udeo rizičnih pokušaja.",
    "tests": "`EventCorrelatorTests`, `ControlEffectivenessCalculatorTests`, `AnalyzeSecurityEventsHandlerTests`",
    "evidence": "`SecurityAnalysisReport` prikazuje povezane slučajeve i rezultate merenja.",
    "task": "Dodati vreme događaja i meriti koliko je prošlo od prvog do poslednjeg događaja u slučaju. Proširiti `CorrelationCase` i napisati test za slučaj sa jednim događajem."
  }
}
