import { Perm, Role } from "./user/user.entity";

export const isStringArray = (array: any[]): array is string[] => {
  return typeof array[0] === "string";
};

export const isPermArray = (array: any[]): array is Perm[] => {
  return array[0] instanceof Perm;
};

export const isRoleArray = (array: any[]): array is Role[] => {
  return array[0] instanceof Role;
};
