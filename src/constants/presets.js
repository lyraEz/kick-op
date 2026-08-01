// Cada preset define os 3 controles de imagem de uma vez. "Personalizado"
// não é uma opção clicável — é o estado implícito assim que o usuário
// mexe manualmente em qualquer slider depois de escolher um preset.
export const PRESETS = {
  natural: { label: 'Natural', saturation: 100, brightness: 100, contrast: 100 },
  vivido: { label: 'Vívido', saturation: 145, brightness: 105, contrast: 110 },
  cinema: { label: 'Cinema', saturation: 90, brightness: 95, contrast: 115 },
  noturno: { label: 'Noturno', saturation: 85, brightness: 130, contrast: 95 },
};
