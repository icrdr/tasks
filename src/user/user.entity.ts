import { Exclude } from "class-transformer";
import { Entity, Column, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "../common/common.entity";

export enum UserGender {
  male = "male",
  female = "female",
}

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  username!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ nullable: true })
  fullName!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  mobile!: string;

  @Column({
    type: "enum",
    enum: UserGender,
    nullable: true,
  })
  gender!: UserGender;

  @Column({ nullable: true })
  idNumber!: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles!: Role[];
}

export enum ThirdAuthType {
  wechat = "wechat",
}

@Entity()
export class ThirdAuth extends BaseEntity {
  @Column({
    type: "enum",
    enum: ThirdAuthType,
  })
  type!: string;

  @Column()
  uid!: string;
}

@Entity()
export class Role extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToMany(() => Perm, (perm) => perm.roles)
  @JoinTable()
  perms!: Perm[];

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];
}

@Entity()
export class Perm extends BaseEntity {
  @Column({ unique: true })
  code!: string;

  @ManyToMany(() => Role, (role) => role.perms)
  roles!: Role[];
}
