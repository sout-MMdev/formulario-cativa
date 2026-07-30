// ================================================================
// SERVIÇO — VIACEP
// Busca logradouros dentro de uma cidade já escolhida.
// É a 2ª fase do autocomplete de endereço.
// ================================================================

import {
  BUSCA_MAX_RESULTADOS,
  RUAS_TAMANHO_MINIMO,
  URL_VIACEP,
} from "../config/index.ts";
import type { Rua } from "../tipos/index.ts";

/**
 * Consulta o ViaCEP por UF + cidade + trecho do nome da rua.
 * Retorna lista vazia em qualquer erro — o campo segue como
 * texto livre e o executivo não fica travado.
 */
export async function buscarRuas(
  uf: string,
  cidade: string,
  textoBusca: string,
): Promise<Rua[]> {
  const busca = textoBusca.trim();

  if (!uf || !cidade || busca.length < RUAS_TAMANHO_MINIMO) return [];

  try {
    const url =
      `${URL_VIACEP}/` +
      `${encodeURIComponent(uf)}/` +
      `${encodeURIComponent(cidade)}/` +
      `${encodeURIComponent(busca)}/json/`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    // O ViaCEP responde { erro: true } quando não encontra nada.
    if (!Array.isArray(dados)) return [];

    return dados
      .slice(0, BUSCA_MAX_RESULTADOS)
      .map((item: Record<string, string>) => ({
        rua: item.logradouro,
        bairro: item.bairro,
        cep: item.cep,
        label: item.logradouro + (item.bairro ? ` - ${item.bairro}` : ""),
      }));
  } catch (erro) {
    console.warn("Não foi possível buscar ruas no ViaCEP.", erro);
    return [];
  }
}
