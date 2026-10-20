export interface StickerItem {
  id: string;
  name: string;
  url: string;
  emojiBadge: string;
  category: 'romantic' | 'work' | 'fun' | 'deals' | 'custom';
}

export const INITIAL_STICKERS: StickerItem[] = [
  {
    id: 'love_duo',
    name: 'Love You!',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '💖',
    category: 'romantic',
  },
  {
    id: 'cute_kitty',
    name: 'Kitty Hug',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🐱',
    category: 'romantic',
  },
  {
    id: 'happy_pup',
    name: 'Happy Pup',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🐶',
    category: 'romantic',
  },
  {
    id: 'coffee_break',
    name: 'Coffee Time',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '☕',
    category: 'work',
  },
  {
    id: 'coding_grind',
    name: 'Coding Hard',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '💻',
    category: 'work',
  },
  {
    id: 'ship_rocket',
    name: "Let's Ship It!",
    url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🚀',
    category: 'work',
  },
  {
    id: 'awesome_applause',
    name: 'Awesome Work!',
    url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '👏',
    category: 'work',
  },
  {
    id: 'celebrate_party',
    name: 'Party Time!',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🎉',
    category: 'fun',
  },
  {
    id: 'pizza_treat',
    name: 'Pizza Split',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🍕',
    category: 'fun',
  },
  {
    id: 'handshake_deal',
    name: 'Agreed!',
    url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🤝',
    category: 'deals',
  },
  {
    id: 'money_settled',
    name: 'Paid Up!',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '💸',
    category: 'deals',
  },
  {
    id: 'on_my_way',
    name: 'On My Way!',
    url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🏃',
    category: 'deals',
  },
];
