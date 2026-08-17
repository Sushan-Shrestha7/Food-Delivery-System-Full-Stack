import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Otp {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column()
  expiresAt: Date;
}
