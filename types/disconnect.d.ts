declare module "disconnect" {
  export class Client {
    constructor(config: { userToken: string });
    database(): {
      getRelease: (
        id: string,
        callback: (err: unknown, release: unknown) => void
      ) => void;
      getMaster: (
        id: string,
        callback: (err: unknown, master: unknown) => void
      ) => void;
      getArtist: (
        id: string,
        callback: (err: unknown, artist: unknown) => void
      ) => void;
      getLabel: (
        id: string,
        callback: (err: unknown, label: unknown) => void
      ) => void;
    };
    marketplace(): {
      getPriceSuggestions: (
        releaseId: string,
        callback: (err: unknown, suggestions: unknown) => void
      ) => void;
    };
  }
}
