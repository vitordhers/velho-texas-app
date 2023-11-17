export class Notificate {
    constructor(
        public notId: string,
        public read: boolean,
        public date: Date,
        public text: string,
        public url?: string
    ) { }
}
