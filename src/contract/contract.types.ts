export interface LinkRequest {
  publicKey: string;
}

export interface LinkResponse {
  transaction: string;
}

export interface GetActionResponse {
  name: string;
  description: string;
  image: string;
  website: string;
  actions: ActionPayload[];
}

export interface ActionPayload {
  id: string;
  label: string;
}

export interface StellarLinkRequest {
  publicKey: string;
  input?: string;
}

type StellarNetwork = 'TESTNET' | 'MAINNET';

export interface StellarEntity {
  contract: string;
  network: StellarNetwork;
  name: string;
  description: string;
  image: string;
  website: string;
  actions: StellarAction[];
}

export interface StellarAction {
  id: string;
  label: string;
  method: string;
  input?: StellarInput[];
}

export type StellarInput = StellarBaseInput | StellarSpecialInput;

export interface StellarBaseInput {
  type: StellarBaseType;
  value: any;
}

export interface StellarSpecialInput {
  type: StellarSpecialType;
  value?: any;
}

export type StellarSpecialType = 'caller' | 'distribution';

export type StellarBaseType =
  | 'u32'
  | 'i32'
  | 'u64'
  | 'i64'
  | 'u128'
  | 'i128'
  | 'bool'
  | 'bytes'
  | 'symbol'
  | 'address';