export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
}

export async function getCurrentUser(): Promise<User> {
  return {
    id: 'usr_acuspeak_101',
    name: 'Shankar Choudhary',
    email: 'shankar@example.com',
    avatarInitial: 'S',
  };
}
