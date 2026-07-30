// ================================================================
// ÍCONE
// Desenha em SVG inline os traçados de @cativa/tema/icones —
// sem biblioteca externa, sem fonte de ícone, sem requisição.
// Herdam a cor do texto (currentColor) e o traço é uniforme.
//
// Ícone novo: acrescente em packages/tema/icones.ts e ele passa
// a existir no desktop E no mobile.
// ================================================================

import { trilhasIcone, type NomeIcone } from "@cativa/tema/icones";
import "./Icone.css";

interface PropsIcone {
  nome: NomeIcone;
  /** Lado do quadrado, em pixels. */
  tamanho?: number;
  /** Espessura do traço. */
  traco?: number;
  className?: string;
}

export function Icone({
  nome,
  tamanho = 18,
  traco = 1.8,
  className = "",
}: PropsIcone) {
  return (
    <svg
      className={`icone ${className}`.trim()}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={trilhasIcone[nome]} />
    </svg>
  );
}

export type { NomeIcone };
