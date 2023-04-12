import crypto from "crypto";
import {
  createDecoder,
  createSigner,
  createVerifier,
  DecoderOptions,
  SignerOptions,
  VerifierOptions,
} from "fast-jwt";

const key = async () => process.env.APP_SECRET;

export async function sign(
  payload: object,
  opts?: Partial<Omit<SignerOptions, "key" | "jti" | "algorithm">>,
) {
  const signer = createSigner({
    algorithm: "HS256",
    key: key,
    jti: crypto.randomBytes(8).toString("hex"),
    ...opts,
  });

  return await signer(payload);
}

export async function verify(
  token: string,
  opts?: Partial<Omit<VerifierOptions, "key" | "algorithms">>,
) {
  const verifier = createVerifier({
    key: key,
    algorithms: ["HS256"],
    ...opts,
  });

  return await verifier(token).catch((_) => null);
}

export function decode(token: string, opts?: Partial<DecoderOptions>) {
  return createDecoder(opts)(token);
}
