import React from 'react';
import {
  MessageCircle,
  Receipt,
  Printer,
  Calendar,
  Briefcase,
  Coffee,
  FileText,
  Heart,
  Folder,
  Sparkles,
  BookOpen,
  Pin,
  Compass,
  ShoppingBag,
  Home,
  Laptop,
} from 'lucide-react';

export const AVAILABLE_ICONS: { name: string; label: string; icon: React.FC<{ className?: string }> }[] = [
  { name: 'MessageCircle', label: 'Chat', icon: MessageCircle },
  { name: 'Receipt', label: 'Expenses', icon: Receipt },
  { name: 'Printer', label: 'Prints/Xerox', icon: Printer },
  { name: 'Calendar', label: 'Meetings', icon: Calendar },
  { name: 'Briefcase', label: 'Project', icon: Briefcase },
  { name: 'Coffee', label: 'Hangout', icon: Coffee },
  { name: 'BookOpen', label: 'Study/College', icon: BookOpen },
  { name: 'ShoppingBag', label: 'Shopping', icon: ShoppingBag },
  { name: 'FileText', label: 'Docs/Notes', icon: FileText },
  { name: 'Heart', label: 'Personal', icon: Heart },
  { name: 'Home', label: 'Apartment', icon: Home },
  { name: 'Laptop', label: 'Tech & Code', icon: Laptop },
];

interface ChannelIconProps {
  name: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const ChannelIcon: React.FC<ChannelIconProps> = ({ name, className = 'w-5 h-5', fallback }) => {
  const match = AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === name.toLowerCase());
  if (match) {
    const IconComponent = match.icon;
    return <IconComponent className={className} />;
  }

  // Fallback defaults
  if (name.includes('expens') || name.includes('money') || name.includes('bill')) {
    return <Receipt className={className} />;
  }
  if (name.includes('print') || name.includes('xerox')) {
    return <Printer className={className} />;
  }
  if (name.includes('meet') || name.includes('event')) {
    return <Calendar className={className} />;
  }
  if (name.includes('proj') || name.includes('work')) {
    return <Briefcase className={className} />;
  }

  return fallback ? <>{fallback}</> : <MessageCircle className={className} />;
};
