import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DialogService} from "../dialog.service";
import {DialogListItem} from "../../../_models";
import {AuthenticationService} from "../../../_services/authentication.service";

@Component({
  selector: 'app-dialog-list',
  templateUrl: './dialog-list.component.html',
  styleUrls: ['./dialog-list.component.scss']
})
export class DialogListComponent implements OnInit, OnDestroy {
  isDialogSelected = false;

  dialogListItems: DialogListItem[];

  constructor(private router: Router,
              private dialogService: DialogService,
              private authService: AuthenticationService) {
    if (sessionStorage.getItem('isDialogSelected')) {
      this.isDialogSelected = sessionStorage.getItem('isDialogSelected') === 'true';
    }
  }

  ngOnInit(): void {
    this.dialogService.getDialogListItems().pipe().subscribe((dialogList) => {
      this.dialogListItems = dialogList;
    });

    this.dialogService.waitChangeLastMessage$().subscribe(lastMessage => {
      this.dialogListItems.forEach((item, index) => {
        if (lastMessage.toSendingSocket) {
          if (lastMessage.send_to_id == item.id && lastMessage.send_from_id == this.authService.authUser.id) {
            const newItem = this.dialogListItems[index];

            newItem.timestamp = lastMessage.timestamp;
            newItem.last_message = lastMessage.last_message;
            newItem.unread_messages_amount = lastMessage.unread_messages_amount;

            this.dialogListItems[index] = newItem;

            return;
          }
        } else {
          if (lastMessage.send_from_id == item.id && lastMessage.send_to_id == this.authService.authUser.id) {
            const newItem = this.dialogListItems[index];

            newItem.timestamp = lastMessage.timestamp;
            newItem.last_message = lastMessage.last_message;
            newItem.unread_messages_amount = lastMessage.unread_messages_amount;

            this.dialogListItems[index] = newItem;

            return;
          }
        }
      });
    });
  }

  set dialogSelected(isSelected: boolean) {
    sessionStorage.setItem('isDialogSelected', String(isSelected));

    this.isDialogSelected = isSelected;
  }

  backToDialogs() {
    this.dialogSelected = false;
    this.router.navigate(['client/dialogs']);
  }

  private clear() {
    this.dialogSelected = false;
  }

  ngOnDestroy() {
    this.clear();
  }

}
