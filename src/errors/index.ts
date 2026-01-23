export class UNAUTHORIZED extends Error {
  status = 401;
  constructor(public message: string) {
    super(message);
  }
}
