// Intelligent Delivery Area Auto-Detection for Bangladesh (Inside Dhaka vs Outside Dhaka)

export interface AreaDetectionResult {
  area: 'inside' | 'outside' | null;
  detectedName?: string;
  badgeText?: string;
}

export interface DistrictInfo {
  id: string;
  nameEn: string;
  nameBn: string;
  isDhaka: boolean;
  divisionEn: string;
  divisionBn: string;
}

// Dhaka thanas, prominent neighborhoods, and keywords
export const DHAKA_AREAS = [
  { en: 'Mirpur', bn: 'মিরপুর' },
  { en: 'Uttara', bn: 'উত্তরা' },
  { en: 'Dhanmondi', bn: 'ধানমন্ডি' },
  { en: 'Gulshan', bn: 'গুলশান' },
  { en: 'Banani', bn: 'বনানী' },
  { en: 'Mohammadpur', bn: 'মোহাম্মদপুর' },
  { en: 'Badda', bn: 'বাড্ডা' },
  { en: 'Rampura', bn: 'রামপুরা' },
  { en: 'Khilgaon', bn: 'খিলগাঁও' },
  { en: 'Motijheel', bn: 'মতিঝিল' },
  { en: 'Jatrabari', bn: 'যাত্রাবাড়ী' },
  { en: 'Bashundhara R/A', bn: 'বসুন্ধরা আ/এ' },
  { en: 'Malibagh', bn: 'মালিবাগ' },
  { en: 'Moghbazar', bn: 'মগবাজার' },
  { en: 'Farmgate', bn: 'ফার্মগেট' },
  { en: 'Tejgaon', bn: 'তেজগাঁও' },
  { en: 'Shahbagh', bn: 'শাহবাগ' },
  { en: 'Paltan', bn: 'পল্টন' },
  { en: 'Lalbagh', bn: 'লালবাগ' },
  { en: 'Chawkbazar', bn: 'চকবাজার' },
  { en: 'Wari', bn: 'ওয়ারী' },
  { en: 'Sutrapur', bn: 'সূত্রাপুর' },
  { en: 'Savar', bn: 'সাভার' },
  { en: 'Ashulia', bn: 'আশুলিয়া' },
  { en: 'Keraniganj', bn: 'কেরানীগঞ্জ' },
  { en: 'Dhamrai', bn: 'ধামরাই' },
  { en: 'Tongi', bn: 'টঙ্গী' },
  { en: 'Demra', bn: 'ডেমরা' },
  { en: 'Kamrangirchar', bn: 'কামরাঙ্গীরচর' },
  { en: 'Shyamoli', bn: 'শ্যামলী' },
  { en: 'Agargaon', bn: 'আগারগাঁও' },
  { en: 'Khilkhet', bn: 'খিলক্ষেত' },
  { en: 'Nikunja', bn: 'নিকুঞ্জ' },
  { en: 'Hazaribagh', bn: 'হাজারীবাগ' },
  { en: 'Kalabagan', bn: 'কলাবাগান' },
  { en: 'New Market', bn: 'নিউমার্কেট' },
  { en: 'Hatirjheel', bn: 'হাতিরঝিল' },
  { en: 'Vatara', bn: 'ভাটারা' },
  { en: 'Pallabi', bn: 'পল্লবী' },
];

export const BANGLADESH_DISTRICTS: DistrictInfo[] = [
  // Dhaka Division
  { id: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা', isDhaka: true, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'gazipur', nameEn: 'Gazipur', nameBn: 'গাজীপুর', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'narayanganj', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'tangail', nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'narsingdi', nameEn: 'Narsingdi', nameBn: 'নরসিংদী', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'munshiganj', nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'manikganj', nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'faridpur', nameEn: 'Faridpur', nameBn: 'ফরিদপুর', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'gopalganj', nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'madaripur', nameEn: 'Madaripur', nameBn: 'মাদারীপুর', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'rajbari', nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'shariatpur', nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },
  { id: 'kishoreganj', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', isDhaka: false, divisionEn: 'Dhaka', divisionBn: 'ঢাকা' },

  // Chattogram Division
  { id: 'chattogram', nameEn: 'Chattogram (Chittagong)', nameBn: 'চট্টগ্রাম', isDhaka: false, divisionEn: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'coxs-bazar', nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', isDhaka: false, divisionEn: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'cumilla', nameEn: 'Cumilla (Comilla)', nameBn: 'কুমিল্লা', isDhaka: false, divisionEn: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'feni', nameEn: 'Feni', nameBn: 'ফেনী', isDhaka: false, divisionEn: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'noakhali', nameEn: 'Noakhali', nameBn: 'নোয়াখালী', isDhaka: false, divisionEn: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'brahmanbaria', nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', isDhaka: false, divisionEn: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'chandpur', nameEn: 'Chandpur', nameBn: 'চাঁদপুর', isDhaka: false, divisionEn: 'Chattogram', divisionBn: 'চট্টগ্রাম' },
  { id: 'lakshmipur', nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', isDhaka: false, divisionEn: 'Chattogram', divisionBn: 'চট্টগ্রাম' },

  // Sylhet Division
  { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট', isDhaka: false, divisionEn: 'Sylhet', divisionBn: 'সিলেট' },
  { id: 'moulvibazar', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', isDhaka: false, divisionEn: 'Sylhet', divisionBn: 'সিলেট' },
  { id: 'habiganj', nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', isDhaka: false, divisionEn: 'Sylhet', divisionBn: 'সিলেট' },
  { id: 'sunamganj', nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', isDhaka: false, divisionEn: 'Sylhet', divisionBn: 'সিলেট' },

  // Rajshahi Division
  { id: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী', isDhaka: false, divisionEn: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'bogura', nameEn: 'Bogura (Bogra)', nameBn: 'বগুড়া', isDhaka: false, divisionEn: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'pabna', nameEn: 'Pabna', nameBn: 'পাবনা', isDhaka: false, divisionEn: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'sirajganj', nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', isDhaka: false, divisionEn: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'natore', nameEn: 'Natore', nameBn: 'নাটোর', isDhaka: false, divisionEn: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'naogaon', nameEn: 'Naogaon', nameBn: 'নওগাঁ', isDhaka: false, divisionEn: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'chapainawabganj', nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', isDhaka: false, divisionEn: 'Rajshahi', divisionBn: 'রাজশাহী' },
  { id: 'joypurhat', nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', isDhaka: false, divisionEn: 'Rajshahi', divisionBn: 'রাজশাহী' },

  // Khulna Division
  { id: 'khulna', nameEn: 'Khulna', nameBn: 'খুলনা', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'jashore', nameEn: 'Jashore (Jessore)', nameBn: 'যশোর', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'kushtia', nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'satkhira', nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'jhenaidah', nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'chuadanga', nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'magura', nameEn: 'Magura', nameBn: 'মাগুরা', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'bagerhat', nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'meherpur', nameEn: 'Meherpur', nameBn: 'মেহেরপুর', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },
  { id: 'narail', nameEn: 'Narail', nameBn: 'নড়াইল', isDhaka: false, divisionEn: 'Khulna', divisionBn: 'খুলনা' },

  // Mymensingh Division
  { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', isDhaka: false, divisionEn: 'Mymensingh', divisionBn: 'ময়মনসিংহ' },
  { id: 'jamalpur', nameEn: 'Jamalpur', nameBn: 'জামালপুর', isDhaka: false, divisionEn: 'Mymensingh', divisionBn: 'ময়মনসিংহ' },
  { id: 'netrokona', nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', isDhaka: false, divisionEn: 'Mymensingh', divisionBn: 'ময়মনসিংহ' },
  { id: 'sherpur', nameEn: 'Sherpur', nameBn: 'শেরপুর', isDhaka: false, divisionEn: 'Mymensingh', divisionBn: 'ময়মনসিংহ' },

  // Barishal Division
  { id: 'barishal', nameEn: 'Barishal (Barisal)', nameBn: 'বরিশাল', isDhaka: false, divisionEn: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'patuakhali', nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', isDhaka: false, divisionEn: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'bhola', nameEn: 'Bhola', nameBn: 'ভোলা', isDhaka: false, divisionEn: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'pirojpur', nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', isDhaka: false, divisionEn: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'barguna', nameEn: 'Barguna', nameBn: 'বরগুনা', isDhaka: false, divisionEn: 'Barishal', divisionBn: 'বরিশাল' },
  { id: 'jhalokati', nameEn: 'Jhalokati', nameBn: 'ঝালকাঠি', isDhaka: false, divisionEn: 'Barishal', divisionBn: 'বরিশাল' },

  // Rangpur Division
  { id: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর', isDhaka: false, divisionEn: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'dinajpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', isDhaka: false, divisionEn: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'kurigram', nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', isDhaka: false, divisionEn: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'gaibandha', nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', isDhaka: false, divisionEn: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'nilphamari', nameEn: 'Nilphamari', nameBn: 'নীলফামারী', isDhaka: false, divisionEn: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'panchagarh', nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', isDhaka: false, divisionEn: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'thakurgaon', nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', isDhaka: false, divisionEn: 'Rangpur', divisionBn: 'রংপুর' },
  { id: 'lalmonirhat', nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', isDhaka: false, divisionEn: 'Rangpur', divisionBn: 'রংপুর' },
];

const DHAKA_KEYWORDS = [
  'ঢাকা', 'মিরপুর', 'ধানমন্ডি', 'উত্তরা', 'গুলশান', 'বনানী', 'মতিঝিল', 'মোহাম্মদপুর',
  'বাড্ডা', 'খিলগাঁও', 'যাত্রাবাড়ী', 'রামপুরা', 'মালিবাগ', 'মগবাজার', 'বসুন্ধরা',
  'শান্তিনগর', 'ফার্মগেট', 'তেজগাঁও', 'শাহবাগ', 'পল্টন', 'লালবাগ', 'চকবাজার', 'ওয়ারী',
  'সূত্রাপুর', 'ডেমরা', 'কামরাঙ্গীরচর', 'সবুজবাগ', 'হাজারীবাগ', 'সেনানিবাস', 'কাফরুল',
  'কলাবাগান', 'খিলক্ষেত', 'নিকুঞ্জ', 'আগারগাঁও', 'কেরানীগঞ্জ', 'সাভার', 'ধামরাই', 'টঙ্গী',
  'আশুলিয়া', 'কাকরাইল', 'সেগুনবাগিচা', 'বংশাল', 'শ্যামপুর', 'তুরাগ', 'দক্ষিণখান',
  'উত্তরখান', 'ভাসানটেক', 'দারুসসালাম', 'রূপনগর', 'ভাটারা', 'কদমতলী', 'গেন্ডারিয়া',
  'নিউমার্কেট', 'হাতিরঝিল', 'পল্লবী', 'শ্যামলী', 'পান্থপথ', 'কারওয়ান বাজার',
  'কাওরান বাজার', 'ঢাকার ভিতরে', 'ইন ঢাকা',
  'dhaka', 'dhanmondi', 'mirpur', 'uttara', 'gulshan', 'banani', 'motijheel',
  'mohammadpur', 'badda', 'khilgaon', 'jatrabari', 'rampura', 'malibagh',
  'moghbazar', 'bashundhara', 'shantinagar', 'farmgate', 'tejgaon', 'shahbagh',
  'paltan', 'lalbagh', 'chawkbazar', 'wari', 'sutrapur', 'demra', 'kamrangirchar',
  'sabujbagh', 'hazaribagh', 'cantonment', 'kafrul', 'kalabagan', 'khilkhet',
  'nikunja', 'agargaon', 'keraniganj', 'savar', 'dhamrai', 'tongi', 'ashulia',
  'kakrail', 'segunbagicha', 'bangshal', 'shyampur', 'turag', 'dakkhinkhan',
  'uttarkhan', 'bhasantek', 'darussalam', 'rupnagar', 'vatara', 'kadamtali',
  'gandaria', 'new market', 'hatirjheel', 'pallabi', 'shyamoli', 'panthapath',
  'karwan bazar', 'kawran bazar', 'inside dhaka', 'in dhaka'
];

const OUTSIDE_DHAKA_KEYWORDS = [
  'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ',
  'কুমিল্লা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'বগুড়া', 'ফেনী', 'নোয়াখালী', 'কক্সবাজার',
  'যশোর', 'দিনাজপুর', 'ব্রাহ্মণবাড়িয়া', 'টাঙ্গাইল', 'সিরাজগঞ্জ', 'পাবনা',
  'কুষ্টিয়া', 'ফরিদপুর', 'জামালপুর', 'কিশোরগঞ্জ', 'নাটোর', 'নওগাঁ', 'সাতক্ষীরা',
  'ভোলা', 'পটুয়াখালী', 'বরগুনা', 'পিরোজপুর', 'ঝালকাঠি', 'সুনামগঞ্জ', 'হবিগঞ্জ',
  'মৌলভীবাজার', 'নেত্রকোনা', 'নেত্রকোণা', 'শেরপুর', 'মানিকগঞ্জ', 'মুন্সীগঞ্জ', 'নরসিংদী',
  'মাদারীপুর', 'গোপালগঞ্জ', 'শরীয়তপুর', 'রাজবাড়ী', 'মেহেরপুর', 'চুয়াডাঙ্গা',
  'ঝিনাইদহ', 'মাগুরা', 'নড়াইল', 'বাগেরহাট', 'ঠাকুরগাঁও', 'পঞ্চগড়', 'নীলফামারী',
  'লালমনিরহাট', 'কুড়িগ্রাম', 'গাইবান্ধা', 'জয়পুরহাট', 'চাঁপাইনবাবগঞ্জ',
  'ঢাকার বাইরে', 'আউট অফ ঢাকা',
  'chittagong', 'chattogram', 'sylhet', 'rajshahi', 'khulna', 'barisal',
  'barishal', 'rangpur', 'mymensingh', 'comilla', 'cumilla', 'gazipur',
  'narayanganj', 'narayangonj', 'bogura', 'bogra', 'feni', 'noakhali', 'cox',
  'jashore', 'jessore', 'dinajpur', 'brahmanbaria', 'tangail', 'sirajganj',
  'pabna', 'kushtia', 'faridpur', 'jamalpur', 'kishoreganj', 'natore',
  'naogaon', 'satkhira', 'bhola', 'patuakhali', 'barguna', 'pirojpur',
  'jhalokati', 'sunamganj', 'habiganj', 'moulvibazar', 'netrokona', 'sherpur',
  'manikganj', 'munshiganj', 'narsingdi', 'madaripur', 'gopalganj',
  'shariatpur', 'rajbari', 'meherpur', 'chuadanga', 'jhenaidah', 'magura',
  'narail', 'bagerhat', 'thakurgaon', 'panchagarh', 'nilphamari',
  'lalmonirhat', 'kurigram', 'gaibandha', 'joypurhat', 'chapainawabganj',
  'outside dhaka', 'out of dhaka'
];

/**
 * Checks if a specific area or district name is inside Dhaka
 */
export function isDhakaLocation(name: string): boolean {
  if (!name) return false;
  const normalized = name.toLowerCase().trim();
  return DHAKA_KEYWORDS.some((kw) => normalized.includes(kw));
}

/**
 * Detects whether an address or selected area string corresponds to inside Dhaka or outside Dhaka.
 */
export function detectDeliveryArea(input: string): AreaDetectionResult {
  if (!input || input.trim().length < 2) {
    return { area: null };
  }

  const normalized = input.toLowerCase().trim();

  // 1. Check for Dhaka keywords first if explicitly Dhaka / Dhaka thana
  for (const keyword of DHAKA_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return {
        area: 'inside',
        detectedName: keyword,
        badgeText: `✓ ${keyword} চিহ্নিত হয়েছে (অটো সিলেক্ট: ঢাকার ভিতরে - ৳৬০)`,
      };
    }
  }

  // 2. Check for outside Dhaka keywords
  for (const keyword of OUTSIDE_DHAKA_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return {
        area: 'outside',
        detectedName: keyword,
        badgeText: `✓ ${keyword} চিহ্নিত হয়েছে (অটো সিলেক্ট: ঢাকার বাইরে - ৳১২০)`,
      };
    }
  }

  return { area: null };
}

