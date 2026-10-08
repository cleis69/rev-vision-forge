import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOT_STATUSES, STATUS_LABELS, type LotStatus } from "@/lib/app/lot-fields";
import { cn } from "@/lib/utils";

const DOT: Record<LotStatus, string> = {
  disponible: "bg-emerald-400",
  reservee: "bg-amber-400",
  vendue: "bg-zinc-500",
};

const TEXT: Record<LotStatus, string> = {
  disponible: "text-emerald-300",
  reservee: "text-amber-300",
  vendue: "text-muted-foreground",
};

export function StatusDot({ status, className }: { status: LotStatus; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full", DOT[status], className)}
    />
  );
}

export function LotStatusLabel({ status }: { status: LotStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", TEXT[status])}>
      <StatusDot status={status} />
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Status of a lot, changed in one click. */
export function StatusSelect({
  value,
  onChange,
  label,
  disabled = false,
  className,
}: {
  value: LotStatus;
  onChange: (status: LotStatus) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as LotStatus)} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          "h-9 w-[8.5rem] border-transparent bg-transparent px-2.5 hover:border-border",
          className,
        )}
      >
        <SelectValue>
          <LotStatusLabel status={value} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LOT_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <LotStatusLabel status={status} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
