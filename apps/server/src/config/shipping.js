export const SHIPPING_RATES = {
  cairo: 30,
  giza: 30,
  alexandria: 45,
  dakahlia: 50,
  red_sea: 75,
  beheira: 50,
  fayoum: 55,
  gharbiya: 50,
  ismailia: 55,
  menofia: 50,
  minya: 60,
  qaliubiya: 35,
  new_valley: 85,
  north_sinai: 80,
  port_said: 55,
  damietta: 55,
  sharqia: 50,
  south_sinai: 80,
  suez: 60,
  aswan: 75,
  assiut: 65,
  beni_suef: 55,
  qena: 70,
  sohag: 65,
  luxor: 70,
  matrouh: 80,
  kafr_el_sheikh: 50,
}

export const normalizeGovernorate = (value) =>
  value
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

export const getShippingCost = (governorate) => {
  const key = normalizeGovernorate(governorate)
  return SHIPPING_RATES[key] ?? null
}
