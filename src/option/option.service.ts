import { Service } from "typedi";
import { EntityManager, getManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { Option } from "./option.entity";

@Service()
export class OptionService {
  @InjectManager()
  private manager!: EntityManager;

  async createOption(name: string, value: string) {
    const option = new Option();
    option.name = name;
    option.value = value;
    await this.manager.save(option);
    return option;
  }

  async getOption(identify: string | number): Promise<Option | undefined> {
    return typeof identify === "string"
      ? await this.manager.findOne(Option, { name: identify })
      : await this.manager.findOne(Option, identify);
  }
}
