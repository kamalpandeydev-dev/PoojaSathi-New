import type { Category } from './types';
import type { TranslationKey } from './i18n';

export interface MasterSamagriItem {
  id: string;
  hindiName: string;          // Primary — exactly as on the samagri sheet
  englishName: string;        // Secondary
  category: Category;
  defaultUnit: string;
  defaultQty: number;
  mandatory: boolean;
  applicablePoojas: string[];
  responsible: 'Pandit' | 'Yajmaan' | 'Shared';
  description?: string;
  serialNo: number;           // original sr.no from the sheet
}

// ─── 75 items transcribed exactly from Pandit Vijay Kumar Mishra's samagri sheet ───
// Sheet title: संक्षिप्त पूजन सामग्री
// Pandit: पंडित विजय कुमार मिश्रा, शास्त्री एम.ए., 9899769768
// Address: शिव मंदिर सेवा समिति, सुभाष मार्किट, खिचड़ीपुर, 5 ब्लॉक, दिल्ली - 110091
export const masterSamagriLibrary: MasterSamagriItem[] = [
  // ── Column 1 (1–25) ──────────────────────────────────────────────────────────
  { id: 'ms-01', serialNo: 1,  hindiName: 'हल्दी',            englishName: 'Turmeric',             category: 'General Pooja', defaultQty: 50,  defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-02', serialNo: 2,  hindiName: 'रोली',             englishName: 'Roli',                 category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पुड़िया', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-03', serialNo: 3,  hindiName: 'सिन्दूर',          englishName: 'Sindoor',              category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पुड़िया', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-04', serialNo: 4,  hindiName: 'कपूर',             englishName: 'Camphor',              category: 'General Pooja', defaultQty: 1,   defaultUnit: 'डली',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-05', serialNo: 5,  hindiName: 'अगरबत्ती',         englishName: 'Incense Sticks',       category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पैकेट', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-06', serialNo: 6,  hindiName: 'धूपबत्ती',         englishName: 'Dhupbatti',            category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पैकेट', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan', description: 'पैकेट रखकर' },
  { id: 'ms-07', serialNo: 7,  hindiName: 'पंचमेवा',          englishName: 'Panchmeva (5 dry fruits)', category: 'Dry Fruits', defaultQty: 250, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '250 ग्राम / सवा सेर' },
  { id: 'ms-08', serialNo: 8,  hindiName: 'सुपारी',           englishName: 'Betel Nut (Supari)',   category: 'General Pooja', defaultQty: 7,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '7 नग' },
  { id: 'ms-09', serialNo: 9,  hindiName: 'लौंग',             englishName: 'Cloves (Laung)',       category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पुड़िया', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-10', serialNo: 10, hindiName: 'इलायची',           englishName: 'Cardamom',             category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पुड़िया', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-11', serialNo: 11, hindiName: 'शहद',              englishName: 'Honey',                category: 'Prasad',        defaultQty: 1,   defaultUnit: 'छोटी शीशी', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: 'छोटी शीशी' },
  { id: 'ms-12', serialNo: 12, hindiName: 'गंगाजल',           englishName: 'Gangajal',             category: 'General Pooja', defaultQty: 250, defaultUnit: 'मिली',  mandatory: true,  applicablePoojas: ['all'], responsible: 'Shared' },
  { id: 'ms-13', serialNo: 13, hindiName: 'केशर',             englishName: 'Saffron (Kesar)',      category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पुड़िया', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-14', serialNo: 14, hindiName: 'कस्तूरी',          englishName: 'Kasturi',              category: 'General Pooja', defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Pandit' },
  { id: 'ms-15', serialNo: 15, hindiName: 'गौलोचन',           englishName: 'Gaulochan',            category: 'General Pooja', defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Pandit' },
  { id: 'ms-16', serialNo: 16, hindiName: 'आम की लकड़ी',      englishName: 'Mango Wood',           category: 'Havan',         defaultQty: 1,   defaultUnit: 'किलो',  mandatory: true,  applicablePoojas: ['Havan', 'Griha Pravesh'], responsible: 'Yajmaan', description: '1 किलो फलो' },
  { id: 'ms-17', serialNo: 17, hindiName: 'नारियल पानी वाला', englishName: 'Green Coconut',        category: 'Fruits',        defaultQty: 1,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-18', serialNo: 18, hindiName: 'नारियल सूखा (श्रीफल)', englishName: 'Dry Coconut',     category: 'Kalash',        defaultQty: 1,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-19', serialNo: 19, hindiName: 'दही',              englishName: 'Curd (Dahi)',          category: 'Prasad',        defaultQty: 1,   defaultUnit: 'कटोरी', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-20', serialNo: 20, hindiName: 'दूध',              englishName: 'Milk',                 category: 'Prasad',        defaultQty: 250, defaultUnit: 'मिली',  mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-21', serialNo: 21, hindiName: 'देशी घी',          englishName: 'Pure Desi Ghee',       category: 'Havan',         defaultQty: 500, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '500 ग्राम' },
  { id: 'ms-22', serialNo: 22, hindiName: 'खैर लकड़ी',        englishName: 'Khaer Wood',           category: 'Havan',         defaultQty: 1,   defaultUnit: 'पैकेट', mandatory: true,  applicablePoojas: ['Havan'], responsible: 'Yajmaan', description: 'मदद की' },
  { id: 'ms-23', serialNo: 23, hindiName: 'चन्दन की लकड़ी',   englishName: 'Sandalwood',           category: 'Havan',         defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan', description: 'सुंदर' },
  { id: 'ms-24', serialNo: 24, hindiName: 'सुगंध वाला',       englishName: 'Fragrance Herbs',      category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पुड़िया', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-25', serialNo: 25, hindiName: 'अगर-तगर',          englishName: 'Agar-Tagar',           category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पुड़िया', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },

  // ── Column 2 (26–50) ─────────────────────────────────────────────────────────
  { id: 'ms-26', serialNo: 26, hindiName: 'कलावा सूती',       englishName: 'Cotton Kalava (Mauli)', category: 'General Pooja', defaultQty: 1,   defaultUnit: 'गट्ठर', mandatory: true,  applicablePoojas: ['all'], responsible: 'Pandit', description: 'कच्चे धागे - 1' },
  { id: 'ms-27', serialNo: 27, hindiName: 'कलावा रेशमी',      englishName: 'Silk Kalava',          category: 'General Pooja', defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Pandit' },
  { id: 'ms-28', serialNo: 28, hindiName: 'फल 5 प्रकार',      englishName: '5 Varieties of Fruits', category: 'Fruits',       defaultQty: 5,   defaultUnit: 'केले', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '5 केले - 1' },
  { id: 'ms-29', serialNo: 29, hindiName: 'फूलमाला',          englishName: 'Flower Garland',       category: 'Flowers',       defaultQty: 5,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '5 नग डन' },
  { id: 'ms-30', serialNo: 30, hindiName: 'इत्र केसर',        englishName: 'Kesar Attar',          category: 'General Pooja', defaultQty: 1,   defaultUnit: 'शीशी', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-31', serialNo: 31, hindiName: 'जायफल',            englishName: 'Nutmeg (Jaiphal)',     category: 'General Pooja', defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-32', serialNo: 32, hindiName: 'मीठा 5',           englishName: 'Five Sweets',          category: 'Prasad',        defaultQty: 5,   defaultUnit: 'प्रकार', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-33', serialNo: 33, hindiName: 'बताशा',            englishName: 'Batasha (Sugar candy)', category: 'Prasad',       defaultQty: 100, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '100 ग्राम' },
  { id: 'ms-34', serialNo: 34, hindiName: 'भोजपत्र',          englishName: 'Bhojpatra',            category: 'General Pooja', defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Pandit' },
  { id: 'ms-35', serialNo: 35, hindiName: 'मास (दूब)',         englishName: 'Durva Grass',          category: 'General Pooja', defaultQty: 1,   defaultUnit: 'मुट्ठी', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-36', serialNo: 36, hindiName: 'पीला कपड़ा सूती सवा मी०', englishName: 'Yellow Cotton Cloth 1.25m', category: 'Cloth', defaultQty: 1, defaultUnit: 'मीटर', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-37', serialNo: 37, hindiName: 'लाल कपड़ा सूती सवा मी०', englishName: 'Red Cotton Cloth 1.25m', category: 'Cloth', defaultQty: 1, defaultUnit: 'मीटर', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-38', serialNo: 38, hindiName: 'बर्तन पात्र',      englishName: 'Vessels / Utensils',   category: 'Utensils',      defaultQty: 1,   defaultUnit: 'सेट',  mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-39', serialNo: 39, hindiName: 'पंडित जी का वस्त्र', englishName: "Pandit's Clothing",  category: 'Cloth',         defaultQty: 1,   defaultUnit: 'सेट',  mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: 'धोती-कुर्ता अंगवस्त्रम' },
  { id: 'ms-40', serialNo: 40, hindiName: 'गूगल',             englishName: 'Gugal Dhoop',          category: 'General Pooja', defaultQty: 50,  defaultUnit: 'ग्राम', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan', description: '50 ग्राम' },
  { id: 'ms-41', serialNo: 41, hindiName: 'श्रृंगार',         englishName: 'Shringar Set',         category: 'Decoration',    defaultQty: 1,   defaultUnit: 'सेट',  mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-42', serialNo: 42, hindiName: 'चुनरी',            englishName: 'Chunri (Dupatta)',     category: 'Cloth',         defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-43', serialNo: 43, hindiName: 'दोना (प्लेट)',     englishName: 'Leaf Plates (Dona)',   category: 'Utensils',      defaultQty: 25,  defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '25 नग' },
  { id: 'ms-44', serialNo: 44, hindiName: 'पूजा थाली पुरानी', englishName: 'Old Pooja Thali',      category: 'Utensils',      defaultQty: 3,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '3 नग' },
  { id: 'ms-45', serialNo: 45, hindiName: 'लोटा',             englishName: 'Lota (Water Vessel)',  category: 'Utensils',      defaultQty: 2,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '2 परात - 2' },
  { id: 'ms-46', serialNo: 46, hindiName: 'चम्मच',            englishName: 'Spoon',                category: 'Utensils',      defaultQty: 3,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '3 झगोला' },
  { id: 'ms-47', serialNo: 47, hindiName: 'कटोरी',            englishName: 'Small Bowl (Katori)',  category: 'Utensils',      defaultQty: 3,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '3 ←' },
  { id: 'ms-48', serialNo: 48, hindiName: 'आम का पत्ता',      englishName: 'Mango Leaves',         category: 'Kalash',        defaultQty: 12,  defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '12 नग' },
  { id: 'ms-49', serialNo: 49, hindiName: 'पंच पल्लव',        englishName: 'Panch Pallav (5 leaves)', category: 'General Pooja', defaultQty: 1, defaultUnit: 'सेट',  mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-50', serialNo: 50, hindiName: 'केले का पत्ता',    englishName: 'Banana Leaf',          category: 'Fruits',        defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },

  // ── Column 3 (51–75) ─────────────────────────────────────────────────────────
  { id: 'ms-51', serialNo: 51, hindiName: 'चावल',             englishName: 'Rice (Akshat)',        category: 'General Pooja', defaultQty: 100, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '100 ग्राम' },
  { id: 'ms-52', serialNo: 52, hindiName: 'चीनी',             englishName: 'Sugar',               category: 'Prasad',        defaultQty: 500, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '500 ग्राम' },
  { id: 'ms-53', serialNo: 53, hindiName: 'बूरा',             englishName: 'Boora (Raw sugar)',    category: 'Prasad',        defaultQty: 500, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '500 ग्राम' },
  { id: 'ms-54', serialNo: 54, hindiName: 'गुड़',             englishName: 'Jaggery (Gur)',        category: 'Prasad',        defaultQty: 100, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '100 ग्राम' },
  { id: 'ms-55', serialNo: 55, hindiName: 'काला तिल',         englishName: 'Black Sesame Seeds',  category: 'Havan',         defaultQty: 100, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['Havan', 'Griha Pravesh'], responsible: 'Yajmaan', description: '100 ग्राम' },
  { id: 'ms-56', serialNo: 56, hindiName: 'जव',               englishName: 'Barley (Jau)',         category: 'Havan',         defaultQty: 50,  defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['Havan'], responsible: 'Yajmaan', description: '50 ग्राम' },
  { id: 'ms-57', serialNo: 57, hindiName: 'इन्द्र जव',        englishName: 'Indra Jau',            category: 'Havan',         defaultQty: 50,  defaultUnit: 'ग्राम', mandatory: false, applicablePoojas: ['Havan'], responsible: 'Pandit', description: '50 ग्राम' },
  { id: 'ms-58', serialNo: 58, hindiName: 'जनेऊ',             englishName: 'Janeu (Sacred thread)', category: 'General Pooja', defaultQty: 2,  defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Pandit', description: '2 धीन' },
  { id: 'ms-59', serialNo: 59, hindiName: 'पान का पत्ता',     englishName: 'Betel Leaf (Paan)',    category: 'General Pooja', defaultQty: 7,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '7 पत्ते / भीगे' },
  { id: 'ms-60', serialNo: 60, hindiName: 'हवन सामग्री',      englishName: 'Havan Samagri Mix',    category: 'Havan',         defaultQty: 250, defaultUnit: 'ग्राम', mandatory: true,  applicablePoojas: ['Havan', 'Griha Pravesh'], responsible: 'Yajmaan', description: 'विशेषधूप जलाएं' },
  { id: 'ms-61', serialNo: 61, hindiName: 'नवग्रह लकड़ी',     englishName: 'Navgrah Wood Set',     category: 'Havan',         defaultQty: 1,   defaultUnit: 'सेट',  mandatory: false, applicablePoojas: ['Havan', 'Navgrah Shanti'], responsible: 'Pandit' },
  { id: 'ms-62', serialNo: 62, hindiName: 'गाय का गोबर',      englishName: 'Cow Dung',             category: 'General Pooja', defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['Griha Pravesh'], responsible: 'Yajmaan' },
  { id: 'ms-63', serialNo: 63, hindiName: 'गाय का दूध',       englishName: "Cow's Milk",           category: 'Prasad',        defaultQty: 500, defaultUnit: 'मिली',  mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan', description: '500 मिली' },
  { id: 'ms-64', serialNo: 64, hindiName: 'रुई बत्ती गोल',    englishName: 'Round Cotton Wicks',   category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पैकेट', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-65', serialNo: 65, hindiName: 'अबीर लाल हरा पीला', englishName: 'Abir (3 colors)',     category: 'Decoration',    defaultQty: 3,   defaultUnit: 'रंग',  mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-66', serialNo: 66, hindiName: 'गुलाल',            englishName: 'Gulal',                category: 'Decoration',    defaultQty: 100, defaultUnit: 'ग्राम', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan', description: 'जन्माष्टमी - 100 ग्राम' },
  { id: 'ms-67', serialNo: 67, hindiName: 'पंचरंग',           englishName: 'Panchrang (5 colors)', category: 'Decoration',    defaultQty: 50,  defaultUnit: 'ग्राम', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan', description: 'मख्खाना - 50 ग्राम' },
  { id: 'ms-68', serialNo: 68, hindiName: 'मूल मूलनी चाँदी का', englishName: 'Silver Coin (Mool Mooni)', category: 'Miscellaneous', defaultQty: 1, defaultUnit: 'नग', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-69', serialNo: 69, hindiName: 'मिट्टी का घड़ा',   englishName: 'Earthen Pot (Matka)',  category: 'Kalash',        defaultQty: 1,   defaultUnit: 'नग',   mandatory: true,  applicablePoojas: ['Griha Pravesh', 'Havan'], responsible: 'Yajmaan' },
  { id: 'ms-70', serialNo: 70, hindiName: 'मिट्टी का घड़ा 27 सुराग', englishName: 'Clay Pot with 27 holes', category: 'Kalash', defaultQty: 1, defaultUnit: 'नग', mandatory: false, applicablePoojas: ['Griha Pravesh'], responsible: 'Yajmaan' },
  { id: 'ms-71', serialNo: 71, hindiName: 'पंच रत्न',         englishName: 'Panch Ratna (5 gems)', category: 'General Pooja', defaultQty: 1,   defaultUnit: 'सेट',  mandatory: false, applicablePoojas: ['all'], responsible: 'Pandit', description: 'जिज्ञासु जाति' },
  { id: 'ms-72', serialNo: 72, hindiName: 'गरीगोला',          englishName: 'Garigola',             category: 'General Pooja', defaultQty: 1,   defaultUnit: 'नग',   mandatory: false, applicablePoojas: ['all'], responsible: 'Pandit' },
  { id: 'ms-73', serialNo: 73, hindiName: 'सौंफ',             englishName: 'Fennel Seeds (Saunf)', category: 'General Pooja', defaultQty: 1,   defaultUnit: 'पुड़िया', mandatory: false, applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-74', serialNo: 74, hindiName: 'मिश्री',           englishName: 'Rock Sugar (Mishri)',  category: 'Prasad',        defaultQty: 1,   defaultUnit: 'पैकेट', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
  { id: 'ms-75', serialNo: 75, hindiName: 'माचिस',            englishName: 'Matchbox',             category: 'General Pooja', defaultQty: 1,   defaultUnit: 'डिब्बी', mandatory: true,  applicablePoojas: ['all'], responsible: 'Yajmaan' },
];

// ─── Category metadata with Hindi labels ─────────────────────────────────────
export const categories: {
  name: Category;
  emoji: string;
  hindi: string;
  blurb: string;
  translationKey: TranslationKey;
}[] = [
  { name: 'General Pooja', emoji: '🪔', hindi: 'सामान्य पूजा', blurb: 'Core ritual essentials for every pooja', translationKey: 'catGeneralPooja' },
  { name: 'Havan',         emoji: '🔥', hindi: 'हवन',        blurb: 'Sacred fire offerings and samidha',         translationKey: 'catHavan' },
  { name: 'Kalash',        emoji: '🏺', hindi: 'कलश',        blurb: 'Kalash sthapana & earthen pots',            translationKey: 'catKalash' },
  { name: 'Fruits',        emoji: '🍌', hindi: 'फल',         blurb: 'Fresh fruit naivedya',                      translationKey: 'catFruits' },
  { name: 'Flowers',       emoji: '🌸', hindi: 'फूल',        blurb: 'Garlands, petals and sacred leaves',        translationKey: 'catFlowers' },
  { name: 'Dry Fruits',    emoji: '🥜', hindi: 'मेवे',       blurb: 'Nut and seed offerings',                    translationKey: 'catDryFruits' },
  { name: 'Cloth',         emoji: '🧵', hindi: 'वस्त्र',     blurb: 'Sacred cloth and coverings',                translationKey: 'catCloth' },
  { name: 'Utensils',      emoji: '🥘', hindi: 'बर्तन',      blurb: 'Vessels and pooja implements',              translationKey: 'catUtensils' },
  { name: 'Decoration',    emoji: '✨', hindi: 'सजावट',      blurb: 'Colors, shringar and decor',                translationKey: 'catDecoration' },
  { name: 'Prasad',        emoji: '🍬', hindi: 'प्रसाद',     blurb: 'Sweets and blessings to distribute',        translationKey: 'catPrasad' },
  { name: 'Miscellaneous', emoji: '📦', hindi: 'विविध',      blurb: 'Coins, silver, special items',              translationKey: 'catMisc' },
];

export function categoryMeta(name: Category) {
  return categories.find((c) => c.name === name)!;
}
