import "reflect-metadata";
import { DataSource } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import * as path from 'path';
import { User } from "src/entity/user.entity";
import { Test } from "src/entity/test.entity";
import { Discount } from "src/entity/discount.entity"
import { Booking } from "src/entity/booking.entity";
import { Listing } from "src/entity/listing.entity";
import { PaymentFpx } from "src/entity/payment-fpx.entity";
import { Payment } from "src/entity/payment.entity";
import { PromotionCode } from "src/entity/promotion-code.entity";
import { Promotion } from "src/entity/promotion.entity";
import { Property } from "src/entity/property.entity";
import { Leasing } from "src/entity/leasing.entity";
import { Email } from "src/entity/email.entity";
import { AdminUser } from "src/entity/admin-user.entity";
import { ESignAgreement } from "src/entity/e-signature-agreement.entity";
import { ListingAnalytic } from "src/entity/listing-analytic.entity";
import { Location } from "src/entity/location.entity";
import { Reference } from "src/entity/reference.entity";
import { Tag } from "src/entity/tag.entity";
import { Photographer } from "src/entity/photographer.entity";
/**
 * Database manager class
 */


//  config: {
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     typeCast(field: any, useDefaultTypeCasting: () => void) {
//       if (field.type === 'BIT' && field.length === 1) {
//         const bytes = field.buffer()
//         return bytes ? bytes[0] === 1 : false
//       }
//       if (field.type === 'JSON') {
//         return JSON.parse(field.string() as string)
//       }

//       return useDefaultTypeCasting()
//     }
//   }
// })

export const Database = new DataSource({

    replication: {
        master: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        slaves: [
            {
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            },
        ],
    },

    type: 'mysql',
    entities: [
        AdminUser,
        Booking,
        Discount,
        ESignAgreement,
        Email,
        Leasing,
        ListingAnalytic,
        Listing,
        Location,
        PaymentFpx,
        Payment,
        Photographer,
        PromotionCode,
        Promotion,
        Property,
        Reference,
        Tag,
        User,
    ],
    multipleStatements: false,
    logging: ["error"],
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
})


// {
//     replication: {
//         master: {
//             host: this.get<string>('DB_HOST'),
//             port: this.get<number>('DB_PORT'),
//             username: this.get('DB_USERNAME'),
//             password: this.get('DB_PASSWORD'),
//             database: this.get<string>('DB_DATABASE'),
//         },
//         slaves: [
//             {
//                 host: this.get<string>('DB_SLAVE_HOST'),
//                 port: this.get<number>('DB_SLAVE_PORT'),
//                 username: this.get('DB_SLAVE_USERNAME'),
//                 password: this.get('DB_SLAVE_PASSWORD'),
//                 database: this.get<string>('DB_DATABASE'),
//             },
//         ],
//     },
//     type: 'mysql',
//     entities: [path.join(__dirname + '/../../**/*.entity{.ts,.js}')],
//     migrations: [path.join(__dirname + '/../../migrations/*{.ts,.js}')],
//     migrationsRun: this.get<string>('DB_MIGRATIONS') === 'true',
//     multipleStatements: false,
//     debug: this.get('env') === 'dev',
//     // logging: this.get<string>('DB_LOGGING') === 'true',
//     synchronize: false,
//     namingStrategy: new SnakeNamingStrategy(),
// }


// import { Connection, ConnectionManager, ConnectionOptions, createConnection, getConnectionManager } from 'typeorm'
// import { inspect } from 'util'
// import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
// import { Test } from 'src/entity/test.entity';

// /**
//  * Database manager class
//  */
// export class Database {
//     private connectionManager: ConnectionManager

//     constructor() {
//         this.connectionManager = getConnectionManager()
//     }

//     public async getConnection(): Promise<Connection> {
//         const CONNECTION_NAME = `default`

//         let connection: Connection

//         if (this.connectionManager.has(CONNECTION_NAME)) {
//             connection = await this.connectionManager.get(CONNECTION_NAME)

//             if (!connection.isConnected) {
//                 connection = await connection.connect()
//             }
//         }
//         else {

//             const connectionOptions: ConnectionOptions = {

//                 type: `mysql`,




//                 host: process.env.DB_HOST,
//                 port: parseInt(process.env.DB_PORT),
//                 username: process.env.DB_USER,
//                 password: process.env.DB_PASSWORD,
//                 database: process.env.DB_NAME,






//                 namingStrategy: new SnakeNamingStrategy(),
//                 entities: [
//                     Test
//                 ]
//             }

//             // Don't need a pwd locally
//             if (process.env.DB_PASSWORD) {
//                 Object.assign(connectionOptions, {
//                     password: process.env.DB_PASSWORD
//                 })
//             }

//             connection = await createConnection(connectionOptions)
//         }

//         return connection
//     }
// }