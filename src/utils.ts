import crypto from "crypto";

const hash = (string: string) => {
  const hash = crypto.createHash("md5");
  return hash.update(string).digest("hex");
};

export { hash };
