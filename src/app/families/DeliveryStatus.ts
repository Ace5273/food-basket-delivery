import { ColumnOptions, ValueListColumn, NumberColumn, FilterBase, Column, DecorateDataColumnSettings, ValueListItem } from '@remult/core';


export class DeliveryStatus {
  static usingSelfPickupModule: boolean = true;
  static IsAResultStatus(value: DeliveryStatus) {
    switch (value) {
      case this.Success:
      case this.SuccessPickedUp:
      case this.SuccessLeftThere:
      case this.FailedBadAddress:
      case this.FailedNotHome:
      case this.FailedOther:
        return true;
    }
    return false;
  }
  static ReadyForDelivery: DeliveryStatus = new DeliveryStatus(0, 'מוכן למשלוח');
  static SelfPickup: DeliveryStatus = new DeliveryStatus(2, 'באים לקחת');
  static Frozen: DeliveryStatus = new DeliveryStatus(90, 'מוקפא');
  static NotInEvent: DeliveryStatus = new DeliveryStatus(95, 'לא באירוע');
  static Success: DeliveryStatus = new DeliveryStatus(11, 'נמסר בהצלחה');
  static SuccessPickedUp: DeliveryStatus = new DeliveryStatus(13, 'לקחו בעצמם');
  static SuccessLeftThere: DeliveryStatus = new DeliveryStatus(19, 'הושאר ליד הבית');
  static FailedBadAddress: DeliveryStatus = new DeliveryStatus(21, 'לא נמסר, בעיה בכתובת');
  static FailedNotHome: DeliveryStatus = new DeliveryStatus(23, 'לא נמסר, לא היו בבית');
  static FailedOther: DeliveryStatus = new DeliveryStatus(25, 'לא נמסר, אחר');
  static RemovedFromList: DeliveryStatus = new DeliveryStatus(99, 'הוצא מהרשימות');


  constructor(public id: number, public caption: string) {
  }

}
export class DeliveryStatusColumn extends ValueListColumn<DeliveryStatus> {
  isActiveDelivery() {
    return this.isLessOrEqualTo(DeliveryStatus.FailedOther);
  }
  isInEvent() {
    return this.isLessOrEqualTo(DeliveryStatus.Frozen);
  }
  isAResultStatus() {
    return this.isGreaterOrEqualTo(DeliveryStatus.Success).and(this.isLessOrEqualTo(DeliveryStatus.FailedOther));
  }

  constructor(settingsOrCaption?: ColumnOptions<DeliveryStatus>, chooseFrom?: DeliveryStatus[]) {
    super(DeliveryStatus, {
      dataControlSettings: () => {
        let op = this.getOptions();
        if (chooseFrom)
          op = chooseFrom.map(x => {
            return {
              id: x.id,
              caption: x.caption
            } as ValueListItem
          });
        if (!DeliveryStatus.usingSelfPickupModule) {
          op = op.filter(x => x.id != DeliveryStatus.SelfPickup.id && x.id != DeliveryStatus.SuccessPickedUp.id);
        }
        return {
          valueList: op,
          width: '150'
        };

      }
    }, settingsOrCaption);
    if (!this.defs.caption)
      this.defs.caption = 'סטטוס משלוח';
  }

  isSuccess() {
    return this.isGreaterOrEqualTo(DeliveryStatus.Success).and(this.isLessOrEqualTo(DeliveryStatus.SuccessLeftThere));
  }
  isProblem() {
    return this.isGreaterOrEqualTo(DeliveryStatus.FailedBadAddress).and(this.isLessOrEqualTo(DeliveryStatus.FailedOther));
  }
  getCss() {
    switch (this.value) {
      case DeliveryStatus.Success:
      case DeliveryStatus.SuccessLeftThere:
      case DeliveryStatus.SuccessPickedUp:
        return 'deliveredOk';
      case DeliveryStatus.FailedBadAddress:
      case DeliveryStatus.FailedNotHome:
      case DeliveryStatus.FailedOther:
        return 'deliveredProblem';
      default:
        return '';
    }
  }

}