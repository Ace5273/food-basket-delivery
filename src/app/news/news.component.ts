import { Component, OnInit, OnDestroy } from '@angular/core';
import { NewsUpdate } from "./NewsUpdate";
import { DeliveryStatus } from "../families/DeliveryStatus";
import { Context } from '@remult/core';
import { DialogService } from '../select-popup/dialog';
import { translate } from '../translate';

import { Route, ActivatedRoute } from '@angular/router';

import { Families } from '../families/families';
import { FilterBase } from '@remult/core';
import { BusyService } from '@remult/core';
import { Roles, AdminGuard } from '../auth/roles';
import { HelperAssignmentComponent } from '../helper-assignment/helper-assignment.component';
import { Helpers } from '../helpers/helpers';

import { FamilySources } from '../families/FamilySources';
import { NewsFilterService } from './news-filter-service';
import { UpdateFamilyDialogComponent } from '../update-family-dialog/update-family-dialog.component';
@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, OnDestroy {
    static route: Route = {
        path: 'news', component: NewsComponent, canActivate: [AdminGuard], data: { name: 'חדשות' }
    };
    static needsWorkRoute: Route = {
        path: 'needsWork', component: NewsComponent, canActivate: [AdminGuard], data: { name: 'מצריך טיפול' }
    };

    filterChange() {

        this.refresh();
    }
    onDestroy = () => { };
    constructor(private dialog: DialogService, private context: Context, private busy: BusyService, public filters: NewsFilterService,private activatedRoute:ActivatedRoute) {
        let y = dialog.refreshStatusStats.subscribe(() => {
            this.refresh();
        });
        this.onDestroy = () => {
            y.unsubscribe();
        };

    }
    async updateFamily(n: NewsUpdate) {

        let f = await this.context.for(Families).findFirst(fam => fam.id.isEqualTo(n.id));
        this.context.openDialog(UpdateFamilyDialogComponent, x => x.args= {
            f: f, onSave: () => {

                n.needsWork.value = f.needsWork.value;
            }
        });

    }
    cancelNeedWork(n: NewsUpdate) {
        this.dialog.YesNoQuestion(translate('לבטל את הסימון "מצריך טיפול" למשפחת "') + n.name.value + '"?', async () => {
            let f = await this.context.for(Families).findFirst(fam => fam.id.isEqualTo(n.id));
            f.needsWork.value = false;
            await f.save();
            n.needsWork.value = false;

        });
    }
    async showHelper(n: NewsUpdate) {
        this.context.openDialog(
            HelperAssignmentComponent, s => s.argsHelper = this.context.for(Helpers).lookup(n.courier));
    }
    ngOnDestroy(): void {
        this.onDestroy();
    }
    news: NewsUpdate[] = [];
    familySources: familySource[] = [{ id: undefined, name: "כל הגורמים מפנים" }];
    
    async ngOnInit() {
        if (this.activatedRoute.routeConfig.path==NewsComponent.needsWorkRoute.path)
        {
         this.filters.setToNeedsWork();   
        }
        this.refresh();
        this.familySources.push(...(await this.context.for(FamilySources).find({ orderBy: x => [x.name] })).map(x => { return { id: x.id.value, name: x.name.value } as familySource }));

    }
    newsRows = 50;
    async refresh() {

        this.busy.donotWait(async () => {
            this.news = await this.context.for(NewsUpdate).find({
                where: n => {
                    return this.filters.where(n);


                }, orderBy: n => [{ column: n.updateTime, descending: true }], limit: this.newsRows
            });
        });
    }
    moreNews() {
        this.newsRows *= 2;
        this.refresh();
    }
    icon(n: NewsUpdate) {

        switch (n.updateType.value) {
            case 1:
                switch (n.deliverStatus.value) {
                    case DeliveryStatus.ReadyForDelivery:

                        break;
                    case DeliveryStatus.Success:
                    case DeliveryStatus.SuccessLeftThere:
                    case DeliveryStatus.SuccessPickedUp:
                        return 'check';
                    case DeliveryStatus.FailedBadAddress:
                    case DeliveryStatus.FailedNotHome:
                    case DeliveryStatus.FailedOther:
                        return 'error';

                }
                return "create";
            case 2:
                if (n.courier.value)
                    return "how_to_reg";
                else
                    return "clear";
        }
        return n.deliverStatus.displayValue;
    }
}
export interface NewsFilter {
    name: string;
    where?: (rowType: NewsUpdate) => FilterBase;
}
interface familySource {
    name: string;
    id: string;
}
