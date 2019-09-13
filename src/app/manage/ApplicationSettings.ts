import { StringColumn, NumberColumn, BoolColumn } from "radweb";
import { GeocodeInformation, GetGeoInformation } from "../shared/googleApiHelpers";
import { Entity, Context, EntityClass } from "radweb";
import { PhoneColumn } from "../model-shared/types";
import { Roles } from "../auth/roles";
import { DeliveryStatusColumn, DeliveryStatus } from "../families/DeliveryStatus";
import { translate } from "../translate";
@EntityClass
export class ApplicationSettings extends Entity<number>  {

  id = new NumberColumn();
  organisationName = new StringColumn('שם הארגון');
  smsText = new StringColumn('תוכן הודעת SMS');
  logoUrl = new StringColumn('לוגו URL');
  address = new StringColumn("כתובת מרכז השילוח");
  commentForSuccessDelivery = new StringColumn('הודעה למשנע כאשר נמסר בהצלחה');
  commentForSuccessLeft = new StringColumn('הודעה למשנע כאשר הושאר ליד הבית');
  commentForProblem = new StringColumn('הודעה למשנע כאשר יש בעיה');
  messageForDoneDelivery = new StringColumn(translate( 'הודעה למשנע כאשר סיים את כל המשפחות'));
  
  helpText = new StringColumn('למי המשנע מתקשר כשיש לו בעיה (שם)');
  helpPhone = new PhoneColumn('טלפון עזרה למשנע');
  dataStructureVersion = new NumberColumn({ allowApiUpdate: false });
  deliveredButtonText = new StringColumn("מלל כפתור נמסר בהצלחה");
  message1Text = new StringColumn('מלל חופשי 1 למתנדב');
  message1Link = new StringColumn('כתובת אינטרנט ללחיצה על מלל חופשי 1 למתנדב');
  message1OnlyWhenDone = new BoolColumn('להציג מלל חופשי 1 רק כאשר המתנדב סיים אל כל הסלים');
  message2Text = new StringColumn('מלל חופשי 2 למתנדב');
  message2Link = new StringColumn('כתובת אינטרנט ללחיצה על מלל חופשי 2 למתנדב');
  message2OnlyWhenDone = new BoolColumn('להציג מלל חופשי 2 רק כאשר המתנדב סיים אל כל הסלים');
  forSoldiers = new BoolColumn('המערכת היא עבור חיילים לא משפחות');
  showCompanies = new BoolColumn('שמור מטעם איזה חברה הגיע המתנדב');
  showLeftThereButton = new BoolColumn('הצג למתנדב כפתור השארתי ליד הבית');
  
  addressApiResult = new StringColumn();
  defaultStatusType = new DeliveryStatusColumn({
    caption:translate( 'סטטוס משלוח ברירת מחדל למשפחות חדשות')
  }, [DeliveryStatus.ReadyForDelivery, DeliveryStatus.SelfPickup, DeliveryStatus.NotInEvent]);
  private _lastString: string;
  private _lastGeo: GeocodeInformation;
  getGeocodeInformation() {
    if (this._lastString == this.addressApiResult.value)
      return this._lastGeo ? this._lastGeo : new GeocodeInformation();
    this._lastString = this.addressApiResult.value;
    return this._lastGeo = GeocodeInformation.fromString(this.addressApiResult.value);
  }


  constructor(context: Context) {
    super({
      name: 'ApplicationSettings',
      allowApiRead: true,
      allowApiUpdate: Roles.admin,
      onSavingRow: async () => {
        if (context.onServer) {
          if (this.address.value != this.address.originalValue || !this.getGeocodeInformation().ok()) {
            let geo = await GetGeoInformation(this.address.value);
            this.addressApiResult.value = geo.saveToString();
            if (geo.ok()) {
            }
          }
          for (const l of [this.message1Link,this.message2Link]) {
            if (l.value){
              if (l.value.trim().indexOf(':')<0)
                l.value = 'http://'+l.value.trim();
            }
          }
        }
      }
    })
  }

  static get(context: Context) {
    return context.for(ApplicationSettings).lookup(app => app.id.isEqualTo(1));

  }
  static async getAsync(context: Context): Promise<ApplicationSettings> {
    return (await context.for(ApplicationSettings).findFirst());
  }

}