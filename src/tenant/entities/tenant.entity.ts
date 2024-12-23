import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid"
import { Tenants } from "../tenants.enum";
import { User } from "src/user/entities/user.entity";

@Entity({
    name: 'tenants'
})
export class Tenant {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 20
    })
    type: Tenants

    @Column({
        type: 'varchar',
        length: 30
    })
    db_name: string;

    @OneToMany(()  => User, (user) => user.tenant_id)
    users: User[]
}
