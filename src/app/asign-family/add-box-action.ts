import { ServerAction } from "../auth/server-action";
import { DataApiRequest } from "radweb/utils/dataInterfaces1";
import { myAuthInfo } from "../auth/my-auth-info";
import { Families, DeliveryStatus, Helpers } from "../models";


export class AddBoxAction extends ServerAction<AddBoxInfo, AddBoxResponse>{
    constructor() {
        super('add-box');//required because of minification
    }
    protected async execute(info: AddBoxInfo, req: DataApiRequest<myAuthInfo>): Promise<AddBoxResponse> {
        let result: myAuthInfo;

        let h = new Helpers();
        if (!info.helperId) {
            let r = await h.source.find({ where: h.phone.isEqualTo(info.phone) });
            if (r.length == 0) {
                h.phone.value = info.phone;
                h.name.value = info.name;
                await h.save();
                info.helperId = h.id.value;
            }
        }

        {
            let f = new Families();
            let r = await f.source.find({ where: f.deliverStatus.isEqualTo(DeliveryStatus.NotYet.id) });
            if (r.length > 0) {
                r[0].deliverStatus.listValue = DeliveryStatus.Assigned;
                r[0].courier.value = info.helperId;
                await r[0].save();
            }
        }
        return {
            helperId:info.helperId
        }


    }
}

export interface AddBoxInfo {
    name: string;
    phone: string;
    helperId?: string;
}
export interface AddBoxResponse {
    helperId?: string;

}