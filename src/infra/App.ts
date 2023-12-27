import admin from "firebase-admin";
import { IServices } from "types/services";

import { Tcp } from "./Tcp";

export class App implements IServices {
  private static instance: App;

  private tcp: IServices = new Tcp();

  constructor() {
    if (!App.instance) {
      App.instance = this;
    }

    return App.instance;
  }

  async init() {
    const { GOOGLE_APPLICATION_CREDENTIALS } = process.env;

    admin.initializeApp({
      credential: admin.credential.cert(GOOGLE_APPLICATION_CREDENTIALS || ""),
    });

    const { tcp } = this;
    console.log("App started!");

    await tcp.init();

    return true;
  }
}
