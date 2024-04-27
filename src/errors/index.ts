export class SQLITE_CONSTRAINT extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class UNAUTHORIZED extends Error {
  constructor(public message: string) {
    super(message);
  }
}
