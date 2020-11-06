import crypto from "crypto";
import { Service } from "typedi";
import { Perm, Role } from "../user/user.entity";

@Service()
export class Utility {
  hash(string: string) {
    const hash = crypto.createHash("md5");
    return hash.update(string).digest("hex");
  }

  // https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript?answertab=votes#tab-top
  stringMatch(str: string, rule: string) {
    const escapeRegex = (str: string) =>
      str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp(
      "^" + rule.split("*").map(escapeRegex).join(".*") + "$"
    ).test(str);
  }
}

@Service()
export class TypeGuard {
  isStringArray(array: any[]): array is string[] {
    return typeof array[0] === "string";
  }

  isPermArray(array: any[]): array is Perm[] {
    return array[0] instanceof Perm;
  }

  isRoleArray(array: any[]): array is Role[] {
    return array[0] instanceof Role;
  }
}
