export interface DeliveryArea {
  id: string;
  nameEn: string;
  nameAr: string;
  fee: number;
}

export const DELIVERY_AREAS: DeliveryArea[] = [
  { id: "doha",       nameEn: "Doha",         nameAr: "الدوحة",    fee: 30 },
  { id: "al_rayyan",  nameEn: "Al Rayyan",    nameAr: "الريان",    fee: 35 },
  { id: "umm_salal",  nameEn: "Umm Salal",    nameAr: "ام صلال",   fee: 35 },
  { id: "azghawa",    nameEn: "Azghawa",      nameAr: "ازغوى",     fee: 30 },
  { id: "al_dafna",   nameEn: "Al Dafna",     nameAr: "الدفنة",    fee: 30 },
  { id: "al_wakrah",  nameEn: "Al Wakrah",    nameAr: "الوكرة",    fee: 40 },
  { id: "al_khor",    nameEn: "Al Khor",      nameAr: "الخور",     fee: 50 },
  { id: "al_ruwais",  nameEn: "Al Ruwais",    nameAr: "الرويس",    fee: 70 },
  { id: "al_shahaniya", nameEn: "Al Shahaniya", nameAr: "الشحانية", fee: 65 },
  { id: "ain_khaled", nameEn: "Ain Khaled",   nameAr: "عين خالد",  fee: 35 },
  { id: "al_thumama", nameEn: "Al Thumama",   nameAr: "الثمامة",   fee: 35 },
];
