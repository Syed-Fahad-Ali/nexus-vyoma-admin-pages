declare module "qrcode" {
  export interface QRCodeToBufferOptions {
    type?: "png" | "svg" | "utf8";
    width?: number;
    margin?: number;
    errorCorrectionLevel?: "low" | "medium" | "quartile" | "high" | "L" | "M" | "Q" | "H";
    [key: string]: any;
  }

  export function toBuffer(text: string | Buffer, options?: QRCodeToBufferOptions): Promise<Buffer>;
  export function toDataURL(text: string | Buffer, options?: any): Promise<string>;
  export function toString(text: string | Buffer, options?: any): Promise<string>;

  const qrCode: {
    toBuffer(text: string | Buffer, options?: QRCodeToBufferOptions): Promise<Buffer>;
    toDataURL(text: string | Buffer, options?: any): Promise<string>;
    toString(text: string | Buffer, options?: any): Promise<string>;
    [key: string]: any;
  };

  export default qrCode;
}

