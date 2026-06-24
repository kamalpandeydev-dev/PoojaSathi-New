import type { Profile } from "./types";

export const currentUserId = "user-yajmaan-1";

export const profiles: Record<string, Profile> = {
  "user-yajmaan-1": {
    id: "user-yajmaan-1",
    name: "राहुल शर्मा",
    nameEn: "Rahul Sharma",
    role: "Yajmaan",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    city: "दिल्ली",
    cityEn: "Delhi",
    avatarInitials: "रा",
    tradition: "उत्तर भारतीय",
  },
  "user-pandit-1": {
    id: "user-pandit-1",
    name: "पंडित विजय कुमार मिश्रा",
    nameEn: "Pandit Vijay Kumar Mishra",
    role: "Pandit",
    phone: "9899769768",
    city: "दिल्ली - 110091",
    cityEn: "Delhi - 110091",
    avatarInitials: "वि",
    tradition: "शास्त्री एम.ए.",
    expertise: [
      "सत्यनारायण कथा",
      "गृह प्रवेश",
      "विवाह संस्कार",
      "नामकरण",
      "हवन",
    ],
    address:
      "शिव मंदिर सेवा समिति, सुभाष मार्किट, खिचड़ीपुर, 5 ब्लॉक, दिल्ली - 110091",
    addressEn:
      "Shiv Mandir Seva Samiti, Subhash Market, Khichdipur, 5 Block, Delhi - 110091",
  },
  "user-yajmaan-2": {
    id: "user-yajmaan-2",
    name: "अनिता देशपांडे",
    nameEn: "Anita Deshpande",
    role: "Yajmaan",
    phone: "+91 90123 45678",
    city: "पुणे",
    cityEn: "Pune",
    avatarInitials: "अ",
  },
};

export const currentUser = profiles[currentUserId];

export function getProfile(id: string): Profile {
  return profiles[id] ?? profiles[currentUserId];
}
