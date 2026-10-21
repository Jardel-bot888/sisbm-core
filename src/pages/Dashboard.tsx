// ─── Page Tableau de bord ─────────────────────────────────────────────────────
import {
  Activity,
  AlertTriangle,
  BatteryWarning,
  Compass,
  Gauge,
  MapPin,
  Radio,
  Satellite,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { C, va } from "@/theme";
import { gpsSample } from "@/data/gpsSample";
import { useGpsFeed } from "@/data/gpsFeed";
import GpsSnapshotMap from "@/components/GpsSnapshotMap";

type Props = { onNavigate: (label: string) => void };

function formatUtc(seconds: number) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(seconds * 1000));
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: va(color, "12%"), color }}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: C.textMuted }}>{label}</p>
        <p className="mt-1 truncate font-mono text-xl font-bold tabular-nums" style={{ color: C.text }}>{value}</p>
        <p className="mt-0.5 truncate text-[11px]" style={{ color: C.textDim }}>{detail}</p>
      </div>
    </div>
  );
}

const reportedFlags: { label: string; active: boolean; icon: LucideIcon }[] = [
  { label: "Événement de survitesse", active: gpsSample.overspeedingEvent, icon: Gauge },
  { label: "Alarme de coupure d’alimentation", active: gpsSample.powerCutAlarm, icon: Zap },
  { label: "Alarme d’arrêt", active: gpsSample.shutdownAlarm, icon: AlertTriangle },
  { label: "Alarme de vibration", active: gpsSample.vibrationAlarm, icon: Activity },
];

export default function Dashboard({ onNavigate }: Props) {
  const { vehicles } = useGpsFeed();

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: C.primary }}>Supervision télématique</p>
          <h1 className="text-2xl font-bold" style={{ color: C.text }}>Tableau de bord GPS</h1>
          <p className="mt-1 text-sm" style={{ color: C.textMuted }}>Dernière trame disponible pour le boîtier {gpsSample.deviceName}.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ color: C.orange, borderColor: va(C.orange, "35%"), background: va(C.orange, "8%") }}>
          <Radio className="h-3.5 w-3.5" /> Trame de démonstration
        </span>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Mesures GPS reçues">
        <Metric icon={Gauge} label="Vitesse" value={`${gpsSample.speed} km/h`} detail={gpsSample.movement ? "Mouvement signalé" : "Aucun mouvement signalé"} color={C.primary} />
        <Metric icon={Zap} label="Contact moteur" value={gpsSample.ignition ? "ACTIF" : "INACTIF"} detail="État fourni par le traceur" color={gpsSample.ignition ? C.green : C.gray} />
        <Metric icon={BatteryWarning} label="Alimentation externe" value={`${gpsSample.externalVoltage.toFixed(1)} V`} detail="Tension remontée" color={C.orange} />
        <Metric icon={Satellite} label="Satellites GPS" value={`${gpsSample.satellites}`} detail={`${gpsSample.beidouSatellites} satellites Beidou`} color={C.primaryLight} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
        <div className="overflow-hidden rounded-xl border" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color: C.primary }} />
              <h2 className="text-sm font-bold" style={{ color: C.text }}>Carte de la flotte</h2>
            </div>
            <span className="text-xs font-semibold" style={{ color: C.textMuted }}>{vehicles.length} véhicules · {gpsSample.deviceName}</span>
          </div>
          <div className="h-[340px] min-h-[320px]">
            <GpsSnapshotMap />
          </div>
          <div className="grid gap-3 border-t px-4 py-3 sm:grid-cols-3" style={{ borderColor: C.border }}>
            <div><p className="text-[11px]" style={{ color: C.textMuted }}>Cap</p><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.text }}><Compass className="h-3.5 w-3.5" />{gpsSample.direction}°</p></div>
            <div><p className="text-[11px]" style={{ color: C.textMuted }}>Altitude</p><p className="mt-1 text-sm font-semibold" style={{ color: C.text }}>{gpsSample.altitude} m</p></div>
            <div><p className="text-[11px]" style={{ color: C.textMuted }}>Kilométrage reçu</p><p className="mt-1 font-mono text-sm font-semibold tabular-nums" style={{ color: C.text }}>{gpsSample.mileage.toLocaleString("fr-FR")} km</p></div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <section className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs" style={{ color: C.textMuted }}>Boîtier GPS</p>
                <h2 className="mt-1 text-lg font-bold" style={{ color: C.text }}>{gpsSample.deviceName}</h2>
                <p className="mt-0.5 font-mono text-xs" style={{ color: C.textDim }}>Identifiant {gpsSample.ident}</p>
              </div>
              <span className="rounded-md px-2 py-1 text-[10px] font-bold" style={{ background: va(C.green, "12%"), color: C.green }}>CONTACT ON</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-3" style={{ borderColor: C.border }}>
              <div><p className="text-[11px]" style={{ color: C.textMuted }}>ID appareil</p><p className="mt-1 font-mono text-xs font-semibold" style={{ color: C.text }}>{gpsSample.deviceId}</p></div>
              <div><p className="text-[11px]" style={{ color: C.textMuted }}>Séquence événement</p><p className="mt-1 font-mono text-xs font-semibold" style={{ color: C.text }}>#{gpsSample.eventSequence}</p></div>
              <div><p className="text-[11px]" style={{ color: C.textMuted }}>Signal GSM reçu</p><p className="mt-1 font-mono text-xs font-semibold" style={{ color: C.text }}>{gpsSample.gsmSignal} dBm</p></div>
              <div><p className="text-[11px]" style={{ color: C.textMuted }}>Réseau</p><p className="mt-1 font-mono text-xs font-semibold" style={{ color: C.text }}>MCC {gpsSample.gsmMcc} · MNC {gpsSample.gsmMnc}</p></div>
            </div>
            <div className="mt-4 rounded-lg px-3 py-2.5" style={{ background: C.soft }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" style={{ color: gpsSample.defenseActive ? C.green : C.gray }} />
                <span className="text-xs font-semibold" style={{ color: C.text }}>Défense {gpsSample.defenseActive ? "activée" : "désactivée"}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold" style={{ color: C.text }}>Indicateurs de la trame</h2>
              <span className="text-[10px]" style={{ color: C.textMuted }}>Valeurs reçues</span>
            </div>
            <div className="space-y-2">
              {reportedFlags.map(({ label, active, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-lg border px-3 py-2" style={{ borderColor: active ? va(C.orange, "30%") : C.border, background: active ? va(C.orange, "7%") : C.cardBg }}>
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color: active ? C.orange : C.textMuted }} />
                  <span className="min-w-0 flex-1 text-xs" style={{ color: C.text }}>{label}</span>
                  <span className="text-[10px] font-bold" style={{ color: active ? C.orange : C.textMuted }}>{active ? "SIGNALÉ" : "NON"}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
              Ces états sont reproduits tels que reçus. Leur acquittement et leur durée doivent être confirmés avec le protocole du traceur.
            </p>
          </section>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
          <div className="mb-3 flex items-center gap-2"><Activity className="h-4 w-4" style={{ color: C.primary }} /><h2 className="text-sm font-bold" style={{ color: C.text }}>Horodatage de la télémétrie</h2></div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-[11px]" style={{ color: C.textMuted }}>Position GPS (UTC)</dt><dd className="mt-1 font-mono text-xs font-semibold" style={{ color: C.text }}>{formatUtc(gpsSample.timestamp)}</dd></div>
            <div><dt className="text-[11px]" style={{ color: C.textMuted }}>Réception serveur (UTC)</dt><dd className="mt-1 font-mono text-xs font-semibold" style={{ color: C.text }}>{formatUtc(gpsSample.serverTimestamp)}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border p-4" style={{ background: va(C.orange, "5%"), borderColor: va(C.orange, "25%") }}>
          <div className="mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" style={{ color: C.orange }} /><h2 className="text-sm font-bold" style={{ color: C.text }}>Interprétation des champs</h2></div>
          <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>
            Le niveau batterie reçu vaut 0, sans indication permettant de savoir s’il est réellement nul ou indisponible. Il n’est donc pas converti en pourcentage ni utilisé comme alerte.
          </p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: C.textDim }}>
            Une seule trame est chargée : aucun historique, cumul de flotte ou tendance ne peut être calculé à partir de cet exemple.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2" style={{ borderColor: C.border, background: C.cardBg }}>
        <p className="text-[11px]" style={{ color: C.textMuted }}>Protocole {gpsSample.protocolId} · canal {gpsSample.channelId} · état véhicule {gpsSample.vehicleState}</p>
        <button type="button" onClick={() => onNavigate("Tracking GPS")} className="text-xs font-semibold" style={{ color: C.primary }}>Ouvrir le module GPS</button>
      </div>
    </div>
  );
}