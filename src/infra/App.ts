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
    const { tcp } = this;
    console.log("App started!");

    await tcp.init();

    return true;
  }
}
