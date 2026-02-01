import { Comment } from '@features/TaskDetail/components/AdviceDetail';

export const MOCK_ADVICE: Comment[] = [
  {
    id: '1',
    text: "Start smaller than you think is necessary. If you want to write, write one sentence. The key isn't output right now, it's building the neural pathway of showing up.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: {
      id: 'u1',
      name: 'Sarah J.',
      photo: 'https://i.pravatar.cc/150?img=47',
    },
    likesCount: 3,
    likedByMe: false,
  },
  {
    id: '2',
    text: "I used to feel this way about painting. I realized I was judging the 'usefulness' too early. Give yourself permission to make 'useless' things for a month.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: {
      id: 'u2',
      name: 'David M.',
      photo: 'https://i.pravatar.cc/150?img=12',
    },
    likesCount: 1,
    likedByMe: true,
  },

  {
    id: '3',
    text: "I used to feel this way about painting. I realized I was judging the 'usefulness' too early. Give yourself permission to make 'useless' things for a month.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: {
      id: 'u2',
      name: 'David asdasd.',
      photo: 'https://i.pravatar.cc/150?img=14',
    },
    likesCount: 1,
    likedByMe: true,
  },

  {
    id: '4',
    text: "I used to feel this way about painting. I realized I was judging the 'usefulness' too early. Give yourself permission to make 'useless' things for a month.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: {
      id: 'u2',
      name: 'Usman Kazm.',
      photo: 'https://i.pravatar.cc/150?img=16',
    },
    likesCount: 1,
    likedByMe: true,
  },
];
