declare module "culori" {
  export function parse(color: string): any;
  export function formatHex(color: any): string;
  export function lch(color: any): any;
  export function lch(l: number, c: number, h: number): any;
  export function displayable(color: any, mode?: string): boolean;
}
