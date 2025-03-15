import { MD5 } from 'crypto-js';

export const hashPassword = (password: string): string => {
  return MD5(password).toString();
};