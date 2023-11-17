import ItemList from '../../../shared/models/itemlist.model';
import Charge from './charge.model';
import { OrderStatus } from '../enums/order-status.enum';
import Payment from './payment.model';
import Freight from './freight.model';

export class Order {
    constructor(
        public orderId: string,
        public orderNo: number,
        public status: OrderStatus,
        public products: ItemList[],
        public description: string,
        public date: Date,
        public freight: Freight,
        public skus: string[],
        public charges: { paymentMethod: string, totalProducts: number, totalShipment: number, charge: Charge },
        public payment?: Payment,
        public cpf?: string,
        public nfe?: string,
        public cancel?: { canceledDate: Date },
        public refund?: { refundRequestId: string, refundRequestDate: Date, refundDate: Date }
    ) { }
}
