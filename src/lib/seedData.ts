import type {
  AppNotification,
  Note,
  Pooja,
  PoojaSamagriItem,
  Responsibility,
  SamagriRequest,
  TimelineEvent,
} from "./types";
import { masterSamagriLibrary } from "./masterLibrary";

export const seedPoojas: Pooja[] = [
  {
    id: "pooja-1",
    name: "सत्यनारायण कथा — गृह प्रवेश",
    nameEn: "Satyanarayan Katha — Griha Pravesh",
    type: "Griha Pravesh",
    occasion: "गृह प्रवेश",
    date: new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10),
    time: "09:30",
    venue: "12, सी ब्रीज़ अपार्टमेंट्स, बांद्रा वेस्ट",
    city: "मुंबई",
    status: "In Preparation",
    createdById: "user-yajmaan-1",
    participants: [
      { profileId: "user-yajmaan-1", role: "Yajmaan", invitation: "accepted" },
      { profileId: "user-pandit-1", role: "Pandit", invitation: "accepted" },
    ],
    inviteCode: "PS-GP-7421",
    notes: "नया घर, पूर्व दिशा में प्रवेश। परिवार उपवास पर रहेगा।",
    budget: 21000,
    coverIllustration: "kalash",
    samagriPublished: true,
  },
  {
    id: "pooja-2",
    name: "सत्यनारायण कथा — वर्षगाँठ",
    nameEn: "Satyanarayan Katha — Anniversary",
    type: "Satyanarayan Katha",
    occasion: "विवाह वर्षगाँठ",
    date: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    time: "17:00",
    venue: "प्लॉट 8, कोथरूड, पुणे",
    city: "पुणे",
    status: "Completed",
    createdById: "user-yajmaan-1",
    participants: [
      { profileId: "user-yajmaan-1", role: "Yajmaan", invitation: "accepted" },
      { profileId: "user-pandit-1", role: "Pandit", invitation: "accepted" },
    ],
    inviteCode: "PS-SN-1188",
    budget: 9000,
    coverIllustration: "lotus",
    samagriPublished: true,
  },
];

function poojaItem(
  poojaId: string,
  masterItemId: string,
  status: PoojaSamagriItem["status"],
  responsible: PoojaSamagriItem["responsible"],
  override?: Partial<PoojaSamagriItem>,
): PoojaSamagriItem {
  const master = masterSamagriLibrary.find((m) => m.id === masterItemId);
  return {
    id: `psi-${poojaId}-${masterItemId}`,
    poojaId,
    masterItemId,
    serialNo: master?.serialNo,
    hindiName: override?.hindiName ?? master?.hindiName ?? "",
    englishName: override?.englishName ?? master?.englishName ?? "",
    category:
      override?.category ?? master?.category ?? ("Miscellaneous" as const),
    qty: override?.qty ?? master?.defaultQty ?? 1,
    unit: override?.unit ?? master?.defaultUnit ?? "नग",
    mandatory: override?.mandatory ?? master?.mandatory ?? true,
    responsible: override?.responsible ?? responsible,
    status: override?.status ?? status,
    source: override?.source ?? "library",
    ...override,
  };
}

// Seed samagri: first 30 items from master library for pooja-1
export const seedSamagri: PoojaSamagriItem[] = [
  poojaItem("pooja-1", "ms-01", "Purchased", "Yajmaan"), // हल्दी
  poojaItem("pooja-1", "ms-02", "Purchased", "Yajmaan"), // रोली
  poojaItem("pooja-1", "ms-03", "Purchased", "Yajmaan"), // सिन्दूर
  poojaItem("pooja-1", "ms-04", "Purchased", "Yajmaan"), // कपूर
  poojaItem("pooja-1", "ms-05", "Purchased", "Yajmaan"), // अगरबत्ती
  poojaItem("pooja-1", "ms-06", "Arranged", "Yajmaan"), // धूपबत्ती
  poojaItem("pooja-1", "ms-07", "Searching", "Yajmaan"), // पंचमेवा
  poojaItem("pooja-1", "ms-08", "Arranged", "Yajmaan"), // सुपारी
  poojaItem("pooja-1", "ms-09", "Purchased", "Yajmaan"), // लौंग
  poojaItem("pooja-1", "ms-10", "Purchased", "Yajmaan"), // इलायची
  poojaItem("pooja-1", "ms-11", "Searching", "Yajmaan"), // शहद
  poojaItem("pooja-1", "ms-12", "Arranged", "Shared"), // गंगाजल
  poojaItem("pooja-1", "ms-16", "Arranged", "Yajmaan"), // आम की लकड़ी
  poojaItem("pooja-1", "ms-17", "Not Started", "Yajmaan"), // नारियल पानी
  poojaItem("pooja-1", "ms-18", "Purchased", "Yajmaan"), // नारियल सूखा
  poojaItem("pooja-1", "ms-19", "Not Started", "Yajmaan"), // दही
  poojaItem("pooja-1", "ms-20", "Not Started", "Yajmaan"), // दूध
  poojaItem("pooja-1", "ms-21", "Purchased", "Yajmaan"), // देशी घी
  poojaItem("pooja-1", "ms-26", "Arranged", "Pandit"), // कलावा सूती
  poojaItem("pooja-1", "ms-28", "Not Started", "Yajmaan"), // फल 5 प्रकार
  poojaItem("pooja-1", "ms-29", "Not Started", "Yajmaan"), // फूलमाला
  poojaItem("pooja-1", "ms-33", "Purchased", "Yajmaan"), // बताशा
  poojaItem("pooja-1", "ms-36", "Arranged", "Yajmaan"), // पीला कपड़ा
  poojaItem("pooja-1", "ms-37", "Arranged", "Yajmaan"), // लाल कपड़ा
  poojaItem("pooja-1", "ms-39", "Not Started", "Yajmaan"), // पंडित जी का वस्त्र
  poojaItem("pooja-1", "ms-43", "Purchased", "Yajmaan"), // दोना (प्लेट)
  poojaItem("pooja-1", "ms-44", "Arranged", "Yajmaan"), // पूजा थाली
  poojaItem("pooja-1", "ms-45", "Arranged", "Yajmaan"), // लोटा
  poojaItem("pooja-1", "ms-51", "Purchased", "Yajmaan"), // चावल
  poojaItem("pooja-1", "ms-52", "Purchased", "Yajmaan"), // चीनी
  poojaItem("pooja-1", "ms-55", "Unable to Arrange", "Yajmaan"), // काला तिल
  poojaItem("pooja-1", "ms-58", "Arranged", "Pandit"), // जनेऊ
  poojaItem("pooja-1", "ms-59", "Not Started", "Yajmaan"), // पान का पत्ता
  poojaItem("pooja-1", "ms-60", "Arranged", "Yajmaan"), // हवन सामग्री
  poojaItem("pooja-1", "ms-64", "Purchased", "Yajmaan"), // रुई बत्ती
  poojaItem("pooja-1", "ms-74", "Purchased", "Yajmaan"), // मिश्री
  poojaItem("pooja-1", "ms-75", "Purchased", "Yajmaan"), // माचिस
];

export const seedRequests: SamagriRequest[] = [
  {
    id: "req-1",
    poojaId: "pooja-1",
    type: "Bring Item",
    title: "काला तिल लाएं",
    detail:
      "काला तिल (ms-55) हमारे यहाँ नहीं मिल रहा। पंडित जी कृपया 100 ग्राम साथ लाएं।",
    createdBy: "user-yajmaan-1",
    assignedTo: "Pandit",
    status: "Approved",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    relatedItemId: "psi-pooja-1-ms-55",
  },
  {
    id: "req-2",
    poojaId: "pooja-1",
    type: "Add Item",
    title: "एक और हवन कुंड चाहिए",
    detail: "25 मेहमान आ रहे हैं — एक हवन कुंड कम पड़ेगा।",
    createdBy: "user-pandit-1",
    assignedTo: "Yajmaan",
    status: "Pending",
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

export const seedNotes: Note[] = [
  {
    id: "note-1",
    poojaId: "pooja-1",
    authorId: "user-pandit-1",
    body: "मुख्य द्वार पूर्व दिशा में होना चाहिए। वास्तु प्रवेश पूजा सबसे पहले की जाएगी। घर में सभी खिड़कियाँ खुली रखें।",
    pinned: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "note-2",
    poojaId: "pooja-1",
    authorId: "user-yajmaan-1",
    body: "बिल्डिंग के गेट पर 12 गाड़ियों की पार्किंग है। पंडित जी के आने पर सूचित करें।",
    pinned: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const seedResponsibilities: Responsibility[] = [
  {
    id: "resp-1",
    poojaId: "pooja-1",
    title: "प्रसाद के लिए 50 प्लेट कैटरर बुक करें",
    detail: "शुद्ध शाकाहारी, बिना प्याज-लहसुन।",
    owner: "Yajmaan",
    dueBy: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    done: false,
  },
  {
    id: "resp-2",
    poojaId: "pooja-1",
    title: "हवन कुंड और घंटी सेट लाएं",
    owner: "Pandit",
    dueBy: new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10),
    done: false,
  },
  {
    id: "resp-3",
    poojaId: "pooja-1",
    title: "पूजा कक्ष साफ और सजाएं",
    owner: "Yajmaan",
    dueBy: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
    done: true,
  },
  {
    id: "resp-4",
    poojaId: "pooja-1",
    title: "पंचामृत तैयार करें",
    owner: "Shared",
    done: false,
  },
];

export const seedTimeline: TimelineEvent[] = [
  {
    id: "t-1",
    poojaId: "pooja-1",
    type: "pooja_created",
    message: "पूजा राहुल शर्मा ने बनाई",
    actorId: "user-yajmaan-1",
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "t-2",
    poojaId: "pooja-1",
    type: "invitation_sent",
    message: "पंडित विजय कुमार मिश्रा को निमंत्रण भेजा",
    actorId: "user-yajmaan-1",
    createdAt: new Date(Date.now() - 9 * 86400000 + 3600000).toISOString(),
  },
  {
    id: "t-3",
    poojaId: "pooja-1",
    type: "invitation_accepted",
    message: "पंडित जी ने निमंत्रण स्वीकार किया",
    actorId: "user-pandit-1",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "t-4",
    poojaId: "pooja-1",
    type: "samagri_added",
    message: "37 सामग्री वस्तुएं जोड़ी गईं",
    actorId: "user-pandit-1",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "t-5",
    poojaId: "pooja-1",
    type: "samagri_published",
    message: "सामग्री सूची यजमान को भेजी गई",
    actorId: "user-pandit-1",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "t-6",
    poojaId: "pooja-1",
    type: "request_raised",
    message: "अनुरोध: काला तिल लाएं",
    actorId: "user-yajmaan-1",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "t-7",
    poojaId: "pooja-1",
    type: "request_resolved",
    message: "पंडित जी स्वीकृत: काला तिल लाएंगे",
    actorId: "user-pandit-1",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const seedNotifications: AppNotification[] = [
  {
    id: "n-1",
    poojaId: "pooja-1",
    kind: "request",
    title: "पंडित जी का नया अनुरोध",
    body: '"एक और हवन कुंड" — आपकी प्रतीक्षा है।',
    read: false,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    link: "/pooja/pooja-1/requests",
  },
  {
    id: "n-2",
    poojaId: "pooja-1",
    kind: "status",
    title: "पंडित जी ने अनुरोध स्वीकारा",
    body: "काला तिल पंडित जी साथ लाएंगे।",
    read: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    link: "/pooja/pooja-1/requests",
  },
  {
    id: "n-3",
    poojaId: "pooja-1",
    kind: "status",
    title: "सामग्री सूची तैयार है",
    body: "पंडित विजय कुमार मिश्रा ने सामग्री सूची भेजी है।",
    read: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    link: "/pooja/pooja-1/checklist",
  },
];
