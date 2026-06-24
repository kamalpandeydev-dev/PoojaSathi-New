// PoojaSathi domain types
export type Role = "Pandit" | "Yajmaan";

export type Category =
  | "General Pooja"
  | "Havan"
  | "Kalash"
  | "Fruits"
  | "Flowers"
  | "Dry Fruits"
  | "Cloth"
  | "Utensils"
  | "Decoration"
  | "Prasad"
  | "Miscellaneous";

export type ItemStatus =
  | "Not Started"
  | "Searching"
  | "Arranged"
  | "Purchased"
  | "Unable to Arrange"
  | "Request Pandit to Bring";

export type ResponsibleParty = "Pandit" | "Yajmaan" | "Shared";

export type PoojaStatus =
  | "Invitation Pending"
  | "Planning"
  | "In Preparation"
  | "Ready"
  | "Completed"
  | "Cancelled";

export interface Profile {
  id: string;
  name: string; // Hindi name (primary)
  nameEn?: string; // English name (secondary)
  role: Role;
  phone?: string;
  email?: string;
  city?: string; // Hindi city
  cityEn?: string; // English city
  avatarInitials: string;
  tradition?: string;
  expertise?: string[];
  address?: string; // Hindi address
  addressEn?: string; // English address
}

export interface Participant {
  profileId: string;
  role: Role;
  invitation: "pending" | "accepted" | "declined";
}

export interface Pooja {
  id: string;
  name: string;
  nameEn?: string;
  type: string;
  occasion?: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  status: PoojaStatus;
  createdById: string;
  participants: Participant[];
  inviteCode: string;
  notes?: string;
  budget?: number;
  coverIllustration: PoojaCover;
  samagriPublished?: boolean; // Pandit has published the list to Yajmaan
}

export type PoojaCover =
  | "diya"
  | "kalash"
  | "lotus"
  | "mandala"
  | "havan"
  | "rangoli";

export interface PoojaSamagriItem {
  id: string;
  poojaId: string;
  masterItemId: string; // 'custom' for custom items
  serialNo?: number; // from master sheet
  hindiName: string;
  englishName: string;
  category: Category;
  qty: number;
  unit: string;
  mandatory: boolean; // Pandit marks as required/optional
  responsible: ResponsibleParty;
  status: ItemStatus;
  note?: string;
  source: "library" | "custom";
  // Yajmaan tracking
  yajmaanNote?: string;
}

export type RequestType =
  | "Add Item"
  | "Modify Item"
  | "Bring Item"
  | "Change Time"
  | "Change Venue"
  | "Other";
export type RequestStatus = "Pending" | "Approved" | "Declined" | "Fulfilled";

export interface SamagriRequest {
  id: string;
  poojaId: string;
  type: RequestType;
  title: string;
  detail: string;
  createdBy: string;
  assignedTo: Role;
  status: RequestStatus;
  createdAt: string;
  resolvedAt?: string;
  relatedItemId?: string;
}

export interface Note {
  id: string;
  poojaId: string;
  authorId: string;
  body: string;
  pinned: boolean;
  createdAt: string;
}

export interface Responsibility {
  id: string;
  poojaId: string;
  title: string;
  detail?: string;
  owner: ResponsibleParty;
  dueBy?: string;
  done: boolean;
}

export type TimelineEventType =
  | "pooja_created"
  | "invitation_sent"
  | "invitation_accepted"
  | "samagri_added"
  | "samagri_published"
  | "status_updated"
  | "request_raised"
  | "request_resolved"
  | "note_added"
  | "responsibility_done"
  | "pooja_completed";

export interface TimelineEvent {
  id: string;
  poojaId: string;
  type: TimelineEventType;
  message: string;
  actorId: string;
  createdAt: string;
}

export type NotificationKind =
  | "invitation"
  | "request"
  | "status"
  | "note"
  | "responsibility"
  | "system";

export interface AppNotification {
  id: string;
  poojaId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
