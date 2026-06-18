export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type PaymentStatusType = 'Betaald' | 'In behandeling' | 'Nog niet betaald';

export interface Order {
  id: string;
  userId: string;
  email: string;
  title: string;
  progress: number; // 0 to 100
  notes: string;
  paymentStatus: PaymentStatusType;
  price: string;
  createdAt: string;
}
