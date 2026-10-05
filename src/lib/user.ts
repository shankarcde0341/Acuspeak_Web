export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
}

export const DEFAULT_USER: User = {
  id: 'usr_acuspeak_101',
  name: 'Learner',
  email: 'learner@acuspeak.com',
  avatarInitial: 'L',
};

export function getFallbackUser(): User {
  return DEFAULT_USER;
}
