export interface EmailRecipient {
    email: string;
    isSelected: boolean;
  }
  
  export type GroupedSelectedRecipients = Record<string, EmailRecipient[]>;