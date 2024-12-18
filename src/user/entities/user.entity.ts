import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Rol } from "../roles.enum";
import { Tenant } from "src/tenant/entities/tenant.entity";

@Entity({
    name: 'users'
})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid();

    @Column({
        type: "varchar",
        length: 100
    })
    name: string; 
    @Column({
        type: "varchar",
        length: 100,
        unique: true
    })
    email: string;

    @Column({
        type: "varchar",
        length: 12,
        unique: true
    })
    dni: string;

    @Column({
        type: "date",
        nullable: true,
    })
    birthdate: Date;

    @Column({
        type: "varchar",
        length: 30,
        nullable: true
    })
    nationality: string;

    @Column({
        type: "varchar",
        length: 12,
        nullable: true
    })
    gender: string;

    @Column({
        type: "int",
        length: 3,
        nullable: true
    })
    phone_prefix: number;

    @Column({
        type: "int",
        length: 15,
        nullable: true,
    })
    phone: number;

    @Column({
        type: "varchar",
        length: 200,
    })
    password: string; 

    @Column({
        type: "varchar",
        nullable: true
    })
    google_id: string;

    @Column({
        type:"varchar",
        default: "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=", 
        nullable:true
    })
    image: string//Foto de perfil.

    @Column({
        type: 'varchar'
    })
    role_type: Rol; //Enum que define si el usuario  es:

    @ManyToOne(() => Tenant, (tenant) => tenant.users)
    tenant_id: Tenant//Relación con el tenant al que pertenece el usuario.
}
