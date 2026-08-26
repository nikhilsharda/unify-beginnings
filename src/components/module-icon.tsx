import {
  Play,
  Globe,
  ListChecks,
  Question,
  ChatCircleDots,
  Compass,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const ICONS: Record<string, Icon> = {
  VIDEO: Play,
  MAP: Globe,
  QUIZ: Question,
  CHECKLIST: ListChecks,
  REFLECTION: ChatCircleDots,
  BRIEFING: Compass,
};

export function ModuleIcon({ type, className }: { type: string; className?: string }) {
  const IconComp = ICONS[type] ?? Play;
  return <IconComp className={className} weight="bold" />;
}
