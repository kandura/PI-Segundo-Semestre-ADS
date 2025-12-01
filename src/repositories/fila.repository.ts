

interface Musica {
  id: number;
  nome: string;
  usuario: string;
  ordem: number;
}

let fila: Musica[] = [
  { id: 1, nome: "Música Teste 1", usuario: "Cliente A", ordem: 1 },
  { id: 2, nome: "Música Teste 2", usuario: "Cliente B", ordem: 2 },
  { id: 3, nome: "Música Teste 3", usuario: "Cliente C", ordem: 3 }
];

export const FilaRepository = {
  getFila() {
    return fila.sort((a, b) => a.ordem - b.ordem);
  },

  colocarNaFrente(id: number) {
    const musica = fila.find(m => m.id === id);
    if (!musica) return;

    // Coloca ordem = 0
    musica.ordem = 0;

    // Empurra as outras para baixo
    fila = fila.map(m => {
      if (m.id !== id) m.ordem++;
      return m;
    });
  },

  remover(id: number) {
    fila = fila.filter(m => m.id !== id);
  }
};
