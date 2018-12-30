import * as React from 'react';
import styles from './CustomNews.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import {sp , Web}  from '@pnp/pnpjs';
import { IWebPartContext } from "@microsoft/sp-webpart-base";
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { ListItemPicker } from '@pnp/spfx-controls-react';
import { DatePicker, DayOfWeek, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';

const DayPickerStrings: IDatePickerStrings = {
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  goToToday: 'Go to today',
  prevMonthAriaLabel: 'Go to previous month',
  nextMonthAriaLabel: 'Go to next month',
  prevYearAriaLabel: 'Go to previous year',
  nextYearAriaLabel: 'Go to next year'
};

export interface CreateNewsProps {
    context : IWebPartContext
}

export interface CreateNewsState {
    showModal : boolean;
    page : any;
    firstDayOfWeek?: DayOfWeek;
    imageFile : File;
    loading : boolean;
    newsHeadline : string;
    newsTeaser : string;
    newsContent : string;
    newsDate : Date;
}

export class CreateNewsButton extends React.Component<CreateNewsProps, CreateNewsState> {

  constructor(props) {
    super(props);
    this.state = {
        imageFile : null,
        newsHeadline : '',
        newsContent : '',
        newsTeaser : '',
        newsDate : null,
        page : {},
        firstDayOfWeek: DayOfWeek.Sunday,
        loading : false,
        showModal : false
    }
  }

  public render(): JSX.Element {
    const { firstDayOfWeek } = this.state;

    return (
      <div>
        <PrimaryButton
          className={styles.button}
          iconProps={{ iconName: 'Add' }}
          secondaryText="Opens the Sample Modal"
          onClick={this._showModal}
          text="Create News" />
        <Modal
          titleAriaId="titleId"
          subtitleAriaId="subtitleId"
          isOpen={this.state.showModal}
          onDismiss={this._closeModal}
          isBlocking={false}
          className={styles.modalContainer}
        >
          <div className={styles.modalHeader}>
            <span style={{ padding: "20px" }} id="titleId">Add News</span>
            <ActionButton className={styles.closeButton} iconProps={{ iconName: 'Cancel' }} onClick={this._closeModal} />
          </div>
          <div id="subtitleId" className={styles.modalBody}>
            <div className="ms-Grid" dir="ltr">
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6">
                  <p>
                    Select Article
                  </p>
                  <ListItemPicker listId='8A4FB100-19E4-43F0-9CC8-10D9FFCF4BCA'
                    columnInternalName='Title'
                    itemLimit={1}
                    onSelectedItem={this._onSelectedItem}
                    context={this.props.context} />
                </div>
                <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6">
                  <p>
                    News Date
                  </p>
                  <DatePicker
                    isRequired={true}
                    firstDayOfWeek={firstDayOfWeek}
                    strings={DayPickerStrings}
                    placeholder="Select a date..."
                    ariaLabel="Select a date"
                    onSelectDate={this._onSelectDate}
                  />
                </div>
              </div>
            </div>
            <p>
              News Headline
              </p>
            <TextField required={true} onChanged={(value) => this.setState({ newsHeadline: value })} />
            <p>
              News Teaser
              </p>
            <TextField required={true} onChanged={(value) => this.setState({ newsTeaser: value })} multiline rows={6} />
            <p>
              News Content
              </p>
            <TextField required={true} onChanged={(value) => this.setState({ newsContent: value })} multiline rows={6} />
            <br />
            <div className="ms-Grid" dir="ltr">
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg3">
                  <input type="File" accept="image/*"
                    id="file" onChange={(e) => this._handleFile(e.target.files)}
                    style={{ display: "none" }} />
                  <PrimaryButton iconProps={{ iconName: 'Upload' }} id="button" value="Upload" onClick={() => { document.getElementById("file").click(); }}>Upload News Image</PrimaryButton>
                </div>
                <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg9">
                  <span>{this.state.imageFile ? this.state.imageFile.name : ''}</span>
                </div>
              </div>
            </div>
            <br />
            <div hidden={this.state.loading}>
              <PrimaryButton
                iconProps={{ iconName: 'Add' }}
                text="Create News"
                onClick={this._createNews}
                style={{ float: "right" }}
              />
            </div>
            <Spinner hidden={this.state.loading == false} size={SpinnerSize.large} style={{ float: "right" }} />
          </div>
        </Modal>
      </div>
    );
  }

  private _onSelectDate = (date: Date | null | undefined)=> {
    this.setState({
      newsDate : date
    });
  }


  private _onSelectedItem =(data: { key: string; name: string }[]) =>{
    console.log(data);
    this.setState({
      page : data[0]
    });
  }

  private _handleFile = (files : FileList) =>{
    this.setState({
      imageFile : files[0]
    })
  }

  private _showModal = (): void => {
    this.setState({ showModal: true });
  }

  private _closeModal = (): void => {
    this.setState({ showModal: false });
  }

  
  private _createNews = () : void =>{
    sp.web.lists.getByTitle("News").items.add({
      Title: this.state.newsHeadline,
      NewsDate : this.state.newsDate,
      NewsTeaser : this.state.newsTeaser,
      NewsContent : this.state.newsContent,
      PageId : {
       results : this.state.page.key
      },
    }).then(item =>{
      console.log(item);
      this._closeModal();
    })
    
    .catch(console.log);
  }
}
