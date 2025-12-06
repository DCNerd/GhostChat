export interface User {
  id: string;
  username: string;
  publicKey: string; // Simulated public key fingerprint
  isAnonymous: boolean;
  avatarSeed: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  encrypted: boolean;
  isSystem?: boolean; // For "Nuke" alerts
}

export interface ChatSession {
  id: string;
  partner: User;
  messages: Message[];
  lastActive: number;
  unreadCount: number;
}

export enum AppState {
  SETUP_VAULT,
  CALCULATOR,
  LANDING,
  CHATTING,
  NUKING,
}

export type NukeType = 'LOCAL' | 'SERVER' | 'PANIC';