import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity  {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @CreateDateColumn()
    createdDate!: Date;
  
    @UpdateDateColumn()
    updatedDate!: Date;
  
    @DeleteDateColumn()
    deletedDate!: Date;
  }